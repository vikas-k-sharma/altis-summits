package com.altis.altissummits.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.locationtech.jts.geom.Point;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "treks")
public class Trek {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // SEO & Routing: The URL-friendly name (e.g., "everest-base-camp")
    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    // Using TEXT instead of VARCHAR for long paragraphs
    @Column(columnDefinition = "TEXT")
    private String description;

    // Categorization
    private String country; // e.g., "India", "Nepal"
    private String region;  // e.g., "Uttarakhand", "Himachal"

    // Geographic Point (Longitude, Latitude)
    // 4326 is the standard GPS coordinate system (WGS 84)
    @Column(columnDefinition = "geometry(Point,4326)")
    @JsonIgnore // We ignore this directly because standard JSON can't read geographic binary data easily
    private Point startLocation;

    // Strict Enum for filtering
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    // Metrics for AI safety planning
    private Integer durationDays;
    private Integer maxAltitudeMeters;

    // Financials
    private Double basePrice;

    // Control Flags
    @Column(nullable = false)
    private Boolean isActive = true; // Never delete a trek, just set this to false

    // Production Auditing (Crucial for tracking data changes)
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // One Trek has Many Itinerary Days
    @OneToMany(mappedBy = "trek", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private java.util.List<ItineraryDay> itinerary = new java.util.ArrayList<>();

    // Helper method to keep both sides of the relationship in sync
    public void addItineraryDay(ItineraryDay day) {
        itinerary.add(day);
        day.setTrek(this);
    }
}
