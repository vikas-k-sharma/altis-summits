package com.altis.altissummits.service;

import com.altis.altissummits.dto.ItineraryDayRequestDTO;
import com.altis.altissummits.entity.ItineraryDay;
import com.altis.altissummits.entity.Trek;
import com.altis.altissummits.repository.ItineraryDayRepository;
import com.altis.altissummits.repository.TrekRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ItineraryDayService {

    private final ItineraryDayRepository itineraryDayRepository;
    private final TrekRepository trekRepository;

    public List<ItineraryDay> getItineraryForTrek(String slug) {
        ensureTrekExists(slug);
        return itineraryDayRepository.findByTrekSlugOrderByDayNumberAsc(slug);
    }

    public ItineraryDay createItineraryDay(String slug, ItineraryDayRequestDTO dto) {
        validateCreateRequest(dto, slug);

        Trek trek = findTrekBySlug(slug);
        ItineraryDay itineraryDay = new ItineraryDay();
        itineraryDay.setTrek(trek);
        applyFields(itineraryDay, dto, false);

        return itineraryDayRepository.save(itineraryDay);
    }

    @Transactional
    public List<ItineraryDay> replaceItineraryForTrek(String slug, List<ItineraryDayRequestDTO> itineraryDays) {
        validateBulkRequest(itineraryDays);

        Trek trek = findTrekBySlug(slug);
        itineraryDayRepository.deleteByTrekSlug(slug);

        List<ItineraryDay> days = itineraryDays.stream()
                .map(dto -> {
                    ItineraryDay itineraryDay = new ItineraryDay();
                    itineraryDay.setTrek(trek);
                    applyFields(itineraryDay, dto, false);
                    return itineraryDay;
                })
                .toList();

        itineraryDayRepository.saveAll(days);
        return itineraryDayRepository.findByTrekSlugOrderByDayNumberAsc(slug);
    }

    public ItineraryDay updateItineraryDay(String slug, Long dayId, ItineraryDayRequestDTO dto) {
        validateUpdateRequest(dto, slug, dayId);

        ItineraryDay itineraryDay = findItineraryDay(slug, dayId);
        applyFields(itineraryDay, dto, true);

        return itineraryDayRepository.save(itineraryDay);
    }

    public void deleteItineraryDay(String slug, Long dayId) {
        ItineraryDay itineraryDay = findItineraryDay(slug, dayId);
        itineraryDayRepository.delete(itineraryDay);
    }

    private void applyFields(ItineraryDay itineraryDay, ItineraryDayRequestDTO dto, boolean partialUpdate) {
        if (!partialUpdate || dto.getDayNumber() != null) {
            itineraryDay.setDayNumber(dto.getDayNumber());
        }
        if (!partialUpdate || dto.getTitle() != null) {
            itineraryDay.setTitle(dto.getTitle().trim());
        }
        if (!partialUpdate || dto.getDescription() != null) {
            itineraryDay.setDescription(dto.getDescription());
        }
        if (!partialUpdate || dto.getAltitudeMeters() != null) {
            itineraryDay.setAltitudeMeters(dto.getAltitudeMeters());
        }
        if (!partialUpdate || dto.getAccommodationType() != null) {
            itineraryDay.setAccommodationType(dto.getAccommodationType());
        }
    }

    private void validateCreateRequest(ItineraryDayRequestDTO dto, String slug) {
        validateRequestBody(dto);

        if (dto.getDayNumber() == null) {
            throw badRequest("Day number is required.");
        }
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw badRequest("Itinerary day title is required.");
        }

        validateCommonFields(dto);
        if (itineraryDayRepository.existsByTrekSlugAndDayNumber(slug, dto.getDayNumber())) {
            throw badRequest("Itinerary day number already exists for this trek.");
        }
    }

    private void validateUpdateRequest(ItineraryDayRequestDTO dto, String slug, Long dayId) {
        validateRequestBody(dto);

        if (dto.getTitle() != null && dto.getTitle().isBlank()) {
            throw badRequest("Itinerary day title cannot be blank.");
        }

        validateCommonFields(dto);
        if (dto.getDayNumber() != null
                && itineraryDayRepository.existsByTrekSlugAndDayNumberAndIdNot(slug, dto.getDayNumber(), dayId)) {
            throw badRequest("Itinerary day number already exists for this trek.");
        }
    }

    private void validateBulkRequest(List<ItineraryDayRequestDTO> itineraryDays) {
        if (itineraryDays == null) {
            throw badRequest("Itinerary day list is required.");
        }

        Set<Integer> dayNumbers = new HashSet<>();
        for (ItineraryDayRequestDTO dto : itineraryDays) {
            validateRequestBody(dto);

            if (dto.getDayNumber() == null) {
                throw badRequest("Day number is required for every itinerary day.");
            }
            if (dto.getTitle() == null || dto.getTitle().isBlank()) {
                throw badRequest("Title is required for every itinerary day.");
            }

            validateCommonFields(dto);
            if (!dayNumbers.add(dto.getDayNumber())) {
                throw badRequest("Duplicate itinerary day number: " + dto.getDayNumber());
            }
        }
    }

    private void validateCommonFields(ItineraryDayRequestDTO dto) {
        if (dto.getDayNumber() != null && dto.getDayNumber() <= 0) {
            throw badRequest("Day number must be greater than zero.");
        }
        if (dto.getAltitudeMeters() != null && dto.getAltitudeMeters() < 0) {
            throw badRequest("Altitude cannot be negative.");
        }
    }

    private void validateRequestBody(ItineraryDayRequestDTO dto) {
        if (dto == null) {
            throw badRequest("Itinerary request body is required.");
        }
    }

    private Trek findTrekBySlug(String slug) {
        return trekRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trek not found with slug: " + slug));
    }

    private void ensureTrekExists(String slug) {
        if (!trekRepository.existsBySlug(slug)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Trek not found with slug: " + slug);
        }
    }

    private ItineraryDay findItineraryDay(String slug, Long dayId) {
        return itineraryDayRepository.findByIdAndTrekSlug(dayId, slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Itinerary day not found for this trek."));
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
