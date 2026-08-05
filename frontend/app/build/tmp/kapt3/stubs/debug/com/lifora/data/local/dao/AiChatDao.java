package com.lifora.data.local.dao;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000$\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0010\b\n\u0002\b\u0002\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0002\b\u0004\bg\u0018\u00002\u00020\u0001J\u0019\u0010\u0002\u001a\u00020\u00032\u0006\u0010\u0004\u001a\u00020\u0005H\u00a7@\u00f8\u0001\u0000\u00a2\u0006\u0002\u0010\u0006J\u001f\u0010\u0007\u001a\b\u0012\u0004\u0012\u00020\t0\b2\u0006\u0010\u0004\u001a\u00020\u0005H\u00a7@\u00f8\u0001\u0000\u00a2\u0006\u0002\u0010\u0006J\u0019\u0010\n\u001a\u00020\u00032\u0006\u0010\u000b\u001a\u00020\tH\u00a7@\u00f8\u0001\u0000\u00a2\u0006\u0002\u0010\f\u0082\u0002\u0004\n\u0002\b\u0019\u00a8\u0006\r"}, d2 = {"Lcom/lifora/data/local/dao/AiChatDao;", "", "clearHistory", "", "userId", "", "(ILkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getChatHistory", "", "Lcom/lifora/data/local/entities/AiChatEntity;", "insertChat", "chat", "(Lcom/lifora/data/local/entities/AiChatEntity;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_debug"})
@androidx.room.Dao
public abstract interface AiChatDao {
    
    @androidx.room.Insert
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object insertChat(@org.jetbrains.annotations.NotNull
    com.lifora.data.local.entities.AiChatEntity chat, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
    
    @androidx.room.Query(value = "SELECT * FROM ai_chat WHERE userId = :userId ORDER BY timestamp DESC LIMIT 50")
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object getChatHistory(int userId, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super java.util.List<com.lifora.data.local.entities.AiChatEntity>> $completion);
    
    @androidx.room.Query(value = "DELETE FROM ai_chat WHERE userId = :userId")
    @org.jetbrains.annotations.Nullable
    public abstract java.lang.Object clearHistory(int userId, @org.jetbrains.annotations.NotNull
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion);
}