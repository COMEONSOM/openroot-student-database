# 🎓 Openroot Student Database System

A modern **Student Database Management System** built with **HTML, CSS, JavaScript, Flask, and MySQL**.  
The project now uses a **clean separated deployment workflow**:

- **Frontend** → GitHub Pages
- **Backend API** → Render
- **Database** → Aiven MySQL 8.4

---

## 🌐 Live Links

| Part | URL |
|---|---|
| Frontend | https://comeonsom.github.io/openroot-student-database/ |
| Backend API | https://openroot-student-management-system-api.onrender.com |
| Health Check | https://openroot-student-management-system-api.onrender.com/health |

> If any service name changes later, update the matching URL here and in the JavaScript API base constant.

---

## 🚀 Architecture Overview

```text
GitHub Pages (Static Frontend)
        ↓
Render (Flask API-only backend)
        ↓
Aiven MySQL 8.4 (Managed database)
```

This means:

- the **browser** loads the HTML/CSS/JS pages from GitHub Pages,
- the **JavaScript** talks to the Flask backend on Render using `fetch()`,
- the **Flask backend** reads and writes data in Aiven MySQL,
- the frontend never connects to the database directly.

---

## ✨ What This Project Does

### Student Management
- Add a new student
- Auto-generate enrollment numbers
- Save personal details
- Save contact details
- Validate date of birth
- Track enrollment date

### Course Management
- Assign a course to a student
- Store fee details
- Track payment status
- Store course duration
- Store course start and end dates

### Record Operations
- Search student by mobile number
- Update student and course details
- Delete a student and linked course rows
- View joined student + course records
- Cascade delete support in the database

### User Experience
- Landing page
- Dashboard cards
- Modern form layouts
- Search → edit workflow
- Delete preview screen
- Message boxes for success/error/loading states
- Responsive design for mobile and desktop

---

## 🛠 Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- GitHub Pages

### Backend
- Flask
- Flask-CORS
- MySQL Connector Python
- Gunicorn
- Render

### Database
- MySQL 8.4 on Aiven
- SSL/TLS enabled with Aiven CA certificate

### Tools
- MySQL Workbench
- Git
- GitHub

---

## 📁 Project Structure

The repository is organized around deployment, not around a single monolithic Flask app.

```text
Student-Database-System/
│
├── docs/                          # GitHub Pages source folder
│   ├── index.html                 # Landing page
│   ├── dashboard.html             # Dashboard page
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
│
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   └── certs/
│       └── ca.pem
│
├── database/
│   ├── database_setup.sql
│   ├── AivenMysql.sql
│   └── queries.sql
│
├── .env
├── .env.example
├── .gitignore
└── README.md
```

### What each folder does

#### `docs/`
This is the **published frontend** folder for GitHub Pages.  
It contains all static HTML pages and assets.

#### `backend/`
This is the **Flask API service**.  
It contains only backend code and database connection logic.

#### `database/`
This folder contains SQL files used to create and seed the database schema.

---

## Page Flow

The frontend uses a simple navigation flow:

```text
index.html (Landing Page)
    ↓
dashboard.html
    ├── add_student.html
    ├── update_student.html
    ├── delete_student.html
    └── database.html
```

### Why this structure works well
- The landing page stays simple and welcoming.
- The dashboard acts as the main control center.
- Each action gets its own page, so the UI remains clean and easy to maintain.

---

## 🔁 How the Full Workflow Works

### 1) User opens the landing page
GitHub Pages serves `index.html`.

### 2) User clicks **Proceed**
The browser opens `dashboard.html`.

### 3) User performs an action
For example, adding a student on `add_student.html`.

### 4) JavaScript sends a request to Render
The form uses `fetch()` to call the Flask API, for example:

```js
const API_BASE = "https://openroot-student-management-system-api.onrender.com";
```

### 5) Flask validates the data
The backend checks:
- names
- mobile numbers
- email format
- date of birth
- fee format
- pincode format
- course date order

### 6) Flask writes to Aiven MySQL
The API inserts or updates rows in:
- `students`
- `courses`

### 7) Response goes back to the browser
The frontend shows a success or error message without reloading the entire site.

---

## 🔗 API Endpoints

The backend is API-only.

### Utility
- `GET /` → basic API status response
- `GET /health` → health check that also verifies the database connection

### Student and course APIs
- `GET /api/students`
- `GET /api/courses`
- `GET /api/full-database`
- `GET /api/student/<mobile>`
- `POST /api/add-student`
- `POST /api/add-course`
- `PUT /api/student/<mobile>`
- `DELETE /api/student/<mobile>`

---

## ⚙️ Local Development Setup

If you want to work on the project again after a long time, follow this sequence.

### 1) Clone the repository

```bash
git clone https://github.com/yourusername/student-database-system.git
cd student-database-system
```

### 2) Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3) Configure environment variables

Create a `.env` file in root and add:

