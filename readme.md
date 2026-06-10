# 🎓 Openroot Student Database System

A modern **Student Database Management System** built with **HTML, CSS, JavaScript, Flask, and MySQL**.

The project now follows a **separated deployment workflow**:

- **Frontend** → GitHub Pages
- **Backend API** → Render
- **Database** → Aiven MySQL

---

## 🚀 Live Architecture

```text
GitHub Pages (Frontend)
        ↓
Render (Flask API)
        ↓
Aiven MySQL (Database)
```

---

## ✨ Features

### Student Management
- Add new students
- Auto-generate enrollment numbers
- Store personal details
- Store contact details
- Validate date of birth
- Track enrollment dates

### Course Management
- Assign course details to a student
- Manage fee structure
- Track payment status
- Store course duration
- Track course start and end dates

### Record Operations
- Search student by mobile number
- Update student details
- Delete student records
- Cascade delete support
- View joined student + course records

### User Interface
- Responsive frontend pages
- Landing page
- Dashboard cards
- Modern form layouts
- Search and update workflow
- Success/error message boxes

---

## 🛠 Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Flask (Python)
- Flask-CORS
- MySQL Connector

### Database
- MySQL 8.4 on Aiven

### Deployment
- GitHub Pages for frontend
- Render for backend API
- Aiven for database hosting

---

## 📁 Project Structure

```text
Student-Database-System/
│
├── frontend/
│   ├── landingpage.html
│   ├── index.html
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
│   └── sample_data.sql
│
├── .env
├── .gitignore
└── README.md
```

---

## 🔗 API Endpoints

The Flask backend now works as an **API-only service**.

### Public / Utility
- `GET /` → health/status response

### Student APIs
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

Create a `.env` file inside `backend/`:

```env
DB_HOST=YOUR_AIVEN_HOST
DB_PORT=19699
DB_USER=avnadmin
DB_PASSWORD=YOUR_AIVEN_PASSWORD
DB_NAME=student_management_system
DB_SSL_CA=certs/ca.pem
FLASK_ENV=production
```

### 4) Run the backend locally

```bash
python app.py
```

Backend runs at:

```text
http://127.0.0.1:5000
```

---

## 🗄 Database Setup

The database is hosted on **Aiven MySQL 8.4**.

### Required tables
- `students`
- `courses`

### Important notes
- `students.enrollment_no` is the primary key
- `courses.enrollment_no` uses a foreign key
- Deleting a student cascades to linked course records

---

## 🌐 Frontend Deployment (GitHub Pages)

The frontend is completely static and can be deployed on **GitHub Pages**.

### Frontend files
- `landingpage.html`
- `index.html`
- `add_student.html`
- `update_student.html`
- `delete_student.html`
- `database.html`
- `static/script.js`
- CSS files
- `indiaGeoData.json`

### Frontend API base URL
Update the JavaScript API base URL to the Render backend URL:

```js
const API_BASE = "https://openroot-student-management-system-api.onrender.com";
```

---

## ☁️ Backend Deployment (Render)

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
Set the same values used in local development:

```env
DB_HOST=YOUR_AIVEN_HOST
DB_PORT=19699
DB_USER=avnadmin
DB_PASSWORD=YOUR_AIVEN_PASSWORD
DB_NAME=student_management_system
DB_SSL_CA=certs/ca.pem
FLASK_ENV=production
```

---

## 🧩 Aiven MySQL Connection

Aiven provides the database connection details used by the backend.

### Example fields
- Host
- Port
- Username
- Password
- Database name
- SSL certificate (`ca.pem`)

### Workbench support
You can connect using **MySQL Workbench** with:
- SSL enabled
- CA certificate selected
- Correct host, port, username, and password

---

## 🔒 Security Notes

Never commit these files or values:

- `.env`
- Database passwords
- Secret keys
- Private API keys
- Personal credentials

Recommended `.gitignore`:

```gitignore
.env
.venv/
__pycache__/
*.pyc
```

---

## ✅ What Changed in the New Workflow

Earlier the project used Flask to serve HTML pages directly.

Now the project is separated into:

### Frontend
Static pages hosted on GitHub Pages

### Backend
Flask API hosted on Render

### Database
Aiven MySQL database accessed through secure environment variables

This makes the project easier to maintain and easier to deploy.

---

## 🚧 Future Enhancements

- Admin authentication layer
- Search filters and pagination
- Export to PDF/CSV
- Better activity logging
- Student image upload
- Attendance module
- Role-based access control

---

## 👨‍💻 Author

**Somnath Banerjee**

---

## 📄 License

This project is intended for educational and learning purposes.
