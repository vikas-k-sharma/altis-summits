package com.altis.altissummits.controller;

import com.altis.altissummits.entity.TrekDeparture;
import com.altis.altissummits.service.TrekDepartureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/treks/{trekId}/departures")
@RequiredArgsConstructor
public class TrekDepartureController {

    private final TrekDepartureService departureService;

    @GetMapping
    public ResponseEntity<List<TrekDeparture>> getDepartures(@PathVariable Long trekId) {
        return ResponseEntity.ok(departureService.getDeparturesForTrek(trekId));
    }

    @PostMapping
    public ResponseEntity<TrekDeparture> createDeparture(
            @PathVariable Long trekId,
            @RequestBody TrekDeparture departure) {

        TrekDeparture createdDeparture = departureService.addDepartureToTrek(trekId, departure);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDeparture);
    }
}
