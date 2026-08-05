package com.lifora.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.*
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.lifora.ui.Screen
import kotlinx.coroutines.launch
import kotlin.math.sin

// ── colour tokens ──────────────────────────────────────────────
private val BgColor      = Color(0xFF0D0D0D)
private val CardColor    = Color(0xFF1A1A1A)
private val RedPrimary   = Color(0xFFD32F2F)
private val RedLight     = Color(0xFFEF5350)
private val RedDim       = Color(0xFF7B0000)
private val TextWhite    = Color(0xFFFFFFFF)
private val TextGray     = Color(0xFFB0B0B0)

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun OnboardingScreen(navController: NavHostController) {
    val pages = listOf(
        OnboardingPage.First,
        OnboardingPage.Second,
        OnboardingPage.Third
    )
    val pagerState = rememberPagerState(pageCount = { pages.size })
    val scope      = rememberCoroutineScope()

    Box(modifier = Modifier.fillMaxSize().background(BgColor)) {
        Column(modifier = Modifier.fillMaxSize()) {

            // ── Pager ───────────────────────────────────────────
            HorizontalPager(
                modifier = Modifier.weight(1f),
                state    = pagerState
            ) { page ->
                PagerScreen(page = pages[page])
            }

            // ── Dot indicator + buttons ─────────────────────────
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 36.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Dots
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.padding(bottom = 24.dp)
                ) {
                    repeat(pages.size) { idx ->
                        val selected = idx == pagerState.currentPage
                        Box(
                            modifier = Modifier
                                .height(8.dp)
                                .width(if (selected) 28.dp else 8.dp)
                                .clip(CircleShape)
                                .background(if (selected) RedPrimary else Color(0xFF444444))
                        )
                    }
                }

                // Skip / Next  or  Get Started
                if (pagerState.currentPage < 2) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 32.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment     = Alignment.CenterVertically
                    ) {
                        TextButton(onClick = { navController.navigate(Screen.PhoneLogin.route) }) {
                            Text("Skip", color = TextGray, fontSize = 16.sp)
                        }
                        Button(
                            onClick = {
                                scope.launch {
                                    pagerState.animateScrollToPage(pagerState.currentPage + 1)
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = RedPrimary),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.height(48.dp).width(120.dp)
                        ) {
                            Text("Next", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        }
                    }
                } else {
                    Button(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 32.dp)
                            .height(52.dp),
                        onClick = { navController.navigate(Screen.PhoneLogin.route) },
                        colors = ButtonDefaults.buttonColors(containerColor = RedPrimary),
                        shape  = RoundedCornerShape(12.dp)
                    ) {
                        Text("Get Started", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    }
                }
            }
        }
    }
}

// ── Individual page ────────────────────────────────────────────
@Composable
fun PagerScreen(page: OnboardingPage) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 28.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(56.dp))

        // Title
        Text(
            text = buildAnnotatedString {
                withStyle(SpanStyle(color = TextWhite,  fontWeight = FontWeight.Bold)) {
                    append(page.titleWhite)
                }
                if (page.titleRed.isNotEmpty()) {
                    append("\n")
                    withStyle(SpanStyle(color = RedPrimary, fontWeight = FontWeight.Bold)) {
                        append(page.titleRed)
                    }
                }
            },
            fontSize   = 30.sp,
            textAlign  = TextAlign.Center,
            lineHeight = 38.sp,
            modifier   = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Description
        Text(
            text      = page.description,
            fontSize  = 15.sp,
            textAlign = TextAlign.Center,
            color     = TextGray,
            lineHeight = 22.sp,
            modifier  = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(40.dp))

        // Custom illustration per page
        Box(
            modifier          = Modifier
                .fillMaxWidth()
                .height(300.dp),
            contentAlignment  = Alignment.Center
        ) {
            when (page) {
                OnboardingPage.First  -> Page1Illustration()
                OnboardingPage.Second -> Page2Illustration()
                OnboardingPage.Third  -> Page3Illustration()
            }
        }
    }
}

// ══════════════════════════════════════════════════════════════
// ILLUSTRATION 1 – Person + Shield
// ══════════════════════════════════════════════════════════════
@Composable
private fun Page1Illustration() {
    Box(
        modifier         = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        // Dark card background
        Box(
            modifier = Modifier
                .size(260.dp)
                .clip(RoundedCornerShape(24.dp))
                .background(CardColor)
        )

        // Red shield + cross icon
        Box(
            modifier = Modifier
                .size(120.dp)
                .offset(x = 50.dp, y = 20.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(RedDim.copy(alpha = 0.6f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                Icons.Filled.HealthAndSafety,
                contentDescription = null,
                tint   = RedPrimary,
                modifier = Modifier.size(80.dp)
            )
        }

        // Person silhouette using a card
        Box(
            modifier = Modifier
                .size(width = 90.dp, height = 180.dp)
                .offset(x = (-50).dp, y = 30.dp)
        ) {
            // Head
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF3A3A3A))
                    .align(Alignment.TopCenter)
            )
            // Body
            Box(
                modifier = Modifier
                    .width(70.dp)
                    .height(110.dp)
                    .clip(RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
                    .background(Color(0xFF252525))
                    .align(Alignment.BottomCenter)
            )
        }

        // Glow dot
        Box(
            modifier = Modifier
                .size(12.dp)
                .offset(x = 50.dp, y = 90.dp)
                .clip(CircleShape)
                .background(RedPrimary)
        )
    }
}

