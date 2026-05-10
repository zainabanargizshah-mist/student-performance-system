from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import models

# Create all tables in database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Performance Analytics System",
    description="A system to track student grades, attendance, assignments and more",
    version="1.0.0"
)

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Student Performance API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}