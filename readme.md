# Openroot Student Database System

A full-stack Student Database Management System built with HTML, CSS, JavaScript, Flask, and MySQL. The project follows a clean, separated deployment workflow in which the static frontend, REST API backend, and managed database layer are deployed and maintained independently.

---

## System Architecture

```text
GitHub Pages (Static Frontend)
        ↓
Render (Flask API)
        ↓
Aiven MySQL 8.4 (Managed Database)
```

The browser loads all HTML, CSS, and JavaScript assets from GitHub Pages. Client-side scripts communicate with the Flask backend on Render via HTTPS `fetch()` requests. The Flask application enforces data validation and persists state through an encrypted TLS tunnel to Aiven MySQL.

This decoupled architecture provides:

- Independent frontend updates without backend redeployment
- Isolated backend scaling, debugging, and restart cycles
- Secure database access with no direct client-to-database exposure
- Cleaner separation of concerns across the entire stack

---

## Live Environments

| Component   | URL                                                                 |
|-------------|---------------------------------------------------------------------|
| Frontend    | https://comeonsom.github.io/openroot-student-database/              |
| Backend API | https://openroot-student-management-system-api.onrender.com         |
| Health Check| https://openroot-student-management-system-api.onrender.com/health  |

If service domains change, update the corresponding URLs in both this README and the frontend JavaScript API base constant.

---

## Technology Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- GitHub Pages (static hosting)

### Backend

- Python 3 / Flask
- Flask-CORS
- MySQL Connector/Python
- Gunicorn (WSGI server)
- Render (PaaS hosting)

### Database

- MySQL 8.4 (Aiven managed)
- SSL/TLS encryption via Aiven CA certificate

### Development Tools

- MySQL Workbench
- Git / GitHub

---

## Features

### Student Management

- Add new students with auto-generated enrollment numbers
- Store and validate personal details, contact information, and date of birth
- Track enrollment dates with automated timestamping

### Course Management

- Assign courses to existing students
- Record fee structures and payment status
- Manage course duration, start dates, and end dates

### Record Operations

- Search students by mobile number
- Update student and course records
- Delete students with cascading removal of linked course data
- View joined student and course records

### User Interface

- Landing page with dashboard navigation
- Modern, responsive form layouts for mobile and desktop
- Dedicated pages for add, update, delete, and database view operations
- Real-time success, error, and loading state notifications

---

## Project Structure

The repository is organized by deployment target rather than as a single monolithic application.

```text
Student-Database-System/
├── docs/                          # GitHub Pages frontend source
│   ├── index.html                 # Landing page
│   ├── dashboard.html             # Dashboard hub
│   ├── add_student.html
│   ├── update_student.html
│   ├── delete_student.html
│   ├── database.html
│   └── static/
│       ├── global.css
│       ├── index.css
│       ├── add_student.css
│       ├── update_student.css
│       ├── delete_student.css
│       ├── database.css
│       ├── script.js
│       ├── indiaGeoData.json
│       ├── logo.png
│       └── favicon.ico
├── backend/                       # Flask API service
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   └── certs/
│       └── ca.pem
├── database/                      # Schema and seed files
│   ├── database_setup.sql
│   ├── AivenMysql.sql
│   └── queries.sql
├── .env
├── .env.example
├── .gitignore
└── README.md
```

### Repository Folders

#### `docs/`

Contains all static HTML pages and assets published to GitHub Pages.

#### `backend/`

Contains the API-only Flask application, database connection logic, and TLS certificate.

#### `database/`

Contains SQL scripts for schema creation, seeding, and query reference.

---

## Application Workflow

1. The user opens the landing page (`index.html`) served by GitHub Pages.
2. Navigation proceeds to the dashboard (`dashboard.html`), which links to functional modules.
3. User actions trigger JavaScript `fetch()` requests to the Render backend.
4. The backend validates input, executes business logic, and persists data to Aiven MySQL.
5. The frontend displays API responses without requiring full page reloads.

### Page Flow

```text
index.html (Landing Page)
    ↓
dashboard.html
    ├── add_student.html
    ├── update_student.html
    ├── delete_student.html
    └── database.html
```

### Frontend Integration

All API requests originate from the static frontend using a dedicated base URL:

```js
const API_BASE = "https://openroot-student-management-system-api.onrender.com";
```

---

## API Specification

### Utility Endpoints

| Method | Endpoint   | Description                                          |
|--------|------------|------------------------------------------------------|
| GET    | `/`        | Basic API status response                            |
| GET    | `/health`  | Health check with database connectivity verification |

### Student and Course Endpoints

| Method | Endpoint                     | Description                                    |
|--------|------------------------------|------------------------------------------------|
| GET    | `/api/students`              | Retrieve all student records                   |
| GET    | `/api/courses`               | Retrieve all course records                    |
| GET    | `/api/full-database`         | Retrieve joined student and course records     |
| GET    | `/api/student/<mobile>`      | Retrieve a specific student by mobile number   |
| POST   | `/api/add-student`           | Create a new student record                    |
| POST   | `/api/add-course`            | Create a new course assignment                 |
| PUT    | `/api/student/<mobile>`      | Update an existing student record              |
| DELETE | `/api/student/<mobile>`      | Remove a student and cascade linked courses    |