```env
DB_HOST=YOUR_AIVEN_HOST
DB_PORT=AIVEN_PORT_DATA
DB_USER=AIVEN_USERNAME
DB_PASSWORD=YOUR_AIVEN_PASSWORD
DB_NAME=USED_DB_NAME
DB_SSL_CA=certs/ca.pem
CORS_ALLOWED_ORIGINS=https://comeonsom.github.io
FLASK_ENV=production
PORT=5000
```

### 4) Run the backend locally

```bash
python app.py
```

The backend will run at:

```text
http://127.0.0.1:5000
```

---

## 🗄 Database Setup

The database is hosted on **Aiven MySQL 8.4**.

### Core tables
- `students`
- `courses`

### Important relationships
- `students.enrollment_no` is the primary key
- `courses.enrollment_no` is a foreign key that references `students.enrollment_no`
- deleting a student automatically removes related course rows because of **ON DELETE CASCADE**

### Schema summary

#### `students`
Stores:
- enrollment number
- student name
- date of birth
- mobile number
- email
- address
- enrollment date
- timestamps

#### `courses`
Stores:
- course ID
- enrollment number
- course name
- fees structure
- fees paid status
- course duration
- course start and end dates
- timestamps

---

## 🌐 Frontend Deployment on GitHub Pages

The frontend is fully static and can be hosted on GitHub Pages.

### Frontend pages
- `index.html`
- `dashboard.html`
- `add_student.html`
- `update_student.html`
- `delete_student.html`
- `database.html`

### Frontend assets
- CSS files
- `script.js`
- `indiaGeoData.json`
- images and favicon

### Important frontend constant
Your JavaScript must point to the Render backend:

```js
const API_BASE = "https://openroot-student-management-system-api.onrender.com";
```

### GitHub Pages setup
The repository is configured to publish from:

```text
Branch: main
Folder: /docs
```

---

## ☁️ Backend Deployment on Render

The backend is deployed on **Render** as a Flask web service.

### Build command

```bash
pip install -r backend/requirements.txt
```

### Start command

```bash
gunicorn app:app
```

### Environment variables on Render

Add the same values used locally:

```env
DB_HOST=YOUR_AIVEN_HOST
DB_PORT=AIVEN_PORT_DATA
DB_USER=AIVEN_USERNAME
DB_PASSWORD=YOUR_AIVEN_PASSWORD
DB_NAME=USED_DB_NAME
DB_SSL_CA=certs/ca.pem
CORS_ALLOWED_ORIGINS=https://comeonsom.github.io
FLASK_ENV=production
PORT=5000
```

> The exact Render service URL and the GitHub Pages URL should also be kept in sync with the frontend JavaScript and this README.

---

## 🔐 Aiven MySQL Connection Notes

Aiven provides:
- Host
- Port
- Username
- Password
- Database name
- CA certificate (`ca.pem`)

### MySQL Workbench setup
To connect from MySQL Workbench:
- choose **SSL required**
- select the downloaded **CA certificate**
- enter the Aiven host, port, username, and password
- use the same database name as the backend

### Why the CA certificate matters
Aiven requires SSL/TLS so the connection is encrypted.  
The CA certificate lets the client verify that the connection is really going to the Aiven server.

---

## 🔒 Security Notes

Never commit these files or values:

- `.env`
- database passwords
- secret keys
- private API keys
- personal credentials

Recommended `.gitignore`:

```gitignore
.env
.venv/
__pycache__/
*.pyc
```

### What is safe to commit?
- HTML/CSS/JS
- SQL schema files
- public CA certificate (`ca.pem`)
- static assets
- README documentation

### What should stay private?
- passwords
- secret keys
- any environment-specific sensitive values

---

## 🧩 Why This New Workflow Is Better

### Frontend
Static pages on GitHub Pages

### Backend
Flask API on Render

### Database
Managed MySQL on Aiven

### Benefits
- easier to maintain
- easier to debug
- cleaner deployment
- safer database access
- frontend can be updated without touching backend logic
- backend can be scaled or redeployed independently

---

## 🧰 How to Reopen the Project Later

When you come back to this project after a long time, use this checklist:

### 1) Open the repository
Confirm the repo still contains:
- `docs/`
- `backend/`
- `database/`

### 2) Check the live services
- Frontend GitHub Pages URL
- Render backend URL
- Aiven database status

### 3) Verify the environment variables
Check that backend variables still point to:
- Aiven host
- Aiven port
- correct username/password
- correct DB name
- correct CA certificate path

### 4) Open the frontend
Test:
- landing page
- dashboard
- add student
- update student
- delete student
- database viewer

### 5) Verify the API
Open:
- `/health`
- `/api/students`
- `/api/full-database`

### 6) Test one full flow
Add one record and confirm it appears in:
- the frontend database viewer
- MySQL Workbench
- Aiven database

That quick test tells you whether the whole stack is healthy.

---

## 👨‍💻 Author

**Somnath Banerjee**

---

## 📄 License

Belongs to Openroot Systems (Kolkata, West Bengal, India).
