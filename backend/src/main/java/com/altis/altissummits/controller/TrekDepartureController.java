package com.altis.altissummits.controller;

import com.altis.altissummits.dto.TrekDepartureRequestDTO;
import com.altis.altissummits.entity.TrekDeparture;
import com.altis.altissummits.service.TrekDepartureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/treks/{slug}/departures")
@RequiredArgsConstructor
public class TrekDepartureController {

    private final TrekDepartureService departureService;

    @GetMapping
    public ResponseEntity<List<TrekDeparture>> getDepartures(@PathVariable String slug) {
        return ResponseEntity.ok(departureService.getDeparturesForTrek(slug));
    }

    @PostMapping
    public ResponseEntity<TrekDeparture> createDeparture(
            @PathVariable String slug,
            @RequestBody TrekDepartureRequestDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(departureService.createDeparture(slug, dto));
    }

    @PatchMapping("/{departureId}")
    public ResponseEntity<TrekDeparture> updateDeparture(
            @PathVariable String slug,
            @PathVariable Long departureId,
            @RequestBody TrekDepartureRequestDTO dto
    ) {
        return ResponseEntity.ok(departureService.updateDeparture(slug, departureId, dto));
    }

    @DeleteMapping("/{departureId}")
    public ResponseEntity<Void> deleteDeparture(
            @PathVariable String slug,
            @PathVariable Long departureId
    ) {
        departureService.deleteDeparture(slug, departureId);
        return ResponseEntity.noContent().build();
    }
}
