-- V4_seed_data.sql
-- Seed data for V4 schema.
-- Run from psql. This script switches DBs using \c.

-- ==========================================
-- SECTION A - AUTH DB
-- ==========================================
\c auth_db

-- ensure citext extension exists (idempotent)
CREATE EXTENSION IF NOT EXISTS citext;

-- Insert users with explicit IDs so we can reference them from rental_db seeds.
INSERT INTO users_auth (user_id, email, password_hash, role, verification_status)
VALUES
  (1001, 'owner@example.com', 'password-hash-owner', 'Owner', 'Verified'),
  (1002, 'alice@example.com', 'password-hash-alice', 'User', 'Verified'),
  (1003, 'bob@example.com', 'password-hash-bob', 'User', 'Pending')
ON CONFLICT (email) DO NOTHING;

-- advance sequence for users_auth
SELECT setval(pg_get_serial_sequence('users_auth','user_id'), GREATEST((SELECT COALESCE(MAX(user_id),0) FROM users_auth),1003));

-- Show inserted users
SELECT user_id, email, role, verification_status FROM users_auth WHERE user_id >= 1001 ORDER BY user_id;

-- ==========================================
-- SECTION B - RENTAL DB
-- ==========================================
\c rental_db

CREATE EXTENSION IF NOT EXISTS citext;

-- Insert customers (use the user_id values created above)
INSERT INTO customers (customer_id, user_id, full_name, email, phone)
VALUES
  (3001, 1002, 'Alice A', 'alice@example.com', '+1-555-0100'),
  (3002, 1003, 'Bob B', 'bob@example.com', '+1-555-0101'),
  (3003, 1001, 'Owner One', 'owner@example.com', '+1-555-0111')
ON CONFLICT (user_id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('customers','customer_id'), GREATEST((SELECT COALESCE(MAX(customer_id),0) FROM customers),3003));

-- Insert an owner record for the owner customer and mark verified (safe conditional insert)
INSERT INTO owner (owner_id, customer_id, verification_status)
SELECT 2001, 3003, 'Verified'
WHERE NOT EXISTS (SELECT 1 FROM owner WHERE customer_id = 3003);
SELECT setval(pg_get_serial_sequence('owner','owner_id'), GREATEST((SELECT COALESCE(MAX(owner_id),0) FROM owner),2001));

-- Insert a property (if not exists) and a room
INSERT INTO property (property_id, owner_id, property_description, room_description, property_type, city, address, google_maps_link, verification_status, average_rating)
SELECT 4001, 2001, 'Cozy guest house near downtown', 'Rooms with private baths', 'Guest House', 'Metropolis', '123 Main St', 'https://maps.example/prop1', 'Verified', NULL
WHERE NOT EXISTS (SELECT 1 FROM property WHERE google_maps_link = 'https://maps.example/prop1');

INSERT INTO room (room_id, property_id, room_number, rent_per_month, is_active)
SELECT 4001, 4001, 'G1', 12000.00, TRUE
WHERE NOT EXISTS (SELECT 1 FROM room WHERE room_id = 4001);

SELECT setval(pg_get_serial_sequence('property','property_id'), GREATEST((SELECT COALESCE(MAX(property_id),0) FROM property), (SELECT COALESCE(MAX(property_id),0) FROM property)));
SELECT setval(pg_get_serial_sequence('room','room_id'), GREATEST((SELECT COALESCE(MAX(room_id),0) FROM room),4001));

-- Create a completed booking (past dates) so we can insert a review
INSERT INTO booking (booking_id, customer_id, room_id, start_date, end_date, booking_status)
VALUES (5001, 3001, 4001, '2025-12-01', '2025-12-15', 'Completed')
ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('booking','booking_id'), GREATEST((SELECT COALESCE(MAX(booking_id),0) FROM booking),5001));

-- Insert a review for the completed booking
INSERT INTO review (review_id, customer_id, property_id, rating, review_text)
VALUES (
  6001,
  3001,
  (SELECT property_id FROM property WHERE google_maps_link = 'https://maps.example/prop1' LIMIT 1),
  5,
  'Excellent stay — very clean and well located.'
)
ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('review','review_id'), GREATEST((SELECT COALESCE(MAX(review_id),0) FROM review),6001));

-- Show seeded domain data
SELECT * FROM customers WHERE customer_id >= 3000 ORDER BY customer_id;
SELECT * FROM owner WHERE owner_id >= 2000 ORDER BY owner_id;
SELECT p.property_id, p.owner_id, p.city, p.google_maps_link, p.verification_status FROM property p WHERE p.owner_id = 2001;
SELECT * FROM room WHERE room_id >= 4000;
SELECT * FROM booking WHERE booking_id >= 5000;
SELECT * FROM review WHERE review_id >= 6000;

-- End of seed file
