package com.altis.altissummits.repository;

import com.altis.altissummits.entity.TrekDeparture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrekDepartureRepository extends JpaRepository<TrekDeparture, Long> {

    List<TrekDeparture> findByTrekIdOrderByStartDateAsc(Long trekId);

    List<TrekDeparture> findByTrekSlugOrderByStartDateAsc(String slug);

    Optional<TrekDeparture> findByIdAndTrekSlug(Long id, String slug);
}
