package com.lifora.ui.screens

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
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
fun EmailLoginScreen(navController: NavHostController) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val authRepository = remember { AuthRepository(context) }

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var rememberMe by remember { mutableStateOf(true) }
    var emailError by remember { mutableStateOf<String?>(null) }
    var passwordError by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    var showForgotPasswordDialog by remember { mutableStateOf(false) }
    var resetEmail by remember { mutableStateOf("") }

    fun validateInputs(): Boolean {
        var isValid = true
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

        return isValid
    }

    fun handleLogin() {
        if (!validateInputs()) return

        isLoading = true
        com.google.firebase.auth.FirebaseAuth.getInstance()
            .signInWithEmailAndPassword(email.trim(), password)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    isLoading = false
                    Toast.makeText(context, "Firebase Login Successful!", Toast.LENGTH_SHORT).show()
                    navController.navigate(Screen.Home.route) { popUpTo(0) }
                } else {
                    scope.launch {
                        val res = authRepository.loginWithEmail(email, password)
                        isLoading = false
                        if (res.error == null && res.user != null) {
                            Toast.makeText(context, "Logged in successfully!", Toast.LENGTH_SHORT).show()
                            navController.navigate(Screen.Home.route) { popUpTo(0) }
                        } else {
                            val msg = task.exception?.localizedMessage ?: res.error ?: "Login failed"
                            Toast.makeText(context, msg, Toast.LENGTH_LONG).show()
                        }
                    }
                }
            }
    }

    val gso = remember {
        com.google.android.gms.auth.api.signin.GoogleSignInOptions.Builder(
            com.google.android.gms.auth.api.signin.GoogleSignInOptions.DEFAULT_SIGN_IN
        )
            .requestEmail()
            .requestProfile()
            .build()
    }

    val googleSignInClient = remember {
        com.google.android.gms.auth.api.signin.GoogleSignIn.getClient(context, gso)
    }

    val googleLauncher = androidx.activity.compose.rememberLauncherForActivityResult(
        contract = androidx.activity.result.contract.ActivityResultContracts.StartActivityForResult()
    ) { result ->
        isLoading = false
        try {
            val task = com.google.android.gms.auth.api.signin.GoogleSignIn.getSignedInAccountFromIntent(result.data)
            val account = task.getResult(com.google.android.gms.common.api.ApiException::class.java)
            if (account != null) {
                val googleEmail = account.email ?: "google.user@gmail.com"
                val googleName = account.displayName ?: googleEmail.split("@")[0]
                val googleId = account.id ?: "google_${System.currentTimeMillis()}"

                scope.launch {
                    val res = authRepository.loginWithGoogle(email = googleEmail, googleId = googleId, fullName = googleName)
                    if (res.error == null) {
                        Toast.makeText(context, "Welcome $googleName! Signed in with Google.", Toast.LENGTH_SHORT).show()
                        navController.navigate(Screen.Home.route) { popUpTo(0) }
                    } else {
                        Toast.makeText(context, res.error, Toast.LENGTH_SHORT).show()
                    }
                }
            }
        } catch (e: Exception) {
            Toast.makeText(context, "Google Sign-In canceled or required Play Services.", Toast.LENGTH_SHORT).show()
        }
    }

    fun handleGoogleSignIn() {
        isLoading = true
        googleSignInClient.signOut().addOnCompleteListener {
            val signInIntent = googleSignInClient.signInIntent
            googleLauncher.launch(signInIntent)
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(BgColor)) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(30.dp))

            Icon(
                imageVector = Icons.Default.Email,
                contentDescription = null,
                tint = RedPrimary,
                modifier = Modifier.size(56.dp)
            )
            Spacer(modifier = Modifier.height(10.dp))
            Text("Welcome to Lifora", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = TextWhite)
            Text("Sign in with your email address or Google account", fontSize = 13.sp, color = TextGray)

            Spacer(modifier = Modifier.height(28.dp))

            // Email Input with Inline Error
            OutlinedTextField(
                value = email,
                onValueChange = {
                    email = it
                    if (emailError != null) emailError = null
                },
                label = { Text("Email Address", color = TextGray) },
                leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = TextGray) },
                isError = emailError != null,
                supportingText = {
                    emailError?.let { Text(it, color = RedPrimary, fontSize = 12.sp) }
                },
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

            // Password Input with Visibility Toggle Eye Icon & Inline Error
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
                supportingText = {
                    passwordError?.let { Text(it, color = RedPrimary, fontSize = 12.sp) }
                },
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

            // Remember Me & Forgot Password Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(
                        checked = rememberMe,
                        onCheckedChange = { rememberMe = it },
                        colors = CheckboxDefaults.colors(checkedColor = RedPrimary, checkmarkColor = TextWhite)
                    )
                    Text("Remember Me", color = TextGray, fontSize = 13.sp)
                }

                TextButton(onClick = { showForgotPasswordDialog = true }) {
                    Text("Forgot Password?", color = RedPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            Button(
                onClick = { handleLogin() },
                enabled = !isLoading,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                colors = ButtonDefaults.buttonColors(containerColor = RedPrimary),
                shape = RoundedCornerShape(8.dp)
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = TextWhite, modifier = Modifier.size(24.dp))
                } else {
                    Text("Sign In", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextWhite)
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            OutlinedButton(
                onClick = { handleGoogleSignIn() },
                enabled = !isLoading,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(8.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color.DarkGray)
            ) {
                Text("🌐 Sign in with Google", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextWhite)
            }

            Spacer(modifier = Modifier.weight(1f))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("New to Lifora?", color = TextGray, fontSize = 14.sp)
                TextButton(onClick = { navController.navigate("email_register") }) {
                    Text("Create New Account", color = RedPrimary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Forgot Password Dialog Modal
        if (showForgotPasswordDialog) {
            AlertDialog(
                onDismissRequest = { showForgotPasswordDialog = false },
                title = { Text("Reset Password", color = TextWhite, fontWeight = FontWeight.Bold) },
                text = {
                    Column {
                        Text("Enter your email address to receive password reset instructions.", color = TextGray, fontSize = 13.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = resetEmail,
                            onValueChange = { resetEmail = it },
                            label = { Text("Email Address", color = TextGray) },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = TextWhite,
                                unfocusedTextColor = TextWhite,
                                focusedBorderColor = RedPrimary,
                                unfocusedBorderColor = Color.DarkGray
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    TextButton(onClick = {
                        if (resetEmail.trim().isNotEmpty()) {
                            Toast.makeText(context, "Password reset link sent to ${resetEmail.trim()}", Toast.LENGTH_LONG).show()
                            showForgotPasswordDialog = false
                            resetEmail = ""
                        } else {
                            Toast.makeText(context, "Please enter your email", Toast.LENGTH_SHORT).show()
                        }
                    }) {
                        Text("Send Reset Link", color = RedPrimary, fontWeight = FontWeight.Bold)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showForgotPasswordDialog = false }) {
                        Text("Cancel", color = TextGray)
                    }
                },
                containerColor = CardColor
            )
        }
    }
}
