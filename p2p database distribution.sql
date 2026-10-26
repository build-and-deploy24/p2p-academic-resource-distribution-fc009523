
DROP DATABASE IF EXISTS p2p_revision_db;

CREATE DATABASE p2p_revision_db;

USE p2p_revision_db;

SELECT DATABASE();

USE p2p_revision_db;

SHOW TABLES;


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


-- 
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
        FOREIGN KEY (semester_id)
        REFERENCES semesters(id)
);



CREATE TABLE files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unit_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
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

    CONSTRAINT fk_peers_files
        FOREIGN KEY (file_id) REFERENCES files(id),

    CONSTRAINT fk_peers_users
        FOREIGN KEY (user_id) REFERENCES users(id),

    CONSTRAINT unique_file_user
        UNIQUE (file_id, user_id)
);




INSERT INTO users (name, email, password_hash, role)
VALUES
('Mercy Jerop', 'mercy.jerop@example.com',
 'SAMPLE_HASH_REPLACE_WITH_REAL_HASH_001', 'STUDENT'),

('John Kiptoo', 'john.kiptoo@example.com',
 'SAMPLE_HASH_REPLACE_WITH_REAL_HASH_002', 'STUDENT'),

('Mary Chebet', 'mary.chebet@example.com',
 'SAMPLE_HASH_REPLACE_WITH_REAL_HASH_003', 'STUDENT'),

('Brian Otieno', 'brian.otieno@example.com',
 'SAMPLE_HASH_REPLACE_WITH_REAL_HASH_004', 'STUDENT'),

('Admin User', 'admin@example.com',
 'SAMPLE_HASH_REPLACE_WITH_REAL_HASH_005', 'ADMIN');




INSERT INTO semesters (name, academic_year)
VALUES
('Year 1 Semester 1', '2025/2026'),
('Year 1 Semester 2', '2025/2026'),
('Year 2 Semester 1', '2026/2027'),
('Year 2 Semester 2', '2026/2027'),
('Year 3 Semester 1', '2027/2028');




INSERT INTO units (semester_id, code, name)
VALUES
(1, 'SOEN201', 'Software Engineering Fundamentals'),
(1, 'DBMS201', 'Database Management Systems'),
(2, 'SOEN202', 'Software Requirements and Specifications'),
(3, 'SOEN301', 'Advanced Software Engineering'),
(3, 'CS301', 'Computer Security');




INSERT INTO files
(unit_id, uploaded_by, filename, file_hash, magnet_link,
 version, file_size, file_type)
VALUES
(1, 5, 'Software_Engineering_Notes.pdf',
 'sha256_sample_hash_001', 'magnet:?xt=urn:sample:001',
 1, 2048000, 'PDF'),

(2, 5, 'Database_Revision_Notes.pdf',
 'sha256_sample_hash_002', 'magnet:?xt=urn:sample:002',
 1, 1536000, 'PDF'),

(3, 1, 'Requirements_Questions.pdf',
 'sha256_sample_hash_003', 'magnet:?xt=urn:sample:003',
 1, 1024000, 'PDF'),

(4, 5, 'Advanced_SE_Slides.pptx',
 'sha256_sample_hash_004', 'magnet:?xt=urn:sample:004',
 1, 3072000, 'PPTX'),

(5, 5, 'Computer_Security_Notes.pdf',
 'sha256_sample_hash_005', 'magnet:?xt=urn:sample:005',
 1, 2560000, 'PDF');


-

INSERT INTO download_sessions
(user_id, file_id, mode, peer_count, duration_seconds,
 started_at, completed_at)
VALUES
(1, 1, 'P2P', 3, 25,
 '2026-10-15 09:00:00', '2026-10-15 09:00:25'),

(2, 2, 'SERVER', 0, 40,
 '2026-10-15 10:00:00', '2026-10-15 10:00:40'),

(3, 3, 'FALLBACK', 1, 35,
 '2026-10-16 11:00:00', '2026-10-16 11:00:35'),

(4, 4, 'P2P', 4, 20,
 '2026-10-17 12:00:00', '2026-10-17 12:00:20'),

(1, 5, 'SERVER', 0, 50,
 '2026-10-18 13:00:00', '2026-10-18 13:00:50');




INSERT INTO peer_records
(file_id, user_id, seeding_enabled, last_active)
VALUES
(1, 1, TRUE, '2026-10-18 09:00:00'),
(2, 2, TRUE, '2026-10-18 09:10:00'),
(3, 3, FALSE, '2026-10-18 09:20:00'),
(4, 4, TRUE, '2026-10-18 09:30:00'),
(5, 1, TRUE, '2026-10-18 09:40:00');



