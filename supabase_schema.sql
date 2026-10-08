-- ==============================================================================
-- Supabase Schema for Hotel Management App
-- Run this SQL in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Create table 'hotel_details'
CREATE TABLE IF NOT EXISTS hotel_details (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude VARCHAR(50),
    longitude VARCHAR(50),
    price VARCHAR(50) NOT NULL,
    rating VARCHAR(10) DEFAULT '8.0',
    description TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Optional: Seed initial demo hotels
INSERT INTO hotel_details (name, location, latitude, longitude, price, rating, description, image_url)
VALUES
(
    'Grand Palace Hotel',
    'Salem, Tamil Nadu',
    '11.6643',
    '78.1460',
    '₹3,500',
    '9.2',
    'Luxury stay with top tier amenities, premium dining, rooftop pool and spectacular views.',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
),
(
    'Ocean View Resort',
    'Chennai, Tamil Nadu',
    '13.0827',
    '80.2707',
    '₹4,800',
    '8.8',
    'Exquisite beachfront resort with private beach access, spa wellness center, and fine dining.',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
),
(
    'Mountain Breeze Retreat',
    'Yercaud, Tamil Nadu',
    '11.7753',
    '78.2093',
    '₹2,900',
    '8.5',
    'Peaceful hillside retreat surrounded by coffee plantations, panoramic valley view and fresh breeze.',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
)
ON CONFLICT DO NOTHING;
