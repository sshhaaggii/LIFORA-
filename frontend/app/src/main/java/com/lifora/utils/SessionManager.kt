package com.lifora.utils

import android.content.Context
import android.content.SharedPreferences

class SessionManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("lifora_session_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_IS_LOGGED_IN = "is_logged_in"
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_UID = "user_uid"
        private const val KEY_FULL_NAME = "full_name"
        private const val KEY_EMAIL = "email"
        private const val KEY_USER_ROLE = "user_role"
        private const val KEY_REMEMBER_ME = "remember_me"
    }

    fun saveUserSession(
        token: String,
        uid: String,
        fullName: String,
        email: String,
        role: String = "PATIENT",
        rememberMe: Boolean = true
    ) {
        prefs.edit().apply {
            putBoolean(KEY_IS_LOGGED_IN, true)
            putString(KEY_TOKEN, token)
            putString(KEY_UID, uid)
            putString(KEY_FULL_NAME, fullName)
            putString(KEY_EMAIL, email)
            putString(KEY_USER_ROLE, role)
            putBoolean(KEY_REMEMBER_ME, rememberMe)
            apply()
        }
    }

    fun isLoggedIn(): Boolean = prefs.getBoolean(KEY_IS_LOGGED_IN, false)
    fun isPhoneVerified(): Boolean = isLoggedIn()
    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)
    fun getUid(): String? = prefs.getString(KEY_UID, null)
    fun getFullName(): String = prefs.getString(KEY_FULL_NAME, "User") ?: "User"
    fun getEmail(): String = prefs.getString(KEY_EMAIL, "") ?: ""
    fun getPhoneNumber(): String = getEmail()
    fun getCountryCode(): String = ""
    fun getPhoneNumberNormalized(): String = getEmail()
    fun getUserRole(): String = prefs.getString(KEY_USER_ROLE, "PATIENT") ?: "PATIENT"
    fun isRememberMe(): Boolean = prefs.getBoolean(KEY_REMEMBER_ME, true)

    fun clearSession() {
        prefs.edit().clear().apply()
    }
}
