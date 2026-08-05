# LIFORA Project

LIFORA is divided into two separate workspaces:

## 📱 Frontend — Android App
**Location:** `frontend/`

The Android mobile application built with **Kotlin + Jetpack Compose**.

### Structure
```
frontend/
├── app/src/main/java/com/lifora/
│   ├── ui/            # Screens, Activities, Theme, Navigation
│   ├── repositories/  # Data repositories
│   ├── models/        # Data models
│   ├── services/      # Background services
│   ├── ai/            # AI integration
│   ├── location/      # Location utilities
│   ├── emergency/     # Emergency features
│   └── translation/   # Translation utilities
├── build.gradle.kts
└── settings.gradle.kts
```

### Run
Open `frontend/` in Android Studio and run on a device/emulator.

---

## 🖥️ Backend — Node.js API Server
**Location:** `backend/`

A REST API server built with **Node.js + Express**.

### Structure
```
backend/
├── src/
│   ├── index.js         # Main server entry point
│   └── routes/
│       ├── auth.js      # Authentication (login, register)
│       ├── sos.js       # SOS emergency alerts
│       ├── location.js  # Live location tracking
│       ├── translation.js # Translation assistant
│       └── ai.js        # AI assistant chat
├── .env.example         # Environment variables template
└── package.json
```

### Setup
```bash
cd backend
cp .env.example .env     # Fill in your API keys
npm install
npm run dev              # Start development server
```

### API Endpoints
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | /api/auth/register        | Register new user        |
| POST   | /api/auth/login           | Login user               |
| POST   | /api/sos/trigger          | Trigger SOS alert        |
| GET    | /api/sos/history/:userId  | Get SOS alert history    |
| POST   | /api/location/update      | Update live location     |
| GET    | /api/location/live/:userId| Get user's live location |
| POST   | /api/translation/translate| Translate text           |
| GET    | /api/translation/languages| Get supported languages  |
| POST   | /api/ai/chat              | Chat with AI assistant   |
| GET    | /api/ai/history/:userId   | Get AI chat history      |
