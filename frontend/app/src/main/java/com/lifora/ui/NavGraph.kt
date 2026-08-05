package com.lifora.ui

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.lifora.ui.screens.*

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Onboarding : Screen("onboarding")
    object UserSetup : Screen("user_setup")
    object PhoneLogin : Screen("email_login")
    object PhoneRegister : Screen("email_register")
    object Home : Screen("home")
    object EmergencyServices : Screen("emergency_services")
    object TranslationAssistant : Screen("translation_assistant")
    object LiveLocation : Screen("live_location")
    object AIAssistant : Screen("ai_assistant")
    object SignLanguage : Screen("sign_language")
    object AlertHistory : Screen("alert_history")
    object Profile : Screen("profile")
    object SOS : Screen("sos")
    object EmergencyContacts : Screen("emergency_contacts")
    object DoctorDashboard : Screen("doctor_dashboard")
    object AdminDashboard : Screen("admin_dashboard")
}

@Composable
fun SetupNavGraph(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route
    ) {
        composable(Screen.Splash.route) { SplashScreen(navController) }
        composable(Screen.Onboarding.route) { OnboardingScreen(navController) }
        composable(Screen.UserSetup.route) { UserSetupScreen(navController) }
        composable("email_login") { EmailLoginScreen(navController) }
        composable("email_register") { EmailRegisterScreen(navController) }

        composable(Screen.Home.route) { HomeScreen(navController) }
        composable(Screen.EmergencyServices.route) { EmergencyServicesScreen(navController) }
        composable(Screen.TranslationAssistant.route) { TranslationAssistantScreen(navController) }
        composable(Screen.LiveLocation.route) { LiveLocationScreen(navController) }
        composable(Screen.AIAssistant.route) { AIAssistantScreen(navController) }
        composable(Screen.SignLanguage.route) { SignLanguageScreen(navController) }
        composable(Screen.AlertHistory.route) { AlertHistoryScreen(navController) }
        composable(Screen.Profile.route) { ProfileScreen(navController) }
        composable(Screen.SOS.route) { SOSScreen(navController) }
        composable(Screen.EmergencyContacts.route) { EmergencyContactsScreen(navController) }
        composable(Screen.DoctorDashboard.route) { DoctorDashboardScreen(navController) }
        composable(Screen.AdminDashboard.route) { AdminDashboardScreen(navController) }
    }
}
