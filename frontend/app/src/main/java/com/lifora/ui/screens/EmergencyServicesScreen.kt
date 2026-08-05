package com.lifora.ui.screens

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.navigation.NavHostController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmergencyServicesScreen(navController: NavHostController) {
    val context = LocalContext.current
    var pendingNumberToCall by remember { mutableStateOf<String?>(null) }
    var selectedTab by remember { mutableIntStateOf(0) }

    val callPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { _ ->
        pendingNumberToCall?.let { number ->
            makeEmergencyCall(context, number)
            pendingNumberToCall = null
        }
    }

    val onMakeCall: (String) -> Unit = { number ->
        val hasPermission = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.CALL_PHONE
        ) == PackageManager.PERMISSION_GRANTED

        if (hasPermission) {
            makeEmergencyCall(context, number)
        } else {
            pendingNumberToCall = number
            callPermissionLauncher.launch(Manifest.permission.CALL_PHONE)
        }
    }

    val services = listOf(
        EmergencyService("Police", "Emergency police service", Icons.Default.LocalPolice, "100"),
        EmergencyService("Ambulance", "Medical emergency", Icons.Default.MedicalServices, "108"),
        EmergencyService("Fire & Rescue", "Fire and rescue service", Icons.Default.FireExtinguisher, "101"),
        EmergencyService("Women Helpline", "Emergency assistance for women", Icons.Default.Female, "1091"),
        EmergencyService("Disaster Management", "Disaster support", Icons.Default.Warning, "1077")
    )

    val firstAidGuides = listOf(
        FirstAidItem("CPR (Cardiac Arrest)", "30 chest compressions at 100-120 bpm, followed by 2 rescue breaths. Repeat until help arrives.", Icons.Default.Favorite),
        FirstAidItem("Choking (Heimlich)", "Stand behind person, wrap arms around waist, make a fist above navel, give quick inward and upward thrusts.", Icons.Default.Accessibility),
        FirstAidItem("Severe Bleeding", "Apply firm, direct pressure with a clean cloth. Keep wound elevated above heart level.", Icons.Default.Bloodtype),
        FirstAidItem("Burns & Scalds", "Cool burn immediately with cold running water for at least 10-20 minutes. Cover loosely with sterile wrap.", Icons.Default.LocalFireDepartment),
        FirstAidItem("Snake Bite", "Keep victim calm and still. Immobilize bitten limb below heart level. DO NOT suck venom or apply tourniquet.", Icons.Default.Healing)
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Emergency Services & First-Aid", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Black)
            )
        },
        containerColor = Color.Black
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color.Black,
                contentColor = Color.Red
            ) {
                Tab(selected = selectedTab == 0, onClick = { selectedTab = 0 }) {
                    Text("Helpline Numbers", modifier = Modifier.padding(14.dp), fontWeight = FontWeight.Bold, color = if (selectedTab == 0) Color.Red else Color.Gray)
                }
                Tab(selected = selectedTab == 1, onClick = { selectedTab = 1 }) {
                    Text("First-Aid Guides", modifier = Modifier.padding(14.dp), fontWeight = FontWeight.Bold, color = if (selectedTab == 1) Color.Red else Color.Gray)
                }
            }

            if (selectedTab == 0) {
                LazyColumn(modifier = Modifier.padding(16.dp)) {
                    items(services) { service ->
                        ServiceCard(service = service, onCallClick = { onMakeCall(service.number) })
                    }
                }
            } else {
                LazyColumn(modifier = Modifier.padding(16.dp)) {
                    items(firstAidGuides) { item ->
                        FirstAidCard(item)
                    }
                }
            }
        }
    }
}

data class EmergencyService(val name: String, val description: String, val icon: ImageVector, val number: String)
data class FirstAidItem(val title: String, val steps: String, val icon: ImageVector)

@Composable
fun FirstAidCard(item: FirstAidItem) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E1E)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(item.icon, contentDescription = null, tint = Color.Red, modifier = Modifier.size(28.dp))
                Spacer(modifier = Modifier.width(12.dp))
                Text(item.title, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(item.steps, fontSize = 14.sp, color = Color(0xFFCCCCCC), lineHeight = 20.sp)
        }
    }
}

@Composable
fun ServiceCard(service: EmergencyService, onCallClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .clickable { onCallClick() },
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E1E))
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(imageVector = service.icon, contentDescription = null, tint = Color.Red, modifier = Modifier.size(40.dp))
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = service.name, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text(text = service.description, fontSize = 14.sp, color = Color.Gray)
            }
            Text(text = service.number, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Spacer(modifier = Modifier.width(8.dp))
            IconButton(onClick = { onCallClick() }) {
                Icon(Icons.Default.Call, contentDescription = "Call", tint = Color.Red)
            }
        }
    }
}

fun makeEmergencyCall(context: Context, rawPhoneNumber: String) {
    val cleanNumber = rawPhoneNumber.replace("\\s".toRegex(), "")
    val uri = Uri.parse("tel:$cleanNumber")

    val hasCallPermission = ContextCompat.checkSelfPermission(
        context,
        Manifest.permission.CALL_PHONE
    ) == PackageManager.PERMISSION_GRANTED

    if (hasCallPermission) {
        val callIntent = Intent(Intent.ACTION_CALL, uri).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        try {
            context.startActivity(callIntent)
            return
        } catch (e: Exception) {
            // Fallback
        }
    }

    val dialIntent = Intent(Intent.ACTION_DIAL, uri).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
    }
    try {
        context.startActivity(dialIntent)
    } catch (e: Exception) {
        Toast.makeText(context, "Unable to open phone app on this device", Toast.LENGTH_SHORT).show()
    }
}
