package com.lifora.ui.screens

import android.net.Uri
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.lifora.ui.Screen
import com.lifora.utils.SessionManager
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(navController: NavHostController) {
    val context = LocalContext.current
    val alpha = remember { Animatable(0f) }

    LaunchedEffect(key1 = true) {
        alpha.animateTo(
            targetValue = 1f,
            animationSpec = tween(durationMillis = 1500)
        )
        delay(1500)

        val sessionManager = SessionManager(context)
        if (sessionManager.isLoggedIn()) {
            if (!sessionManager.isPhoneVerified()) {
                val encPhone = Uri.encode(sessionManager.getPhoneNumber())
                val encCc = Uri.encode(sessionManager.getCountryCode())
                navController.navigate("otp_verification/$encPhone/REGISTRATION/$encCc") {
                    popUpTo(Screen.Splash.route) { inclusive = true }
                }
            } else {
                when (sessionManager.getUserRole().uppercase()) {
                    "DOCTOR" -> navController.navigate(Screen.DoctorDashboard.route) { popUpTo(Screen.Splash.route) { inclusive = true } }
                    "ADMIN" -> navController.navigate(Screen.AdminDashboard.route) { popUpTo(Screen.Splash.route) { inclusive = true } }
                    "EMERGENCY_OPERATOR" -> navController.navigate(Screen.EmergencyServices.route) { popUpTo(Screen.Splash.route) { inclusive = true } }
                    else -> navController.navigate(Screen.Home.route) { popUpTo(Screen.Splash.route) { inclusive = true } }
                }
            }
        } else {
            navController.navigate(Screen.Onboarding.route) {
                popUpTo(Screen.Splash.route) { inclusive = true }
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    imageVector = Icons.Default.Shield,
                    contentDescription = null,
                    modifier = Modifier.size(120.dp).alpha(alpha.value),
                    tint = Color.Red
                )
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = null,
                    modifier = Modifier.size(40.dp).alpha(alpha.value),
                    tint = Color.White
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Lifora",
                fontSize = 42.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Red,
                modifier = Modifier.alpha(alpha.value)
            )
            Text(
                text = "When Every Second Matters",
                fontSize = 14.sp,
                color = Color.White.copy(alpha = 0.7f),
                modifier = Modifier.alpha(alpha.value)
            )

            Spacer(modifier = Modifier.height(100.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth(0.5f)
                    .height(2.dp)
                    .alpha(alpha.value)
                    .background(
                        Brush.horizontalGradient(
                            listOf(Color.Transparent, Color.Red, Color.Transparent)
                        )
                    )
            )
        }
    }
}
