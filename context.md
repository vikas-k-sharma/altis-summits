# Altis Summits - Architecture Context

## Tech Stack
- **Frontend:** Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS v4, shadcn/ui, lucide-react. Port: 3000
- **Backend:** Spring Boot 3.x, Java 17/21, Spring Data JPA, Lombok. Port: 8080
- **Database:** PostgreSQL (Database: `altis`, User: `altis_app`). Port: 5432

## Current Data Model (PostgreSQL)

### 1. Catalog & Expedition Data
- `Trek` 
  - Fields: `id`, `slug` (unique), `title`, `description`, `country`, `region`, `difficulty` (Enum), `durationDays`, `maxAltitudeMeters`, `basePrice`, `isActive`, `createdAt`, `updatedAt`
  - Relationships: One-to-Many with `ItineraryDay`, One-to-Many with `TrekDeparture`
- `ItineraryDay`
  - Fields: `id`, `dayNumber`, `title`, `description`, `altitudeMeters`, `accommodationType`
  - Relationships: Many-to-One with `Trek` (foreign key: `trek_id`)
- `TrekDeparture` (Scheduling)
  - Fields: `id`, `startDate`, `endDate`, `totalSeats`, `availableSeats`, `status` (Enum: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)
  - Relationships: Many-to-One with `Trek` (foreign key: `trek_id`)

### 2. Users & Transactions (The Booking Engine)
- `User`
  - Fields: `id`, `fullName`, `email` (unique), `emergencyContact`
- `Booking`
  - Fields: `id`, `status` (Enum: PENDING, CONFIRMED, CANCELLED), `paymentReference`, `bookingDate`
  - Relationships: Many-to-One with `User` (foreign key: `user_id`), Many-to-One with `TrekDeparture` (foreign key: `departure_id`)

## Backend API Endpoints (Base: `/api/v1`)
- **Treks:** - `GET /treks` (All active)
  - `GET /treks/{slug}` (Single trek)
  - `POST /treks` (Create trek + cascade save itinerary)
- **Departures:** - `GET /treks/{trekId}/departures`
  - `POST /treks/{trekId}/departures`
- **Bookings:** - `POST /bookings` (Consumes `BookingRequest` DTO. Uses `@Transactional` to verify inventory, decrement `availableSeats`, and save booking safely).

## Next.js Frontend State
- `src/app/layout.tsx`: Global navigation and footer.
- `src/app/page.tsx`: Static marketing homepage.
- `src/app/treks/page.tsx`: Dynamic list fetching all active treks.
- `src/app/treks/[slug]/page.tsx`: Dynamic detail page. Sequentially fetches the Trek, then its Departures. Maps itinerary and departure arrays to the UI.

## Current Architectural Rules
- Database credentials use the Principle of Least Privilege (`altis_app`).
- Next.js 16 components use async `params` and `fetch()` caching logic.
- Transactional integrity is enforced on all inventory-altering actions.