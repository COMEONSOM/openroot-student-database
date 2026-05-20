from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error, IntegrityError
from config import MYSQL_CONFIG
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from datetime import date
import re

app = Flask(__name__)
CORS(app)

# =============================================================
# DATABASE  —  persistent connection with auto-reconnect
# =============================================================

db = None


def get_db():
    """
    Return a safe live (db, cursor) pair.
    Uses auto reconnect and a fresh buffered cursor per request.
    """
    global db

    try:
        if db is None or not db.is_connected():
            db = mysql.connector.connect(
                host=MYSQL_CONFIG["host"],
                user=MYSQL_CONFIG["user"],
                password=MYSQL_CONFIG["password"],
                database=MYSQL_CONFIG["database"],
                autocommit=False
            )
            print("MySQL connected / reconnected.")

        cursor = db.cursor(dictionary=True, buffered=True)
        return db, cursor

    except Error as e:
        print("DB connection error:", e)
        raise


try:
    get_db()
    print("MySQL Connected Successfully")
except Error as e:
    print("Startup DB error:", e)

# =============================================================
# VALIDATION HELPERS
# =============================================================

NAME_RE = re.compile(r"^[A-Za-z ]{1,60}$")
EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
FEE_RE = re.compile(r"^(?:0|[1-9]\d*)(?:\.\d{1,2})?$")
PIN_RE = re.compile(r"^\d{6}$")

ALLOWED_COURSES = {
    "Prompt Engineering",
    "Personal Finance & Investing",
}


def normalize_text(value):
    return " ".join(str(value or "").strip().split())


def normalize_mobile(value):
    """Keep digits only and return a 10-digit mobile string (or '')."""
    if value is None:
        return ""
    return re.sub(r"\D", "", str(value)).strip()


def first_present(data, *keys):
    """
    Return the first non-empty value from data among the provided keys.
    Keeps 0 / False valid, but rejects None and blank strings.
    """
    for key in keys:
        if key in data:
            val = data.get(key)
            if isinstance(val, str):
                val = val.strip()
            if val is not None and val != "":
                return val
    return None


def is_blank(value):
    return value is None or (isinstance(value, str) and value.strip() == "")


def parse_money(value):
    """
    Parse currency safely as Decimal(10,2) style value.
    Rejects scientific notation such as '1e5'.
    """
    text = normalize_text(value)
    if not FEE_RE.fullmatch(text):
        raise ValueError("Invalid fee amount. Use digits only, up to 2 decimal places.")
    try:
        money = Decimal(text).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    except (InvalidOperation, TypeError, ValueError):
        raise ValueError("Invalid fee amount.")
    if money < 0:
        raise ValueError("Fee amount cannot be negative.")
    return money


def serialize_value(value):
    """Convert DB values into JSON-safe values."""
    if isinstance(value, Decimal):
        return format(value, "f")
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return value


def serialize_row(row):
    if not row:
        return None
    return {k: serialize_value(v) for k, v in row.items()}


def serialize_rows(rows):
    return [serialize_row(row) for row in rows]


def to_bool_int(value):
    """Normalize checkbox/select values into 0 or 1."""
    if isinstance(value, bool):
        return int(value)
    if value is None:
        return 0
    if isinstance(value, (int, float, Decimal)):
        return 1 if int(value) != 0 else 0
    text = str(value).strip().lower()
    return 1 if text in {"1", "true", "yes", "on", "paid"} else 0


def validate_name(name):
    name = normalize_text(name)
    if not NAME_RE.fullmatch(name):
        raise ValueError("Name must contain only English letters and spaces, and be at most 60 characters.")
    return name


def validate_email(email):
    email = normalize_text(email)
    if not EMAIL_RE.fullmatch(email) or "@" not in email:
        raise ValueError("Enter a valid email address.")
    return email


def validate_dob_18_plus(dob_str):
    try:
        dob = date.fromisoformat(str(dob_str))
    except Exception:
        raise ValueError(
            "Enter a valid date of birth."
        )

    today = date.today()

    # Future DOB check
    if dob > today:
        raise ValueError(
            "Date of birth cannot be in the future."
        )

    age = (
        today.year
        - dob.year
        - (
            (today.month, today.day)
            < (dob.month, dob.day)
        )
    )

    # Minimum age
    if age < 18:
        raise ValueError(
            "Only users 18 years and above can register."
        )

    # Maximum age
    if age > 100:
        raise ValueError(
            "Enter a realistic date of birth."
        )

    return dob.isoformat()


