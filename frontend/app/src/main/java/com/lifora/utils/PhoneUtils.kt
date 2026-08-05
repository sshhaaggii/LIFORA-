package com.lifora.utils

object PhoneUtils {
    
    /**
     * Normalizes phone number into international E.164 string (+919876543210)
     */
    fun normalizePhoneNumber(countryCode: String = "+91", phoneNumber: String): String {
        val cc = if (countryCode.trim().startsWith("+")) countryCode.trim() else "+${countryCode.trim()}"
        val digits = phoneNumber.replace("\\D".toRegex(), "")
        return "$cc$digits"
    }

    /**
     * Validates phone number input based on country code
     */
    fun validatePhoneNumber(countryCode: String, phoneNumber: String): String? {
        val digits = phoneNumber.replace("\\D".toRegex(), "")
        val cc = countryCode.trim()
        
        if (cc == "+91") {
            if (digits.length != 10) {
                return "Indian phone numbers (+91) must contain exactly 10 digits."
            }
            if (!digits.matches("^[6-9].*".toRegex())) {
                return "Invalid Indian mobile number. Must start with 6, 7, 8, or 9."
            }
        } else {
            if (digits.length < 7 || digits.length > 15) {
                return "Phone number must be between 7 and 15 digits."
            }
        }
        return null
    }

    /**
     * Mask phone number for display (+91 ******3210)
     */
    fun maskPhoneNumber(countryCode: String, phoneNumber: String): String {
        val digits = phoneNumber.replace("\\D".toRegex(), "")
        if (digits.length < 4) return "$countryCode ****"
        val masked = "*".repeat(digits.length - 4) + digits.takeLast(4)
        return "$countryCode $masked"
    }

    /**
     * Format phone number for readability (+91 98765 43210)
     */
    fun formatReadablePhone(countryCode: String, phoneNumber: String): String {
        val digits = phoneNumber.replace("\\D".toRegex(), "")
        return if (digits.length == 10) {
            "$countryCode ${digits.substring(0, 5)} ${digits.substring(5)}"
        } else {
            "$countryCode $digits"
        }
    }
}
