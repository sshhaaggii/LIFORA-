package com.lifora.ui.screens

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Sms
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.lifora.repositories.AuthRepository
import com.lifora.ui.Screen
import com.lifora.utils.PhoneUtils
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private val BgColor = Color(0xFF0D0D0D)
private val CardColor = Color(0xFF1A1A1A)
private val RedPrimary = Color(0xFFD32F2F)
private val TextWhite = Color(0xFFFFFFFF)
private val TextGray = Color(0xFFB0B0B0)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OtpVerificationScreen(
    navController: NavHostController,
    phoneNumber: String,
    purpose: String = "LOGIN",
    countryCode: String = "+91",
    fullName: String = ""
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val authRepository = remember { AuthRepository(context) }

    var otpCode by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }

    var resendCooldownSeconds by remember { mutableIntStateOf(30) }
    var expirySeconds by remember { mutableIntStateOf(300) }

    val maskedPhone = remember(countryCode, phoneNumber) {
        PhoneUtils.maskPhoneNumber(countryCode, phoneNumber)
    }

    LaunchedEffect(Unit) {
        while (expirySeconds > 0) {
            delay(1000)
            expirySeconds--
            if (resendCooldownSeconds > 0) {
                resendCooldownSeconds--
            }
        }
    }

    fun handleVerify() {
        if (otpCode.trim().length != 6) {
            Toast.makeText(context, "Please enter a 6-digit OTP code", Toast.LENGTH_SHORT).show()
            return
        }

        isLoading = true
        scope.launch {
            val res = authRepository.verifyOtp(
                countryCode = countryCode,
                phoneNumber = phoneNumber,
                otp = otpCode,
                fullName = fullName,
                purpose = purpose
            )
            isLoading = false

            if (res.error == null && res.user != null) {
                Toast.makeText(context, "Authentication Successful!", Toast.LENGTH_SHORT).show()
                when (res.user.role.uppercase()) {
                    "DOCTOR" -> navController.navigate(Screen.DoctorDashboard.route) { popUpTo(0) }
                    "ADMIN" -> navController.navigate(Screen.AdminDashboard.route) { popUpTo(0) }
                    "EMERGENCY_OPERATOR" -> navController.navigate(Screen.EmergencyServices.route) { popUpTo(0) }
                    else -> navController.navigate(Screen.Home.route) { popUpTo(0) }
                }
            } else if (res.error == null) {
                Toast.makeText(context, "Authentication Successful!", Toast.LENGTH_SHORT).show()
                navController.navigate(Screen.Home.route) { popUpTo(0) }
            } else {
                Toast.makeText(context, res.error, Toast.LENGTH_LONG).show()
            }
        }
    }

    fun handleResend() {
        if (resendCooldownSeconds > 0) return
        isLoading = true
        scope.launch {
            val res = authRepository.resendOtp(countryCode, phoneNumber, purpose)
            isLoading = false
            if (res.error == null) {
                Toast.makeText(context, res.message, Toast.LENGTH_LONG).show()
                resendCooldownSeconds = 30
                expirySeconds = 300
            } else {
                Toast.makeText(context, res.error, Toast.LENGTH_LONG).show()
            }
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(BgColor)) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { navController.popBackStack() }) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = TextWhite)
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text("Phone Verification", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = TextWhite)
            }

            Spacer(modifier = Modifier.height(30.dp))

            Icon(Icons.Default.Sms, contentDescription = null, tint = RedPrimary, modifier = Modifier.size(64.dp))
            Spacer(modifier = Modifier.height(16.dp))

            Text("Enter 6-Digit Verification Code", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TextWhite)
            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "We have sent an OTP code to your mobile phone number:\n$maskedPhone",
                color = TextGray,
                fontSize = 14.sp,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(24.dp))

            OutlinedTextField(
                value = otpCode,
                onValueChange = { if (it.length <= 6) otpCode = it },
                label = { Text("6-Digit OTP", color = TextGray) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = TextWhite,
                    unfocusedTextColor = TextWhite,
                    focusedBorderColor = RedPrimary,
                    unfocusedBorderColor = Color.DarkGray,
                    focusedContainerColor = CardColor,
                    unfocusedContainerColor = CardColor
                ),
                modifier = Modifier.fillMaxWidth().height(60.dp)
            )

            Spacer(modifier = Modifier.height(12.dp))

            val minutes = expirySeconds / 60
            val seconds = expirySeconds % 60
            Text(
                text = "OTP Expires in: %02d:%02d".format(minutes, seconds),
                color = if (expirySeconds < 60) RedPrimary else TextGray,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium
            )

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = { handleVerify() },
                enabled = !isLoading && expirySeconds > 0,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                colors = ButtonDefaults.buttonColors(containerColor = RedPrimary),
                shape = RoundedCornerShape(8.dp)
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = TextWhite, modifier = Modifier.size(24.dp))
                } else {
                    Text("Verify & Continue", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextWhite)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            TextButton(
                onClick = { handleResend() },
                enabled = resendCooldownSeconds == 0
            ) {
                Text(
                    text = if (resendCooldownSeconds > 0) "Resend OTP in (${resendCooldownSeconds}s)" else "Resend OTP",
                    color = if (resendCooldownSeconds == 0) RedPrimary else TextGray,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }

            Spacer(modifier = Modifier.weight(1f))

            TextButton(onClick = { navController.popBackStack() }) {
                Text("Change Phone Number", color = TextGray, fontSize = 14.sp)
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
