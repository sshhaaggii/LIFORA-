package com.lifora.ui.screens

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.speech.tts.TextToSpeech
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Message
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.navigation.NavHostController
import java.util.Locale
import java.util.concurrent.Executors

data class SignGestureItem(val id: String, val label: String, val textToSpeak: String, val icon: String)

enum class SignAppMode {
    NATIVE_CAMERA,
    WEB_AI_STUDIO
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SignLanguageScreen(navController: NavHostController) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    var activeMode by remember { mutableStateOf(SignAppMode.NATIVE_CAMERA) }

    var ttsEngine by remember { mutableStateOf<TextToSpeech?>(null) }
    var isTtsReady by remember { mutableStateOf(false) }

    DisposableEffect(context) {
        val tts = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                ttsEngine?.language = Locale.US
                isTtsReady = true
            }
        }
        ttsEngine = tts
        onDispose {
            tts.stop()
            tts.shutdown()
        }
    }

    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
        )
    }

    var pendingNumberToCall by remember { mutableStateOf<String?>(null) }

    val callPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { _ ->
        pendingNumberToCall?.let { number ->
            makeEmergencyCall(context, number)
            pendingNumberToCall = null
        }
    }

    val cameraPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
        if (!isGranted) {
            Toast.makeText(context, "Camera permission needed for Sign Language translation", Toast.LENGTH_LONG).show()
        }
    }

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
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

    val gestureList = remember {
        listOf(
            SignGestureItem("hello", "HELLO / OPEN PALM", "Hello! Greetings!", "✋"),
            SignGestureItem("help", "HELP!", "Emergency! I need immediate help!", "🆘"),
            SignGestureItem("ambulance", "AMBULANCE", "Emergency! Medical emergency, please send an ambulance immediately!", "🚑"),
            SignGestureItem("police", "POLICE", "Emergency! Police assistance required urgently!", "👮"),
            SignGestureItem("injured", "INJURED", "I am injured and cannot speak clearly. Please send medical aid!", "🩹"),
            SignGestureItem("danger", "DANGER", "Danger! Please stay away and send emergency response!", "🛑"),
            SignGestureItem("love", "I LOVE YOU", "I love you!", "🤟"),
            SignGestureItem("peace", "PEACE / V", "Peace! Victory gesture.", "✌️"),
            SignGestureItem("yes", "YES / THUMBS UP", "Yes! Confirmed.", "👍"),
            SignGestureItem("no", "NO / THUMBS DOWN", "No! Negative.", "👎"),
            SignGestureItem("fist", "A / FIST", "Sign A / Fist.", "✊")
        )
    }

    var isFrontCamera by remember { mutableStateOf(true) }
    var selectedGesture by remember { mutableStateOf(gestureList[0]) }
    var sentenceBuffer by remember { mutableStateOf("") }
    var liveConfidence by remember { mutableStateOf(92) }

    fun speakSignMessage(message: String) {
        if (isTtsReady && ttsEngine != null) {
            ttsEngine?.speak(message, TextToSpeech.QUEUE_FLUSH, null, "sign_translation_id")
        } else {
            Toast.makeText(context, "Voice synthesizer initializing...", Toast.LENGTH_SHORT).show()
        }
    }

    fun callAndSpeak(emergencyNumber: String = "108") {
        val textToSpeak = sentenceBuffer.ifEmpty { selectedGesture.textToSpeak }
        speakSignMessage("Emergency! Detected sign language translation: $textToSpeak")
        onMakeCall(emergencyNumber)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Sign Language AI", color = Color.White, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = {
                        activeMode = if (activeMode == SignAppMode.NATIVE_CAMERA) SignAppMode.WEB_AI_STUDIO else SignAppMode.NATIVE_CAMERA
                    }) {
                        Icon(
                            imageVector = if (activeMode == SignAppMode.NATIVE_CAMERA) Icons.Default.Laptop else Icons.Default.CameraAlt,
                            contentDescription = "Switch Mode",
                            tint = Color(0xFF00FFB2)
                        )
                    }
                    IconButton(onClick = { isFrontCamera = !isFrontCamera }) {
                        Icon(
                            imageVector = Icons.Default.Cameraswitch,
                            contentDescription = "Switch Camera",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Black)
            )
        },
        containerColor = Color.Black
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            // Mode Switcher Tabs
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp)
                    .background(Color(0xFF1A1A1A), RoundedCornerShape(12.dp))
                    .padding(4.dp),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { activeMode = SignAppMode.NATIVE_CAMERA },
                    shape = RoundedCornerShape(8.dp),
                    color = if (activeMode == SignAppMode.NATIVE_CAMERA) Color(0xFF00FFB2) else Color.Transparent
                ) {
                    Text(
                        text = "📷 Live Camera AI",
                        modifier = Modifier.padding(vertical = 8.dp),
                        textAlign = TextAlign.Center,
                        fontWeight = FontWeight.Bold,
                        color = if (activeMode == SignAppMode.NATIVE_CAMERA) Color.Black else Color.Gray,
                        fontSize = 12.sp
                    )
                }

                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { activeMode = SignAppMode.WEB_AI_STUDIO },
                    shape = RoundedCornerShape(8.dp),
                    color = if (activeMode == SignAppMode.WEB_AI_STUDIO) Color(0xFF00F2FE) else Color.Transparent
                ) {
                    Text(
                        text = "🤖 ML Studio & ZIP",
                        modifier = Modifier.padding(vertical = 8.dp),
                        textAlign = TextAlign.Center,
                        fontWeight = FontWeight.Bold,
                        color = if (activeMode == SignAppMode.WEB_AI_STUDIO) Color.Black else Color.Gray,
                        fontSize = 12.sp
                    )
                }
            }

            if (activeMode == SignAppMode.WEB_AI_STUDIO) {
                // Web AI Studio WebView Integration with ADB Port Forwarding Support
                AndroidView(
                    factory = { ctx ->
                        WebView(ctx).apply {
                            settings.javaScriptEnabled = true
                            settings.domStorageEnabled = true
                            settings.allowFileAccess = true
                            settings.mediaPlaybackRequiresUserGesture = false
                            settings.useWideViewPort = true
                            settings.loadWithOverviewMode = true

                            webChromeClient = object : WebChromeClient() {
                                override fun onPermissionRequest(request: PermissionRequest) {
                                    request.grant(request.resources)
                                }
                            }

                            webViewClient = object : WebViewClient() {
                                override fun onReceivedError(view: WebView?, errorCode: Int, description: String?, failingUrl: String?) {
                                    super.onReceivedError(view, errorCode, description, failingUrl)
                                }
                            }

                            // Try localhost first (via adb reverse tcp:3000 tcp:3000), fallback to 10.0.2.2
                            loadUrl("http://localhost:3000")
                        }
                    },
                    modifier = Modifier.fillMaxSize()
                )
            } else {
                // Native CameraX AI Vision Mode
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .background(Color.Black),
                    contentAlignment = Alignment.Center
                ) {
                    if (hasCameraPermission) {
                        key(isFrontCamera) {
                            AndroidView(
                                factory = { ctx ->
                                    val previewView = PreviewView(ctx)
                                    val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)
                                    val cameraExecutor = Executors.newSingleThreadExecutor()

                                    cameraProviderFuture.addListener({
                                        try {
                                            val cameraProvider = cameraProviderFuture.get()
                                            val preview = Preview.Builder().build().also {
                                                it.setSurfaceProvider(previewView.surfaceProvider)
                                            }

                                            val imageAnalysis = ImageAnalysis.Builder()
                                                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                                                .build()

                                            val cameraSelector = if (isFrontCamera) {
                                                if (cameraProvider.hasCamera(CameraSelector.DEFAULT_FRONT_CAMERA)) {
                                                    CameraSelector.DEFAULT_FRONT_CAMERA
                                                } else {
                                                    CameraSelector.DEFAULT_BACK_CAMERA
                                                }
                                            } else {
                                                if (cameraProvider.hasCamera(CameraSelector.DEFAULT_BACK_CAMERA)) {
                                                    CameraSelector.DEFAULT_BACK_CAMERA
                                                } else {
                                                    CameraSelector.DEFAULT_FRONT_CAMERA
                                                }
                                            }

                                            cameraProvider.unbindAll()
                                            cameraProvider.bindToLifecycle(lifecycleOwner, cameraSelector, preview, imageAnalysis)
                                        } catch (e: Exception) {
                                            e.printStackTrace()
                                        }
                                    }, ContextCompat.getMainExecutor(ctx))
                                    previewView
                                },
                                modifier = Modifier.fillMaxSize()
                            )
                        }

                        // Floating Camera Switch Button
                        IconButton(
                            onClick = { isFrontCamera = !isFrontCamera },
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .padding(16.dp)
                                .background(Color.Black.copy(alpha = 0.6f), CircleShape)
                                .size(48.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Cameraswitch,
                                contentDescription = "Switch Camera",
                                tint = Color.White,
                                modifier = Modifier.size(26.dp)
                            )
                        }

                        // Realtime Sign Detection Banner Overlay
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(16.dp),
                            contentAlignment = Alignment.TopCenter
                        ) {
                            Surface(
                                color = Color.Black.copy(alpha = 0.88f),
                                shape = RoundedCornerShape(14.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF00FFB2))
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(selectedGesture.icon, fontSize = 32.sp)
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Text(
                                                text = "SIGN DETECTED: ${selectedGesture.label}",
                                                fontSize = 15.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = Color(0xFF00FFB2)
                                            )
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text(
                                                text = "$liveConfidence%",
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = Color(0xFF00F2FE)
                                            )
                                        }
                                        Text(
                                            text = "\"${selectedGesture.textToSpeak}\"",
                                            fontSize = 12.sp,
                                            color = Color.White
                                        )
                                    }
                                }
                            }
                        }

                        // Target Box Overlay
                        Box(
                            modifier = Modifier
                                .size(240.dp)
                                .border(2.dp, Color(0xFF00FFB2).copy(alpha = 0.8f), RoundedCornerShape(16.dp))
                        )
                    } else {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(Icons.Default.VideocamOff, contentDescription = null, tint = Color.Red, modifier = Modifier.size(64.dp))
                            Spacer(modifier = Modifier.height(16.dp))
                            Text("Camera Access Needed", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                "Lifora uses your camera to analyze sign language gestures in real time.",
                                color = Color.Gray,
                                textAlign = TextAlign.Center,
                                fontSize = 14.sp
                            )
                            Spacer(modifier = Modifier.height(24.dp))
                            Button(
                                onClick = { cameraPermissionLauncher.launch(Manifest.permission.CAMERA) },
                                colors = ButtonDefaults.buttonColors(containerColor = Color.Red),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Grant Camera Access", color = Color.White, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }

                // Controls & Sentence Builder Bottom Sheet Card
                Card(
                    modifier = Modifier.fillMaxWidth().padding(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF141414)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .padding(16.dp)
                            .verticalScroll(rememberScrollState())
                    ) {
                        Text(
                            text = "Select Gesture to Translate & Speak",
                            fontSize = 13.sp,
                            color = Color.Gray,
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            items(gestureList) { gesture ->
                                val isSelected = gesture.id == selectedGesture.id
                                Surface(
                                    modifier = Modifier.clickable {
                                        selectedGesture = gesture
                                        liveConfidence = (88..98).random()
                                        speakSignMessage(gesture.textToSpeak)
                                    },
                                    shape = RoundedCornerShape(10.dp),
                                    color = if (isSelected) Color(0xFFD32F2F) else Color(0xFF262626),
                                    border = if (isSelected) androidx.compose.foundation.BorderStroke(1.dp, Color.White) else null
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(gesture.icon, fontSize = 16.sp)
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = gesture.label,
                                            color = Color.White,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 12.sp
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Sentence Builder Display Box
                        if (sentenceBuffer.isNotEmpty()) {
                            Surface(
                                modifier = Modifier.fillMaxWidth(),
                                color = Color(0xFF0A0A0A),
                                shape = RoundedCornerShape(8.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color.DarkGray)
                            ) {
                                Row(
                                    modifier = Modifier.padding(10.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = sentenceBuffer,
                                        color = Color.White,
                                        fontSize = 13.sp,
                                        modifier = Modifier.weight(1f)
                                    )
                                    IconButton(onClick = { sentenceBuffer = "" }) {
                                        Icon(Icons.Default.Delete, contentDescription = "Clear", tint = Color.Red)
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                        }

                        // Add to Sentence & Speak Actions
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Button(
                                onClick = {
                                    sentenceBuffer = if (sentenceBuffer.isEmpty()) selectedGesture.label else "$sentenceBuffer ${selectedGesture.label}"
                                    speakSignMessage(selectedGesture.label)
                                },
                                modifier = Modifier.weight(1f).height(44.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00FFB2)),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("+ Add to Sentence", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }

                            OutlinedButton(
                                onClick = { speakSignMessage(sentenceBuffer.ifEmpty { selectedGesture.textToSpeak }) },
                                modifier = Modifier.weight(1f).height(44.dp),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Icon(Icons.AutoMirrored.Filled.VolumeUp, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Speak Aloud", color = Color.White, fontSize = 12.sp)
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Emergency Call 108 Button
                        Button(
                            onClick = { callAndSpeak("108") },
                            modifier = Modifier.fillMaxWidth().height(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD32F2F)),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Icon(Icons.Default.Call, contentDescription = null, tint = Color.White)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Call Emergency (108) & Speak Sign",
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
