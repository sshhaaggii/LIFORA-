package com.lifora.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lifora.repositories.LocationRepository
import com.lifora.repositories.TranslationRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MainViewModel(
    private val locationRepository: LocationRepository,
    private val translationRepository: TranslationRepository
) : ViewModel() {

    private val _locationState = MutableStateFlow<String>("Unknown")
    val locationState = _locationState.asStateFlow()

    fun updateLocation() {
        viewModelScope.launch {
            val loc = locationRepository.getCurrentLocation()
            if (loc != null) {
                _locationState.value = "${loc.latitude}, ${loc.longitude}"
            } else {
                _locationState.value = "Unable to get location"
            }
        }
    }
}
