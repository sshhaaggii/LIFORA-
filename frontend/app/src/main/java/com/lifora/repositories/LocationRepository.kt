package com.lifora.repositories

import android.annotation.SuppressLint
import android.content.Context
import android.location.Geocoder
import android.location.Location
import android.location.LocationManager
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import java.util.Locale
import kotlin.coroutines.resume

class LocationRepository(private val context: Context) {
    private val fusedLocationClient: FusedLocationProviderClient =
        LocationServices.getFusedLocationProviderClient(context)
    private val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager

    fun isGpsEnabled(): Boolean {
        return try {
            locationManager?.isProviderEnabled(LocationManager.GPS_PROVIDER) == true ||
                    locationManager?.isProviderEnabled(LocationManager.NETWORK_PROVIDER) == true
        } catch (e: Exception) {
            false
        }
    }

    @SuppressLint("MissingPermission")
    suspend fun getCurrentLocation(): Location? {
        return try {
            val freshLocation = getFreshLocation()
            if (freshLocation != null) return freshLocation

            val lastLocation = getLastKnownLocation()
            if (lastLocation != null) return lastLocation

            getLocationManagerFallback()
        } catch (e: Exception) {
            null
        }
    }

    @SuppressLint("MissingPermission")
    private suspend fun getFreshLocation(): Location? = suspendCancellableCoroutine { continuation ->
        try {
            val cancellationTokenSource = CancellationTokenSource()
            fusedLocationClient.getCurrentLocation(
                Priority.PRIORITY_HIGH_ACCURACY,
                cancellationTokenSource.token
            ).addOnSuccessListener { location ->
                if (continuation.isActive) continuation.resume(location)
            }.addOnFailureListener {
                if (continuation.isActive) continuation.resume(null)
            }
        } catch (e: Exception) {
            if (continuation.isActive) continuation.resume(null)
        }
    }

    @SuppressLint("MissingPermission")
    private suspend fun getLastKnownLocation(): Location? = suspendCancellableCoroutine { continuation ->
        try {
            fusedLocationClient.lastLocation
                .addOnSuccessListener { location ->
                    if (continuation.isActive) continuation.resume(location)
                }
                .addOnFailureListener {
                    if (continuation.isActive) continuation.resume(null)
                }
        } catch (e: Exception) {
            if (continuation.isActive) continuation.resume(null)
        }
    }

    @SuppressLint("MissingPermission")
    private fun getLocationManagerFallback(): Location? {
        return try {
            val gpsLoc = locationManager?.getLastKnownLocation(LocationManager.GPS_PROVIDER)
            val netLoc = locationManager?.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
            val passiveLoc = locationManager?.getLastKnownLocation(LocationManager.PASSIVE_PROVIDER)

            listOfNotNull(gpsLoc, netLoc, passiveLoc).maxByOrNull { it.time }
        } catch (e: Exception) {
            null
        }
    }

    suspend fun getAddressFromLocation(latitude: Double, longitude: Double): String = withContext(Dispatchers.IO) {
        try {
            val geocoder = Geocoder(context, Locale.getDefault())
            @Suppress("DEPRECATION")
            val addresses = geocoder.getFromLocation(latitude, longitude, 1)
            if (!addresses.isNullOrEmpty()) {
                val address = addresses[0]
                val sb = StringBuilder()
                val maxAddressLine = address.maxAddressLineIndex
                if (maxAddressLine >= 0) {
                    for (i in 0..maxAddressLine) {
                        sb.append(address.getAddressLine(i)).append(" ")
                    }
                    sb.toString().trim()
                } else {
                    listOfNotNull(
                        address.thoroughfare,
                        address.subLocality,
                        address.locality,
                        address.adminArea,
                        address.postalCode,
                        address.countryName
                    ).joinToString(", ")
                }
            } else {
                "Lat: %.5f, Lng: %.5f".format(latitude, longitude)
            }
        } catch (e: Exception) {
            "Lat: %.5f, Lng: %.5f".format(latitude, longitude)
        }
    }
}
