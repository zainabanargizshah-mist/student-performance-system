from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import models
from app.routes import auth, students, smart, calendar, reports

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Performance Analytics System",
    description="A system to track student grades, attendance, assignments and more",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(smart.router)
app.include_router(calendar.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {"message": "Student Performance API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
