-- =========================
-- STUDENTS TABLE
-- =========================

CREATE TABLE IF NOT EXISTS students (
    enrollment_no VARCHAR(20) PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    enrollment_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- COURSES TABLE
-- =========================

CREATE TABLE IF NOT EXISTS courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_no VARCHAR(20) NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    fees_structure DECIMAL(10,2) NOT NULL,
    fees_paid BOOLEAN DEFAULT FALSE,
    course_duration VARCHAR(50),
    course_start_date DATE,
    course_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_student_course
    FOREIGN KEY (enrollment_no)
    REFERENCES students(enrollment_no)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

SHOW TABLES;