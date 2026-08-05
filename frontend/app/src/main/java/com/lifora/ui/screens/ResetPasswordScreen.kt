package com.lifora.ui.screens

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.navigation.NavHostController
import com.lifora.ui.Screen

@Composable
fun ResetPasswordScreen(
    navController: NavHostController,
    phoneNumber: String = "",
    countryCode: String = "+91"
) {
    LaunchedEffect(Unit) {
        navController.navigate(Screen.PhoneLogin.route) { popUpTo(0) }
    }
}
