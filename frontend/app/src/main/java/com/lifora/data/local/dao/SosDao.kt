package com.lifora.data.local.dao

import androidx.room.*
import com.lifora.data.local.entities.SosAlertEntity

@Dao
interface SosDao {
    @Insert
    suspend fun insertAlert(alert: SosAlertEntity): Long

    @Query("SELECT * FROM sos_alerts WHERE userId = :userId ORDER BY triggeredAt DESC LIMIT 20")
    suspend fun getAlertsByUser(userId: Int): List<SosAlertEntity>

    @Query("UPDATE sos_alerts SET status = 'cancelled', cancelledAt = :cancelledAt WHERE id = :alertId")
    suspend fun cancelAlert(alertId: Int, cancelledAt: Long = System.currentTimeMillis())

    @Query("SELECT * FROM sos_alerts WHERE id = :alertId LIMIT 1")
    suspend fun getAlertById(alertId: Int): SosAlertEntity?
}
