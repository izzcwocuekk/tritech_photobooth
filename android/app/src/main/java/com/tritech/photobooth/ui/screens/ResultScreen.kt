package com.tritech.photobooth.ui.screens

import android.graphics.Bitmap
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tritech.photobooth.ui.theme.Ink
import com.tritech.photobooth.ui.theme.MutedText
import com.tritech.photobooth.ui.theme.PrimaryPink

@Composable
fun ResultScreen(
    photostrip: Bitmap?,
    onRetakeClick: () -> Unit,
    onHomeClick: () -> Unit,
    onSaveClick: () -> Unit,
    onShareClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(20.dp)
            .testTag("result_screen_container")
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Hasil Foto Kamu! 🎉",
                    fontWeight = FontWeight.Black,
                    fontSize = 24.sp,
                    color = Ink
                )
                Text(
                    text = "Photostrip siap disimpan & dibagikan",
                    color = MutedText,
                    fontSize = 13.sp
                )
            }

            IconButton(
                onClick = onHomeClick,
                modifier = Modifier.testTag("result_home_button")
            ) {
                Icon(Icons.Default.Home, contentDescription = "Beranda", tint = Ink)
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Image result preview
        photostrip?.let { bmp ->
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    bitmap = bmp.asImageBitmap(),
                    contentDescription = "Hasil Photostrip",
                    modifier = Modifier
                        .fillMaxWidth(0.85f)
                        .aspectRatio(9f / 16f)
                        .clip(RoundedCornerShape(16.dp))
                        .shadow(12.dp, RoundedCornerShape(16.dp))
                        .testTag("result_photostrip_image")
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Actions
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            OutlinedButton(
                onClick = onRetakeClick,
                modifier = Modifier
                    .weight(1f)
                    .height(50.dp)
                    .testTag("retake_button"),
                shape = RoundedCornerShape(14.dp)
            ) {
                Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Foto Ulang", fontWeight = FontWeight.Bold)
            }

            Button(
                onClick = onSaveClick,
                modifier = Modifier
                    .weight(1f)
                    .height(50.dp)
                    .testTag("save_result_button"),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryPink)
            ) {
                Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Simpan", fontWeight = FontWeight.Bold)
            }

            IconButton(
                onClick = onShareClick,
                modifier = Modifier
                    .size(50.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color.White)
                    .testTag("share_result_button")
            ) {
                Icon(Icons.Default.Share, contentDescription = "Bagikan", tint = Ink)
            }
        }
    }
}
