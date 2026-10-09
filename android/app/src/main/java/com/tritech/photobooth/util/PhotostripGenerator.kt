package com.tritech.photobooth.util

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import androidx.compose.ui.graphics.toArgb
import com.tritech.photobooth.model.Major
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object PhotostripGenerator {

    fun generateStrip(
        photos: List<Bitmap>,
        major: Major,
        frameTitle: String,
        filterName: String
    ): Bitmap {
        val width = 1080
        val height = 1920
        val result = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(result)

        // 1. Background Gradient
        val bgPaint = Paint().apply {
            shader = LinearGradient(
                0f, 0f, 0f, height.toFloat(),
                major.color.toArgb(),
                major.accentColor.toArgb(),
                Shader.TileMode.CLAMP
            )
        }
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), bgPaint)

        // Border Outline
        val borderPaint = Paint().apply {
            color = Color.argb(60, 255, 255, 255)
            style = Paint.Style.STROKE
            strokeWidth = 10f
        }
        canvas.drawRect(30f, 30f, (width - 30).toFloat(), (height - 30).toFloat(), borderPaint)

        // 2. Header
        val headerPaint = Paint().apply {
            color = Color.WHITE
            textSize = 52f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        canvas.drawText("TRITECH MEMORIES 2026", (width / 2).toFloat(), 84f, headerPaint)

        val subheaderPaint = Paint().apply {
            color = Color.argb(220, 255, 255, 255)
            textSize = 24f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.NORMAL)
            isAntiAlias = true
        }
        canvas.drawText("SMK TRITECH INFORMATIKA · ${major.fullName.uppercase(Locale.getDefault())}", (width / 2).toFloat(), 122f, subheaderPaint)

        // 3. Draw Photos
        val photoYStart = 150f
        val photoHeight = 390f
        val photoWidth = 920f
        val photoX = 80f
        val photoGap = 24f

        val photoBorderPaint = Paint().apply {
            color = Color.WHITE
            style = Paint.Style.FILL
            isAntiAlias = true
        }

        val photoPaint = Paint().apply {
            isAntiAlias = true
            when (filterName) {
                "B&W Film" -> {
                    val matrix = ColorMatrix().apply { setSaturation(0f) }
                    colorFilter = ColorMatrixColorFilter(matrix)
                }
                "Vintage Sepia" -> {
                    val matrix = ColorMatrix(floatArrayOf(
                        0.393f, 0.769f, 0.189f, 0f, 0f,
                        0.349f, 0.686f, 0.168f, 0f, 0f,
                        0.272f, 0.534f, 0.131f, 0f, 0f,
                        0f,     0f,     0f,     1f, 0f
                    ))
                    colorFilter = ColorMatrixColorFilter(matrix)
                }
                "Warm Glow" -> {
                    val matrix = ColorMatrix().apply { setSaturation(1.3f) }
                    colorFilter = ColorMatrixColorFilter(matrix)
                }
            }
        }

        photos.take(4).forEachIndexed { idx, srcBitmap ->
            val y = photoYStart + idx * (photoHeight + photoGap)

            // White frame around photo
            val outerRect = RectF(photoX - 10, y - 10, photoX + photoWidth + 10, y + photoHeight + 10)
            canvas.drawRoundRect(outerRect, 24f, 24f, photoBorderPaint)

            // Scaled photo
            val scaled = Bitmap.createScaledBitmap(srcBitmap, photoWidth.toInt(), photoHeight.toInt(), true)
            canvas.drawBitmap(scaled, photoX, y, photoPaint)

            // Badge number
            val badgePaint = Paint().apply {
                color = Color.argb(160, 0, 0, 0)
                isAntiAlias = true
            }
            canvas.drawRoundRect(RectF(photoX + 16, y + 16, photoX + 68, y + 50), 10f, 10f, badgePaint)

            val badgeTextPaint = Paint().apply {
                color = Color.WHITE
                textSize = 20f
                textAlign = Paint.Align.CENTER
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                isAntiAlias = true
            }
            canvas.drawText("${idx + 1}", photoX + 42, y + 40, badgeTextPaint)
        }

        // 4. Footer
        val footerPaint = Paint().apply {
            color = Color.WHITE
            textSize = 36f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        canvas.drawText("${major.shortName} · ${frameTitle.uppercase(Locale.getDefault())}", (width / 2).toFloat(), 1830f, footerPaint)

        val datePaint = Paint().apply {
            color = Color.argb(200, 255, 255, 255)
            textSize = 22f
            textAlign = Paint.Align.CENTER
            isAntiAlias = true
        }
        val dateStr = SimpleDateFormat("dd MMM yyyy", Locale.getDefault()).format(Date())
        canvas.drawText("PHOTOBOOTH EDITION · $dateStr · MEDAN", (width / 2).toFloat(), 1866f, datePaint)

        return result
    }
}
