package com.tritech.photobooth.model

import androidx.compose.ui.graphics.Color

data class Major(
    val id: String,
    val shortName: String,
    val fullName: String,
    val color: Color,
    val accentColor: Color,
    val description: String
)

val sampleMajors = listOf(
    Major(
        id = "rpl",
        shortName = "RPL",
        fullName = "Rekayasa Perangkat Lunak",
        color = Color(0xFF2563EB),
        accentColor = Color(0xFF60A5FA),
        description = "Code, create, and innovate. Tema bernuansa biru teknologi."
    ),
    Major(
        id = "dkv",
        shortName = "DKV",
        fullName = "Desain Komunikasi Visual",
        color = Color(0xFFDB2777),
        accentColor = Color(0xFFF472B6),
        description = "Warna ekspresif, seni visual, dan estetika kreatif."
    ),
    Major(
        id = "tkj",
        shortName = "TKJ",
        fullName = "Teknik Komputer dan Jaringan",
        color = Color(0xFF1E293B),
        accentColor = Color(0xFF64748B),
        description = "Jaringan, server, dan keandalan sistem bernuansa sleek."
    )
)
