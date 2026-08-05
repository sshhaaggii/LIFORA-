package com.lifora.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.People
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.lifora.ui.Screen
import com.lifora.utils.SessionManager

private val BgColor = Color(0xFF0D0D0D)
private val CardColor = Color(0xFF1A1A1A)
private val RedPrimary = Color(0xFFD32F2F)
private val TextWhite = Color(0xFFFFFFFF)
private val TextGray = Color(0xFFB0B0B0)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminDashboardScreen(navController: NavHostController) {
    val context = LocalContext.current
    val sessionManager = remember { SessionManager(context) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Admin Dashboard", color = TextWhite, fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = {
                        sessionManager.clearSession()
                        navController.navigate(Screen.PhoneLogin.route) { popUpTo(0) }
                    }) {
                        Icon(Icons.Default.Logout, contentDescription = "Logout", tint = RedPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BgColor)
            )
        },
        containerColor = BgColor
    ) { padding ->
        Column(
            modifier = Modifier.padding(padding).fillMaxSize().padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Card(
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = CardColor),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.AdminPanelSettings, contentDescription = null, tint = RedPrimary, modifier = Modifier.size(48.dp))
                    Spacer(modifier = Modifier.width(16.dp))
                    Column {
                        Text(text = sessionManager.getFullName(), fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextWhite)
                        Text(text = "Phone: ${sessionManager.getPhoneNumberNormalized()}", fontSize = 14.sp, color = TextGray)
                        Text(text = "Role: ADMIN", fontSize = 12.sp, color = RedPrimary, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = { navController.navigate(Screen.Home.route) },
                modifier = Modifier.fillMaxWidth().height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = RedPrimary),
                shape = RoundedCornerShape(8.dp)
            ) {
                Icon(Icons.Default.People, contentDescription = null, tint = TextWhite)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Open System Dashboard", color = TextWhite, fontWeight = FontWeight.Bold)
            }
        }
    }
}
