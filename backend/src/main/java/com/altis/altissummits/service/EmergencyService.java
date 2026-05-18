package com.altis.altissummits.service;

import com.altis.altissummits.entity.EmergencyFacility;
import com.altis.altissummits.repository.EmergencyFacilityRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmergencyService {

    private final EmergencyFacilityRepository facilityRepository;

    public EmergencyFacility getNearestExtractionPoint(Point sosLocation) {
        List<Object[]> results = facilityRepository.findNearestFacilityRaw(sosLocation);

        if (results == null || results.isEmpty() || results.getFirst()[0] == null) {
            throw new RuntimeException("No emergency facilities found in the database.");
        }

        Object[] result = results.getFirst();

        // Hibernate returns an array where [0] is the Entity and [1] is the calculated distance
        EmergencyFacility facility = (EmergencyFacility) result[0];
        Double distance = ((Number) result[1]).doubleValue();

        facility.setDistanceInMeters(distance);
        return facility;
    }
}
