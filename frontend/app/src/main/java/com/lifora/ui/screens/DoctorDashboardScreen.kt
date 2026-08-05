package com.lifora.ui.screens

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.MedicalServices
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
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

data class DoctorEmergencyRequest(
    val id: String,
    val patientName: String,
    val emergencyType: String,
    val location: String,
    val distance: String,
    val timeAgo: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DoctorDashboardScreen(navController: NavHostController) {
    val context = LocalContext.current
    val sessionManager = remember { SessionManager(context) }

    val emergencyQueue = remember {
        mutableStateListOf(
            DoctorEmergencyRequest("SOS-8091", "Priya Sharma", "Severe Chest Pain & Dizziness", "Anna Nagar, Chennai", "1.2 km away", "2 mins ago"),
            DoctorEmergencyRequest("SOS-8092", "Ramesh Kumar", "Accident Injury - Deep Cut", "T. Nagar, Chennai", "3.4 km away", "5 mins ago"),
            DoctorEmergencyRequest("SOS-8093", "Anitha Raj", "Asthma Breathing Attack", "Velachery, Chennai", "4.8 km away", "8 mins ago")
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Doctor Dashboard", color = TextWhite, fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = {
                        sessionManager.clearSession()
                        navController.navigate(Screen.PhoneLogin.route) { popUpTo(0) }
                    }) {
                        Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = "Logout", tint = RedPrimary)
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
                    Icon(Icons.Default.MedicalServices, contentDescription = null, tint = RedPrimary, modifier = Modifier.size(48.dp))
                    Spacer(modifier = Modifier.width(16.dp))
                    Column {
                        Text(text = "Dr. ${sessionManager.getFullName()}", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextWhite)
                        Text(text = "Email: ${sessionManager.getEmail()}", fontSize = 13.sp, color = TextGray)
                        Text(text = "Status: ON-CALL DOCTOR", fontSize = 12.sp, color = Color.Green, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text("Live Patient Emergency Queue", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TextWhite, modifier = Modifier.fillMaxWidth())

            Spacer(modifier = Modifier.height(10.dp))

            LazyColumn(modifier = Modifier.weight(1f)) {
                items(emergencyQueue) { req ->
                    Card(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
                        colors = CardDefaults.cardColors(containerColor = CardColor),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                                Icon(Icons.Default.Warning, contentDescription = null, tint = RedPrimary, modifier = Modifier.size(20.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(req.patientName, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TextWhite)
                                Spacer(modifier = Modifier.weight(1f))
                                Text(req.timeAgo, fontSize = 12.sp, color = TextGray)
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text("Emergency: ${req.emergencyType}", fontSize = 14.sp, color = Color.Yellow, fontWeight = FontWeight.Medium)
                            Text("Location: ${req.location} (${req.distance})", fontSize = 13.sp, color = TextGray)

                            Spacer(modifier = Modifier.height(12.dp))

                            Button(
                                onClick = {
                                    Toast.makeText(context, "Emergency ${req.id} Accepted! Connecting with ${req.patientName}...", Toast.LENGTH_LONG).show()
                                    emergencyQueue.remove(req)
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = RedPrimary),
                                modifier = Modifier.fillMaxWidth().height(42.dp),
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Icon(Icons.Default.Call, contentDescription = null, tint = TextWhite, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Accept Emergency & Connect", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextWhite)
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Button(
                onClick = { navController.navigate(Screen.EmergencyServices.route) },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = CardColor),
                border = androidx.compose.foundation.BorderStroke(1.dp, RedPrimary),
                shape = RoundedCornerShape(8.dp)
            ) {
                Icon(Icons.Default.LocalHospital, contentDescription = null, tint = RedPrimary)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Emergency Services Console", color = TextWhite, fontWeight = FontWeight.Bold)
            }
        }
    }
}
