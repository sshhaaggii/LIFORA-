package com.lifora.data.local.dao

import androidx.room.*
import com.lifora.data.local.entities.AiChatEntity

@Dao
interface AiChatDao {
    @Insert
    suspend fun insertChat(chat: AiChatEntity)

    @Query("SELECT * FROM ai_chat WHERE userId = :userId ORDER BY timestamp DESC LIMIT 50")
    suspend fun getChatHistory(userId: Int): List<AiChatEntity>

    @Query("DELETE FROM ai_chat WHERE userId = :userId")
    suspend fun clearHistory(userId: Int)
}