// ══════════════════════════════════════════════════════════════
// ILLUSTRATION 2 – A  →  文A  + sound waves
// ══════════════════════════════════════════════════════════════
@Composable
private fun Page2Illustration() {
    val infiniteTransition = rememberInfiniteTransition(label = "wave")
    val waveOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue  = (2 * Math.PI).toFloat(),
        animationSpec = infiniteRepeatable(tween(1800, easing = LinearEasing)),
        label = "waveOffset"
    )

    Box(
        modifier         = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        // Sound wave canvas
        Canvas(modifier = Modifier.fillMaxWidth().height(60.dp).offset(y = 80.dp)) {
            val midY   = size.height / 2
            val points = 120
            val path   = Path()
            for (i in 0..points) {
                val x  = i * size.width / points
                val amp = 22f * sin(waveOffset + i * 0.25f)
                if (i == 0) path.moveTo(x, midY + amp)
                else path.lineTo(x, midY + amp)
            }
            drawPath(path, color = RedPrimary, style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round))
        }

        // "A" bubble  (left)
        Box(
            modifier = Modifier
                .size(90.dp)
                .offset(x = (-70).dp, y = (-20).dp)
                .clip(CircleShape)
                .background(RedPrimary),
            contentAlignment = Alignment.Center
        ) {
            Text("A", color = TextWhite, fontSize = 38.sp, fontWeight = FontWeight.Bold)
        }

        // Arrow
        Icon(
            Icons.Filled.ArrowForward,
            contentDescription = null,
            tint     = TextGray,
            modifier = Modifier.size(28.dp).offset(y = (-20).dp)
        )

        // "文A" bubble  (right)
        Box(
            modifier = Modifier
                .size(90.dp)
                .offset(x = 70.dp, y = (-20).dp)
                .clip(CircleShape)
                .background(CardColor)
                .border(2.dp, RedPrimary, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text("文A", color = RedPrimary, fontSize = 28.sp, fontWeight = FontWeight.Bold)
        }
    }
}

// ══════════════════════════════════════════════════════════════
// ILLUSTRATION 3 – 5 feature circles  (SOS, Pin, AI, hands)
// ══════════════════════════════════════════════════════════════
@Composable
private fun Page3Illustration() {
    data class FeatureItem(val label: String, val icon: androidx.compose.ui.graphics.vector.ImageVector, val bg: Color)

    val items = listOf(
        FeatureItem("SOS",      Icons.Filled.Sos,             RedPrimary),
        FeatureItem("Location", Icons.Filled.LocationOn,      Color(0xFF1B1B3A)),
        FeatureItem("AI",       Icons.Filled.SmartToy,        Color(0xFF1A3A3A)),
        FeatureItem("Sign",     Icons.Filled.PanTool,         CardColor),
        FeatureItem("Stop",     Icons.Filled.BackHand,        CardColor),
    )

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top row: SOS, Location, AI
        Row(
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment     = Alignment.CenterVertically
        ) {
            items.take(3).forEach { item ->
                FeatureCircle(item.icon, item.label, item.bg)
            }
        }
        // Bottom row: Sign, Stop
        Row(
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment     = Alignment.CenterVertically
        ) {
            items.drop(3).forEach { item ->
                FeatureCircle(item.icon, item.label, item.bg)
            }
        }
    }
}

@Composable
private fun FeatureCircle(
    icon : androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    bg   : Color
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .size(80.dp)
                .clip(CircleShape)
                .background(bg)
                .border(2.dp, RedPrimary.copy(alpha = 0.5f), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, contentDescription = label, tint = TextWhite, modifier = Modifier.size(36.dp))
        }
        Spacer(Modifier.height(6.dp))
        Text(label, color = TextGray, fontSize = 12.sp, textAlign = TextAlign.Center)
    }
}

// ── Data ───────────────────────────────────────────────────────
sealed class OnboardingPage(
    val titleWhite  : String,
    val titleRed    : String,
    val description : String
) {
    object First : OnboardingPage(
        titleWhite  = "Your Safety,",
        titleRed    = "Our Priority",
        description = "Lifora is here to help you in critical situations with instant assistance."
    )
    object Second : OnboardingPage(
        titleWhite  = "Break Language",
        titleRed    = "Barriers",
        description = "AI-powered translation helps you communicate with emergency services in any language."
    )
    object Third : OnboardingPage(
        titleWhite  = "Get Help When\nEvery Second",
        titleRed    = "Matters",
        description = "SOS, live location, AI assistant and sign language support – all in one app."
    )
}