def validate_not_future(date_str, field_name):
    try:
        d = date.fromisoformat(str(date_str))
    except Exception:
        raise ValueError(f"Enter a valid {field_name}.")
    if d > date.today():
        raise ValueError(f"{field_name.capitalize()} cannot be in the future.")
    return d.isoformat()


def validate_course_name(course_name):
    course_name = normalize_text(course_name)
    if course_name not in ALLOWED_COURSES:
        raise ValueError("Select a valid course name.")
    return course_name


def validate_pincode(pin):
    pin = normalize_text(pin)
    if not PIN_RE.fullmatch(pin):
        raise ValueError("Pincode must be exactly 6 digits.")
    return pin


def build_address(state=None, district=None, assembly_constituency=None, pincode=None, fallback_address=None):
    """
    Keeps database schema unchanged by storing one combined address string.
    Preferred format:
        Assembly Constituency, District, State - Pincode
    """
    if not is_blank(state) or not is_blank(district) or not is_blank(assembly_constituency) or not is_blank(pincode):
        state = normalize_text(state)
        district = normalize_text(district)
        assembly_constituency = normalize_text(assembly_constituency)
        pincode = validate_pincode(pincode)

        if is_blank(state) or is_blank(district) or is_blank(assembly_constituency):
            raise ValueError("Please complete state, district, assembly constituency, and pincode.")

        return f"{assembly_constituency}, {district}, {state} - {pincode}"

    fallback_address = normalize_text(fallback_address)
    if is_blank(fallback_address):
        raise ValueError("Address is required.")
    return fallback_address


def validate_course_dates(start_date, end_date):
    if start_date and end_date and start_date >= end_date:
        raise ValueError("Course start date must be before course end date.")
    return True


def generate_enrollment_no():
    """
    Generate the next ID like ENR001, ENR002...
    Uses the numeric suffix rather than relying on row ordering.
    """
    _, cur = get_db()
    cur.execute("""
        SELECT COALESCE(
            MAX(CAST(SUBSTRING(enrollment_no, 4) AS UNSIGNED)),
            0
        ) AS max_no
        FROM students
        WHERE enrollment_no LIKE 'ENR%'
    """)
    row = cur.fetchone()
    next_no = int(row["max_no"] or 0) + 1
    return f"ENR{next_no:03d}"


def validate_fee_payload(value):
    return parse_money(value)

# =============================================================
# PAGE ROUTES
# =============================================================

@app.route("/")
def landing():
    return render_template("landingpage.html")


@app.route("/dashboard")
def dashboard():
    return render_template("index.html")


@app.route("/add-student")
def add_student_page():
    return render_template("add_student.html")


@app.route("/add-course")
def add_course_page():
    return render_template("add_course.html")


@app.route("/database")
def database_page():
    return render_template("database.html")


@app.route("/update-student")
def update_student_page():
    return render_template("update_student.html")


@app.route("/delete-student")
def delete_student_page():
    return render_template("delete_student.html")

# =============================================================
# API  —  FULL DATABASE
# =============================================================

@app.route("/api/full-database", methods=["GET"])
def full_database():
    try:
        _, cur = get_db()
        cur.execute("""
            SELECT
                s.enrollment_no,
                s.student_name,
                s.date_of_birth,
                s.mobile_number,
                s.email,
                s.address,
                s.enrollment_date,
                c.course_id,
                c.course_name,
                c.fees_structure,
                c.fees_paid,
                c.course_duration,
                c.course_start_date,
                c.course_end_date
            FROM students s
            LEFT JOIN courses c
            ON s.enrollment_no = c.enrollment_no
            ORDER BY s.created_at DESC
        """)
        records = cur.fetchall()

        return jsonify({
            "success": True,
            "records": serialize_rows(records)
        })

    except Error as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# =============================================================
# API  —  ADD STUDENT + COURSE
# =============================================================

