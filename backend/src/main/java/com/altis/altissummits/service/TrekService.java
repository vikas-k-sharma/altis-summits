package com.altis.altissummits.service;

import com.altis.altissummits.dto.TrekRequestDTO;
import com.altis.altissummits.entity.Difficulty;
import com.altis.altissummits.entity.ItineraryDay;
import com.altis.altissummits.entity.Trek;
import com.altis.altissummits.repository.TrekRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class TrekService {

    private final TrekRepository trekRepository;
    private final GeometryFactory geometryFactory = new GeometryFactory();
    private static final int WGS_84_SRID = 4326;

    // 1. Fetch all active treks for the catalog
    public List<Trek> getAllActiveTreks() {
        return trekRepository.findByIsActiveTrue().stream()
                .map(this::applyResponseDefaults)
                .toList();
    }

    public List<Trek> getTrekOptionsForAdmin() {
        return trekRepository.findAllByOrderByTitleAsc().stream()
                .map(this::applyResponseDefaults)
                .toList();
    }

    // 2. Fetch by region
    public List<Trek> getTreksByRegion(String region) {
        return trekRepository.findByRegionAndIsActiveTrue(region).stream()
                .map(this::applyResponseDefaults)
                .toList();
    }

    // 3. Fetch a single trek by its URL slug
    public Trek getTrekBySlug(String slug) {
        return trekRepository.findBySlug(slug)
                .map(this::applyResponseDefaults)
                .orElseThrow(() -> new RuntimeException("Trek not found with slug: " + slug));
    }

    // 4. Create a new Trek (with business logic!)
    public Trek createTrek(Trek trek) {
        // Business Logic: If the user didn't provide a slug, auto-generate one from the title
        if (trek.getSlug() == null || trek.getSlug().isEmpty()) {
            trek.setSlug(generateUniqueSlug(trek.getTitle()));
        }

        if (trek.getItinerary() != null) {
            for (ItineraryDay day : trek.getItinerary()) {
                day.setTrek(trek); // Tell the child who its parent is
            }
        }

        // Save to the database
        return trekRepository.save(trek);
    }

    public List<Trek> getTreksNearby(Point userLocation, double radius) {
        return trekRepository.findTreksNearLocation(userLocation, radius).stream()
                .map(this::applyResponseDefaults)
                .toList();
    }

    public Trek createAdminTrek(TrekRequestDTO dto) {
        validateCreateTrekRequest(dto);

        Trek trek = new Trek();
        applyAdminTrekFields(trek, dto, false);
        trek.setSlug(generateUniqueSlug(dto.getTitle()));
        trek.setIsActive(true);

        return trekRepository.save(trek);
    }

    public Trek updateAdminTrek(String slug, TrekRequestDTO dto) {
        validateUpdateTrekRequest(dto);

        Trek trek = trekRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trek not found with slug: " + slug));

        if (hasText(dto.getTitle()) && !toSlug(dto.getTitle()).equals(trek.getSlug())) {
            trek.setSlug(generateUniqueSlug(dto.getTitle(), trek.getId()));
        }

        applyAdminTrekFields(trek, dto, true);
        return trekRepository.save(trek);
    }

    private String generateUniqueSlug(String title) {
        return generateUniqueSlug(title, null);
    }

    private String generateUniqueSlug(String title, Long existingTrekId) {
        String baseSlug = toSlug(title);
        String slug = baseSlug;
        int suffix = 2;

        while (slugExists(slug, existingTrekId)) {
            slug = baseSlug + "-" + suffix;
            suffix++;
        }

        return slug;
    }

    private String toSlug(String title) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Trek title is required to generate slug.");
        }

        String slug = title.toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        if (slug.isBlank()) {
            throw new IllegalArgumentException("Trek title must contain letters or numbers to generate slug.");
        }

        return slug;
    }

    private boolean slugExists(String slug, Long existingTrekId) {
        if (existingTrekId == null) {
            return trekRepository.existsBySlug(slug);
        }

        return trekRepository.existsBySlugAndIdNot(slug, existingTrekId);
    }

    private void applyAdminTrekFields(Trek trek, TrekRequestDTO dto, boolean partialUpdate) {
        if (!partialUpdate || dto.getTitle() != null) {
            trek.setTitle(dto.getTitle().trim());
        }
        if (!partialUpdate || dto.getDescription() != null) {
            trek.setDescription(dto.getDescription());
        }
        if (!partialUpdate || dto.getDurationDays() != null) {
            trek.setDurationDays(dto.getDurationDays());
        }
        if (!partialUpdate || dto.getMaxAltitudeMeters() != null) {
            trek.setMaxAltitudeMeters(dto.getMaxAltitudeMeters());
        }
        if (!partialUpdate || dto.getPrice() != null) {
            trek.setBasePrice(dto.getPrice());
        }
        if (!partialUpdate || dto.getRegion() != null) {
            trek.setRegion(dto.getRegion());
        }
        if (!partialUpdate || dto.getDifficulty() != null) {
            trek.setDifficulty(parseDifficulty(dto.getDifficulty()));
        }
        if (!partialUpdate || dto.getStartLat() != null || dto.getStartLon() != null) {
            trek.setStartLocation(createPoint(dto.getStartLon(), dto.getStartLat()));
        }
    }

    private Point createPoint(double longitude, double latitude) {
        Point point = geometryFactory.createPoint(new Coordinate(longitude, latitude));
        point.setSRID(WGS_84_SRID);
        return point;
    }

    private Difficulty parseDifficulty(String difficulty) {
        try {
            return Difficulty.valueOf(difficulty.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid trek difficulty: " + difficulty, ex);
        }
    }

    private void validateCreateTrekRequest(TrekRequestDTO dto) {
        validateTrekRequestBody(dto);

        if (!hasText(dto.getTitle())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trek title is required.");
        }
        if (!hasText(dto.getDifficulty())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trek difficulty is required.");
        }
        if (dto.getDurationDays() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duration is required.");
        }
        if (dto.getMaxAltitudeMeters() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Max altitude is required.");
        }
        if (dto.getPrice() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price is required.");
        }
        if (dto.getStartLat() == null || dto.getStartLon() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start latitude and longitude are required.");
        }

        validateCommonTrekFields(dto);
    }

    private void validateUpdateTrekRequest(TrekRequestDTO dto) {
        validateTrekRequestBody(dto);

        if (dto.getTitle() != null && dto.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trek title cannot be blank.");
        }
        if (dto.getDifficulty() != null && dto.getDifficulty().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trek difficulty cannot be blank.");
        }
        if ((dto.getStartLat() == null) != (dto.getStartLon() == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start latitude and longitude must be provided together.");
        }

        validateCommonTrekFields(dto);
    }

    private void validateTrekRequestBody(TrekRequestDTO dto) {
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trek request body is required.");
        }
    }

    private void validateCommonTrekFields(TrekRequestDTO dto) {
        if (dto.getDurationDays() != null && dto.getDurationDays() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duration must be greater than zero.");
        }
        if (dto.getMaxAltitudeMeters() != null && dto.getMaxAltitudeMeters() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Max altitude cannot be negative.");
        }
        if (dto.getPrice() != null && dto.getPrice() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price cannot be negative.");
        }
        if (dto.getStartLat() != null && (dto.getStartLat() < -90 || dto.getStartLat() > 90)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Latitude must be between -90 and 90.");
        }
        if (dto.getStartLon() != null && (dto.getStartLon() < -180 || dto.getStartLon() > 180)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Longitude must be between -180 and 180.");
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private Trek applyResponseDefaults(Trek trek) {
        if (trek.getMaxAltitudeMeters() == null) {
            trek.setMaxAltitudeMeters(0);
        }

        return trek;
    }
}
