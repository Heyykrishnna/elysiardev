-- sessions: each QR session created by teacher
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid, -- optional: references users table if you have auth
  class_id text,
  qr_token text not null unique,
  created_at timestamptz default now(),
  expires_at timestamptz,
  latitude double precision,
  longitude double precision,
  radius_meters integer default 50, -- allowed distance
  active boolean default true
);

-- attendance records inserted when a student is accepted
create table if not exists attendances (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  student_id uuid, -- optional: your user id
  student_name text,
  student_lat double precision,
  student_lng double precision,
  distance_meters double precision,
  created_at timestamptz default now(),
  unique(session_id, student_id) -- prevent double attendance for same session
);