@app.route("/api/add-student", methods=["POST"])
def add_student():
    conn = None
    try:
        conn, cur = get_db()
        data = request.get_json(silent=True) or {}

        student_name = validate_name(first_present(data, "student_name", "name"))
        date_of_birth = validate_dob_18_plus(first_present(data, "date_of_birth", "dob"))
        mobile_number = normalize_mobile(first_present(data, "mobile_number", "mobile"))
        email = validate_email(first_present(data, "email"))
        enrollment_date = validate_not_future(first_present(data, "enrollment_date"), "enrollment date")

        # Address can be saved as a single combined string without changing DB schema.
        address = build_address(
            state=first_present(data, "state"),
            district=first_present(data, "district"),
            assembly_constituency=first_present(data, "assembly_constituency"),
            pincode=first_present(data, "pincode"),
            fallback_address=first_present(data, "address", "address_line")
        )

        course_name = validate_course_name(first_present(data, "course_name"))
        fees_structure = validate_fee_payload(first_present(data, "fees_structure"))
        fees_paid = to_bool_int(first_present(data, "fees_paid"))
        course_duration = first_present(data, "course_duration")
        course_start_date = first_present(data, "course_start_date")
        course_end_date = first_present(data, "course_end_date")

        if len(mobile_number) != 10:
            return jsonify({
                "success": False,
                "message": "Mobile number must be exactly 10 digits."
            }), 400

        validate_course_dates(course_start_date, course_end_date)

        required = {
            "student_name": student_name,
            "date_of_birth": date_of_birth,
            "mobile_number": mobile_number,
            "email": email,
            "address": address,
            "enrollment_date": enrollment_date,
            "course_name": course_name,
            "fees_structure": fees_structure,
        }

        for field, value in required.items():
            if is_blank(value):
                return jsonify({
                    "success": False,
                    "message": f"Missing required field: {field}"
                }), 400

        cur.execute("""
            SELECT enrollment_no, mobile_number, email
            FROM students
            WHERE mobile_number = %s OR email = %s
            LIMIT 1
        """, (mobile_number, email))
        existing = cur.fetchone()
        if existing:
            if existing.get("mobile_number") == mobile_number:
                return jsonify({
                    "success": False,
                    "message": "Mobile number already exists."
                }), 409
            if existing.get("email") == email:
                return jsonify({
                    "success": False,
                    "message": "Email already exists."
                }), 409

        enrollment_no = generate_enrollment_no()

        cur.execute("""
            INSERT INTO students
                (enrollment_no, student_name, date_of_birth,
                 mobile_number, email, address, enrollment_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            enrollment_no,
            student_name,
            date_of_birth,
            mobile_number,
            email,
            address,
            enrollment_date
        ))

        cur.execute("""
            INSERT INTO courses
                (enrollment_no, course_name, fees_structure,
                 fees_paid, course_duration,
                 course_start_date, course_end_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            enrollment_no,
            course_name,
            fees_structure,
            fees_paid,
            course_duration or None,
            course_start_date or None,
            course_end_date or None
        ))

        conn.commit()

        return jsonify({
            "success": True,
            "message": "Student and course added successfully.",
            "enrollment_no": enrollment_no
        }), 201

    except ValueError as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        return jsonify({"success": False, "message": str(e)}), 400

    except (IntegrityError, Error) as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        return jsonify({"success": False, "message": str(e)}), 500

# =============================================================
# API  —  ADD COURSE ONLY
# =============================================================

