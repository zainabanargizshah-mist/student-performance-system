# 🚀 Deployment Guide

This guide covers the necessary steps to deploy the Student Performance Analytics System to production environments.

## Option 1: Docker Compose (VPS / Local Server)

The easiest way to run the entire stack on a single server (like DigitalOcean, AWS EC2, or a local server) is using Docker Compose.

### 1. Prerequisites
- Docker installed on your server.
- Docker Compose installed.

### 2. Setup
1. Clone the repository to your server.
2. Ensure you change the `SECRET_KEY` in the `docker-compose.yml` file to a secure, random string.
3. If deploying to a public IP/Domain, update the `ALLOWED_ORIGINS` in `docker-compose.yml` and `VITE_API_URL` in the frontend environment block.

### 3. Run
```bash
docker-compose up -d --build
```
This will start:
- **PostgreSQL Database** on port 5432
- **FastAPI Backend** on port 8000
- **React Frontend** on port 5173

---

## Option 2: Cloud PaaS (Render / Railway)

If you prefer a fully managed solution without dealing with servers, use platforms like Render or Railway.

### Backend Deployment
1. Connect your GitHub repository to Render/Railway.
2. Create a new **Web Service** for the backend.
3. Set the Root Directory to `backend/`.
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. **Environment Variables**:
   - `DATABASE_URL`: Your production PostgreSQL connection string.
   - `SECRET_KEY`: A highly secure random string.
   - `ALGORITHM`: `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `30`
   - `ALLOWED_ORIGINS`: The URL of your deployed frontend.

### Frontend Deployment
1. Create a new **Static Site** for the frontend.
2. Set the Root Directory to `frontend/`.
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. **Environment Variables**:
   - `VITE_API_URL`: The URL of your deployed backend service.

---

## Important Security Notes
- **Never commit `.env` files** containing real passwords or secret keys.
- **Always update `ALLOWED_ORIGINS`** in the backend to point only to your frontend domain to prevent CORS vulnerabilities.
- Ensure the PostgreSQL database is not publicly exposed unless necessary (Docker Compose handles this safely by default).
