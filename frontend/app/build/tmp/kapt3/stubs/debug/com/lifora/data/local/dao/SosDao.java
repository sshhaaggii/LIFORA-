package com.lifora.data.local.dao;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000.\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0010\b\n\u0000\n\u0002\u0010\t\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010 \n\u0002\b\u0005\bg\u0018\u00002\u00020\u0001J#\u0010\u0002\u001a\u00020\u00032\u0006\u0010\u0004\u001a\u00020\u00052\b\b\u0002\u0010\u0006\u001a\u00020\u0007H\u00a7@\u00f8\u0001\u0000\u00a2\u0006\u0002\u0010\bJ\u001b\u0010\t\u001a\u0004\u0018\u00010\n2\u0006\u0010\u0004\u001a\u00020\u0005H\u00a7@\u00f8\u0001\u0000\u00a2\u0006\u0002\u0010\u000bJ\u001f\u0010\f\u001a\b\u0012\u0004\u0012\u00020\n0\r2\u0006\u0010\u000e\u001a\u00020\u0005H\u00a7@\u00f8\u0001\u0000\u00a2\u0006\u0002\u0010\u000bJ\u0019\u0010\u000f\u001a\u00020\u00072\u0006\u0010\u0010\u001a\u00020\nH\u00a7@\u00f8\u0001\u0000\u00a2\u0006\u0002\u0010\u0011\u0082\u0002\u0004\n\u0002\b\u0019\u00a8\u0006\u0012"}, d2 = {"Lcom/lifora/data/local/dao/SosDao;", "", "cancelAlert", "", "alertId", "", "cancelledAt", "", "(IJLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getAlertById", "Lcom/lifora/data/local/entities/SosAlertEntity;", "(ILkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getAlertsByUser", "", "userId", "insertAlert", "alert", "(Lcom/lifora/data/local/entities/SosAlertEntity;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_debug"})
@androidx.room.Dao
public abstract interface SosDao {
    
    @androidx.room.Insert
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object insertAlert(@org.jetbrains.annotations.NotNull
    com.lifora.data.local.entities.SosAlertEntity alert, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super java.lang.Long> $completion);
    
    @androidx.room.Query(value = "SELECT * FROM sos_alerts WHERE userId = :userId ORDER BY triggeredAt DESC LIMIT 20")
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object getAlertsByUser(int userId, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super java.util.List<com.lifora.data.local.entities.SosAlertEntity>> $completion);
    
    @androidx.room.Query(value = "UPDATE sos_alerts SET status = \'cancelled\', cancelledAt = :cancelledAt WHERE id = :alertId")
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object cancelAlert(int alertId, long cancelledAt, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
    
    @androidx.room.Query(value = "SELECT * FROM sos_alerts WHERE id = :alertId LIMIT 1")
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object getAlertById(int alertId, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super com.lifora.data.local.entities.SosAlertEntity> $completion);
    
    @kotlin.Metadata(mv = {1, 9, 0}, k = 3, xi = 48)
    public static final class DefaultImpls {
    }
}