@app.route("/api/add-course", methods=["POST"])
def add_course():
    conn = None
    try:
        conn, cur = get_db()
        data = request.get_json(silent=True) or {}

        enrollment_no = first_present(data, "enrollment_no", "course_enrollment_no")
        mobile_number = normalize_mobile(first_present(data, "mobile_number", "course_mobile_number"))

        course_name = validate_course_name(first_present(data, "course_name"))
        fees_structure = validate_fee_payload(first_present(data, "fees_structure"))
        fees_paid = to_bool_int(first_present(data, "fees_paid"))
        course_duration = first_present(data, "course_duration")
        course_start_date = first_present(data, "course_start_date")
        course_end_date = first_present(data, "course_end_date")

        if is_blank(course_name) or is_blank(fees_structure):
            return jsonify({
                "success": False,
                "message": "Missing required field: course_name or fees_structure"
            }), 400

        validate_course_dates(course_start_date, course_end_date)

        if is_blank(enrollment_no):
            if len(mobile_number) != 10:
                return jsonify({
                    "success": False,
                    "message": "Provide a valid enrollment number or 10-digit mobile number."
                }), 400

            cur.execute("""
                SELECT enrollment_no
                FROM students
                WHERE mobile_number = %s
                LIMIT 1
            """, (mobile_number,))
            student = cur.fetchone()
            if not student:
                return jsonify({
                    "success": False,
                    "message": "Student not found."
                }), 404
            enrollment_no = student["enrollment_no"]
        else:
            cur.execute("""
                SELECT enrollment_no
                FROM students
                WHERE enrollment_no = %s
                LIMIT 1
            """, (enrollment_no,))
            student = cur.fetchone()
            if not student:
                return jsonify({
                    "success": False,
                    "message": "Student not found."
                }), 404

        cur.execute("""
            INSERT INTO courses
                (enrollment_no, course_name, fees_structure,
                 fees_paid, course_duration,
                 course_start_date, course_end_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            enrollment_no,
            course_name,
            fees_structure,
            fees_paid,
            course_duration or None,
            course_start_date or None,
            course_end_date or None
        ))

        conn.commit()

        return jsonify({
            "success": True,
            "message": "Course added successfully."
        }), 201

    except ValueError as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        return jsonify({"success": False, "message": str(e)}), 400

    except (IntegrityError, Error) as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        return jsonify({"success": False, "message": str(e)}), 500

# =============================================================
# API  —  GET ALL STUDENTS
# =============================================================

@app.route("/api/students", methods=["GET"])
def get_students():
    try:
        _, cur = get_db()
        cur.execute("SELECT * FROM students ORDER BY created_at DESC")
        students = serialize_rows(cur.fetchall())
        return jsonify({"success": True, "students": students})
    except Error as e:
        return jsonify({"success": False, "message": str(e)}), 500

# =============================================================
# API  —  GET ALL COURSES
# =============================================================

@app.route("/api/courses", methods=["GET"])
def get_courses():
    try:
        _, cur = get_db()
        cur.execute("SELECT * FROM courses ORDER BY course_id DESC")
        courses = serialize_rows(cur.fetchall())
        for course in courses:
            course["fees_paid"] = bool(course.get("fees_paid"))
        return jsonify({"success": True, "courses": courses})
    except Error as e:
        return jsonify({"success": False, "message": str(e)}), 500

# =============================================================
# API  —  GET STUDENT + MOST RECENT COURSE BY MOBILE
# =============================================================

@app.route("/api/student/<mobile>", methods=["GET"])
def get_student_by_mobile(mobile):
    try:
        _, cur = get_db()
        mobile = normalize_mobile(mobile)

        cur.execute("""
            SELECT * FROM students
            WHERE mobile_number = %s
            LIMIT 1
        """, (mobile,))
        student = cur.fetchone()

        if not student:
            return jsonify({
                "success": False,
                "message": "No student found with this mobile number."
            }), 404

        student = serialize_row(student)

        cur.execute("""
            SELECT * FROM courses
            WHERE enrollment_no = %s
            ORDER BY course_id DESC
            LIMIT 1
        """, (student["enrollment_no"],))
        course = cur.fetchone()
        course = serialize_row(course) if course else None

        if course:
            course["fees_paid"] = bool(course.get("fees_paid"))

        return jsonify({
            "success": True,
            "student": student,
            "course": course
        })

    except Error as e:
        return jsonify({"success": False, "message": str(e)}), 500

# =============================================================
# API  —  UPDATE STUDENT + OPTIONAL COURSE BY MOBILE
# =============================================================

@app.route("/api/student/<mobile>", methods=["PUT"])
def update_student_by_mobile(mobile):
    conn = None
    try:
        conn, cur = get_db()
        data = request.get_json(silent=True) or {}
        original_mobile = normalize_mobile(mobile)

        cur.execute("""
            SELECT * FROM students
            WHERE mobile_number = %s
            LIMIT 1
        """, (original_mobile,))
        student = cur.fetchone()

        if not student:
            return jsonify({
                "success": False,
                "message": "Student not found."
            }), 404

        enrollment_no = student["enrollment_no"]

        student_name = validate_name(first_present(data, "student_name") or student["student_name"])
        date_of_birth = validate_dob_18_plus(first_present(data, "date_of_birth") or serialize_value(student["date_of_birth"]))
        new_mobile = normalize_mobile(first_present(data, "mobile_number") or student["mobile_number"])
        email = validate_email(first_present(data, "email") or student["email"])
        enrollment_date = validate_not_future(first_present(data, "enrollment_date") or serialize_value(student["enrollment_date"]), "enrollment date")

        address = build_address(
            state=first_present(data, "state"),
            district=first_present(data, "district"),
            assembly_constituency=first_present(data, "assembly_constituency"),
            pincode=first_present(data, "pincode"),
            fallback_address=first_present(data, "address", "address_line") or student["address"]
        )

        if len(new_mobile) != 10:
            return jsonify({
                "success": False,
                "message": "Mobile number must be exactly 10 digits."
            }), 400

        if new_mobile != original_mobile:
            cur.execute("""
                SELECT enrollment_no
                FROM students
                WHERE mobile_number = %s
                LIMIT 1
            """, (new_mobile,))
            conflict = cur.fetchone()
            if conflict:
                return jsonify({
                    "success": False,
                    "message": "That mobile number already exists."
                }), 409

        if email != student["email"]:
            cur.execute("""
                SELECT enrollment_no
                FROM students
                WHERE email = %s
                LIMIT 1
            """, (email,))
            conflict = cur.fetchone()
            if conflict and conflict["enrollment_no"] != enrollment_no:
                return jsonify({
                    "success": False,
                    "message": "That email already exists."
                }), 409

        cur.execute("""
            UPDATE students SET
                student_name    = %s,
                date_of_birth   = %s,
                mobile_number   = %s,
                email           = %s,
                enrollment_date = %s,
                address         = %s
            WHERE mobile_number = %s
        """, (
            student_name,
            date_of_birth,
            new_mobile,
            email,
            enrollment_date,
            address,
            original_mobile
        ))

        course_fields_present = any(
            key in data for key in (
                "course_id",
                "course_name",
                "fees_structure",
                "fees_paid",
                "course_duration",
                "course_start_date",
                "course_end_date",
            )
        )

        if course_fields_present:
            course_name = validate_course_name(first_present(data, "course_name"))
            fees_structure = validate_fee_payload(first_present(data, "fees_structure"))
            fees_paid = to_bool_int(first_present(data, "fees_paid"))
            course_duration = first_present(data, "course_duration")
            course_start_date = first_present(data, "course_start_date")
            course_end_date = first_present(data, "course_end_date")
            course_id = first_present(data, "course_id")

            validate_course_dates(course_start_date, course_end_date)

            if course_id:
                cur.execute("""
                    UPDATE courses SET
                        course_name       = %s,
                        fees_structure    = %s,
                        fees_paid         = %s,
                        course_duration   = %s,
                        course_start_date = %s,
                        course_end_date   = %s
                    WHERE course_id = %s AND enrollment_no = %s
                """, (
                    course_name,
                    fees_structure,
                    fees_paid,
                    course_duration or None,
                    course_start_date or None,
                    course_end_date or None,
                    int(course_id),
                    enrollment_no
                ))
            else:
                cur.execute("""
                    SELECT course_id
                    FROM courses
                    WHERE enrollment_no = %s
                    ORDER BY course_id DESC
                    LIMIT 1
                """, (enrollment_no,))
                existing_course = cur.fetchone()

                if existing_course:
                    cur.execute("""
                        UPDATE courses SET
                            course_name       = %s,
                            fees_structure    = %s,
                            fees_paid         = %s,
                            course_duration   = %s,
                            course_start_date = %s,
                            course_end_date   = %s
                        WHERE enrollment_no = %s
                        ORDER BY course_id DESC
                        LIMIT 1
                    """, (
                        course_name,
                        fees_structure,
                        fees_paid,
                        course_duration or None,
                        course_start_date or None,
                        course_end_date or None,
                        enrollment_no
                    ))
                else:
                    cur.execute("""
                        INSERT INTO courses
                            (enrollment_no, course_name, fees_structure,
                             fees_paid, course_duration,
                             course_start_date, course_end_date)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """, (
                        enrollment_no,
                        course_name,
                        fees_structure,
                        fees_paid,
                        course_duration or None,
                        course_start_date or None,
                        course_end_date or None
                    ))

        conn.commit()

        return jsonify({
            "success": True,
            "message": "Student and course updated successfully."
        })

    except ValueError as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        return jsonify({"success": False, "message": str(e)}), 400

    except (IntegrityError, Error) as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        return jsonify({"success": False, "message": str(e)}), 500

# =============================================================
# API  —  DELETE STUDENT BY MOBILE
# =============================================================

@app.route("/api/student/<mobile>", methods=["DELETE"])
def delete_student_by_mobile(mobile):
    conn = None
    try:
        conn, cur = get_db()
        mobile = normalize_mobile(mobile)

        cur.execute("""
            SELECT student_name
            FROM students
            WHERE mobile_number = %s
            LIMIT 1
        """, (mobile,))
        row = cur.fetchone()

        if not row:
            return jsonify({
                "success": False,
                "message": "Student not found."
            }), 404

        name = row["student_name"]

        cur.execute("""
            DELETE FROM students
            WHERE mobile_number = %s
        """, (mobile,))

        conn.commit()

        return jsonify({
            "success": True,
            "message": f"Student '{name}' and all linked courses deleted successfully."
        })

    except Error as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        return jsonify({"success": False, "message": str(e)}), 500

# =============================================================
# RUN
# =============================================================

if __name__ == "__main__":
    app.run(debug=True)
