package com.lifora.repositories;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000L\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\u0010\u0002\n\u0000\n\u0002\u0010\b\n\u0002\b\u0003\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0002\b\u0004\n\u0002\u0010\u0006\n\u0002\b\u0002\n\u0002\u0010\u000e\n\u0002\b\u0003\u0018\u00002\u00020\u0001B\r\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\u0002\u0010\u0004J*\u0010\t\u001a\b\u0012\u0004\u0012\u00020\u000b0\n2\u0006\u0010\f\u001a\u00020\rH\u0086@\u00f8\u0001\u0000\u00f8\u0001\u0001\u00f8\u0001\u0002\u00f8\u0001\u0002\u00a2\u0006\u0004\b\u000e\u0010\u000fJ(\u0010\u0010\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\u00120\u00110\nH\u0086@\u00f8\u0001\u0000\u00f8\u0001\u0001\u00f8\u0001\u0002\u00f8\u0001\u0002\u00a2\u0006\u0004\b\u0013\u0010\u0014J@\u0010\u0015\u001a\b\u0012\u0004\u0012\u00020\r0\n2\b\u0010\u0016\u001a\u0004\u0018\u00010\u00172\b\u0010\u0018\u001a\u0004\u0018\u00010\u00172\b\b\u0002\u0010\u0019\u001a\u00020\u001aH\u0086@\u00f8\u0001\u0000\u00f8\u0001\u0001\u00f8\u0001\u0002\u00f8\u0001\u0002\u00a2\u0006\u0004\b\u001b\u0010\u001cR\u000e\u0010\u0005\u001a\u00020\u0006X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0007\u001a\u00020\bX\u0082\u0004\u00a2\u0006\u0002\n\u0000\u0082\u0002\u000f\n\u0002\b!\n\u0005\b\u00a1\u001e0\u0001\n\u0002\b\u0019\u00a8\u0006\u001d"}, d2 = {"Lcom/lifora/repositories/SosRepository;", "", "context", "Landroid/content/Context;", "(Landroid/content/Context;)V", "db", "Lcom/lifora/data/local/LiforaDatabase;", "sosDao", "Lcom/lifora/data/local/dao/SosDao;", "cancelSOS", "Lkotlin/Result;", "", "alertId", "", "cancelSOS-gIAlu-s", "(ILkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getSosHistory", "", "Lcom/lifora/data/local/entities/SosAlertEntity;", "getSosHistory-IoAF18A", "(Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "triggerSOS", "latitude", "", "longitude", "message", "", "triggerSOS-BWLJW6A", "(Ljava/lang/Double;Ljava/lang/Double;Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_debug"})
public final class SosRepository {
    @org.jetbrains.annotations.NotNull
    private final com.lifora.data.local.LiforaDatabase db = null;
    @org.jetbrains.annotations.NotNull
    private final com.lifora.data.local.dao.SosDao sosDao = null;
    
    public SosRepository(@org.jetbrains.annotations.NotNull
    android.content.Context context) {
        super();
    }
}