# Health Prediction Server

Backend API for the Health Prediction System.

Quick start:

1. copy `.env.example` to `.env` and fill values
2. cd `backend` and run `npm install`
3. `npm run dev` to start with nodemon

APIs are mounted under `/api`:
- `GET /api/patients`
- `GET /api/patients/:id`
- `POST /api/patients`
- `PUT /api/patients/:id`
- `DELETE /api/patients/:id`
- `POST /api/predict`
