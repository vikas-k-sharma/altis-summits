package com.altis.altissummits.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.locationtech.jts.geom.Point;

@Entity
@Table(name = "emergency_facilities")
@Data
public class EmergencyFacility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FacilityType type;

    private String contactNumber;

    private Boolean hasNightLanding; // Crucial for helipads

    @Column(columnDefinition = "geometry(Point,4326)", nullable = false)
    @JsonIgnore
    private Point location;

    // Transient field to send the calculated distance back to the frontend
    @Transient
    private Double distanceInMeters;

    // Getters for longitude and latitude to send to frontend easily
    public double getLatitude() {
        return location != null ? location.getY() : 0.0;
    }

    public double getLongitude() {
        return location != null ? location.getX() : 0.0;
    }
}