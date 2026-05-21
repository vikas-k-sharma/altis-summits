package com.altis.altissummits.controller;

import com.altis.altissummits.dto.ItineraryDayRequestDTO;
import com.altis.altissummits.entity.ItineraryDay;
import com.altis.altissummits.service.ItineraryDayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/treks/{slug}/itinerary")
@RequiredArgsConstructor
public class ItineraryDayController {

    private final ItineraryDayService itineraryDayService;

    @GetMapping
    public ResponseEntity<List<ItineraryDay>> getItinerary(@PathVariable String slug) {
        return ResponseEntity.ok(itineraryDayService.getItineraryForTrek(slug));
    }

    @PostMapping
    public ResponseEntity<ItineraryDay> createItineraryDay(
            @PathVariable String slug,
            @RequestBody ItineraryDayRequestDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(itineraryDayService.createItineraryDay(slug, dto));
    }

    @PutMapping
    public ResponseEntity<List<ItineraryDay>> replaceItinerary(
            @PathVariable String slug,
            @RequestBody List<ItineraryDayRequestDTO> itineraryDays
    ) {
        return ResponseEntity.ok(itineraryDayService.replaceItineraryForTrek(slug, itineraryDays));
    }

    @PatchMapping("/{dayId}")
    public ResponseEntity<ItineraryDay> updateItineraryDay(
            @PathVariable String slug,
            @PathVariable Long dayId,
            @RequestBody ItineraryDayRequestDTO dto
    ) {
        return ResponseEntity.ok(itineraryDayService.updateItineraryDay(slug, dayId, dto));
    }

    @DeleteMapping("/{dayId}")
    public ResponseEntity<Void> deleteItineraryDay(
            @PathVariable String slug,
            @PathVariable Long dayId
    ) {
        itineraryDayService.deleteItineraryDay(slug, dayId);
        return ResponseEntity.noContent().build();
    }
}
