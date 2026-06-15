# init-database

Supabase Edge Function for initializing the `guests` table from the organizer panel.

## Deploy

- Deploy this function in Supabase Edge Functions.
- Disable JWT verification for the function, because `organizer.html` calls it from a browser-only app.
- Make sure the project has access to `SUPABASE_DB_URL` in the Edge Function environment.

## What it creates

- `public.guests`
- RLS policy for public access
- Realtime publication for `guests`

