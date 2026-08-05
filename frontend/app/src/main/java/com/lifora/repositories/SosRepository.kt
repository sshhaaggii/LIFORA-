package com.lifora.repositories

import android.content.Context
import com.lifora.data.local.LiforaDatabase
import com.lifora.data.local.entities.SosAlertEntity

class SosRepository(context: Context) {
    private val db = LiforaDatabase.getInstance(context)
    private val sosDao = db.sosDao()

    /** Trigger SOS — saves alert to local Room DB */
    suspend fun triggerSOS(
        latitude: Double?,
        longitude: Double?,
        message: String = "SOS! I need help!"
    ): Result<Int> {
        return try {
            val userId = 1

            val alert = SosAlertEntity(
                userId = userId,
                latitude = latitude,
                longitude = longitude,
                message = message,
                status = "active",
                triggeredAt = System.currentTimeMillis()
            )
            val id = sosDao.insertAlert(alert).toInt()
            Result.success(id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /** Cancel an active SOS alert */
    suspend fun cancelSOS(alertId: Int): Result<Unit> {
        return try {
            sosDao.cancelAlert(alertId)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /** Get SOS history for the current user */
    suspend fun getSosHistory(): Result<List<SosAlertEntity>> {
        return try {
            val userId = 1
            val history = sosDao.getAlertsByUser(userId)
            Result.success(history)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
