package com.lifora.ui.screens

import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.lifora.repositories.AuthRepository
import com.lifora.ui.Screen
import com.lifora.utils.PhoneUtils
import kotlinx.coroutines.launch

private val BgColor = Color(0xFF0D0D0D)
private val CardColor = Color(0xFF1A1A1A)
private val RedPrimary = Color(0xFFD32F2F)
private val TextWhite = Color(0xFFFFFFFF)
private val TextGray = Color(0xFFB0B0B0)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PhoneRegisterScreen(navController: NavHostController) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val authRepository = remember { AuthRepository(context) }

    var fullName by remember { mutableStateOf("") }
    var selectedCountryCode by remember { mutableStateOf("+91") }
    var phoneNumber by remember { mutableStateOf("") }
    var acceptTerms by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }

    val countryCodes = listOf("+91", "+1", "+44", "+61", "+971", "+81", "+49")

    fun handleRegister() {
        if (fullName.trim().isEmpty()) {
            Toast.makeText(context, "Please enter your Full Name", Toast.LENGTH_SHORT).show()
            return
        }

        val phoneErr = PhoneUtils.validatePhoneNumber(selectedCountryCode, phoneNumber)
        if (phoneErr != null) {
            Toast.makeText(context, phoneErr, Toast.LENGTH_LONG).show()
            return
        }

        if (!acceptTerms) {
            Toast.makeText(context, "Please accept Terms and Conditions", Toast.LENGTH_SHORT).show()
            return
        }

        isLoading = true
        scope.launch {
            val res = authRepository.sendOtp(
                countryCode = selectedCountryCode,
                phoneNumber = phoneNumber,
                fullName = fullName,
                purpose = "REGISTRATION"
            )
            isLoading = false

            if (res.error == null || res.maskedPhone != null) {
                Toast.makeText(context, "Verification code sent via SMS to ${res.maskedPhone ?: phoneNumber}", Toast.LENGTH_LONG).show()
                val encPhone = Uri.encode(phoneNumber)
                val encCc = Uri.encode(selectedCountryCode)
                val encName = Uri.encode(fullName)
                navController.navigate("otp_verification/$encPhone/REGISTRATION/$encCc?name=$encName")
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
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = { navController.popBackStack() }) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = TextWhite)
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text("Create Account", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = TextWhite)
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Full Name Input
            OutlinedTextField(
                value = fullName,
                onValueChange = { fullName = it },
                label = { Text("Full Name", color = TextGray) },
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = TextWhite,
                    unfocusedTextColor = TextWhite,
                    focusedBorderColor = RedPrimary,
                    unfocusedBorderColor = Color.DarkGray,
                    focusedContainerColor = CardColor,
                    unfocusedContainerColor = CardColor
                ),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Country Code + Phone Input Row
            Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                var expandedCc by remember { mutableStateOf(false) }

                Box {
                    Surface(
                        modifier = Modifier
                            .height(56.dp)
                            .clickable { expandedCc = true },
                        color = CardColor,
                        shape = RoundedCornerShape(8.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color.DarkGray)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(selectedCountryCode, color = TextWhite, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Icon(Icons.Default.ArrowDropDown, contentDescription = null, tint = TextGray)
                        }
                    }

                    DropdownMenu(
                        expanded = expandedCc,
                        onDismissRequest = { expandedCc = false },
                        modifier = Modifier.background(CardColor)
                    ) {
                        countryCodes.forEach { code ->
                            DropdownMenuItem(
                                text = { Text(code, color = TextWhite) },
                                onClick = {
                                    selectedCountryCode = code
                                    expandedCc = false
                                }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.width(8.dp))

                OutlinedTextField(
                    value = phoneNumber,
                    onValueChange = { phoneNumber = it },
                    label = { Text("Mobile Phone Number", color = TextGray) },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextWhite,
                        unfocusedTextColor = TextWhite,
                        focusedBorderColor = RedPrimary,
                        unfocusedBorderColor = Color.DarkGray,
                        focusedContainerColor = CardColor,
                        unfocusedContainerColor = CardColor
                    ),
                    modifier = Modifier.weight(1f).height(56.dp)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                Checkbox(
                    checked = acceptTerms,
                    onCheckedChange = { acceptTerms = it },
                    colors = CheckboxDefaults.colors(checkedColor = RedPrimary, checkmarkColor = TextWhite)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("I accept the Terms and Conditions", color = TextGray, fontSize = 13.sp)
            }

            Spacer(modifier = Modifier.height(28.dp))

            Button(
                onClick = { handleRegister() },
                enabled = !isLoading,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                colors = ButtonDefaults.buttonColors(containerColor = RedPrimary),
                shape = RoundedCornerShape(8.dp)
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = TextWhite, modifier = Modifier.size(24.dp))
                } else {
                    Text("Get Verification OTP", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextWhite)
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Already have an account?", color = TextGray, fontSize = 14.sp)
                TextButton(onClick = { navController.navigate(Screen.PhoneLogin.route) }) {
                    Text("Login Here", color = RedPrimary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
