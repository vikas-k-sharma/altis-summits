package com.altis.altissummits.repository;

import com.altis.altissummits.entity.EmergencyFacility;
import org.locationtech.jts.geom.Point;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyFacilityRepository extends JpaRepository<EmergencyFacility, Long> {

    // Find the closest facility and calculate the exact distance
    @Query("""
            SELECT f, function('ST_DistanceSphere', f.location, :sosLocation) as dist
            FROM EmergencyFacility f
            ORDER BY dist ASC
            LIMIT 1
            """)
    List<Object[]> findNearestFacilityRaw(@Param("sosLocation") Point sosLocation);
}
