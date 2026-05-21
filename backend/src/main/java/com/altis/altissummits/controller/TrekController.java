package com.altis.altissummits.controller;

import com.altis.altissummits.dto.TrekRequestDTO;
import com.altis.altissummits.entity.Trek;
import com.altis.altissummits.service.TrekService;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/treks")
@RequiredArgsConstructor
public class TrekController {

    public record TrekMapData(String title, String slug, double latitude, double longitude) {}
    public record TrekOption(Long id, String title, String slug, String region, Boolean isActive) {}

    private static final int WGS_84_SRID = 4326;

    private final TrekService trekService;
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), WGS_84_SRID);

    @GetMapping
    public ResponseEntity<List<Trek>> getAllTreks() {
        return ResponseEntity.ok(trekService.getAllActiveTreks());
    }

    @GetMapping("/admin/options")
    public ResponseEntity<List<TrekOption>> getTrekOptionsForAdmin() {
        List<TrekOption> options = trekService.getTrekOptionsForAdmin().stream()
                .map(trek -> new TrekOption(
                        trek.getId(),
                        trek.getTitle(),
                        trek.getSlug(),
                        trek.getRegion(),
                        trek.getIsActive()
                ))
                .toList();

        return ResponseEntity.ok(options);
    }

    @GetMapping("/region/{region}")
    public ResponseEntity<List<Trek>> getTreksByRegion(@PathVariable String region) {
        return ResponseEntity.ok(trekService.getTreksByRegion(region));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Trek> getTrekBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(trekService.getTrekBySlug(slug));
    }

//    @PostMapping
//    public ResponseEntity<Trek> createTrek(@RequestBody Trek trek) {
//        Trek createdTrek = trekService.createTrek(trek);
//        return ResponseEntity.status(HttpStatus.CREATED).body(createdTrek);
//    }

    // 5. GET /api/v1/treks/map - Fetch data specifically formatted for frontend maps
    @GetMapping("/map")
    public ResponseEntity<List<TrekMapData>> getTreksForMap() {
        List<TrekMapData> mapData = trekService.getAllActiveTreks().stream()
                .filter(trek -> trek.getStartLocation() != null)
                .map(trek -> new TrekMapData(
                        trek.getTitle(),
                        trek.getSlug(),
                        trek.getStartLocation().getY(), // Y is Latitude
                        trek.getStartLocation().getX()  // X is Longitude
                ))
                .toList();

        return ResponseEntity.ok(mapData);
    }

    // 6. GET /api/v1/treks/search/nearby - Find treks near a specific GPS coordinate
    @GetMapping("/search/nearby")
    public ResponseEntity<List<Trek>> getTreksNearby(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "50000") double radius // Default 50km (50,000 meters)
    ) {
        Point userLocation = geometryFactory.createPoint(new Coordinate(lon, lat));
        userLocation.setSRID(WGS_84_SRID);

        return ResponseEntity.ok(trekService.getTreksNearby(userLocation, radius));
    }

    @PostMapping
    public ResponseEntity<Trek> createAdminTrek(@RequestBody TrekRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trekService.createAdminTrek(dto));
    }

    @PutMapping("/{slug}")
    public ResponseEntity<Trek> updateAdminTrek(
            @PathVariable String slug,
            @RequestBody TrekRequestDTO dto
    ) {
        return ResponseEntity.ok(trekService.updateAdminTrek(slug, dto));
    }
}
