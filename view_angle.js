// Get references to HTML elements
const testImage = document.getElementById("testImage");
const brightnessSlider = document.getElementById("brightnessSlider");
const brightnessValue = document.getElementById("brightnessValue");
const fullscreenBtn = document.getElementById("fullscreenBtn");

// Adjust brightness based on slider value
brightnessSlider.addEventListener("input", () => {
    const brightness = brightnessSlider.value;
    testImage.style.filter = `brightness(${brightness}%)`;
    brightnessValue.textContent = `${brightness}%`;
});

// Fullscreen mode
fullscreenBtn.addEventListener("click", () => {
    if (testImage.requestFullscreen) {
        testImage.requestFullscreen();
    } else if (testImage.webkitRequestFullscreen) { // Safari
        testImage.webkitRequestFullscreen();
    } else if (testImage.msRequestFullscreen) { // IE/Edge
        testImage.msRequestFullscreen();
    } else {
        alert("Fullscreen mode is not supported in your browser.");
    }
});