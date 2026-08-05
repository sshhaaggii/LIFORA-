package com.lifora.ui.screens

import android.app.Activity
import android.content.Intent
import android.speech.RecognizerIntent
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController

data class ChatMessage(val text: String, val lang: String, val isUser: Boolean, val isTranslation: Boolean = false)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AIAssistantScreen(navController: NavHostController) {
    val context = LocalContext.current
    var text by remember { mutableStateOf("") }
    val messages = remember { mutableStateListOf(
        ChatMessage("Hello! I am Lifora AI Health Assistant. How can I assist you with your health or emergency guidance today?", "Lifora AI", false),
    ) }

    val speechLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val spokenText = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull()
            if (!spokenText.isNullOrBlank()) {
                text = spokenText
            }
        }
    }

    fun launchVoiceInput() {
        try {
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak your medical question or emergency symptoms...")
            }
            speechLauncher.launch(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "Speech recognition is not supported on this device.", Toast.LENGTH_SHORT).show()
        }
    }

    fun handleSend() {
        if (text.isNotBlank()) {
            val userMsg = text.trim()
            messages.add(ChatMessage(userMsg, "You", true))
            text = ""

            val response = when {
                userMsg.contains("headache", ignoreCase = true) || userMsg.contains("fever", ignoreCase = true) ->
                    "For fever and headache: Stay hydrated, rest, and consider over-the-counter paracetamol. If fever exceeds 102°F (38.9°C), seek medical attention."
                userMsg.contains("chest pain", ignoreCase = true) || userMsg.contains("heart", ignoreCase = true) ->
                    "⚠️ CRITICAL: Chest pain can indicate a cardiac emergency! Sit down, stay calm, and activate Lifora SOS immediately."
                userMsg.contains("cut", ignoreCase = true) || userMsg.contains("bleed", ignoreCase = true) ->
                    "Apply firm, direct pressure with a clean cloth. Elevate the wounded area above heart level if possible."
                else ->
                    "I have recorded your symptoms. Please ensure you stay in a safe location. If symptoms worsen, use our SOS button to alert emergency services."
            }

            messages.add(ChatMessage(response, "Lifora AI", false))
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Lifora AI Health Assistant", color = Color.White) },
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
            LazyColumn(
                modifier = Modifier.weight(1f).padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(messages) { message ->
                    AIChatBubble(message)
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp).background(Color(0xFF1E1E1E), RoundedCornerShape(24.dp)).padding(horizontal = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = { launchVoiceInput() }) {
                    Icon(Icons.Default.Mic, contentDescription = "Voice Input", tint = Color.Red)
                }

                TextField(
                    value = text,
                    onValueChange = { text = it },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("Ask medical question or speak...", color = Color.Gray) },
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color.Transparent,
                        unfocusedContainerColor = Color.Transparent,
                        disabledContainerColor = Color.Transparent,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                IconButton(onClick = { handleSend() }) {
                    Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Send", tint = Color.Red)
                }
            }
        }
    }
}

@Composable
fun AIChatBubble(message: ChatMessage) {
    val isUser = message.isUser
    val alignment = if (isUser) Alignment.CenterEnd else Alignment.CenterStart
    val bgColor = if (isUser) Color.Red else Color(0xFF1E1E1E)
    
    Box(modifier = Modifier.fillMaxWidth(), contentAlignment = alignment) {
        Column(horizontalAlignment = if (isUser) Alignment.End else Alignment.Start) {
            Text(text = message.lang, fontSize = 10.sp, color = Color.Gray, modifier = Modifier.padding(bottom = 4.dp))
            Card(
                shape = RoundedCornerShape(
                    topStart = 12.dp, topEnd = 12.dp,
                    bottomStart = if (isUser) 12.dp else 0.dp,
                    bottomEnd = if (isUser) 0.dp else 12.dp
                ),
                colors = CardDefaults.cardColors(containerColor = bgColor),
                modifier = Modifier.widthIn(max = 280.dp)
            ) {
                Text(text = message.text, fontSize = 15.sp, color = Color.White, modifier = Modifier.padding(12.dp))
            }
        }
    }
}
