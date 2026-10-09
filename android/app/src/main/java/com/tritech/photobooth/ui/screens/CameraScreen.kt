package com.tritech.photobooth.ui.screens

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color as AndroidColor
import android.graphics.Paint
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Cameraswitch
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tritech.photobooth.model.Major
import com.tritech.photobooth.ui.theme.Ink
import com.tritech.photobooth.ui.theme.MutedText
import com.tritech.photobooth.ui.theme.PrimaryPink
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun CameraScreen(
    major: Major,
    isFrontCamera: Boolean,
    onBackClick: () -> Unit,
    onToggleCamera: () -> Unit,
    onPhotosCaptured: (List<Bitmap>) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var isCapturing by remember { mutableStateOf(false) }
    var countdown by remember { mutableStateOf<Int?>(null) }
    var currentShotIndex by remember { mutableStateOf(0) }
    var flashVisible by remember { mutableStateOf(false) }

    fun generateSampleBitmap(index: Int): Bitmap {
        val bitmap = Bitmap.createBitmap(720, 960, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val paint = Paint()

        val bgColors = listOf(
            AndroidColor.parseColor("#38BDF8"),
            AndroidColor.parseColor("#F472B6"),
            AndroidColor.parseColor("#A78BFA"),
            AndroidColor.parseColor("#34D399")
        )
        canvas.drawColor(bgColors[index % bgColors.size])

        paint.color = AndroidColor.WHITE
        paint.textSize = 50f
        paint.textAlign = Paint.Align.CENTER
        paint.isAntiAlias = true
        canvas.drawText("Pose ${index + 1}: ${major.shortName}", 360f, 480f, paint)

        return bitmap
    }

    fun startCaptureSequence() {
        if (isCapturing) return
        isCapturing = true

        coroutineScope.launch {
            val list = mutableListOf<Bitmap>()
            for (i in 0 until 4) {
                currentShotIndex = i + 1
                for (c in 3 downTo 1) {
                    countdown = c
                    delay(650)
                }
                countdown = null

                // Flash animation
                flashVisible = true
                list.add(generateSampleBitmap(i))
                delay(120)
                flashVisible = false
                delay(400)
            }
            isCapturing = false
            currentShotIndex = 0
            onPhotosCaptured(list)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(20.dp)
            .testTag("camera_screen_container")
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Ambil 4 Foto",
                    fontWeight = FontWeight.Black,
                    fontSize = 24.sp,
                    color = Ink
                )
                Text(
                    text = "${major.shortName} · ${major.fullName}",
                    color = MutedText,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            IconButton(
                onClick = onBackClick,
                enabled = !isCapturing,
                modifier = Modifier.testTag("camera_back_button")
            ) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Kembali")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Viewfinder Box
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(Color(0xFF131A31)),
            contentAlignment = Alignment.Center
        ) {
            // Flash effect
            AnimatedVisibility(
                visible = flashVisible,
                enter = fadeIn(),
                exit = fadeOut(),
                modifier = Modifier.fillMaxSize()
            ) {
                Box(modifier = Modifier.fillMaxSize().background(Color.White))
            }

            // Viewfinder message or live feed
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Icon(
                    Icons.Default.PhotoCamera,
                    contentDescription = null,
                    tint = Color.White.copy(alpha = 0.5f),
                    modifier = Modifier.size(56.dp)
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "Kamera Siap (${if (isFrontCamera) "Depan" : "Belakang"})",
                    color = Color.White.copy(alpha = 0.7f),
                    fontSize = 14.sp
                )
                if (isCapturing) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Foto $currentShotIndex dari 4",
                        color = PrimaryPink,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                }
            }

            // Big Countdown Overlay
            countdown?.let { num ->
                Text(
                    text = num.toString(),
                    color = Color.White,
                    fontSize = 90.sp,
                    fontWeight = FontWeight.Black
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Camera Bottom Controls
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onBackClick,
                enabled = !isCapturing
            ) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Ganti Jurusan")
            }

            // Shutter Button
            Button(
                onClick = { startCaptureSequence() },
                enabled = !isCapturing,
                shape = CircleShape,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryPink),
                modifier = Modifier
                    .size(72.dp)
                    .testTag("shutter_button")
            ) {
                if (isCapturing) {
                    Text("$currentShotIndex/4", fontWeight = FontWeight.Black, fontSize = 14.sp)
                } else {
                    Icon(
                        Icons.Default.PhotoCamera,
                        contentDescription = "Capture",
                        modifier = Modifier.size(28.dp)
                    )
                }
            }

            IconButton(
                onClick = onToggleCamera,
                enabled = !isCapturing,
                modifier = Modifier.testTag("switch_camera_button")
            ) {
                Icon(Icons.Default.Cameraswitch, contentDescription = "Putar Kamera")
            }
        }

        Text(
            text = "Countdown 3 detik · Foto otomatis 4 kali bergantian",
            color = MutedText,
            fontSize = 12.sp,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
            modifier = Modifier.fillMaxWidth()
        )
    }
}
