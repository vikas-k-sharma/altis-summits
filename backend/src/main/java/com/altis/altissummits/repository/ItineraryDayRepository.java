package com.altis.altissummits.repository;

import com.altis.altissummits.entity.ItineraryDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItineraryDayRepository extends JpaRepository<ItineraryDay, Long> {
    List<ItineraryDay> findByTrekSlugOrderByDayNumberAsc(String slug);

    void deleteByTrekSlug(String slug);

    Optional<ItineraryDay> findByIdAndTrekSlug(Long id, String slug);

    boolean existsByTrekSlugAndDayNumber(String slug, Integer dayNumber);

    boolean existsByTrekSlugAndDayNumberAndIdNot(String slug, Integer dayNumber, Long id);
}
