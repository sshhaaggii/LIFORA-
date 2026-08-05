package com.lifora.models

data class UserProfile(
    val uid: String,
    val fullName: String,
    val email: String,
    val countryCode: String = "+91",
    val phoneNumber: String = "",
    val phoneNumberNormalized: String = "",
    val phoneVerified: Boolean = false,
    val role: String = "PATIENT"
)

data class AuthResponse(
    val message: String,
    val token: String? = null,
    val user: UserProfile? = null,
    val error: String? = null,
    val maskedPhone: String? = null,
    val expiresAt: String? = null,
    val devOtp: String? = null,
    val requiresVerification: Boolean = false
)
