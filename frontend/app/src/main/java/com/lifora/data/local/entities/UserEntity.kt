package com.lifora.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "users",
    indices = [Index(value = ["email"], unique = false)]
)
data class UserEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val uid: String,
    val fullName: String,
    val email: String,
    val countryCode: String = "+91",
    val phoneNumber: String = "",
    val phoneNumberNormalized: String = "",
    val phoneVerified: Boolean = false,
    val passwordHash: String = "",
    val role: String = "PATIENT",
    val profileImage: String? = null,
    val isActive: Boolean = true,
    val createdAt: Long = System.currentTimeMillis(),
    val lastLoginAt: Long = System.currentTimeMillis()
)
