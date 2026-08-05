package com.lifora.data.local.dao

import androidx.room.*
import com.lifora.data.local.entities.LocationEntity

@Dao
interface LocationDao {
    @Insert
    suspend fun insertLocation(location: LocationEntity)

    @Query("SELECT * FROM location_history WHERE userId = :userId ORDER BY updatedAt DESC LIMIT 1")
    suspend fun getLastLocation(userId: Int): LocationEntity?

    @Query("SELECT * FROM location_history WHERE userId = :userId ORDER BY updatedAt DESC LIMIT 50")
    suspend fun getLocationHistory(userId: Int): List<LocationEntity>
}
