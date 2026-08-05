package com.lifora.ui;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00000\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0010\u000e\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u0002\n\u0000\u0018\u00002\u00020\u0001B\u0015\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u00a2\u0006\u0002\u0010\u0006J\u0006\u0010\u000e\u001a\u00020\u000fR\u0014\u0010\u0007\u001a\b\u0012\u0004\u0012\u00020\t0\bX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0017\u0010\n\u001a\b\u0012\u0004\u0012\u00020\t0\u000b\u00a2\u0006\b\n\u0000\u001a\u0004\b\f\u0010\rR\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0010"}, d2 = {"Lcom/lifora/ui/MainViewModel;", "Landroidx/lifecycle/ViewModel;", "locationRepository", "Lcom/lifora/repositories/LocationRepository;", "translationRepository", "Lcom/lifora/repositories/TranslationRepository;", "(Lcom/lifora/repositories/LocationRepository;Lcom/lifora/repositories/TranslationRepository;)V", "_locationState", "Lkotlinx/coroutines/flow/MutableStateFlow;", "", "locationState", "Lkotlinx/coroutines/flow/StateFlow;", "getLocationState", "()Lkotlinx/coroutines/flow/StateFlow;", "updateLocation", "", "app_debug"})
public final class MainViewModel extends androidx.lifecycle.ViewModel {
    @org.jetbrains.annotations.NotNull
    private final com.lifora.repositories.LocationRepository locationRepository = null;
    @org.jetbrains.annotations.NotNull
    private final com.lifora.repositories.TranslationRepository translationRepository = null;
    @org.jetbrains.annotations.NotNull
    private final kotlinx.coroutines.flow.MutableStateFlow<java.lang.String> _locationState = null;
    @org.jetbrains.annotations.NotNull
    private final kotlinx.coroutines.flow.StateFlow<java.lang.String> locationState = null;
    
    public MainViewModel(@org.jetbrains.annotations.NotNull
    com.lifora.repositories.LocationRepository locationRepository, @org.jetbrains.annotations.NotNull
    com.lifora.repositories.TranslationRepository translationRepository) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull
    public final kotlinx.coroutines.flow.StateFlow<java.lang.String> getLocationState() {
        return null;
    }
    
    public final void updateLocation() {
    }
}