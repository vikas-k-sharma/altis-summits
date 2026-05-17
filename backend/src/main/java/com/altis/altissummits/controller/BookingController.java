package com.altis.altissummits.controller;

import com.altis.altissummits.dto.BookingRequest;
import com.altis.altissummits.entity.Booking;
import com.altis.altissummits.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody BookingRequest request) {
        Booking newBooking = bookingService.processBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(newBooking);
    }
}
