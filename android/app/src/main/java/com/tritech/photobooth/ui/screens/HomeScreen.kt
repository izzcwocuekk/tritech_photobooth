package com.tritech.photobooth.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tritech.photobooth.model.Major
import com.tritech.photobooth.model.sampleMajors
import com.tritech.photobooth.ui.theme.Ink
import com.tritech.photobooth.ui.theme.MutedText
import com.tritech.photobooth.ui.theme.PrimaryPink

@Composable
fun HomeScreen(
    onStartClick: () -> Unit,
    onGalleryClick: () -> Unit,
    onMajorClick: (Major) -> Unit,
    galleryCount: Int
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(20.dp)
            .testTag("home_screen_container")
    ) {
        // Top Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "TRITECH",
                    fontWeight = FontWeight.Black,
                    fontSize = 22.sp,
                    color = Ink,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "PHOTOBOOTH · 2026",
                    fontWeight = FontWeight.Bold,
                    fontSize = 10.sp,
                    color = MutedText,
                    letterSpacing = 2.sp
                )
            }

            OutlinedButton(
                onClick = onGalleryClick,
                shape = RoundedCornerShape(50),
                modifier = Modifier.testTag("gallery_nav_button")
            ) {
                Icon(Icons.Default.PhotoLibrary, contentDescription = "Gallery", modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Galeri ($galleryCount)", fontSize = 13.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Hero Section
        Text(
            text = "JURUSAN EDITION · 2026",
            color = Color(0xFF8B70E8),
            fontWeight = FontWeight.ExtraBold,
            fontSize = 12.sp,
            letterSpacing = 1.5.sp
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Capture your\nschool memories.",
            fontSize = 36.sp,
            lineHeight = 40.sp,
            fontWeight = FontWeight.Black,
            color = Ink
        )

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = "Foto seru bersama teman dengan gaya khas jurusanmu. Pilih tema, ambil empat foto otomatis, lalu bawa pulang kenangannya.",
            color = MutedText,
            fontSize = 15.sp,
            lineHeight = 22.sp
        )

        Spacer(modifier = Modifier.height(20.dp))

        Button(
            onClick = onStartClick,
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = PrimaryPink),
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp)
                .testTag("start_photobooth_button")
        ) {
            Text("Mulai Photobooth", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Spacer(modifier = Modifier.width(8.dp))
            Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null)
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Photostrip Preview Banner
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(
                    Brush.linearGradient(
                        listOf(Color(0xFFDCECFF), Color(0xFFFCE1F2))
                    )
                )
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier
                    .width(180.dp)
                    .rotate(3f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.White)
                    .padding(10.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                repeat(3) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(75.dp)
                            .padding(vertical = 4.dp)
                            .clip(RoundedCornerShape(6.dp))
                            .background(
                                Brush.linearGradient(listOf(Color(0xFF52AAF4), Color(0xFF182867)))
                            )
                    )
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "TRITECH\nMEMORIES 2026",
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    color = Ink
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Majors Section
        Text(
            text = "Pilih Jurusanmu",
            fontSize = 24.sp,
            fontWeight = FontWeight.ExtraBold,
            color = Ink
        )

        Spacer(modifier = Modifier.height(14.dp))

        sampleMajors.forEach { major ->
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 6.dp)
                    .clickable { onMajorClick(major) }
                    .testTag("major_card_${major.id}")
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(major.color),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = major.shortName,
                            color = Color.White,
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp
                        )
                    }

                    Spacer(modifier = Modifier.width(16.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = major.fullName,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = Ink
                        )
                        Text(
                            text = major.description,
                            color = MutedText,
                            fontSize = 12.sp,
                            lineHeight = 16.sp
                        )
                    }

                    Icon(
                        Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "Pilih",
                        tint = major.color
                    )
                }
            }
        }
    }
}
