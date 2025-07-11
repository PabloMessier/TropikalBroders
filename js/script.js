// Initialize Feather Icons
feather.replace();

// DOM Elements
let slides = [];
let dots = [];
const lightbox = document.querySelector('.lightbox');
const lightboxImage = document.querySelector('.lightbox-image');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-button.prev');
const lightboxNext = document.querySelector('.lightbox-button.next');
const backToTop = document.querySelector('.back-to-top');

let currentSlide = 0;
let carouselInterval;

// Test if image exists with explicit debugging
function imageExists(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
    });
}

// Setup gallery carousel navigation with touch support
function setupGalleryCarousel(containerId) {
    const container = document.getElementById(containerId);
    const slides = container.querySelectorAll('.gallery-carousel-slide');
    
    if (slides.length === 0) {
        console.warn(`No slides found for ${containerId}`);
        return;
    }
    
    let currentIndex = 0;
    console.log(`Setting up carousel for ${containerId} with ${slides.length} slides`);
    
    // Get navigation buttons based on container ID
    let prevBtn, nextBtn;
    if (containerId === 'gallery-carousel') {
        prevBtn = document.getElementById('gallery-prev');
        nextBtn = document.getElementById('gallery-next');
    } else if (containerId === 'presentaciones-carousel') {
        prevBtn = document.getElementById('presentaciones-prev');
        nextBtn = document.getElementById('presentaciones-next');
    }
    
    // Function to show specific slide
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        currentIndex = index;
    }
    
    // Function to go to next slide
    function nextSlide() {
        const newIndex = (currentIndex + 1) % slides.length;
        showSlide(newIndex);
    }
    
    // Function to go to previous slide
    function prevSlide() {
        const newIndex = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(newIndex);
    }
    
    // Setup button event listeners
    if (prevBtn) {
        prevBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            prevSlide();
        };
    }
    
    if (nextBtn) {
        nextBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
        };
    }
    
    // Touch/Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistanceX = Math.abs(touchEndX - touchStartX);
        const swipeDistanceY = Math.abs(touchEndY - touchStartY);
        
        if (swipeDistanceX > swipeThreshold && swipeDistanceX > swipeDistanceY) {
            if (touchEndX < touchStartX) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }
    
    // Initialize first slide
    showSlide(0);
}

