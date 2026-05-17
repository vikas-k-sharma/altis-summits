package com.altis.altissummits.repository;

import com.altis.altissummits.entity.TrekDeparture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrekDepartureRepository extends JpaRepository<TrekDeparture, Long> {

    List<TrekDeparture> findByTrekIdOrderByStartDateAsc(Long trekId);
}
