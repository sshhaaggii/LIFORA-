package com.lifora.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.lifora.data.local.dao.AiChatDao
import com.lifora.data.local.dao.LocationDao
import com.lifora.data.local.dao.SosDao
import com.lifora.data.local.dao.UserDao
import com.lifora.data.local.entities.AiChatEntity
import com.lifora.data.local.entities.LocationEntity
import com.lifora.data.local.entities.SosAlertEntity
import com.lifora.data.local.entities.UserEntity

@Database(
    entities = [
        UserEntity::class,
        SosAlertEntity::class,
        LocationEntity::class,
        AiChatEntity::class
    ],
    version = 2,
    exportSchema = false
)
abstract class LiforaDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun sosDao(): SosDao
    abstract fun locationDao(): LocationDao
    abstract fun aiChatDao(): AiChatDao

    companion object {
        @Volatile
        private var INSTANCE: LiforaDatabase? = null

        fun getInstance(context: Context): LiforaDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    LiforaDatabase::class.java,
                    "lifora_database"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}