// Simple, direct image loading
async function loadImages(containerId, isCarousel = false) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container not found: ${containerId}`);
        return;
    }
    
    const folderPath = container.dataset.folder;
    if (!folderPath) {
        console.error(`No folder path for: ${containerId}`);
        return;
    }
    
    console.log(`Loading ${containerId} from ${folderPath}`);
    
    // Clear existing content
    container.innerHTML = '<div class="loading-indicator">Cargando...</div>';
    
    // Determine prefix
    let prefix = '';
    if (folderPath === 'images/carousel') prefix = 'carousel';
    else if (folderPath === 'images/gallery') prefix = 'gallery';
    else if (folderPath === 'images/presentaciones') prefix = 'presentation';
    else if (folderPath === 'images/streaming_music') prefix = 'streaming';
    
    console.log(`Container: ${containerId} | Folder: ${folderPath} | Using prefix: ${prefix}`);
    
    if (!prefix) {
        console.error(`No prefix found for folder: ${folderPath}`);
        return;
    }
    
    const foundImages = [];
    const batchSize = 20;
    const maxImages = 50;
    
    for (let startIndex = 1; startIndex <= maxImages; startIndex += batchSize) {
        const endIndex = Math.min(startIndex + batchSize - 1, maxImages);
        const batch = [];
        
        for (let i = startIndex; i <= endIndex; i++) {
            const filename = `${prefix}${String(i).padStart(2, '0')}.jpg`;
            const imagePath = `${folderPath}/${filename}`;
            batch.push(
                imageExists(imagePath).then(exists => ({ filename, imagePath, exists, index: i }))
            );
        }
        
        const results = await Promise.all(batch);
        
        let consecutiveMisses = 0;
        for (const result of results) {
            if (result.exists) {
                foundImages.push(result.filename);
                consecutiveMisses = 0;
                console.log(`✅ Found: ${result.imagePath}`);
            } else {
                consecutiveMisses++;
                console.log(`❌ Not found: ${result.imagePath}`);
            }
        }
        
        if (consecutiveMisses >= 3) break;
    }
    
    console.log(`Found ${foundImages.length} images for ${containerId}`);
    
    // Remove loading indicator
    container.innerHTML = '';
    
    // Add images to container
    const isGalleryCarousel = containerId === 'gallery-carousel' || containerId === 'presentaciones-carousel';
    
    foundImages.forEach((filename, index) => {
        const img = document.createElement('img');
        const src = `${folderPath}/${filename}`;
        
        img.src = src;
        img.alt = `${containerId} image ${index + 1}`;
        
        if (isCarousel) {
            img.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
            img.addEventListener('click', () => openLightbox(index));
        } else if (isGalleryCarousel) {
            img.className = `gallery-carousel-slide ${index === 0 ? 'active' : ''}`;
            img.addEventListener('click', () => {
                const container = document.getElementById(containerId);
                const slides = container.querySelectorAll('.gallery-carousel-slide');
                const activeSlide = container.querySelector('.gallery-carousel-slide.active');
                const currentIndex = Array.from(slides).indexOf(activeSlide);
                maximizeSection(containerId, foundImages, currentIndex, folderPath);
            });
        } else {
            img.className = 'gallery-item';
            img.addEventListener('click', () => {
                const container = document.getElementById(containerId);
                const slides = container.querySelectorAll('.gallery-item');
                const activeSlide = img;
                const currentIndex = Array.from(slides).indexOf(activeSlide);
                maximizeSection(containerId, foundImages, currentIndex, folderPath);
            });
        }
        
        container.appendChild(img);
        console.log(`Added to ${containerId}: ${src}`);
        
        // Add dots for main carousel
        if (isCarousel) {
            const dotsContainer = document.getElementById('carousel-dots');
            if (dotsContainer) {
                const dot = document.createElement('div');
                dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
                dotsContainer.appendChild(dot);
            }
        }
    });
    
    // Setup navigation
    if (isCarousel) {
        slides = document.querySelectorAll('.carousel-slide');
        dots = document.querySelectorAll('.carousel-dot');
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                stopCarousel();
                currentSlide = index;
                showSlide(currentSlide);
                startCarousel();
            });
        });
    } else if (isGalleryCarousel) {
        // Add a delay to ensure images are fully loaded before setting up carousel
        setTimeout(() => {
            setupGalleryCarousel(containerId);
        }, 200);
    }
    
    // Trigger fade-in
    setTimeout(() => {
        if (containerId === 'carousel-wrapper') {
            container.closest('.carousel-container')?.classList.add('fade-in-carousel');
        } else if (containerId === 'gallery-carousel') {
            container.classList.add('fade-in-gallery');
        } else if (containerId === 'presentaciones-carousel') {
            container.classList.add('fade-in-presentations');
        } else if (containerId === 'streaming-grid') {
            container.classList.add('fade-in-streaming');
        }
    }, 100);
    
    console.log(`✅ Completed ${containerId} with ${foundImages.length} images`);
}

// Carousel functions
function showSlide(index) {
    if (!slides || slides.length === 0) return;
    
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    
    if (dots && dots.length > 0) {
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    currentSlide = index;
}

function nextSlide() {
    if (!slides || slides.length === 0) return;
    const newIndex = (currentSlide + 1) % slides.length;
    showSlide(newIndex);
}

function prevSlide() {
    if (!slides || slides.length === 0) return;
    const newIndex = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(newIndex);
}

function startCarousel() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
    }
    
    if (slides && slides.length > 1) {
        carouselInterval = setInterval(nextSlide, 5000);
    }
}

function stopCarousel() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }
}

// Lightbox functionality
function openLightbox(index) {
    currentSlide = index;
    lightboxImage.src = slides[currentSlide].src;
    lightboxImage.alt = slides[currentSlide].alt;
    lightbox.classList.add('active');
    stopCarousel();
    document.body.style.overflow = 'hidden';
}

function openGalleryLightbox(src, alt) {
    lightboxImage.src = src;
    lightboxImage.alt = alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function maximizeSection(containerId, allImages, startIndex, folderPath) {
    console.log(`Maximizing section ${containerId} starting at image ${startIndex + 1}`);
    
    const lightbox = document.querySelector('.lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    let currentIndex = startIndex;
    
    function showImage(index) {
        const filename = allImages[index];
        const src = `${folderPath}/${filename}`;
        lightboxImage.src = src;
        lightboxImage.alt = `${containerId} image ${index + 1} of ${allImages.length}`;
    }
    
    function nextImage() {
        currentIndex = (currentIndex + 1) % allImages.length;
        showImage(currentIndex);
    }
    
    function prevImage() {
        currentIndex = (currentIndex - 1 + allImages.length) % allImages.length;
        showImage(currentIndex);
    }
    
    const lightboxPrev = document.querySelector('.lightbox-button.prev');
    const lightboxNext = document.querySelector('.lightbox-button.next');
    
    if (lightboxPrev) {
        lightboxPrev.onclick = prevImage;
    }
    
    if (lightboxNext) {
        lightboxNext.onclick = nextImage;
    }
    
    showImage(currentIndex);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    const keyHandler = (e) => {
        if (lightbox.classList.contains('active')) {
            switch (e.key) {
                case 'ArrowLeft':
                    prevImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
                case 'Escape':
                    closeLightbox();
                    document.removeEventListener('keydown', keyHandler);
                    break;
            }
        }
    };
    
    document.addEventListener('keydown', keyHandler);
}

function closeLightbox() {
    lightbox.classList.remove('active');
    startCarousel();
    document.body.style.overflow = '';
}

function navigateLightbox(direction) {
    if (slides.length > 0) {
        currentSlide = (currentSlide + direction + slides.length) % slides.length;
        lightboxImage.src = slides[currentSlide].src;
        lightboxImage.alt = slides[currentSlide].alt;
        showSlide(currentSlide);
    }
}

// Setup touch support for main carousel
function setupMainCarouselTouch() {
    const carouselWrapper = document.getElementById('carousel-wrapper');
    if (!carouselWrapper) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    
    carouselWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        stopCarousel();
    }, { passive: true });
    
    carouselWrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleMainCarouselSwipe();
        startCarousel();
    }, { passive: true });
    
    function handleMainCarouselSwipe() {
        const swipeThreshold = 50;
        const swipeDistanceX = Math.abs(touchEndX - touchStartX);
        const swipeDistanceY = Math.abs(touchEndY - touchStartY);
        
        if (swipeDistanceX > swipeThreshold && swipeDistanceX > swipeDistanceY) {
            if (touchEndX < touchStartX) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }
}


// Simple initialization
document.addEventListener('DOMContentLoaded', async () => {
    feather.replace();
    
    console.log('🚀 Starting simple image loading...');
    
    try {
        console.log('🚀 Loading all sections in parallel...');
        
        const loadingPromises = [
            loadImages('carousel-wrapper', true),
            loadImages('gallery-carousel'),
            loadImages('presentaciones-carousel'),
            loadImages('streaming-grid')
        ];
        
        await Promise.all(loadingPromises);
        
        console.log('✅ All sections loaded in parallel');
        
        // Initialize main carousel
        setTimeout(() => {
            slides = document.querySelectorAll('.carousel-slide');
            dots = document.querySelectorAll('.carousel-dot');
            
            if (slides.length > 0) {
                showSlide(0);
                startCarousel();
                setupMainCarouselTouch();
            }
        }, 500);
        
        
    } catch (error) {
        console.error('❌ Error loading images:', error);
    }
    
    // Event listeners
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    }
    
    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => navigateLightbox(1));
    }
    
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('active')) {
            switch (e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    navigateLightbox(-1);
                    break;
                case 'ArrowRight':
                    navigateLightbox(1);
                    break;
            }
        }
    });
    
    // Mobile-specific optimizations
    if (window.innerWidth <= 768) {
        document.body.classList.add('mobile-device');
    }
});