CREATE VIEW documents_grouped_by_unit AS
SELECT
    u.code AS unit_code,
    u.name AS unit_name,
    f.id AS file_id,
    f.filename AS document_name,
    f.file_type,
    f.file_size
FROM units u
LEFT JOIN files f ON u.id = f.unit_id;




SELECT DATABASE();

SHOW TABLES;


CREATE TABLE units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    semester_id INT NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    CONSTRAINT fk_units_semesters
        FOREIGN KEY (semester_id)
        REFERENCES semesters(id)
);
DROP TABLE IF EXISTS files;
CREATE TABLE files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unit_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
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
USE p2p_revision_db;

DROP TABLE IF EXISTS download_sessions;
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
show tables;
USE p2p_revision_db;

DROP TABLE IF EXISTS peer_records;
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
show tables;
INSERT INTO users (name, email, password_hash, role)
VALUES
('Mercy Jerop', 'mercy.jerop@example.com', 'SAMPLE_HASH_001', 'STUDENT'),
('John Kiptoo', 'john.kiptoo@example.com', 'SAMPLE_HASH_002', 'STUDENT'),
('Mary Chebet', 'mary.chebet@example.com', 'SAMPLE_HASH_003', 'STUDENT'),
('Brian Otieno', 'brian.otieno@example.com', 'SAMPLE_HASH_004', 'STUDENT'),
('Admin User', 'admin@example.com', 'SAMPLE_HASH_005', 'ADMIN');
INSERT INTO files
(unit_id, uploaded_by, filename, file_hash, magnet_link,
 version, file_size, file_type)
VALUES
(1, 5, 'Software_Engineering_Notes.pdf',
 'sha256_sample_hash_001', 'magnet:?xt=urn:sample:001',
 1, 2048000, 'PDF'),

(2, 5, 'Database_Revision_Notes.pdf',
 'sha256_sample_hash_002', 'magnet:?xt=urn:sample:002',
 1, 1536000, 'PDF'),

(3, 1, 'Requirements_Questions.pdf',
 'sha256_sample_hash_003', 'magnet:?xt=urn:sample:003',
 1, 1024000, 'PDF'),

(4, 5, 'Advanced_SE_Slides.pptx',
 'sha256_sample_hash_004', 'magnet:?xt=urn:sample:004',
 1, 3072000, 'PPTX'),

(5, 5, 'Computer_Security_Notes.pdf',
 'sha256_sample_hash_005', 'magnet:?xt=urn:sample:005',
 1, 2560000, 'PDF');
USE p2p_revision_db;

SELECT id, unit_id, filename
FROM files;
USE p2p_revision_db;

SELECT COUNT(*) AS total_files
FROM files;

SELECT * FROM files;
USE p2p_revision_db;

INSERT INTO files
(unit_id, filename, document_name, file_type, file_size, file_hash, magnet_link)
VALUES
(1, 'DBMS_Notes.pdf', 'Database Management Systems Notes',
 'PDF', 204800, 'sha256_sample_hash_001', 'magnet:?xt=urn:btih:sample001'),

(2, 'Java_Programming.pdf', 'Java Programming Notes',
 'PDF', 307200, 'sha256_sample_hash_002', 'magnet:?xt=urn:btih:sample002'),

(3, 'Computer_Security_Notes.pdf', 'Computer Security Notes',
 'PDF', 409600, 'sha256_sample_hash_003', 'magnet:?xt=urn:btih:sample003'),

(4, 'Software_Engineering.pdf', 'Software Engineering Notes',
 'PDF', 256000, 'sha256_sample_hash_004', 'magnet:?xt=urn:btih:sample004'),

(5, 'Data_Structures.pdf', 'Data Structures and Algorithms Notes',
 'PDF', 512000, 'sha256_sample_hash_005', 'magnet:?xt=urn:btih:sample005');

SELECT * FROM files;
DESCRIBE files;
USE p2p_revision_db;

INSERT INTO files (unit_id, uploaded_by, filename, file_hash)
VALUES
(1, 1, 'DBMS_Notes.pdf', 'sample_hash_001'),
(2, 2, 'Java_Programming.pdf', 'sample_hash_002'),
(3, 3, 'Computer_Security_Notes.pdf', 'sample_hash_003'),
(4, 4, 'Software_Engineering.pdf', 'sample_hash_004'),
(5, 5, 'Data_Structures.pdf', 'sample_hash_005');

