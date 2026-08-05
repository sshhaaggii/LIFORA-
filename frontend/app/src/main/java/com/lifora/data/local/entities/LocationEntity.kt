package com.lifora.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "location_history")
data class LocationEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val userId: Int,
    val latitude: Double,
    val longitude: Double,
    val updatedAt: Long = System.currentTimeMillis()
)
