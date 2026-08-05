package com.lifora.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AlertHistoryScreen(navController: NavHostController) {
    val alerts = listOf(
        AlertItem("SOS to Police", "May 20, 2024 10:30 AM", "Location shared successfully", Icons.Default.Shield),
        AlertItem("SOS to Ambulance", "May 18, 2024 07:15 PM", "Emergency medical call", Icons.Default.MedicalServices),
        AlertItem("SOS to Fire & Rescue", "May 15, 2024 12:00 PM", "Fire emergency reported", Icons.Default.FireExtinguisher),
        AlertItem("SOS to Police", "May 10, 2024 08:20 PM", "Silent alert sent", Icons.Default.Shield)
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Alert History", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = null, tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Black)
            )
        },
        containerColor = Color.Black
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            LazyColumn(modifier = Modifier.weight(1f)) {
                items(alerts) { alert ->
                    AlertCard(alert)
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = { },
                modifier = Modifier.fillMaxWidth().height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color.Red),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("View All History")
            }
        }
    }
}

data class AlertItem(val title: String, val date: String, val detail: String, val icon: ImageVector)

@Composable
fun AlertCard(alert: AlertItem) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E1E)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(modifier = Modifier.size(40.dp).background(Color(0xFF2C2C2C), CircleShape), contentAlignment = Alignment.Center) {
                Icon(alert.icon, contentDescription = null, tint = Color.Red, modifier = Modifier.size(20.dp))
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(text = alert.date, fontSize = 11.sp, color = Color.Gray)
                Text(text = alert.title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text(text = alert.detail, fontSize = 13.sp, color = Color.Gray)
            }
            Spacer(modifier = Modifier.weight(1f))
            Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Color.DarkGray)
        }
    }
}
