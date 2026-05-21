package com.altis.altissummits.service;

import com.altis.altissummits.dto.TrekDepartureRequestDTO;
import com.altis.altissummits.entity.DepartureStatus;
import com.altis.altissummits.entity.Trek;
import com.altis.altissummits.entity.TrekDeparture;
import com.altis.altissummits.repository.TrekDepartureRepository;
import com.altis.altissummits.repository.TrekRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class TrekDepartureService {

    private final TrekDepartureRepository departureRepository;
    private final TrekRepository trekRepository;

    public List<TrekDeparture> getDeparturesForTrek(Long trekId) {
        return departureRepository.findByTrekIdOrderByStartDateAsc(trekId);
    }

    public List<TrekDeparture> getDeparturesForTrek(String slug) {
        ensureTrekExists(slug);
        return departureRepository.findByTrekSlugOrderByStartDateAsc(slug);
    }

    public TrekDeparture addDepartureToTrek(Long trekId, TrekDeparture departure) {
        Trek trek = trekRepository.findById(trekId)
                .orElseThrow(() -> new RuntimeException("Trek not found with ID: " + trekId));

        departure.setTrek(trek);

        if (departure.getAvailableSeats() == null) {
            departure.setAvailableSeats(departure.getTotalSeats());
        }

        return departureRepository.save(departure);
    }

    public TrekDeparture createDeparture(String slug, TrekDepartureRequestDTO dto) {
        validateCreateRequest(dto);

        Trek trek = findTrekBySlug(slug);
        TrekDeparture departure = new TrekDeparture();
        departure.setTrek(trek);
        applyFields(departure, dto, false);

        if (departure.getAvailableSeats() == null) {
            departure.setAvailableSeats(departure.getTotalSeats());
        }

        validateSeatCapacity(departure.getTotalSeats(), departure.getAvailableSeats());
        return departureRepository.save(departure);
    }

    public TrekDeparture updateDeparture(String slug, Long departureId, TrekDepartureRequestDTO dto) {
        validateUpdateRequest(dto);

        TrekDeparture departure = findDeparture(slug, departureId);
        applyFields(departure, dto, true);

        validateDateRange(departure.getStartDate(), departure.getEndDate());
        validateSeatCapacity(departure.getTotalSeats(), departure.getAvailableSeats());
        return departureRepository.save(departure);
    }

    public void deleteDeparture(String slug, Long departureId) {
        TrekDeparture departure = findDeparture(slug, departureId);
        departureRepository.delete(departure);
    }

    private void applyFields(TrekDeparture departure, TrekDepartureRequestDTO dto, boolean partialUpdate) {
        if (!partialUpdate || dto.getStartDate() != null) {
            departure.setStartDate(dto.getStartDate());
        }
        if (!partialUpdate || dto.getEndDate() != null) {
            departure.setEndDate(dto.getEndDate());
        }
        if (!partialUpdate || dto.getTotalSeats() != null) {
            departure.setTotalSeats(dto.getTotalSeats());
        }
        if (!partialUpdate || dto.getAvailableSeats() != null) {
            departure.setAvailableSeats(dto.getAvailableSeats());
        }
        if (!partialUpdate || dto.getStatus() != null) {
            departure.setStatus(parseStatus(dto.getStatus()));
        }
    }

    private void validateCreateRequest(TrekDepartureRequestDTO dto) {
        validateRequestBody(dto);

        if (dto.getStartDate() == null) {
            throw badRequest("Start date is required.");
        }
        if (dto.getEndDate() == null) {
            throw badRequest("End date is required.");
        }
        if (dto.getTotalSeats() == null) {
            throw badRequest("Total seats is required.");
        }

        validateCommonFields(dto);
        validateDateRange(dto.getStartDate(), dto.getEndDate());
        validateSeatCapacity(dto.getTotalSeats(), dto.getAvailableSeats());
    }

    private void validateUpdateRequest(TrekDepartureRequestDTO dto) {
        validateRequestBody(dto);
        validateCommonFields(dto);
    }

    private void validateCommonFields(TrekDepartureRequestDTO dto) {
        if (dto.getTotalSeats() != null && dto.getTotalSeats() <= 0) {
            throw badRequest("Total seats must be greater than zero.");
        }
        if (dto.getAvailableSeats() != null && dto.getAvailableSeats() < 0) {
            throw badRequest("Available seats cannot be negative.");
        }
        if (dto.getStatus() != null) {
            parseStatus(dto.getStatus());
        }
    }

    private void validateRequestBody(TrekDepartureRequestDTO dto) {
        if (dto == null) {
            throw badRequest("Departure request body is required.");
        }
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw badRequest("End date cannot be before start date.");
        }
    }

    private void validateSeatCapacity(Integer totalSeats, Integer availableSeats) {
        if (totalSeats != null && availableSeats != null && availableSeats > totalSeats) {
            throw badRequest("Available seats cannot exceed total seats.");
        }
    }

    private DepartureStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return DepartureStatus.SCHEDULED;
        }

        try {
            return DepartureStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid departure status: " + status, ex);
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

    private TrekDeparture findDeparture(String slug, Long departureId) {
        return departureRepository.findByIdAndTrekSlug(departureId, slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Departure not found for this trek."));
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
