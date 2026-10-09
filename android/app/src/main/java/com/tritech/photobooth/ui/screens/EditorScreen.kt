package com.tritech.photobooth.ui.screens

import android.graphics.Bitmap
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tritech.photobooth.model.Major
import com.tritech.photobooth.model.availableFilters
import com.tritech.photobooth.model.availableFrames
import com.tritech.photobooth.model.sampleMajors
import com.tritech.photobooth.ui.theme.Ink
import com.tritech.photobooth.ui.theme.MutedText
import com.tritech.photobooth.ui.theme.PrimaryPink

@Composable
fun EditorScreen(
    photos: List<Bitmap>,
    selectedMajor: Major,
    selectedFrame: String,
    selectedFilter: String,
    onMajorChange: (Major) -> Unit,
    onFrameChange: (String) -> Unit,
    onFilterChange: (String) -> Unit,
    onGenerateClick: () -> Unit,
    onBackClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(20.dp)
            .testTag("editor_screen_container")
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Kustomisasi Foto",
                    fontWeight = FontWeight.Black,
                    fontSize = 24.sp,
                    color = Ink
                )
                Text(
                    text = "${photos.size} foto siap dikemas",
                    color = MutedText,
                    fontSize = 13.sp
                )
            }

            IconButton(
                onClick = onBackClick,
                modifier = Modifier.testTag("editor_back_button")
            ) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Foto Ulang")
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Mini preview card of the 4 shots
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = selectedMajor.color),
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp)
        ) {
            Column(
                modifier = Modifier.padding(18.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "TRITECH MEMORIES 2026",
                    fontWeight = FontWeight.Black,
                    color = Color.White,
                    fontSize = 14.sp,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "${selectedMajor.fullName} · $selectedFrame",
                    color = Color.White.copy(alpha = 0.8f),
                    fontSize = 10.sp
                )

                Spacer(modifier = Modifier.height(12.dp))

                photos.take(4).forEach { bmp ->
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(80.dp)
                            .padding(vertical = 3.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color.White)
                            .padding(3.dp)
                    ) {
                        Image(
                            bitmap = bmp.asImageBitmap(),
                            contentDescription = null,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier
                                .fillMaxSize()
                                .clip(RoundedCornerShape(6.dp))
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Options: Theme Major
        Text("Tema Warna Jurusan", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Ink)
        Spacer(modifier = Modifier.height(8.dp))
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(sampleMajors) { m ->
                val isSelected = m.id == selectedMajor.id
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = if (isSelected) Ink else Color.White,
                    modifier = Modifier
                        .clickable { onMajorChange(m) }
                        .border(1.dp, if (isSelected) Ink else Color(0xFFE2E8F0), RoundedCornerShape(12.dp))
                ) {
                    Text(
                        text = m.shortName,
                        color = if (isSelected) Color.White else Ink,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Options: Frame
        Text("Gaya Frame", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Ink)
        Spacer(modifier = Modifier.height(8.dp))
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(availableFrames) { f ->
                val isSelected = f == selectedFrame
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = if (isSelected) Ink else Color.White,
                    modifier = Modifier
                        .clickable { onFrameChange(f) }
                        .border(1.dp, if (isSelected) Ink else Color(0xFFE2E8F0), RoundedCornerShape(12.dp))
                ) {
                    Text(
                        text = f,
                        color = if (isSelected) Color.White else Ink,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Options: Filter
        Text("Filter Efek Foto", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Ink)
        Spacer(modifier = Modifier.height(8.dp))
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(availableFilters) { flt ->
                val isSelected = flt == selectedFilter
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = if (isSelected) Ink else Color.White,
                    modifier = Modifier
                        .clickable { onFilterChange(flt) }
                        .border(1.dp, if (isSelected) Ink else Color(0xFFE2E8F0), RoundedCornerShape(12.dp))
                ) {
                    Text(
                        text = flt,
                        color = if (isSelected) Color.White else Ink,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        Button(
            onClick = onGenerateClick,
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = PrimaryPink),
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp)
                .testTag("generate_photostrip_button")
        ) {
            Icon(Icons.Default.AutoAwesome, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Generate Photostrip", fontWeight = FontWeight.Bold, fontSize = 16.sp)
        }
    }
}
