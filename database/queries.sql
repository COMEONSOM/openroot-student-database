-- =========================================
-- INDEXES FOR FAST SEARCH
-- =========================================

CREATE INDEX idx_student_name
ON students(student_name);

CREATE INDEX idx_course_name
ON courses(course_name);

CREATE INDEX idx_enrollment_no
ON courses(enrollment_no);

-- =========================================
-- VIEW DATA
-- =========================================

SELECT * FROM students;

SELECT * FROM courses;

-- =========================================
-- JOIN QUERY
-- =========================================

SELECT
    s.enrollment_no,
    s.student_name,
    s.mobile_number,
    s.email,
    c.course_name,
    c.fees_structure,
    c.fees_paid
FROM students s
JOIN courses c
ON s.enrollment_no = c.enrollment_no;