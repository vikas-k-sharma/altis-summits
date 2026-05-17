package com.altis.altissummits.service;

import com.altis.altissummits.entity.Trek;
import com.altis.altissummits.entity.TrekDeparture;
import com.altis.altissummits.repository.TrekDepartureRepository;
import com.altis.altissummits.repository.TrekRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrekDepartureService {

    private final TrekDepartureRepository departureRepository;
    private final TrekRepository trekRepository;

    public List<TrekDeparture> getDeparturesForTrek(Long trekId) {
        return departureRepository.findByTrekIdOrderByStartDateAsc(trekId);
    }

    public TrekDeparture addDepartureToTrek(Long trekId, TrekDeparture departure) {
        // 1. Find the parent Trek first
        Trek trek = trekRepository.findById(trekId)
                .orElseThrow(() -> new RuntimeException("Trek not found with ID: " + trekId));

        // 2. Link the child to the parent
        departure.setTrek(trek);

        // 3. Business Logic: If new, available seats equal total seats
        if (departure.getAvailableSeats() == null) {
            departure.setAvailableSeats(departure.getTotalSeats());
        }

        return departureRepository.save(departure);
    }

}
