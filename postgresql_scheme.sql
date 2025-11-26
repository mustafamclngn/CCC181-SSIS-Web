-- create colleges table
CREATE TABLE IF NOT EXISTS public.colleges
(
    collegecode character varying(20) COLLATE pg_catalog."default" NOT NULL,
    collegename character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT colleges_pkey PRIMARY KEY (collegecode)
);

-- create programs table
CREATE TABLE IF NOT EXISTS public.programs
(
    programcode character varying(20) COLLATE pg_catalog."default" NOT NULL,
    programname character varying(255) COLLATE pg_catalog."default" NOT NULL,
    collegecode character varying(20) COLLATE pg_catalog."default",
    CONSTRAINT programs_pkey PRIMARY KEY (programcode),
    CONSTRAINT program_college_code_fkey FOREIGN KEY (collegecode)
        REFERENCES public.colleges (collegecode) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- create students table
CREATE TABLE IF NOT EXISTS public.students
(
    idnumber character varying(20) COLLATE pg_catalog."default" NOT NULL,
    firstname character varying(255) COLLATE pg_catalog."default" NOT NULL,
    lastname character varying(255) COLLATE pg_catalog."default" NOT NULL,
    programcode character varying(20) COLLATE pg_catalog."default",
    yearlevel integer NOT NULL,
    gender character varying(20) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT students_pkey PRIMARY KEY (idnumber),
    CONSTRAINT student_program_code_fkey FOREIGN KEY (programcode)
        REFERENCES public.programs (programcode) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- create users table
CREATE TABLE IF NOT EXISTS public.users
(
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    CONSTRAINT unique_email UNIQUE (email),
    CONSTRAINT unique_username UNIQUE (username)
);

-- add imageurl column to students table
ALTER TABLE public.students 
ADD COLUMN imageurl TEXT;

-- create policies for images bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'students-images');

CREATE POLICY "Allow uploads"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'students-images');

CREATE POLICY "Allow updates"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'students-images');

CREATE POLICY "Allow deletes"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'students-images');

-- drop policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- update the bucket restrictions
UPDATE storage.buckets
SET 
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg']
WHERE name = 'students-images';

-- create indexes for faster performance
CREATE INDEX IF NOT EXISTS idx_programs_collegecode ON public.programs(collegecode);
CREATE INDEX IF NOT EXISTS idx_students_programcode ON public.students(programcode);
CREATE INDEX IF NOT EXISTS idx_students_name ON public.students(lastname, firstname);
CREATE INDEX IF NOT EXISTS idx_colleges_name ON public.colleges(collegename);
CREATE INDEX IF NOT EXISTS idx_programs_name ON public.programs(programname);
CREATE INDEX IF NOT EXISTS idx_students_yearlevel ON public.students(yearlevel);
CREATE INDEX IF NOT EXISTS idx_students_gender ON public.students(gender);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);