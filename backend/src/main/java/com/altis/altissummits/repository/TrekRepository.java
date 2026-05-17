package com.altis.altissummits.repository;

import com.altis.altissummits.entity.Trek;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrekRepository extends JpaRepository<Trek, Long> {

    // 1. Fetch for SEO URLs
    Optional<Trek> findBySlug(String slug);

    // 2. Fetch only active treks for the main catalog
    List<Trek> findByIsActiveTrue();

    // 3. Fetch treks for specific landing pages (e.g., "Uttarakhand Treks")
    List<Trek> findByRegionAndIsActiveTrue(String region);
}
