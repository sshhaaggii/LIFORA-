package com.lifora.utils;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000\u0014\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0010\u000e\n\u0002\b\u0006\b\u00c6\u0002\u0018\u00002\u00020\u0001B\u0007\b\u0002\u00a2\u0006\u0002\u0010\u0002J\u0016\u0010\u0003\u001a\u00020\u00042\u0006\u0010\u0005\u001a\u00020\u00042\u0006\u0010\u0006\u001a\u00020\u0004J\u0016\u0010\u0007\u001a\u00020\u00042\u0006\u0010\u0005\u001a\u00020\u00042\u0006\u0010\u0006\u001a\u00020\u0004J\u0018\u0010\b\u001a\u00020\u00042\b\b\u0002\u0010\u0005\u001a\u00020\u00042\u0006\u0010\u0006\u001a\u00020\u0004J\u0018\u0010\t\u001a\u0004\u0018\u00010\u00042\u0006\u0010\u0005\u001a\u00020\u00042\u0006\u0010\u0006\u001a\u00020\u0004\u00a8\u0006\n"}, d2 = {"Lcom/lifora/utils/PhoneUtils;", "", "()V", "formatReadablePhone", "", "countryCode", "phoneNumber", "maskPhoneNumber", "normalizePhoneNumber", "validatePhoneNumber", "app_debug"})
public final class PhoneUtils {
    @org.jetbrains.annotations.NotNull
    public static final com.lifora.utils.PhoneUtils INSTANCE = null;
    
    private PhoneUtils() {
        super();
    }
    
    /**
     * Normalizes phone number into international E.164 string (+919876543210)
     */
    @org.jetbrains.annotations.NotNull
    public final java.lang.String normalizePhoneNumber(@org.jetbrains.annotations.NotNull
    java.lang.String countryCode, @org.jetbrains.annotations.NotNull
    java.lang.String phoneNumber) {
        return null;
    }
    
    /**
     * Validates phone number input based on country code
     */
    @org.jetbrains.annotations.Nullable
    public final java.lang.String validatePhoneNumber(@org.jetbrains.annotations.NotNull
    java.lang.String countryCode, @org.jetbrains.annotations.NotNull
    java.lang.String phoneNumber) {
        return null;
    }
    
    /**
     * Mask phone number for display (+91 ******3210)
     */
    @org.jetbrains.annotations.NotNull
    public final java.lang.String maskPhoneNumber(@org.jetbrains.annotations.NotNull
    java.lang.String countryCode, @org.jetbrains.annotations.NotNull
    java.lang.String phoneNumber) {
        return null;
    }
    
    /**
     * Format phone number for readability (+91 98765 43210)
     */
    @org.jetbrains.annotations.NotNull
    public final java.lang.String formatReadablePhone(@org.jetbrains.annotations.NotNull
    java.lang.String countryCode, @org.jetbrains.annotations.NotNull
    java.lang.String phoneNumber) {
        return null;
    }
}