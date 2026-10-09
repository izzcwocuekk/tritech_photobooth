package com.tritech.photobooth.viewmodel

import android.graphics.Bitmap
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tritech.photobooth.model.Major
import com.tritech.photobooth.model.availableFilters
import com.tritech.photobooth.model.availableFrames
import com.tritech.photobooth.model.sampleMajors
import com.tritech.photobooth.util.PhotostripGenerator
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class ScreenStage {
    object Home : ScreenStage()
    object MajorSelection : ScreenStage()
    object Camera : ScreenStage()
    object Editor : ScreenStage()
    object Result : ScreenStage()
    object Gallery : ScreenStage()
}

data class PhotoboothUiState(
    val currentStage: ScreenStage = ScreenStage.Home,
    val selectedMajor: Major = sampleMajors[0],
    val capturedPhotos: List<Bitmap> = emptyList(),
    val selectedFrame: String = availableFrames[0],
    val selectedFilter: String = availableFilters[0],
    val finalPhotostripBitmap: Bitmap? = null,
    val galleryStrips: List<Bitmap> = emptyList(),
    val countdownNumber: Int? = null,
    val isCapturing: Boolean = false,
    val isFrontCamera: Boolean = true
)

class PhotoboothViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(PhotoboothUiState())
    val uiState: StateFlow<PhotoboothUiState> = _uiState.asStateFlow()

    fun navigateTo(stage: ScreenStage) {
        _uiState.value = _uiState.value.copy(currentStage = stage)
    }

    fun selectMajor(major: Major) {
        _uiState.value = _uiState.value.copy(selectedMajor = major)
        navigateTo(ScreenStage.Camera)
    }

    fun setFrame(frame: String) {
        _uiState.value = _uiState.value.copy(selectedFrame = frame)
    }

    fun setFilter(filter: String) {
        _uiState.value = _uiState.value.copy(selectedFilter = filter)
    }

    fun toggleCameraFacing() {
        _uiState.value = _uiState.value.copy(isFrontCamera = !_uiState.value.isFrontCamera)
    }

    fun setCapturedPhotos(photos: List<Bitmap>) {
        _uiState.value = _uiState.value.copy(capturedPhotos = photos)
        navigateTo(ScreenStage.Editor)
    }

    fun generateFinalPhotostrip() {
        val state = _uiState.value
        if (state.capturedPhotos.isEmpty()) return

        val strip = PhotostripGenerator.generateStrip(
            photos = state.capturedPhotos,
            major = state.selectedMajor,
            frameTitle = state.selectedFrame,
            filterName = state.selectedFilter
        )

        val updatedGallery = listOf(strip) + state.galleryStrips
        _uiState.value = state.copy(
            finalPhotostripBitmap = strip,
            galleryStrips = updatedGallery
        )
        navigateTo(ScreenStage.Result)
    }

    fun removeGalleryItem(index: Int) {
        val list = _uiState.value.galleryStrips.toMutableList()
        if (index in list.indices) {
            list.removeAt(index)
            _uiState.value = _uiState.value.copy(galleryStrips = list)
        }
    }

    fun clearGallery() {
        _uiState.value = _uiState.value.copy(galleryStrips = emptyList())
    }
}