USE p2p_revision_db;

INSERT INTO files
(unit_id, uploaded_by, filename, file_hash, magnet_link, version, file_size, file_type)
VALUES
(1, 1, 'DBMS_Notes.pdf', 'sample_hash_001', 'magnet:?xt=urn:btih:sample001', 1, 204800, 'PDF'),
(2, 2, 'Java_Programming.pdf', 'sample_hash_002', 'magnet:?xt=urn:btih:sample002', 1, 307200, 'PDF'),
(3, 3, 'Computer_Security_Notes.pdf', 'sample_hash_003', 'magnet:?xt=urn:btih:sample003', 1, 409600, 'PDF'),
(4, 4, 'Software_Engineering.pdf', 'sample_hash_004', 'magnet:?xt=urn:btih:sample004', 1, 256000, 'PDF'),
(5, 5, 'Data_Structures.pdf', 'sample_hash_005', 'magnet:?xt=urn:btih:sample005', 1, 512000, 'PDF');

SELECT * FROM files;
describe download_sessions;

USE p2p_revision_db;

INSERT INTO download_sessions
(user_id, file_id, mode, peer_count, duration_seconds,
 started_at, completed_at)
VALUES
(1, 1, 'P2P', 3, 25,
 '2026-10-15 09:00:00', '2026-10-15 09:00:25'),
(2, 2, 'SERVER', 0, 40,
 '2026-10-15 10:00:00', '2026-10-15 10:00:40'),
(3, 3, 'FALLBACK', 1, 35,
 '2026-10-16 11:00:00', '2026-10-16 11:00:35'),
(4, 4, 'P2P', 4, 20,
 '2026-10-17 12:00:00', '2026-10-17 12:00:20'),
(1, 5, 'SERVER', 0, 50,
 '2026-10-18 13:00:00', '2026-10-18 13:00:50');

SELECT * FROM download_sessions;

USE p2p_revision_db;

SELECT 'users' AS table_name, COUNT(*) AS total_records FROM users
UNION ALL
SELECT 'units', COUNT(*) FROM units
UNION ALL
SELECT 'files', COUNT(*) FROM files
UNION ALL
SELECT 'download_sessions', COUNT(*) FROM download_sessions;

USE p2p_revision_db;

SELECT 'users' AS table_name, COUNT(*) AS total_records FROM users
UNION ALL
SELECT 'semesters', COUNT(*) FROM semesters
UNION ALL
SELECT 'units', COUNT(*) FROM units
UNION ALL
SELECT 'files', COUNT(*) FROM files
UNION ALL
SELECT 'download_sessions', COUNT(*) FROM download_sessions
UNION ALL
SELECT 'peer_records', COUNT(*) FROM peer_records;

USE p2p_revision_db;

SELECT 'users' AS table_name, COUNT(*) AS total_records FROM users
UNION ALL
SELECT 'semesters', COUNT(*) FROM semesters
UNION ALL
SELECT 'units', COUNT(*) FROM units
UNION ALL
SELECT 'files', COUNT(*) FROM files
UNION ALL
SELECT 'download_sessions', COUNT(*) FROM download_sessions
UNION ALL
SELECT 'peer_records', COUNT(*) FROM peer_records;

USE p2p_revision_db;

SELECT
    u.code AS unit_code,
    u.name,
    f.id AS file_id,
    f.filename,
    f.file_type,
    f.file_size
FROM units u
JOIN files f ON u.id = f.unit_id
ORDER BY u.code, f.filename;


DESCRIBE units;

USE p2p_revision_db;

SELECT
    id AS file_id,
    unit_id,
    uploaded_by,
    filename,
    file_hash,
    magnet_link,
    version,
    file_size,
    file_type,
    uploaded_at
FROM files
ORDER BY unit_id, filename;

USE p2p_revision_db;

SELECT
    id AS session_id,
    user_id,
    file_id,
    mode,
    peer_count,
    duration_seconds,
    started_at,
    completed_at
FROM download_sessions
ORDER BY started_at DESC;

USE p2p_revision_db;

SELECT
    id,
    name,
    email,
    role
FROM users
ORDER BY id;
describe users;

USE p2p_revision_db;

SELECT *
FROM semesters
ORDER BY id;

