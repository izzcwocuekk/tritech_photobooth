package com.tritech.photobooth.model

import android.graphics.Bitmap

data class Photostrip(
    val id: String,
    val major: Major,
    val frameTitle: String,
    val filterName: String,
    val photos: List<Bitmap>,
    val timestamp: Long = System.currentTimeMillis()
)

val availableFrames = listOf(
    "Memories 2026",
    "Jurusan Edition",
    "Polaroid Classic",
    "Best Friends Forever"
)

val availableFilters = listOf(
    "Normal",
    "B&W Film",
    "Vintage Sepia",
    "Warm Glow"
)
