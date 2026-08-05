package com.lifora.repositories

class TranslationRepository {
    // Local prototype translation repository
    suspend fun translateText(text: String, sourceLang: String, targetLang: String): String {
        return "[$targetLang] $text"
    }
}
