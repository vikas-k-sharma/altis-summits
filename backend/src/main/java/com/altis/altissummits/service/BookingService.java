package com.altis.altissummits.service;

import com.altis.altissummits.dto.BookingRequest;
import com.altis.altissummits.entity.Booking;
import com.altis.altissummits.entity.BookingStatus;
import com.altis.altissummits.entity.TrekDeparture;
import com.altis.altissummits.entity.User;
import com.altis.altissummits.repository.BookingRepository;
import com.altis.altissummits.repository.TrekDepartureRepository;
import com.altis.altissummits.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final TrekDepartureRepository departureRepository;

    @Transactional
    public Booking processBooking(BookingRequest request) {

        // 1. Fetch User and Departure
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        TrekDeparture departure = departureRepository.findById(request.getDepartureId())
                .orElseThrow(() -> new RuntimeException("Departure not found"));

        // 2. Business Logic: Inventory Check
        if (departure.getAvailableSeats() <= 0) {
            throw new RuntimeException("Sorry, this departure is fully booked.");
        }

        // 3. Update Inventory
        departure.setAvailableSeats(departure.getAvailableSeats() - 1);
        departureRepository.save(departure);

        // 4. Create the Booking Record
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setDeparture(departure);
        booking.setPaymentReference(request.getPaymentReference());
        booking.setStatus(BookingStatus.CONFIRMED); // Simulating successful payment for now

        return bookingRepository.save(booking);
    }
}
