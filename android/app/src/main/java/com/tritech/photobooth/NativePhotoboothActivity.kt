package com.tritech.photobooth

import android.content.Intent
import android.graphics.Bitmap
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.tritech.photobooth.ui.screens.CameraScreen
import com.tritech.photobooth.ui.screens.EditorScreen
import com.tritech.photobooth.ui.screens.GalleryScreen
import com.tritech.photobooth.ui.screens.HomeScreen
import com.tritech.photobooth.ui.screens.MajorScreen
import com.tritech.photobooth.ui.screens.ResultScreen
import com.tritech.photobooth.ui.theme.TritechPhotoboothTheme
import com.tritech.photobooth.viewmodel.PhotoboothViewModel
import com.tritech.photobooth.viewmodel.ScreenStage

class NativePhotoboothActivity : ComponentActivity() {

    private val viewModel: PhotoboothViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            TritechPhotoboothTheme {
                val uiState by viewModel.uiState.collectAsState()

                when (uiState.currentStage) {
                    ScreenStage.Home -> {
                        HomeScreen(
                            onStartClick = { viewModel.navigateTo(ScreenStage.MajorSelection) },
                            onGalleryClick = { viewModel.navigateTo(ScreenStage.Gallery) },
                            onMajorClick = { major -> viewModel.selectMajor(major) },
                            galleryCount = uiState.galleryStrips.size
                        )
                    }

                    ScreenStage.MajorSelection -> {
                        MajorScreen(
                            onBackClick = { viewModel.navigateTo(ScreenStage.Home) },
                            onMajorSelect = { major -> viewModel.selectMajor(major) }
                        )
                    }

                    ScreenStage.Camera -> {
                        CameraScreen(
                            major = uiState.selectedMajor,
                            isFrontCamera = uiState.isFrontCamera,
                            onBackClick = { viewModel.navigateTo(ScreenStage.MajorSelection) },
                            onToggleCamera = { viewModel.toggleCameraFacing() },
                            onPhotosCaptured = { photos -> viewModel.setCapturedPhotos(photos) }
                        )
                    }

                    ScreenStage.Editor -> {
                        EditorScreen(
                            photos = uiState.capturedPhotos,
                            selectedMajor = uiState.selectedMajor,
                            selectedFrame = uiState.selectedFrame,
                            selectedFilter = uiState.selectedFilter,
                            onMajorChange = { m -> viewModel.selectMajor(m) },
                            onFrameChange = { f -> viewModel.setFrame(f) },
                            onFilterChange = { flt -> viewModel.setFilter(flt) },
                            onGenerateClick = { viewModel.generateFinalPhotostrip() },
                            onBackClick = { viewModel.navigateTo(ScreenStage.Camera) }
                        )
                    }

                    ScreenStage.Result -> {
                        ResultScreen(
                            photostrip = uiState.finalPhotostripBitmap,
                            onRetakeClick = { viewModel.navigateTo(ScreenStage.Camera) },
                            onHomeClick = { viewModel.navigateTo(ScreenStage.Home) },
                            onSaveClick = {
                                Toast.makeText(this, "Photostrip disimpan ke Galeri!", Toast.LENGTH_SHORT).show()
                            },
                            onShareClick = {
                                val sendIntent = Intent().apply {
                                    action = Intent.ACTION_SEND
                                    putExtra(Intent.EXTRA_TEXT, "Kenangan Photobooth SMK Tritech 2026!")
                                    type = "text/plain"
                                }
                                val shareIntent = Intent.createChooser(sendIntent, "Bagikan Photostrip")
                                startActivity(shareIntent)
                            }
                        )
                    }

                    ScreenStage.Gallery -> {
                        GalleryScreen(
                            gallery = uiState.galleryStrips,
                            onBackClick = { viewModel.navigateTo(ScreenStage.Home) },
                            onStartNewClick = { viewModel.navigateTo(ScreenStage.MajorSelection) },
                            onDeleteItem = { index -> viewModel.removeGalleryItem(index) },
                            onClearAll = { viewModel.clearGallery() }
                        )
                    }
                }
            }
        }
    }
}