SELECT
    u.id AS unit_id,
    u.code AS unit_code,
    u.name AS unit_name,
    s.name AS semester_name
FROM units u
JOIN semesters s ON u.semester_id = s.id
ORDER BY u.code;

SELECT
    u.code AS unit_code,
    u.name AS unit_name,
    f.id AS file_id,
    f.filename,
    f.file_type,
    f.file_size,
    f.version
FROM units u
JOIN files f ON u.id = f.unit_id
ORDER BY u.code, f.filename;

SELECT
    u.code AS unit_code,
    u.name AS unit_name,
    COUNT(f.id) AS total_files
FROM units u
LEFT JOIN files f ON u.id = f.unit_id
GROUP BY u.id, u.code, u.name
ORDER BY u.code;

CREATE OR REPLACE VIEW documents_grouped_by_unit AS
SELECT
    u.code AS unit_code,
    u.name AS unit_name,
    f.id AS file_id,
    f.filename,
    f.file_type,
    f.file_size,
    f.version
FROM units u
JOIN files f ON u.id = f.unit_id;

SELECT *
FROM documents_grouped_by_unit
ORDER BY unit_code, filename;

SELECT
    mode,
    COUNT(*) AS total_downloads,
    ROUND(AVG(duration_seconds), 2) AS average_duration_seconds
FROM download_sessions
GROUP BY mode
ORDER BY total_downloads DESC;

SELECT
    f.id AS file_id,
    f.filename,
    COUNT(ds.id) AS total_downloads
FROM files f
LEFT JOIN download_sessions ds ON f.id = ds.file_id
GROUP BY f.id, f.filename
ORDER BY total_downloads DESC, f.filename;

SELECT
    u.id AS user_id,
    u.name,
    COUNT(ds.id) AS total_downloads,
    ROUND(AVG(ds.duration_seconds), 2) AS average_duration_seconds
FROM users u
LEFT JOIN download_sessions ds ON u.id = ds.user_id
GROUP BY u.id, u.name
ORDER BY total_downloads DESC;

DESCRIBE peer_records;

SELECT
    pr.id AS peer_record_id,
    pr.user_id,
    pr.file_id,
    pr.seeding_enabled,
    pr.last_active
FROM peer_records pr
ORDER BY pr.last_active DESC;

SELECT f.*
FROM files f
LEFT JOIN units u ON f.unit_id = u.id
WHERE u.id IS NULL;

SELECT ds.*
FROM download_sessions ds
LEFT JOIN users u ON ds.user_id = u.id
LEFT JOIN files f ON ds.file_id = f.id
WHERE u.id IS NULL OR f.id IS NULL;

SELECT 'users' AS table_name, COUNT(*) AS total_records FROM users
UNION ALL
SELECT 'semesters', COUNT(*) FROM semesters
UNION ALL
SELECT 'units', COUNT(*) FROM units
UNION ALL
SELECT 'files', COUNT(*) FROM files
UNION ALL
SELECT 'download_sessions', COUNT(*) FROM download_sessions
UNION ALL
SELECT 'peer_records', COUNT(*) FROM peer_records;

USE p2p_revision_db;

SHOW TABLES;

SHOW CREATE TABLE files;

SHOW CREATE TABLE download_sessions;


USE p2p_revision_db;

SHOW CREATE TABLE users;
SHOW CREATE TABLE semesters;

SHOW CREATE TABLE units;

SHOW CREATE TABLE files;
SHOW CREATE TABLE download_sessions;
SHOW CREATE TABLE peer_records;

SHOW INDEX FROM files;

SHOW INDEX FROM download_sessions;

SHOW INDEX FROM peer_records;

SELECT *
FROM documents_grouped_by_unit
ORDER BY unit_code, filename;

USE p2p_revision_db;

SELECT DATABASE() AS current_database;

SHOW TABLES;

SELECT 'users' AS table_name, COUNT(*) AS total_records FROM users
UNION ALL
SELECT 'units', COUNT(*) FROM units
UNION ALL
SELECT 'files', COUNT(*) FROM files
UNION ALL
SELECT 'download_sessions', COUNT(*) FROM download_sessions
UNION ALL
SELECT 'peer_records', COUNT(*) FROM peer_records;

SELECT * FROM users;

SELECT * FROM units;

SELECT * FROM files;

SELECT * FROM download_sessions;

SELECT * FROM peer_records;

SELECT
    u.code,
    u.name,
    f.*
FROM units u
JOIN files f ON u.id = f.unit_id;
















