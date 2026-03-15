# EyeAI Diagnostics

Welcome to **EyeAI Diagnostics**—a cutting-edge, patient-centric web platform powered by Artificial Intelligence to help detect ocular diseases! 

Our system uses an **EfficientNet-B3** deep learning model alongside **Grad-CAM explainability** to not just detect diseases like Glaucoma, Cataracts, and Diabetic Retinopathy, but actually *show* you where the AI is looking.

---

## What makes EyeAI special?
- **AI-Powered Screening**: Rapidly analyses retinal fundus images for multiple diseases.
- **Explainable AI (Grad-CAM)**: Heatmaps that show exactly what parts of the eye led to the diagnosis.
- **Role-based Dashboards**: Tailored experiences for both **Patients** (to view their medical history) and **Doctors** (to manage patient records and add clinical notes).
- **PDF Reports**: Instant, downloadable clinical reports for every scan.

---

## Project Architecture

Our application is split into three main pieces working seamlessly together:

1. **`frontend/`** (React) — The beautiful, interactive user interface on port `3000`.
2. **`backend/`** (Node.js & Express) — The robust API managing users, patients, and databases on port `5000`.
3. **`ml-service/`** (FastAPI & PyTorch) — The brain of the operation running the AI models on port `8000`.

---

## How to Run Locally

Ready to try it out? You'll need three separate terminal windows to run each service simultaneously.

### 1. Start the Machine Learning Service (Python)
This service handles all the heavy AI lifting.

```bash
cd ml-service

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # On Windows, use: venv\Scripts\activate

# Install the required Python packages
pip install -r requirements.txt

# Start the AI engine!
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*Make sure you've placed your trained model files (`glaucoma_model.pth`, `cataract_model.pth`, `dr_model.pth`) into the `ml-service/models/` folder first!*
> API Live: http://localhost:8000

---

### 2. Start the Backend API (Node.js)
This handles our database and routing logic.

```bash
cd backend

# Install all Node dependencies
npm install

# Start the server
npm run dev
```
*Note: Make sure you have MongoDB running locally on port `27017`, or configure your `MONGODB_URI` in the `.env` file to point to MongoDB Atlas.*
> Backend Live: http://localhost:5000

---

### 3. Start the Frontend (React)
This brings up the visual interface for doctors and patients.

```bash
cd frontend

# Install UI dependencies
npm install

# Start the React app!
npm start
```
*Note: Our authentication relies on Firebase. You will need to set up a Firebase project and add your credentials to `frontend/.env`.*
> App Live: http://localhost:3000

---

## The AI Models

Our engine looks for specific PyTorch model weights inside `ml-service/models/`:
- `glaucoma_model.pth` — Detects Glaucoma
- `cataract_model.pth` — Detects Cataracts
- `dr_model.pth` — Detects Diabetic Retinopathy

If you need to tweak the model labels or preprocessing constants, just check out the JSON files inside `ml-service/configs/`.

---

## Essential Configurations

### Firebase Setup (Required for Login)
1. Head over to the Firebase Console.
2. Create a new project (e.g., `eyeai-diagnostics`).
3. Under **Authentication -> Sign-in method**, enable both **Google** and **Email/Password**.
4. Register a Web App in your project settings and copy the `firebaseConfig` variables into your `frontend/.env` file.

### Environment Variables (.env)
You'll need `.env` files in both the frontend and backend folders. Here's what they should look like:

**`backend/.env`**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eyeai
JWT_SECRET=your_super_secret_code_here
ML_SERVICE_URL=http://localhost:8000
CLIENT_URL=http://localhost:3000
```

**`frontend/.env`**
```env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

---

## User Roles

EyeAI supports two primary types of users:

- **Doctors**: Can view the entire patient directory, upload scans on behalf of patients, review AI predictions, and add clinical notes.
- **Patients**: Can log in to view their own profile, upload their own ocular scans for preliminary screening, and view their historical reports.

*You can simply select your role when registering for a new account!*

---

## Behind the Scenes: How a Scan Works

1. **Upload:** A user uploads a retinal fundus image via the React dashboard.
2. **Routing:** The Node.js backend safely stores the image and forwards it to the Python ML service.
3. **Analysis:** The PyTorch models (EfficientNet-B3) process the image.
4. **Explanation:** Grad-CAM generates a heatmap highlighting the exact pixels that influenced the diagnosis.
5. **Storage:** The predictions and heatmaps are sent back to Node.js and saved into MongoDB.
6. **Display:** The user instantly sees a detailed, interactive medical report on their screen!

---

*Built with passion to make ocular diagnostics more accessible and explainable.*
