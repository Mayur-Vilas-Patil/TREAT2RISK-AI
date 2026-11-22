@echo off
TITLE Threat2Risk AI - Enterprise SOC Platform
echo =====================================================================
echo                THREAT2RISK AI - ENTERPRISE SOC PLATFORM
echo          From Alert Noise to an Explainable Attack Story
echo                 Smart India Hackathon 2026 Submission
echo =====================================================================
echo.
echo [1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000 ...
start "Threat2Risk Backend" cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting React Frontend on http://127.0.0.1:5173 ...
cd frontend
start "Threat2Risk Frontend" cmd /k "npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo Application successfully launched!
echo - Frontend URL: http://127.0.0.1:5173
echo - Backend API Docs: http://127.0.0.1:8000/docs
echo.
pause
