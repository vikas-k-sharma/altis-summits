package com.altis.altissummits.controller;

import com.altis.altissummits.entity.Trek;
import com.altis.altissummits.service.TrekService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/treks")
@RequiredArgsConstructor
public class TrekController {

    private final TrekService trekService;

    @GetMapping
    public ResponseEntity<List<Trek>> getAllTreks() {
        return ResponseEntity.ok(trekService.getAllActiveTreks());
    }

    @GetMapping("/region/{region}")
    public ResponseEntity<List<Trek>> getTreksByRegion(@PathVariable String region) {
        return ResponseEntity.ok(trekService.getTreksByRegion(region));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Trek> getTrekBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(trekService.getTrekBySlug(slug));
    }

    @PostMapping
    public ResponseEntity<Trek> createTrek(@RequestBody Trek trek) {
        Trek createdTrek = trekService.createTrek(trek);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTrek);
    }
}
