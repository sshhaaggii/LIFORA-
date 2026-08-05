package com.lifora.ui.screens

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.navigation.NavHostController
import com.lifora.ui.Screen

@Composable
fun ForgotPasswordPhoneScreen(navController: NavHostController) {
    LaunchedEffect(Unit) {
        navController.navigate(Screen.PhoneLogin.route) { popUpTo(0) }
    }
}
