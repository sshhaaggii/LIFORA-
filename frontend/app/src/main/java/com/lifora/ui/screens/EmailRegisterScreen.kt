package com.lifora.ui.screens

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.lifora.repositories.AuthRepository
import com.lifora.ui.Screen
import kotlinx.coroutines.launch

private val BgColor = Color(0xFF0D0D0D)
private val CardColor = Color(0xFF1A1A1A)
private val RedPrimary = Color(0xFFD32F2F)
private val TextWhite = Color(0xFFFFFFFF)
private val TextGray = Color(0xFFB0B0B0)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmailRegisterScreen(navController: NavHostController) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val authRepository = remember { AuthRepository(context) }

    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var confirmPasswordVisible by remember { mutableStateOf(false) }
    var acceptTerms by remember { mutableStateOf(false) }

    var nameError by remember { mutableStateOf<String?>(null) }
    var emailError by remember { mutableStateOf<String?>(null) }
    var passwordError by remember { mutableStateOf<String?>(null) }
    var confirmPasswordError by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }

    fun validateRegisterInputs(): Boolean {
        var isValid = true

        if (fullName.trim().isEmpty()) {
            nameError = "Full name is required"
            isValid = false
        } else {
            nameError = null
        }

        if (email.trim().isEmpty()) {
            emailError = "Email address is required"
            isValid = false
        } else if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email.trim()).matches()) {
            emailError = "Enter a valid email address"
            isValid = false
        } else {
            emailError = null
        }

        if (password.isEmpty()) {
            passwordError = "Password is required"
            isValid = false
        } else if (password.length < 6) {
            passwordError = "Password must be at least 6 characters"
            isValid = false
        } else {
            passwordError = null
        }

        if (confirmPassword.isEmpty()) {
            confirmPasswordError = "Please confirm your password"
            isValid = false
        } else if (password != confirmPassword) {
            confirmPasswordError = "Passwords do not match"
            isValid = false
        } else {
            confirmPasswordError = null
        }

        if (!acceptTerms) {
            Toast.makeText(context, "Please accept Terms & Conditions", Toast.LENGTH_SHORT).show()
            isValid = false
        }

        return isValid
    }

    fun handleRegister() {
        if (!validateRegisterInputs()) return

        isLoading = true
        com.google.firebase.auth.FirebaseAuth.getInstance()
            .createUserWithEmailAndPassword(email.trim(), password)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    isLoading = false
                    Toast.makeText(context, "Firebase Account Created Successfully!", Toast.LENGTH_SHORT).show()
                    navController.navigate(Screen.Home.route) { popUpTo(0) }
                } else {
                    scope.launch {
                        val res = authRepository.registerWithEmail(fullName, email, password)
                        isLoading = false
                        if (res.error == null && res.user != null) {
                            Toast.makeText(context, "Account registered successfully!", Toast.LENGTH_SHORT).show()
                            navController.navigate(Screen.Home.route) { popUpTo(0) }
                        } else {
                            val msg = task.exception?.localizedMessage ?: res.error ?: "Registration failed"
                            Toast.makeText(context, msg, Toast.LENGTH_LONG).show()
                        }
                    }
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
                Text("Create Account", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = TextWhite)
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Full Name Input
            OutlinedTextField(
                value = fullName,
                onValueChange = {
                    fullName = it
                    if (nameError != null) nameError = null
                },
                label = { Text("Full Name", color = TextGray) },
                leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = TextGray) },
                isError = nameError != null,
                supportingText = { nameError?.let { Text(it, color = RedPrimary, fontSize = 12.sp) } },
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

            Spacer(modifier = Modifier.height(10.dp))

            // Email Input
            OutlinedTextField(
                value = email,
                onValueChange = {
                    email = it
                    if (emailError != null) emailError = null
                },
                label = { Text("Email Address", color = TextGray) },
                leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = TextGray) },
                isError = emailError != null,
                supportingText = { emailError?.let { Text(it, color = RedPrimary, fontSize = 12.sp) } },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
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

            Spacer(modifier = Modifier.height(10.dp))

            // Password Input with Eye Icon
            OutlinedTextField(
                value = password,
                onValueChange = {
                    password = it
                    if (passwordError != null) passwordError = null
                },
                label = { Text("Password", color = TextGray) },
                leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = TextGray) },
                trailingIcon = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            imageVector = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                            contentDescription = if (passwordVisible) "Hide password" else "Show password",
                            tint = TextGray
                        )
                    }
                },
                isError = passwordError != null,
                supportingText = { passwordError?.let { Text(it, color = RedPrimary, fontSize = 12.sp) } },
                singleLine = true,
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
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

            Spacer(modifier = Modifier.height(10.dp))

            // Confirm Password Input with Eye Icon
            OutlinedTextField(
                value = confirmPassword,
                onValueChange = {
                    confirmPassword = it
                    if (confirmPasswordError != null) confirmPasswordError = null
                },
                label = { Text("Confirm Password", color = TextGray) },
                leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = TextGray) },
                trailingIcon = {
                    IconButton(onClick = { confirmPasswordVisible = !confirmPasswordVisible }) {
                        Icon(
                            imageVector = if (confirmPasswordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                            contentDescription = if (confirmPasswordVisible) "Hide password" else "Show password",
                            tint = TextGray
                        )
                    }
                },
                isError = confirmPasswordError != null,
                supportingText = { confirmPasswordError?.let { Text(it, color = RedPrimary, fontSize = 12.sp) } },
                singleLine = true,
                visualTransformation = if (confirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
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

            Spacer(modifier = Modifier.height(12.dp))

            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                Checkbox(
                    checked = acceptTerms,
                    onCheckedChange = { acceptTerms = it },
                    colors = CheckboxDefaults.colors(checkedColor = RedPrimary, checkmarkColor = TextWhite)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("I accept the Terms and Conditions", color = TextGray, fontSize = 13.sp)
            }

            Spacer(modifier = Modifier.height(20.dp))

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
                    Text("Register Account", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextWhite)
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Already have an account?", color = TextGray, fontSize = 14.sp)
                TextButton(onClick = { navController.navigate("email_login") }) {
                    Text("Login Here", color = RedPrimary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
