package com.tritech.photobooth.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tritech.photobooth.model.Major
import com.tritech.photobooth.model.sampleMajors
import com.tritech.photobooth.ui.theme.Ink
import com.tritech.photobooth.ui.theme.MutedText

@Composable
fun MajorScreen(
    onBackClick: () -> Unit,
    onMajorSelect: (Major) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(20.dp)
            .testTag("major_screen_container")
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Pilih Jurusan",
                    fontWeight = FontWeight.Black,
                    fontSize = 26.sp,
                    color = Ink
                )
                Text(
                    text = "Setiap jurusan punya nuansa spesial.",
                    color = MutedText,
                    fontSize = 13.sp
                )
            }

            IconButton(
                onClick = onBackClick,
                modifier = Modifier.testTag("major_back_button")
            ) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Kembali", tint = Ink)
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        sampleMajors.forEach { major ->
            Card(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
                    .clickable { onMajorSelect(major) }
                    .testTag("select_major_${major.id}")
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Box(
                        modifier = Modifier
                            .size(52.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(major.color),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = major.shortName,
                            color = Color.White,
                            fontWeight = FontWeight.Black,
                            fontSize = 18.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = major.fullName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = Ink
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = major.description,
                        color = MutedText,
                        fontSize = 13.sp,
                        lineHeight = 18.sp
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = "Mulai sesi ${major.shortName}",
                            color = major.color,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowForward,
                            contentDescription = null,
                            tint = major.color,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }
    }
}
