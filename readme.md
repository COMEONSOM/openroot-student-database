python app.py
pip install -r requirements.txt

# 🎓 Student Database System

A modern Student Database Management System built with **Flask**, **MySQL**, **HTML**, **CSS**, and **JavaScript** for managing student and course records through a responsive user interface.

---

## ✨ Features

### Student Management
- Add new students
- Auto-generated enrollment number
- Store student personal details
- Store contact information
- Date of birth validation
- Enrollment date tracking

### Course Management
- Assign courses to students
- Fee structure management
- Payment status tracking
- Course duration tracking
- Course start and end date management

### Record Operations
- Search student by mobile number
- Update student details
- Delete student records
- Cascade delete support
- View complete database records

### User Interface
- Responsive layout
- Landing page
- Dashboard cards
- Success and error notifications
- Form validation
- Modern UI design

---

## 🛠 Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Flask (Python)

### Database
- MySQL

### Tools
- MySQL Workbench
- Git
- GitHub

---

## 📁 Project Structure

```text
Student-Database-System/
│
├── app.py
├── config.py
├── requirements.txt
├── database_setup.sql
├── sample_data.sql
├── .env
├── .gitignore
│
├── templates/
│   ├── landingpage.html
│   ├── index.html
│   ├── add_student.html
│   ├── update_student.html
│   ├── delete_student.html
│   └── database.html
│
├── static/
│   ├── global.css
│   ├── index.css
│   ├── add_student.css
│   ├── update_student.css
│   ├── delete_student.css
│   ├── script.js
│   ├── logo.png
│   └── favicon.ico
```

---

## ⚙️ Installation and Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/yourusername/student-database-system.git
```

Move into project directory:

```bash
cd student-database-system
```

---

### Step 2: Install required dependencies

```bash
pip install -r requirements.txt
```

---

### Step 3: Install MySQL

Install:

- MySQL Server
- MySQL Workbench

---

### Step 4: Configure Database

Open MySQL Workbench.

Open:

```text
database_setup.sql
```

Click:

```text
⚡ Execute All
```

This creates:

- Database
- Students table
- Courses table

---

### Step 5: Configure Environment Variables

Create a file:

```text
.env
```

Add:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=student_database
```

---

### Step 6: Run Flask Application

Activate virtual environment      .\.venv\Scripts\Activate

```bash
python app.py
```

Open browser:

```text
http://127.0.0.1:5000
```

---

## 🗄 Database Schema

### Students Table

| Field | Type |
|---------|------|
| enrollment_no | VARCHAR |
| student_name | VARCHAR |
| date_of_birth | DATE |
| mobile_number | VARCHAR |
| email | VARCHAR |
| address | TEXT |
| enrollment_date | DATE |

---

### Courses Table

| Field | Type |
|---------|------|
| course_id | INT |
| enrollment_no | VARCHAR |
| course_name | VARCHAR |
| fees_structure | DECIMAL |
| fees_paid | BOOLEAN |
| course_duration | VARCHAR |
| course_start_date | DATE |
| course_end_date | DATE |

---

## 🔒 Security Notes

Never upload:

- `.env`
- Database passwords
- API keys
- Secret credentials

Recommended `.gitignore`:

```gitignore
.env
__pycache__/
*.pyc
```

---

## 🚀 Future Enhancements

- Authentication system
- Admin dashboard
- Student image upload
- Attendance management
- Export to PDF
- Search filters
- Pagination support

---

## 👨‍💻 Author

Somnath Banerjee

---

## 📄 License

This project is intended for educational and learning purposes.