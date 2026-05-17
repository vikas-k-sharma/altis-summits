package com.altis.altissummits.service;

import com.altis.altissummits.entity.ItineraryDay;
import com.altis.altissummits.entity.Trek;
import com.altis.altissummits.repository.TrekRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrekService {

    private final TrekRepository trekRepository;

    // 1. Fetch all active treks for the catalog
    public List<Trek> getAllActiveTreks() {
        return trekRepository.findByIsActiveTrue();
    }

    // 2. Fetch by region
    public List<Trek> getTreksByRegion(String region) {
        return trekRepository.findByRegionAndIsActiveTrue(region);
    }

    // 3. Fetch a single trek by its URL slug
    public Trek getTrekBySlug(String slug) {
        return trekRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Trek not found with slug: " + slug));
    }

    // 4. Create a new Trek (with business logic!)
    public Trek createTrek(Trek trek) {
        // Business Logic: If the user didn't provide a slug, auto-generate one from the title
        if (trek.getSlug() == null || trek.getSlug().isEmpty()) {
            String generatedSlug = trek.getTitle().toLowerCase().replace(" ", "-");
            trek.setSlug(generatedSlug);
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
        return trekRepository.findTreksNearLocation(userLocation, radius);
    }
}
