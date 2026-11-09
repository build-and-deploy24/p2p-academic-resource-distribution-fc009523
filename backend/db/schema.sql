-- P2P Academic Resource Distribution: clean MySQL schema
-- Based on Mercy's design (p2p database distribution.sql), cleaned up so it
-- runs top to bottom in MySQL Workbench without errors.
--
-- Changes from Mercy's version:
--   * files.storage_key added: the name of the file inside backend/storage,
--     which the download route needs to read the real bytes.
--   * Duplicate CREATE TABLE statements and the experiments were removed.
--
-- WARNING: the first two lines delete and recreate the database on YOUR
-- computer. Only run this on a local database.

DROP DATABASE IF EXISTS p2p_revision_db;
CREATE DATABASE p2p_revision_db;
USE p2p_revision_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE semesters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (name, academic_year)
);

CREATE TABLE units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    semester_id INT NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    CONSTRAINT fk_units_semesters
        FOREIGN KEY (semester_id) REFERENCES semesters(id)
);

CREATE TABLE files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unit_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    storage_key VARCHAR(255) NOT NULL,
    file_hash VARCHAR(255),
    magnet_link VARCHAR(500),
    version INT NOT NULL DEFAULT 1,
    file_size BIGINT UNSIGNED NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_files_units
        FOREIGN KEY (unit_id) REFERENCES units(id),
    CONSTRAINT fk_files_users
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE TABLE download_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_id INT NOT NULL,
    mode ENUM('P2P', 'SERVER', 'FALLBACK') NOT NULL,
    peer_count INT UNSIGNED NOT NULL DEFAULT 0,
    duration_seconds INT UNSIGNED,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    CONSTRAINT fk_sessions_users
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_sessions_files
        FOREIGN KEY (file_id) REFERENCES files(id)
);

CREATE TABLE peer_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_id INT NOT NULL,
    user_id INT NOT NULL,
    seeding_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_file_user (file_id, user_id),
    FOREIGN KEY (file_id) REFERENCES files(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ---------------------------------------------------------------
-- Sample data (users, semesters, units). Files are added in a
-- separate step so they match the real PDFs in backend/storage.
-- ---------------------------------------------------------------

INSERT INTO users (name, email, password_hash, role) VALUES
('Mercy Jerop',  'mercy.jerop@example.com',  'SAMPLE_HASH_001', 'STUDENT'),
('John Kiptoo',  'john.kiptoo@example.com',  'SAMPLE_HASH_002', 'STUDENT'),
('Mary Chebet',  'mary.chebet@example.com',  'SAMPLE_HASH_003', 'STUDENT'),
('Brian Otieno', 'brian.otieno@example.com', 'SAMPLE_HASH_004', 'STUDENT'),
('Admin User',   'admin@example.com',        'SAMPLE_HASH_005', 'ADMIN');

INSERT INTO semesters (name, academic_year) VALUES
('Year 1 Semester 1', '2025/2026'),
('Year 1 Semester 2', '2025/2026'),
('Year 2 Semester 1', '2026/2027'),
('Year 2 Semester 2', '2026/2027'),
('Year 3 Semester 1', '2027/2028');

INSERT INTO units (semester_id, code, name) VALUES
(1, 'SOEN201', 'Software Engineering Fundamentals'),
(1, 'DBMS201', 'Database Management Systems'),
(2, 'SOEN202', 'Software Requirements and Specifications'),
(3, 'SOEN301', 'Advanced Software Engineering'),
(3, 'CS301',   'Computer Security');

-- Quick check
SELECT 'users' AS table_name, COUNT(*) AS total_records FROM users
UNION ALL SELECT 'semesters', COUNT(*) FROM semesters
UNION ALL SELECT 'units', COUNT(*) FROM units
UNION ALL SELECT 'files', COUNT(*) FROM files;
