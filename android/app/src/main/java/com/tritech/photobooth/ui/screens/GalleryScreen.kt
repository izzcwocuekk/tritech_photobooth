package com.tritech.photobooth.ui.screens

import android.graphics.Bitmap
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material3.*
import androidx.compose.runtime.*
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
import androidx.compose.ui.window.Dialog
import com.tritech.photobooth.ui.theme.Ink
import com.tritech.photobooth.ui.theme.MutedText
import com.tritech.photobooth.ui.theme.PrimaryPink

@Composable
fun GalleryScreen(
    gallery: List<Bitmap>,
    onBackClick: () -> Unit,
    onStartNewClick: () -> Unit,
    onDeleteItem: (Int) -> Unit,
    onClearAll: () -> Unit
) {
    var selectedItemIndex by remember { mutableStateOf<Int?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(20.dp)
            .testTag("gallery_screen_container")
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Galeri Kenangan",
                    fontWeight = FontWeight.Black,
                    fontSize = 24.sp,
                    color = Ink
                )
                Text(
                    text = "${gallery.size} photostrip tersimpan",
                    color = MutedText,
                    fontSize = 13.sp
                )
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (gallery.isNotEmpty()) {
                    IconButton(onClick = onClearAll) {
                        Icon(Icons.Default.Delete, contentDescription = "Hapus Semua", tint = Color(0xFFEF4444))
                    }
                }
                IconButton(onClick = onBackClick) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Kembali")
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        if (gallery.isEmpty()) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        Icons.Default.PhotoLibrary,
                        contentDescription = null,
                        tint = MutedText.copy(alpha = 0.5f),
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Belum ada foto tersimpan",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = Ink
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Ayo buat photostrip pertamamu sekarang!",
                        color = MutedText,
                        fontSize = 13.sp
                    )
                    Spacer(modifier = Modifier.height(20.dp))
                    Button(
                        onClick = onStartNewClick,
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryPink),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Text("Mulai Photobooth", fontWeight = FontWeight.Bold)
                    }
                }
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                modifier = Modifier.weight(1f),
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                itemsIndexed(gallery) { index, bmp ->
                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedItemIndex = index }
                    ) {
                        Image(
                            bitmap = bmp.asImageBitmap(),
                            contentDescription = "Photostrip $index",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier
                                .fillMaxWidth()
                                .aspectRatio(9f / 16f)
                                .clip(RoundedCornerShape(16.dp))
                        )
                    }
                }
            }
        }

        // Preview modal
        selectedItemIndex?.let { idx ->
            if (idx in gallery.indices) {
                val bmp = gallery[idx]
                Dialog(onDismissRequest = { selectedItemIndex = null }) {
                    Card(
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Image(
                                bitmap = bmp.asImageBitmap(),
                                contentDescription = null,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .aspectRatio(9f / 16f)
                                    .clip(RoundedCornerShape(14.dp))
                            )
                            Spacer(modifier = Modifier.height(14.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Button(
                                    onClick = {
                                        onDeleteItem(idx)
                                        selectedItemIndex = null
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Text("Hapus", fontWeight = FontWeight.Bold)
                                }

                                Button(
                                    onClick = { selectedItemIndex = null },
                                    colors = ButtonDefaults.buttonColors(containerColor = Ink),
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Text("Tutup", fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
