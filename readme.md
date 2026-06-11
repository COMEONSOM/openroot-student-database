<div align="center">

  <h1>Openroot Student Database System</h1>
  <p><strong>Full-Stack Student Database Management System</strong></p>
  <p>Built by <a href="https://openroot.in/">Openroot Systems</a></p>

  <p>
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
    <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask">
    <img src="https://img.shields.io/badge/MySQL_8.4-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
  </p>

  <p>
    <img src="https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=githubpages&logoColor=white" alt="GitHub Pages">
    <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black" alt="Render">
    <img src="https://img.shields.io/badge/Aiven-FF3E00?style=for-the-badge&logo=aiven&logoColor=white" alt="Aiven">
  </p>

</div>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Live Environments](#live-environments)
- [Project Structure](#project-structure)
- [Application Workflow](#application-workflow)
- [API Specification](#api-specification)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Local Development Setup](#local-development-setup)
- [Security Considerations](#security-considerations)
- [Maintenance and Recovery](#maintenance-and-recovery)

---

## Overview

**Openroot Student Database System** is a full-stack web application for managing student enrollment and course assignment records. The project follows a clean, separated deployment workflow in which the static frontend, REST API backend, and managed database layer are deployed and maintained independently.

> **Product Name:** Openroot Student Database System
> **Organization:** Openroot Systems
> **Type:** Static frontend + Flask REST API + Managed MySQL database

---

## Architecture

```
+--------------------------------------------------+
|        GitHub Pages (Static Frontend)            |  <- HTML / CSS / JavaScript
|                                                  |
|  index.html → dashboard.html                     |
|      ├── add_student.html                        |
|      ├── update_student.html                     |
|      ├── delete_student.html                     |
|      └── database.html                           |
|                                                  |
|  JavaScript fetch() → Render API                 |
+--------------------------------------------------+
                        ↓
+--------------------------------------------------+
|           Render (Flask REST API)                |  <- Python / Flask / Gunicorn
|                                                  |
|  +------------+  +------------+  +-----------+   |
|  | Validation |  | Endpoints  |  |   CORS    |   |
|  +------------+  +------------+  +-----------+   |
+--------------------------------------------------+
                        ↓
+--------------------------------------------------+
|        Aiven MySQL 8.4 (Managed Database)        |  <- SSL/TLS encrypted connection
|                                                  |
|  +------------------+  +---------------------+   |
|  |     students     |  |       courses       |   |
|  +------------------+  +---------------------+   |
|  | enrollment_no PK |  | enrollment_no FK    |   |
|  | student_name     |  | course_name         |   |
|  | mobile_number    |  | fees_structure      |   |
|  | ...              |  | ...                 |   |
|  +------------------+  +---------------------+   |
+--------------------------------------------------+
```

### Core Components

| Component | Role | Description |
|-----------|------|-------------|
| **GitHub Pages** | Frontend Host | Serves all static HTML, CSS, and JavaScript assets |
| **Flask API** | Backend Service | Validates input, handles business logic, and writes to the database |
| **Aiven MySQL** | Database Layer | Managed MySQL 8.4 with SSL/TLS and cascading relational integrity |
| **Gunicorn** | WSGI Server | Production-grade process manager for the Flask application on Render |
| **script.js** | API Client | All `fetch()` calls to the Render backend originate here |

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Markup | HTML5 | Page structure for all frontend views |
| Styling | CSS3 | Responsive layout and visual design |
| Client Logic | Vanilla JavaScript | API communication and DOM interaction |
| Frontend Hosting | GitHub Pages | Static delivery from the `/docs` folder |
| Backend Framework | Python 3 / Flask | REST API with input validation |
| Cross-Origin | Flask-CORS | Allows the GitHub Pages frontend to call the Render API |
| DB Driver | MySQL Connector/Python | Encrypted connection to Aiven MySQL |
| Process Manager | Gunicorn | WSGI server for production Flask deployment on Render |
| Backend Hosting | Render | PaaS hosting for the Flask web service |
| Database | MySQL 8.4 on Aiven | Managed relational database with SSL/TLS |
| Dev Tools | MySQL Workbench, Git, GitHub | Schema management and version control |

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

## Live Environments

| Component | URL |
|-----------|-----|
| **Frontend** | https://comeonsom.github.io/openroot-student-database/ |
| **Backend API** | https://openroot-student-management-system-api.onrender.com |
| **Health Check** | https://openroot-student-management-system-api.onrender.com/health |

> If service domains change, update the corresponding URLs in both this README and the `API_BASE` constant in `script.js`.

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
│       ├── script.js              # All fetch() calls and frontend logic
│       ├── indiaGeoData.json
│       ├── logo.png
│       └── favicon.ico
├── backend/                       # Flask API service
│   ├── app.py                     # API routes and validation logic
│   ├── config.py                  # Database and environment configuration
│   ├── requirements.txt
│   └── certs/
│       └── ca.pem                 # Aiven SSL CA certificate
├── database/                      # Schema and seed files
│   ├── database_setup.sql
│   ├── AivenMysql.sql
│   └── queries.sql
├── .env                           # Local environment variables (never commit)
├── .env.example
├── .gitignore
└── README.md
```

### Repository Folders

| Folder | Purpose |
|--------|---------|
| `docs/` | Published frontend for GitHub Pages — all static HTML pages and assets |
| `backend/` | API-only Flask application, database connection logic, and TLS certificate |
| `database/` | SQL scripts for schema creation, seeding, and query reference |

---

## Application Workflow

```
index.html (Landing Page)
    ↓
dashboard.html
    ├── add_student.html
    ├── update_student.html
    ├── delete_student.html
    └── database.html
```

1. The user opens `index.html` served by GitHub Pages.
2. Navigation proceeds to `dashboard.html`, which links to all functional modules.
3. User actions trigger JavaScript `fetch()` requests to the Render backend.
4. The backend validates input, executes business logic, and persists data to Aiven MySQL.
5. The frontend displays API responses without requiring full page reloads.

### Frontend Integration

All API requests originate from the static frontend using a dedicated base URL constant:

```js
const API_BASE = "https://openroot-student-management-system-api.onrender.com";
```

---

## API Specification

### Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Basic API status response |
| GET | `/health` | Health check with database connectivity verification |

### Student and Course Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | Retrieve all student records |
| GET | `/api/courses` | Retrieve all course records |
| GET | `/api/full-database` | Retrieve joined student and course records |
| GET | `/api/student/<mobile>` | Retrieve a specific student by mobile number |
| POST | `/api/add-student` | Create a new student record |
| POST | `/api/add-course` | Create a new course assignment |
| PUT | `/api/student/<mobile>` | Update an existing student record |
| DELETE | `/api/student/<mobile>` | Remove a student and cascade linked courses |

### Backend Validation

The API enforces strict validation on all incoming requests:

| Field | Validation Rule |
|-------|----------------|
| Name fields | Non-empty, alphabetic format |
| Mobile number | Valid Indian mobile number format |
| Email address | Standard email format check |
| Date of birth | Valid date range and format |
| Fee structure | Numeric format |
| Pincode | 6-digit Indian pincode format |
| Course dates | Start date must precede end date |

---

## Database Schema

The managed MySQL 8.4 instance on Aiven contains two core tables with referential integrity enforced via foreign keys.

### `students`

| Column | Details |
|--------|---------|
| `enrollment_no` | Primary key — auto-generated |
| `student_name` | Full name |
| `date_of_birth` | Validated date |
| `mobile_number` | Unique contact number |
| `email` | Validated email address |
| `address` | Residential address |
| `enrollment_date` | Automatic timestamp |
| `created_at` | Audit timestamp |
| `updated_at` | Audit timestamp |

### `courses`

| Column | Details |
|--------|---------|
| `course_id` | Primary key |
| `enrollment_no` | Foreign key referencing `students.enrollment_no` |
| `course_name` | Program name |
| `fees_structure` | Fee details |
| `fees_paid_status` | Payment tracking |
| `course_duration` | Program length |
| `course_start_date` | Start date |
| `course_end_date` | End date |
| `created_at` | Audit timestamp |
| `updated_at` | Audit timestamp |

### Relationships

- `students.enrollment_no` is the primary key.
- `courses.enrollment_no` is a foreign key referencing `students.enrollment_no`.
- `ON DELETE CASCADE` ensures that deleting a student automatically removes all associated course records.

---

## Deployment

### Frontend Deployment (GitHub Pages)

The frontend is fully static and deployed directly from the repository.

| Setting | Value |
|---------|-------|
| **Source branch** | `main` |
| **Source folder** | `/docs` |
| **Published URL** | https://comeonsom.github.io/openroot-student-database/ |

### Backend Deployment (Render)

The Flask application is deployed as a web service on Render.

| Setting | Value |
|---------|-------|
| **Build command** | `pip install -r backend/requirements.txt` |
| **Start command** | `gunicorn app:app` |

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

Aiven MySQL requires TLS encryption for all connections. The backend and any management clients must present the CA certificate (`ca.pem`) to verify server identity.

#### MySQL Workbench Configuration

| Setting | Value |
|---------|-------|
| **SSL mode** | Require SSL |
| **SSL CA file** | Downloaded `ca.pem` from Aiven console |
| **Host / Port** | Aiven-provided host and port |
| **Credentials** | Aiven username, password, and database name |

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

### Never Commit

- `.env` files containing secrets
- Database passwords or connection strings
- Secret keys and private API credentials
- Personal user credentials

### Recommended `.gitignore` Entries

```gitignore
.env
.venv/
__pycache__/
*.pyc
```

### Safe to Commit

| Asset | Safe |
|-------|------|
| HTML, CSS, and JavaScript source | Yes |
| SQL schema and seed files | Yes |
| Public CA certificate (`ca.pem`) | Yes |
| Static assets and documentation | Yes |
| Passwords or secret keys | **Never** |

---

## Maintenance and Recovery

When returning to this project after extended downtime, follow this checklist.

### Repository Integrity

- [ ] Confirm presence of `docs/`, `backend/`, and `database/` directories

### Service Availability

- [ ] Frontend GitHub Pages URL responds with HTTP 200
- [ ] Render backend `/health` endpoint returns a healthy status
- [ ] Aiven database shows active status in the service console

### Environment Verification

- [ ] All backend environment variables point to the current Aiven host, port, credentials, and CA path
- [ ] `CORS_ALLOWED_ORIGINS` matches the current GitHub Pages domain

### End-to-End Validation

- [ ] Open the frontend landing page and dashboard
- [ ] Execute a test student creation via `add_student.html`
- [ ] Verify the record appears in the frontend database viewer (`database.html`)
- [ ] Verify the record appears via the backend API (`/api/full-database`)
- [ ] Verify the record appears in MySQL Workbench or the Aiven console

---

<div align="center">

**Maintained by [Openroot Systems](https://openroot.in/)**

<p>
  <img src="https://img.shields.io/badge/Made%20with-Flask-000000?style=flat-square&logo=flask&logoColor=white" alt="Flask">
  <img src="https://img.shields.io/badge/Database-MySQL_8.4-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/License-Proprietary-red?style=flat-square" alt="License">
</p>

</div>
