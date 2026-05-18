package com.altis.altissummits.controller;

import com.altis.altissummits.entity.EmergencyFacility;
import com.altis.altissummits.service.EmergencyService;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/emergency")
@RequiredArgsConstructor
public class EmergencyController {

    private final EmergencyService emergencyService;
    private final GeometryFactory geometryFactory = new GeometryFactory();
    private static final int WGS_84_SRID = 4326;

    @GetMapping("/sos")
    public ResponseEntity<EmergencyFacility> triggerSos(
            @RequestParam double lat,
            @RequestParam double lon
    ) {
        Point sosLocation = geometryFactory.createPoint(new Coordinate(lon, lat));
        sosLocation.setSRID(WGS_84_SRID);

        return ResponseEntity.ok(emergencyService.getNearestExtractionPoint(sosLocation));
    }
}