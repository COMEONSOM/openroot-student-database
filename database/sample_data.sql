USE student_database;

-- Sample Students

INSERT INTO students
(
enrollment_no,
student_name,
date_of_birth,
mobile_number,
email,
address,
enrollment_date
)

VALUES

(
'ENR001',
'Rahul Das',
'2003-05-14',
'9876543210',
'rahul@example.com',
'Kolkata',
'2026-05-20'
),

(
'ENR002',
'Sneha Roy',
'2004-07-22',
'9123456789',
'sneha@example.com',
'Howrah',
'2026-05-20'
);

-- Sample Courses

INSERT INTO courses
(
enrollment_no,
course_name,
fees_structure,
fees_paid,
course_duration,
course_start_date,
course_end_date
)

VALUES

(
'ENR001',
'Python Full Stack',
35000,
TRUE,
'6 Months',
'2026-05-20',
'2026-11-20'
),

(
'ENR002',
'React Development',
25000,
FALSE,
'4 Months',
'2026-05-20',
'2026-09-20'
);