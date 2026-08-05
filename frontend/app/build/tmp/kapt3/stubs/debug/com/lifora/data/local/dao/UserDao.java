package com.lifora.data.local.dao;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00000\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0010\b\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u000e\n\u0002\b\u0004\n\u0002\u0010\t\n\u0002\b\u0004\bg\u0018\u00002\u00020\u0001J\u0019\u0010\u0002\u001a\u00020\u00032\u0006\u0010\u0004\u001a\u00020\u0005H\u00a7@\u00f8\u0001\u0000\u00a2\u0006\u0002\u0010\u0006J\u001b\u0010\u0007\u001a\u0004\u0018\u00010\b2\u0006\u0010\u0004\u001a\u00020\u0005H\u00a7@\u00f8\u0001\u0000\u00a2\u0006\u0002\u0010\u0006J\u001b\u0010\t\u001a\u0004\u0018\u00010\b2\u0006\u0010\n\u001a\u00020\u000bH\u00a7@\u00f8\u0001\u0000\u00a2\u0006\u0002\u0010\fJ\u001b\u0010\r\u001a\u0004\u0018\u00010\b2\u0006\u0010\u000e\u001a\u00020\u000bH\u00a7@\u00f8\u0001\u0000\u00a2\u0006\u0002\u0010\fJ\u0019\u0010\u000f\u001a\u00020\u00102\u0006\u0010\u0011\u001a\u00020\bH\u00a7@\u00f8\u0001\u0000\u00a2\u0006\u0002\u0010\u0012J\u0019\u0010\u0013\u001a\u00020\u00032\u0006\u0010\u0011\u001a\u00020\bH\u00a7@\u00f8\u0001\u0000\u00a2\u0006\u0002\u0010\u0012\u0082\u0002\u0004\n\u0002\b\u0019\u00a8\u0006\u0014"}, d2 = {"Lcom/lifora/data/local/dao/UserDao;", "", "deleteUser", "", "id", "", "(ILkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getUserById", "Lcom/lifora/data/local/entities/UserEntity;", "getUserByPhoneNormalized", "normalizedPhone", "", "(Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getUserByUid", "uid", "insertUser", "", "user", "(Lcom/lifora/data/local/entities/UserEntity;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "updateUser", "app_debug"})
@androidx.room.Dao
public abstract interface UserDao {
    
    @androidx.room.Insert(onConflict = 1)
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object insertUser(@org.jetbrains.annotations.NotNull
    com.lifora.data.local.entities.UserEntity user, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super java.lang.Long> $completion);
    
    @androidx.room.Query(value = "SELECT * FROM users WHERE phoneNumberNormalized = :normalizedPhone LIMIT 1")
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object getUserByPhoneNormalized(@org.jetbrains.annotations.NotNull
    java.lang.String normalizedPhone, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super com.lifora.data.local.entities.UserEntity> $completion);
    
    @androidx.room.Query(value = "SELECT * FROM users WHERE uid = :uid LIMIT 1")
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object getUserByUid(@org.jetbrains.annotations.NotNull
    java.lang.String uid, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super com.lifora.data.local.entities.UserEntity> $completion);
    
    @androidx.room.Query(value = "SELECT * FROM users WHERE id = :id LIMIT 1")
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object getUserById(int id, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super com.lifora.data.local.entities.UserEntity> $completion);
    
    @androidx.room.Update
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object updateUser(@org.jetbrains.annotations.NotNull
    com.lifora.data.local.entities.UserEntity user, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
    
    @androidx.room.Query(value = "DELETE FROM users WHERE id = :id")
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object deleteUser(int id, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
}