### Backend Validation

The API enforces strict validation on:

- Name fields
- Mobile number format
- Email address format
- Date of birth range and format
- Fee structure format
- Pincode format
- Course date sequencing (start before end)

---

## Database Schema

The managed MySQL 8.4 instance on Aiven contains two core tables with referential integrity enforced via foreign keys.

### `students`

| Column              | Details                       |
|---------------------|-------------------------------|
| enrollment_no       | Primary key                   |
| student_name        | Full name                     |
| date_of_birth       | Validated date                |
| mobile_number       | Unique contact number         |
| email               | Validated email address       |
| address             | Residential address           |
| enrollment_date     | Automatic timestamp           |
| created_at          | Audit timestamp               |
| updated_at          | Audit timestamp               |

### `courses`

| Column              | Details                                           |
|---------------------|---------------------------------------------------|
| course_id           | Primary key                                       |
| enrollment_no       | Foreign key referencing `students.enrollment_no`  |
| course_name         | Program name                                      |
| fees_structure      | Fee details                                       |
| fees_paid_status    | Payment tracking                                  |
| course_duration     | Program length                                    |
| course_start_date   | Start date                                        |
| course_end_date     | End date                                          |
| created_at          | Audit timestamp                                   |
| updated_at          | Audit timestamp                                   |

### Relationships

- `students.enrollment_no` is the primary key.
- `courses.enrollment_no` references `students.enrollment_no`.
- `ON DELETE CASCADE` ensures that deleting a student automatically removes associated course records.

---

## Deployment

### Frontend Deployment (GitHub Pages)

The frontend is fully static and deployed directly from the repository.

- **Source branch:** `main`
- **Source folder:** `/docs`
- **Published URL:** https://comeonsom.github.io/openroot-student-database/

### Backend Deployment (Render)

The Flask application is deployed as a web service on Render.

- **Build command:** `pip install -r backend/requirements.txt`
- **Start command:** `gunicorn app:app`

#### Required Render Environment Variables

```env
DB_HOST=YOUR_AIVEN_HOST
DB_PORT=AIVEN_PORT
DB_USER=AIVEN_USERNAME
DB_PASSWORD=YOUR_AIVEN_PASSWORD
DB_NAME=YOUR_DB_NAME
DB_SSL_CA=certs/ca.pem
CORS_ALLOWED_ORIGINS=https://comeonsom.github.io
FLASK_ENV=production
PORT=5000
```

### Database Connection (Aiven)

Aiven MySQL requires TLS encryption. The backend and any management clients must use the provided CA certificate (`ca.pem`) to verify server identity.

#### MySQL Workbench Configuration

- **SSL mode:** Require SSL
- **SSL CA file:** Downloaded `ca.pem`
- **Connection parameters:** Aiven host, port, username, password, and database name

---

## Local Development Setup

### Prerequisites

- Python 3.x
- pip
- Git
- Aiven MySQL instance (or local MySQL 8.x for isolated testing)

### Clone and Install

```bash
git clone https://github.com/yourusername/student-database-system.git
cd student-database-system
cd backend
pip install -r requirements.txt
```

### Environment Configuration

Create a `.env` file in the project root:

```env
DB_HOST=YOUR_AIVEN_HOST
DB_PORT=AIVEN_PORT
DB_USER=AIVEN_USERNAME
DB_PASSWORD=YOUR_AIVEN_PASSWORD
DB_NAME=USED_DB_NAME
DB_SSL_CA=certs/ca.pem
CORS_ALLOWED_ORIGINS=https://comeonsom.github.io
FLASK_ENV=production
PORT=5000
```

### Run the Backend

```bash
python app.py
```

The local API will be available at `http://127.0.0.1:5000`.

---

## Security Considerations

The following must never be committed to version control:

- `.env` files containing secrets
- Database passwords or connection strings
- Secret keys and private API credentials
- Personal user credentials

### Recommended `.gitignore` entries

```gitignore
.env
.venv/
__pycache__/
*.pyc
```

### Safe to commit

- HTML, CSS, and JavaScript source
- SQL schema and seed files
- Public CA certificates (`ca.pem`)
- Static assets and documentation

---

## Maintenance and Recovery

When returning to this project after extended downtime, verify the following:

### Repository Integrity

- Confirm presence of `docs/`, `backend/`, and `database/` directories.

### Service Availability

- Frontend GitHub Pages URL responds with HTTP 200.
- Render backend URL and `/health` endpoint return healthy status.
- Aiven database shows active status in the service console.

### Environment Verification

- All backend environment variables point to the current Aiven host, port, credentials, and CA path.
- `CORS_ALLOWED_ORIGINS` matches the current GitHub Pages domain.

### End-to-End Validation

1. Open the frontend landing page and dashboard.
2. Execute a test student creation via `add_student.html`.
3. Verify the record appears in:
   - Frontend database viewer (`database.html`)
   - Backend API (`/api/full-database`)
   - MySQL Workbench or Aiven console

---

## Author

Somnath Banerjee

---

## License

Proprietary. Belongs to Openroot Systems (Kolkata, West Bengal, India).
