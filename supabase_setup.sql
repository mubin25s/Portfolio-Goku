-- Supabase Database Setup for Portfolio (Contacts & Ratings)

-- 1. Create 'contacts' table to store messages from "Get In Touch" section
CREATE TABLE IF NOT EXISTS public.contacts (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create 'ratings' table to store feedback from "Leave a Review" section
CREATE TABLE IF NOT EXISTS public.ratings (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
-- This ensures the data is protected and we can define specific access rules.
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for 'contacts'
-- Allow anyone (anonymous public users) to send a message (Insert)
CREATE POLICY "Allow anonymous users to send messages" ON public.contacts FOR
INSERT
    TO anon
WITH
    CHECK (true);

-- Allow you (the admin) to view your messages (Select)
-- Note: In Supabase dashboard, you can view these easily.
-- This policy allows select access to service_role or authenticated users if needed.
CREATE POLICY "Allow authenticated users to view contacts" ON public.contacts FOR
SELECT TO authenticated USING (true);

-- 5. Create Policies for 'ratings'
-- Allow anyone (public) to leave a rating (Insert)
CREATE POLICY "Allow anonymous users to submit ratings" ON public.ratings FOR
INSERT
    TO anon
WITH
    CHECK (true);

-- Allow anyone (public) to see the average rating or existing reviews (Select)
-- This is necessary for the frontend to fetch and display the average stars.
CREATE POLICY "Allow public to view ratings" ON public.ratings FOR
SELECT TO anon USING (true);

-- 6. Add Indexes for better performance on large sets of data
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts (email);

CREATE INDEX IF NOT EXISTS idx_ratings_rating ON ratings (rating);