

document.addEventListener('DOMContentLoaded', function() {
    // Guard: if there are no tab buttons (comparison UI removed), skip setup
    const tabButtons = document.querySelectorAll('.tab-button');
    const video1 = document.getElementById('video1');
    const video2 = document.getElementById('video2');
    const video3 = document.getElementById('video3');
    const comparisonExists = tabButtons.length > 0 && video1 && video2 && video3;

    if (comparisonExists) {
        const videoContainers = [video1, video2, video3];
        const videoSources = {
            instance1: ['video/1-3.mp4', 'video/1-2.mp4', 'video/1-1.mp4'],
            instance2: ['video/2-3.mp4', 'video/2-2.mp4', 'video/2-1.mp4'],
            instance3: ['video/3-3.mp4', 'video/3-2.mp4', 'video/3-1.mp4']
        };

        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.getAttribute('data-tab');
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                videoContainers.forEach((video, index) => {
                    video.pause();
                    video.querySelector('source').src = videoSources[targetId][index];
                    video.load();
                    video.play();
                });
            });
        });

        // Initialize the first tab as active
        tabButtons[0].click();

        const sliders = document.querySelectorAll('.slider');
        sliders.forEach(slider => {
            let isDragging = false;
            slider.addEventListener('mousedown', function() {
                isDragging = true;
                document.body.style.cursor = 'ew-resize';
            });
            document.addEventListener('mouseup', function() {
                isDragging = false;
                document.body.style.cursor = 'default';
            });
            document.addEventListener('mousemove', function(e) {
                if (!isDragging) return;
                const videoContainer = slider.closest('#video-compare-container');
                if (!videoContainer) return;
                const rect = videoContainer.getBoundingClientRect();
                let offsetX = e.clientX - rect.left;
                if (offsetX < 0) offsetX = 0;
                if (offsetX > rect.width) offsetX = rect.width;
                const percentage = (offsetX / rect.width) * 100;
                const slider1 = document.getElementById('slider1');
                const slider2 = document.getElementById('slider2');
                let slider1Percentage = parseFloat(slider1?.style.left);
                let slider2Percentage = parseFloat(slider2?.style.left);
                if (isNaN(slider2Percentage)) slider2Percentage = 61;
                if (isNaN(slider1Percentage)) slider1Percentage = 36;
                if (slider.id === 'slider1' && percentage < slider2Percentage - 3) {
                    slider.style.left = `${percentage}%`;
                    const vc1 = videoContainer.querySelector('#video-container1');
                    const vc2 = videoContainer.querySelector('#video-container2');
                    if (vc1) vc1.style.clipPath = `inset(0 ${100 - percentage}% 0 0`;
                    if (vc2) vc2.style.clipPath = `inset(0 0 0 ${percentage}%)`;
                }
                if (slider.id === 'slider2' && percentage > slider1Percentage + 3) {
                    slider.style.left = `${percentage}%`;
                    const vc2 = videoContainer.querySelector('#video-container2');
                    const vc3 = videoContainer.querySelector('#video-container3');
                    if (vc2) vc2.style.clipPath = `inset(0 0 0 ${parseFloat(slider.previousElementSibling.style.left)}%)`;
                    if (vc3) vc3.style.clipPath = `inset(0 0 0 ${percentage}%)`;
                }
            });
        });
    }

    const interactiveCarousel = document.querySelector('.interactive-carousel');
    if (interactiveCarousel) {
        const images = Array.from(interactiveCarousel.querySelectorAll('.carousel-image'));
        const nextButton = interactiveCarousel.querySelector('.carousel-next');
        const prevButton = interactiveCarousel.querySelector('.carousel-prev');
        const AUTOPLAY_INTERVAL = 1000;
        let currentIndex = 0;
        let autoplayId = null;

        if (!images.length) {
            return;
        }

        const showImage = (index) => {
            images.forEach((img, i) => {
                if (i === index) {
                    img.classList.add('active');
                } else {
                    img.classList.remove('active');
                }
            });
            currentIndex = index;
        };

        const goToNext = () => {
            const nextIndex = (currentIndex + 1) % images.length;
            showImage(nextIndex);
        };

        const goToPrev = () => {
            const prevIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(prevIndex);
        };

        const restartAutoplay = () => {
            if (autoplayId) {
                clearInterval(autoplayId);
            }
            autoplayId = setInterval(goToNext, AUTOPLAY_INTERVAL);
        };

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                goToNext();
                restartAutoplay();
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                goToPrev();
                restartAutoplay();
            });
        }

        showImage(currentIndex);
        restartAutoplay();
    }

    const copyButtons = document.querySelectorAll('[data-copy-target]');
    copyButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            const target = document.getElementById(button.dataset.copyTarget);
            if (!target) {
                return;
            }
            const text = target.textContent.trim();
            try {
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(text);
                    return;
                }
            } catch (clipboardError) {
                // Fallback handled below when Clipboard API fails
            }
            const helper = document.createElement('textarea');
            helper.value = text;
            helper.setAttribute('readonly', '');
            helper.style.position = 'absolute';
            helper.style.left = '-9999px';
            document.body.appendChild(helper);
            helper.select();
            document.execCommand('copy');
            document.body.removeChild(helper);
        });
    });
});

