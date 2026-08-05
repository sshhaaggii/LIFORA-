package com.lifora.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.lifora.ui.Screen

@Composable
fun UserSetupScreen(navController: NavHostController) {
    var selectedLanguage by remember { mutableStateOf("English") }
    val languages = listOf("English", "Telugu (తెలుగు)", "Tamil (தமிழ்)", "Hindi (हिन्दी)", "Malayalam (മലയാളം)", "Kannada (ಕന്നഡ)", "Bengali (বাংলা)", "Marathi (मరాఠీ)")

    Column(
        modifier = Modifier.fillMaxSize().background(Color.Black).padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(40.dp))
        Text(text = "Choose Your", fontSize = 24.sp, color = Color.White)
        Text(text = "Primary Language", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Color.White)
        Text(text = "This helps us provide better assistance.", fontSize = 14.sp, color = Color.Gray)
        
        Spacer(modifier = Modifier.height(32.dp))
        
        LazyColumn(modifier = Modifier.weight(1f)) {
            items(languages) { language ->
                LanguageItem(
                    name = language,
                    isSelected = selectedLanguage == language,
                    onClick = { selectedLanguage = language }
                )
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        Button(
            onClick = { navController.navigate(Screen.Home.route) },
            modifier = Modifier.fillMaxWidth().height(50.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color.Red),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text("Continue", fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(20.dp))
    }
}

@Composable
fun LanguageItem(name: String, isSelected: Boolean, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp)
            .clickable { onClick() },
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(20.dp)
                .background(if (isSelected) Color.Red else Color.Transparent, shape = CircleShape)
                .border(2.dp, if (isSelected) Color.Red else Color.DarkGray, shape = CircleShape)
        )
        Spacer(modifier = Modifier.width(16.dp))
        Text(text = name, fontSize = 18.sp, color = if (isSelected) Color.White else Color.Gray)
    }
}
