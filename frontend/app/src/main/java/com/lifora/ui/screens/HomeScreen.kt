package com.lifora.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.lifora.ui.Screen

@Composable
fun HomeScreen(navController: NavHostController) {
    Scaffold(
        bottomBar = { BottomNavigationBar(navController) },
        containerColor = Color.Black
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color.Black),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "Lifora", color = Color.Red, fontSize = 24.sp, fontWeight = FontWeight.Bold)
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // SOS Button
            Box(
                modifier = Modifier
                    .size(130.dp)
                    .clip(CircleShape)
                    .background(Color.Red)
                    .clickable { navController.navigate(Screen.SOS.route) }
                    .border(4.dp, Color.Red.copy(alpha = 0.3f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(
                        modifier = Modifier.size(50.dp).background(Color.White.copy(alpha = 0.2f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "SOS", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Tap for Help",
                        color = Color.White,
                        fontSize = 10.sp,
                        textAlign = TextAlign.Center
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Quick Access Cards
            val menuItems = listOf(
                MenuItem("Emergency Service", Icons.Default.LocalPolice, Screen.EmergencyServices.route, Color(0xFF42A5F5)),
                MenuItem("Emergency Call", Icons.Default.Call, Screen.EmergencyContacts.route, Color(0xFF66BB6A)),
                MenuItem("AI Assistant", Icons.Default.SmartToy, Screen.AIAssistant.route, Color(0xFFAB47BC)),
                MenuItem("Sign Language", Icons.Default.BackHand, Screen.SignLanguage.route, Color(0xFFEC407A))
            )

            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                contentPadding = PaddingValues(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(menuItems) { item ->
                    MenuCard(item) {
                        navController.navigate(item.route)
                    }
                }
            }
        }
    }
}

data class MenuItem(val title: String, val icon: ImageVector, val route: String, val color: Color)

@Composable
fun MenuCard(item: MenuItem, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(100.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1E1E))
    ) {
        Column(
            modifier = Modifier.fillMaxSize().padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(imageVector = item.icon, contentDescription = null, tint = item.color, modifier = Modifier.size(28.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = item.title, fontSize = 10.sp, fontWeight = FontWeight.Medium, textAlign = TextAlign.Center, color = Color.White)
        }
    }
}

@Composable
fun BottomNavigationBar(navController: NavHostController) {
    NavigationBar(containerColor = Color(0xFF121212), tonalElevation = 0.dp) {
        NavigationBarItem(
            icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
            label = { Text("Home") },
            selected = true,
            onClick = { navController.navigate(Screen.Home.route) },
            colors = NavigationBarItemDefaults.colors(selectedIconColor = Color.Red, unselectedIconColor = Color.Gray, indicatorColor = Color.Transparent)
        )
        NavigationBarItem(
            icon = { Icon(Icons.Default.MedicalServices, contentDescription = "Emergency") },
            label = { Text("Emergency") },
            selected = false,
            onClick = { navController.navigate(Screen.EmergencyServices.route) },
            colors = NavigationBarItemDefaults.colors(selectedIconColor = Color.Red, unselectedIconColor = Color.Gray, indicatorColor = Color.Transparent)
        )
        NavigationBarItem(
            icon = { Icon(Icons.Default.SmartToy, contentDescription = "AI") },
            label = { Text("AI") },
            selected = false,
            onClick = { navController.navigate(Screen.AIAssistant.route) },
            colors = NavigationBarItemDefaults.colors(selectedIconColor = Color.Red, unselectedIconColor = Color.Gray, indicatorColor = Color.Transparent)
        )
        NavigationBarItem(
            icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
            label = { Text("Profile") },
            selected = false,
            onClick = { navController.navigate(Screen.Profile.route) },
            colors = NavigationBarItemDefaults.colors(selectedIconColor = Color.Red, unselectedIconColor = Color.Gray, indicatorColor = Color.Transparent)
        )
    }
}
