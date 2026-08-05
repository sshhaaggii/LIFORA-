package com.lifora.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "sos_alerts")
data class SosAlertEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val userId: Int,
    val latitude: Double?,
    val longitude: Double?,
    val message: String = "SOS! I need help!",
    val status: String = "active",     // active | cancelled
    val triggeredAt: Long = System.currentTimeMillis(),
    val cancelledAt: Long? = null
)
