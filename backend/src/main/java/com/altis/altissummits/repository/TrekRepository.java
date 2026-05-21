package com.altis.altissummits.repository;

import com.altis.altissummits.entity.Trek;
import org.locationtech.jts.geom.Point;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrekRepository extends JpaRepository<Trek, Long> {

    // 1. Fetch for SEO URLs
    Optional<Trek> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    // 2. Fetch only active treks for the main catalog
    List<Trek> findByIsActiveTrue();

    // 3. Fetch treks for specific landing pages (e.g., "Uttarakhand Treks")
    List<Trek> findByRegionAndIsActiveTrue(String region);

    @Query("""
            SELECT t
            FROM Trek t
            WHERE t.isActive = true
              AND function('ST_DWithin', t.startLocation, :userLocation, :radiusInMeters) = true
            ORDER BY function('ST_Distance', t.startLocation, :userLocation)
            """)
    List<Trek> findTreksNearLocation(
            @Param("userLocation") Point userLocation,
            @Param("radiusInMeters") double radiusInMeters
    );
}
