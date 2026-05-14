<div align="center">
  <h1>🎓 Student Performance Analytics System</h1>
  <p>A comprehensive academic tracker for students to monitor grades, attendance, certifications, and career alignment.</p>

  ![React](https://img.shields.io/badge/React-18-blue?logo=react)
  ![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)
  ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?logo=fastapi)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
  ![License](https://img.shields.io/badge/License-MIT-gray)
</div>

<br />

## ✨ Features

- **📊 Dashboard:** High-level overview of CGPA, recent grades, and a visual target tracker for your dream GPA.
- **📝 Grades & CGPA:** Track semester-by-semester subjects, automatically calculate SGPA, and track your overall CGPA.
- **📅 Attendance:** Stay above the mandatory thresholds. Features dynamic progress bars and calculates exactly how many consecutive classes you need to reach 85%.
- **🏆 Certifications:** Track external learning (Coursera, Udemy, etc.), tag acquired skills, and link your credentials.
- **🧠 Skills Profile:** Visualize all skills acquired from both academic subjects and external certifications through an interactive Radar Chart.
- **💼 Dream Jobs Target:** Select a dream career and see exactly how your current skills match up. Provides actionable insights on missing requirements and bonus skills.
- **🗓️ Academic Calendar:** Manage exams and deadlines with an interactive monthly calendar. Tracks "critical deadlines" automatically.
- **📄 Export Center:** Download professional PDF reports, Excel data exports, and auto-generated Academic Resumes.

---

## 🛠 Tech Stack

**Frontend:**
- React 19 / Vite
- TailwindCSS (Premium UI/UX, Gradients, Glassmorphism)
- Recharts (Data Visualization)
- React Router DOM

**Backend:**
- FastAPI (Python)
- SQLAlchemy (ORM)
- PostgreSQL (Database)
- JWT Authentication

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- Python (3.10+)
- PostgreSQL

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment & install dependencies
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt

# Environment Setup
cp .env.example .env
# Important: Update DATABASE_URL in .env with your local PostgreSQL credentials

# Run the server
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`. You can view the Swagger UI documentation at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Environment Setup
cp .env.example .env

# Run the development server
npm run dev
```
The frontend will be available at `http://localhost:5173`.

---

## 🐳 Running with Docker

You can easily run the entire stack (Database, Backend, Frontend) using Docker Compose.

```bash
docker-compose up -d --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

## 📖 API Reference Highlights

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Register a new user | No |
| `POST` | `/auth/login` | Login and get JWT token | No |
| `GET`  | `/students/profile` | Get student academic profile | Yes |
| `GET`  | `/students/subjects/{sem}` | Get subjects for a specific semester | Yes |
| `POST` | `/students/attendance` | Log or update attendance for a subject | Yes |
| `GET`  | `/smart/skills` | Get compiled skills from all courses/certs | Yes |
| `GET`  | `/reports/pdf` | Download full academic report PDF | Yes |

*For the complete API documentation, run the backend and visit `/docs`.*

---

## ☁️ Deployment

For deployment instructions (Render, Railway, or VPS via Docker), please refer to the [`DEPLOYMENT.md`](./DEPLOYMENT.md) file.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
