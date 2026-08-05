# 🗄️ LIFORA Local Storage (Room SQLite Database)

LIFORA Android application uses **Android Room** for 100% local database storage without relying on external cloud databases.

## 📱 Database Architecture
- **Database File**: `lifora_database`
- **Class**: `com.lifora.data.local.LiforaDatabase`
- **ORM Framework**: Android Jetpack Room (`androidx.room`)

## 📊 Tables & Entities

1. **`users`** (`UserEntity`)
   - `id`: Auto-incrementing primary key
   - `name`, `email`, `phone`
   - `passwordHash`: SHA-256 secure local password hash
   - `role`, `createdAt`

2. **`sos_alerts`** (`SosAlertEntity`)
   - `id`: Auto-incrementing primary key
   - `userId`: Reference to logged-in user
   - `latitude`, `longitude`, `message`, `status`, `triggeredAt`, `cancelledAt`

3. **`location_history`** (`LocationEntity`)
   - `id`: Primary key
   - `userId`: Reference to logged-in user
   - `latitude`, `longitude`, `updatedAt`

4. **`ai_chat`** (`AiChatEntity`)
   - `id`: Primary key
   - `userId`: Reference to logged-in user
   - `userMessage`, `aiResponse`, `timestamp`

## 🔒 Session Management
User authentication status and current active session token/user ID are stored securely in local `SharedPreferences` (`lifora_session`).
