-- drop table if exists
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS colleges CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- create colleges table
CREATE TABLE IF NOT EXISTS colleges (
    collegecode VARCHAR(20) PRIMARY KEY,
    collegename VARCHAR(255) NOT NULL
);

-- create programs table
CREATE TABLE IF NOT EXISTS programs (
    programcode VARCHAR(20) PRIMARY KEY,
    programname VARCHAR(255) NOT NULL,
    collegecode VARCHAR(20),
    CONSTRAINT fk_program_college
        FOREIGN KEY (collegecode)
        REFERENCES colleges (collegecode)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- create students table
CREATE TABLE IF NOT EXISTS students (
    idnumber VARCHAR(20) PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    programcode VARCHAR(20),
    yearlevel INTEGER NOT NULL,
    gender VARCHAR(20) NOT NULL,
    CONSTRAINT fk_student_program
        FOREIGN KEY (programcode)
        REFERENCES programs (programcode)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- create users table
CREATE SEQUENCE IF NOT EXISTS users_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER NOT NULL DEFAULT nextval('users_id_seq'),
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT unique_email UNIQUE (email),
    CONSTRAINT unique_username UNIQUE (username)
);