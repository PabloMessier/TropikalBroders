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

// Test if image exists with explicit debugging and timeout
function imageExists(src) {
    return new Promise((resolve) => {
        const img = new Image();
        const timeout = setTimeout(() => {
            console.log(`⏰ Timeout for: ${src}`);
            resolve(false);
        }, 3000); // 3 second timeout
        
        img.onload = () => {
            clearTimeout(timeout);
            console.log(`✅ Image loaded: ${src}`);
            resolve(true);
        };
        
        img.onerror = () => {
            clearTimeout(timeout);
            console.log(`❌ Image failed: ${src}`);
            resolve(false);
        };
        
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
    } else if (containerId === 'donde-jose-carousel') {
        prevBtn = document.getElementById('donde-jose-prev');
        nextBtn = document.getElementById('donde-jose-next');
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
    
    // Determine prefix - improved mapping
    let prefix = '';
    if (folderPath === 'images/carousel') prefix = 'carousel';
    else if (folderPath === 'images/gallery') prefix = 'gallery';
    else if (folderPath === 'images/donde_jose') prefix = 'party';
    else if (folderPath === 'images/presentaciones') prefix = 'presentation';
    else if (folderPath === 'images/streaming_music') prefix = 'streaming';
    
    console.log(`Container: ${containerId} | Folder: ${folderPath} | Using prefix: ${prefix}`);
    
    if (!prefix) {
        console.error(`No prefix found for folder: ${folderPath}`);
        // Show error message in container
        container.innerHTML = '<div class="loading-indicator">Error: No se pudo determinar el prefijo para las imágenes</div>';
        return;
    }
    
    const foundImages = [];
    const batchSize = 10; // Reduced batch size for better performance
    const maxImages = 50;
    
    console.log(`Starting to search for images with prefix: ${prefix}`);
    
    for (let startIndex = 1; startIndex <= maxImages; startIndex += batchSize) {
        const endIndex = Math.min(startIndex + batchSize - 1, maxImages);
        const batch = [];
        
        console.log(`Processing batch ${startIndex}-${endIndex} for ${containerId}`);
        
        for (let i = startIndex; i <= endIndex; i++) {
            // Handle different naming conventions
            let filename;
            if (prefix === 'party') {
                filename = `${prefix}${i}.jpg`; // party1.jpg, party2.jpg, etc.
            } else {
                filename = `${prefix}${String(i).padStart(2, '0')}.jpg`; // gallery01.jpg, etc.
            }
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
        
        // More lenient exit condition
        if (consecutiveMisses >= 5 && foundImages.length > 0) {
            console.log(`Stopping search after ${consecutiveMisses} consecutive misses`);
            break;
        }
    }
    
    console.log(`Found ${foundImages.length} images for ${containerId}`);
    
    // Remove loading indicator
    container.innerHTML = '';
    
    if (foundImages.length === 0) {
        console.warn(`No images found for ${containerId}, trying fallback method...`);
        
        // Try fallback for gallery sections
        if (containerId === 'gallery-carousel') {
            const success = await loadGalleryImagesSimple(containerId, folderPath, 'gallery');
            if (success) return;
        } else if (containerId === 'donde-jose-carousel') {
            const success = await loadGalleryImagesSimple(containerId, folderPath, 'party');
            if (success) return;
        } else if (containerId === 'presentaciones-carousel') {
            const success = await loadGalleryImagesSimple(containerId, folderPath, 'presentation');
            if (success) return;
        }
        
        container.innerHTML = '<div class="loading-indicator">No se encontraron imágenes en esta sección</div>';
        return;
    }
    
    // Add images to container
    const isGalleryCarousel = containerId === 'gallery-carousel' || containerId === 'donde-jose-carousel' || containerId === 'presentaciones-carousel';
    
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
        } else if (containerId === 'donde-jose-carousel') {
            container.classList.add('fade-in-donde-jose');
        } else if (containerId === 'presentaciones-carousel') {
            container.classList.add('fade-in-presentations');
        } else if (containerId === 'streaming-grid') {
            container.classList.add('fade-in-streaming');
        }
    }, 100);
    
    console.log(`✅ Completed ${containerId} with ${foundImages.length} images`);
}

// Simpler image loading fallback for galleries
async function loadGalleryImagesSimple(containerId, folderPath, prefix, maxCount = 50) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    console.log(`🔄 Fallback loading for ${containerId} with prefix ${prefix}`);
    
    const foundImages = [];
    
    // Try to load images synchronously to avoid timeout issues
    for (let i = 1; i <= maxCount; i++) {
        // Handle different naming conventions
        let filename;
        if (prefix === 'party') {
            filename = `${prefix}${i}.jpg`; // party1.jpg, party2.jpg, etc.
        } else {
            filename = `${prefix}${String(i).padStart(2, '0')}.jpg`; // gallery01.jpg, etc.
        }
        const imagePath = `${folderPath}/${filename}`;
        
        try {
            const exists = await imageExists(imagePath);
            if (exists) {
                foundImages.push(filename);
                console.log(`✅ Simple found: ${imagePath}`);
            } else {
                // If we miss 3 consecutive images, we probably reached the end
                if (i > 3 && foundImages.length === 0) break;
                if (foundImages.length > 0 && (i - foundImages.length) > 5) break;
            }
        } catch (error) {
            console.log(`❌ Error checking ${imagePath}:`, error);
        }
    }
    
    console.log(`Simple method found ${foundImages.length} images for ${containerId}`);
    
    if (foundImages.length > 0) {
        // Clear container and add images
        container.innerHTML = '';
        
        foundImages.forEach((filename, index) => {
            const img = document.createElement('img');
            const src = `${folderPath}/${filename}`;
            
            img.src = src;
            img.alt = `${containerId} image ${index + 1}`;
            img.className = `gallery-carousel-slide ${index === 0 ? 'active' : ''}`;
            img.addEventListener('click', () => {
                const slides = container.querySelectorAll('.gallery-carousel-slide');
                const activeSlide = container.querySelector('.gallery-carousel-slide.active');
                const currentIndex = Array.from(slides).indexOf(activeSlide);
                maximizeSection(containerId, foundImages, currentIndex, folderPath);
            });
            
            container.appendChild(img);
        });
        
        // Setup carousel navigation
        setTimeout(() => {
            setupGalleryCarousel(containerId);
        }, 300);
        
        return true;
    }
    
    return false;
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
    
    // Initialize music player asynchronously
    loadMusicPlaylist().then(() => {
        console.log('🎵 Music player initialized');
    }).catch(error => {
        console.error('🎵 Music player initialization failed:', error);
    });
    setupMusicPlayer();
    
    try {
        console.log('🚀 Loading all sections in parallel...');
        
        const loadingPromises = [
            loadImages('carousel-wrapper', true),
            loadImages('gallery-carousel'),
            loadImages('donde-jose-carousel'),
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

// Prevent auto-scroll to the button on page load
window.scrollTo({ top: 0, behavior: 'auto' });

// Ensure no auto-scroll on page load
window.addEventListener('load', () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
});

// Removed scroll listener - back to top button is always visible

// Music Player Functionality
let musicFiles = []; // Will be populated dynamically
let currentTrack = null;
const audioPlayer = document.getElementById('audio-player');
const musicPlaylist = document.getElementById('music-playlist');

// Function to check if a music file exists
async function musicFileExists(filePath) {
    return new Promise((resolve) => {
        const audio = new Audio();
        audio.oncanplaythrough = () => resolve(true);
        audio.onerror = () => resolve(false);
        audio.onabort = () => resolve(false);
        
        // Set a timeout to avoid hanging
        const timeout = setTimeout(() => {
            resolve(false);
        }, 3000);
        
        audio.addEventListener('loadeddata', () => {
            clearTimeout(timeout);
            resolve(true);
        });
        
        audio.src = filePath;
    });
}

// Function to discover music files dynamically
async function discoverMusicFiles() {
    console.log('🎵 Starting comprehensive music file discovery...');
    
    const foundFiles = [];
    
    // Known existing files - this list should capture all current files
    const knownFiles = [
        "Amanze-arn4l2 ft Tropikal.wav",
        "Assare ft Freezy Fromx (MSTR 2025).wav",
        "Lido Pimienta - Eso Que Tu Haces (Tropikal Broders & Pablo Messier Remix).wav",
        "Pablo Messier - Lavoe.wav",
        "Tropikal Broders & Pablo Messier - Cumbia.wav",
        "Tropikal Broders & Pablo Messier - El Espeluque.wav",
        "Tropikal Broders & Pablo Messier - Mambo Bado.wav",
        "Tropikal Broders - Amazonas.wav",
        "Tropikal Broders - Ethnic.wav"
    ];
    
    // Test all known files first
    console.log('🎵 Testing known files...');
    for (const filename of knownFiles) {
        const filePath = `music/${filename}`;
        const exists = await musicFileExists(filePath);
        if (exists) {
            console.log(`✅ Found known file: ${filename}`);
            foundFiles.push(filename);
        } else {
            console.log(`❌ Known file not found: ${filename}`);
        }
    }
    
    // Generate potential new filenames based on common patterns
    const artistPatterns = [
        "Assare", "Freezy Fromx", "Tropikal Broders", "Pablo Messier", 
        "Lido Pimienta", "Amanze", "MSTR", "Tropikal"
    ];
    
    const collaborationWords = ["ft", "feat", "featuring", "&", "x", "vs"];
    const yearPattern = ["2025", "2024", "2023"];
    const trackWords = ["Track", "Song", "Remix", "Mix", "Demo", "New", "Latest"];
    
    // Generate combinations for potential new files
    const potentialNewFiles = [];
    
    // Single artist patterns
    for (const artist of artistPatterns) {
        for (const year of yearPattern) {
            potentialNewFiles.push(`${artist} (${year}).wav`);
            potentialNewFiles.push(`${artist} - ${year}.wav`);
            for (const track of trackWords) {
                potentialNewFiles.push(`${artist} - ${track} ${year}.wav`);
                potentialNewFiles.push(`${artist} ${track} (${year}).wav`);
            }
        }
    }
    
    // Collaboration patterns
    for (let i = 0; i < artistPatterns.length; i++) {
        for (let j = i + 1; j < artistPatterns.length; j++) {
            for (const collab of collaborationWords) {
                for (const year of yearPattern) {
                    potentialNewFiles.push(`${artistPatterns[i]} ${collab} ${artistPatterns[j]} (${year}).wav`);
                    potentialNewFiles.push(`${artistPatterns[i]} ${collab} ${artistPatterns[j]} (MSTR ${year}).wav`);
                }
            }
        }
    }
    
    // Test potential new files in batches
    console.log(`🎵 Testing ${potentialNewFiles.length} potential new files...`);
    const batchSize = 25;
    let totalTested = knownFiles.length;
    
    for (let i = 0; i < potentialNewFiles.length; i += batchSize) {
        const batch = potentialNewFiles.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (filename) => {
            // Skip if already found
            if (foundFiles.includes(filename)) return null;
            
            const filePath = `music/${filename}`;
            const exists = await musicFileExists(filePath);
            totalTested++;
            
            if (exists) {
                console.log(`✅ DISCOVERED NEW FILE: ${filename}`);
                return filename;
            }
            return null;
        });
        
        const batchResults = await Promise.all(batchPromises);
        const validFiles = batchResults.filter(file => file !== null);
        foundFiles.push(...validFiles);
        
        // Show progress
        if (i % (batchSize * 3) === 0) {
            console.log(`🔍 Discovery progress: tested ${totalTested} files, found ${foundFiles.length} total...`);
        }
        
        // Small delay for browser performance
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    console.log(`🎵 Music discovery complete!`);
    console.log(`📁 Total files found: ${foundFiles.length}`);
    console.log(`📋 File list:`, foundFiles.map(f => `  • ${f}`).join('\n'));
    
    return foundFiles;
}

async function loadMusicPlaylist() {
    if (!musicPlaylist) return;
    
    // Show loading indicator
    musicPlaylist.innerHTML = '<div class="loading-indicator">Descubriendo música...</div>';
    
    try {
        // Discover music files dynamically
        musicFiles = await discoverMusicFiles();
        
        if (musicFiles.length === 0) {
            musicPlaylist.innerHTML = '<div class="loading-indicator">No se encontraron archivos de música</div>';
            return;
        }
        
        musicPlaylist.innerHTML = '';
        
        musicFiles.forEach((filename, index) => {
            const trackElement = document.createElement('div');
            trackElement.className = 'music-track';
            trackElement.dataset.index = index;
            trackElement.dataset.filename = filename;
            
            // Clean up filename for display
            const displayName = filename
                .replace('.wav', '')
                .replace(/Tropikal Broders & Pablo Messier - /, '')
                .replace(/Tropikal Broders - /, '')
                .replace(/Pablo Messier - /, '');
            
            trackElement.innerHTML = `
                <div class="music-track-icon">
                    <i data-feather="music"></i>
                </div>
                <div class="music-track-name">${displayName}</div>
            `;
            
            trackElement.addEventListener('click', () => playTrack(index, filename, displayName));
            musicPlaylist.appendChild(trackElement);
        });
        
        // Update feather icons
        feather.replace();
        
        console.log(`🎵 Playlist loaded with ${musicFiles.length} tracks`);
        
    } catch (error) {
        console.error('Error loading music playlist:', error);
        musicPlaylist.innerHTML = '<div class="loading-indicator">Error al cargar la música</div>';
    }
}

function playTrack(index, filename, displayName) {
    // Update active track styling
    document.querySelectorAll('.music-track').forEach(track => {
        track.classList.remove('active');
    });
    
    const selectedTrack = document.querySelector(`[data-index="${index}"]`);
    if (selectedTrack) {
        selectedTrack.classList.add('active');
    }
    
    // Update audio player
    if (audioPlayer) {
        audioPlayer.src = `music/${filename}`;
        audioPlayer.load();
        
        // Auto-play the track
        audioPlayer.play().catch(error => {
            console.log('Auto-play prevented by browser:', error);
        });
    }
    
    currentTrack = index;
}

function setupMusicPlayer() {
    if (!audioPlayer) return;
    
    // Handle track end
    audioPlayer.addEventListener('ended', () => {
        // Remove active styling
        document.querySelectorAll('.music-track').forEach(track => {
            track.classList.remove('active');
        });
        
        currentTrack = null;
    });
    
    // Handle play/pause state
    audioPlayer.addEventListener('play', () => {
        // Track is playing - visual feedback already handled by active class
    });
    
    audioPlayer.addEventListener('pause', () => {
        // Track is paused - visual feedback already handled by active class
    });
    
    // Handle errors
    audioPlayer.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
    });
}

// Function to refresh music playlist (can be called manually)
async function refreshMusicPlaylist() {
    console.log('🔄 Refreshing music playlist...');
    await loadMusicPlaylist();
}

// Global test functions for debugging
window.testMusicDiscovery = async function() {
    console.clear();
    console.log('🧪 TESTING MUSIC DISCOVERY SYSTEM');
    console.log('================================');
    
    try {
        // Test the new file specifically
        const newFile = "Assare ft Freezy Fromx (MSTR 2025).wav";
        const newFileExists = await musicFileExists(`music/${newFile}`);
        console.log(`🎯 Testing new file "${newFile}": ${newFileExists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
        
        // Run full discovery
        const files = await discoverMusicFiles();
        console.log(`\n📊 DISCOVERY RESULTS:`);
        console.log(`   Total files found: ${files.length}`);
        console.log(`   Includes new file: ${files.includes(newFile) ? '✅ YES' : '❌ NO'}`);
        
        // Test music player update
        console.log(`\n🎵 UPDATING MUSIC PLAYER...`);
        await loadMusicPlaylist();
        
        return files;
    } catch (error) {
        console.error('❌ Discovery test failed:', error);
        return [];
    }
};

window.testSpecificFile = async function(filename) {
    const exists = await musicFileExists(`music/${filename}`);
    console.log(`Testing "${filename}": ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    return exists;
};

// Global video test functions for debugging
window.testVideoDiscovery = async function() {
    console.clear();
    console.log('🧪 TESTING VIDEO DISCOVERY SYSTEM');
    console.log('=================================');
    
    try {
        // Test the new video specifically
        const newVideo = "TROPIKAL VISUAL.mp4";
        const newVideoExists = await videoFileExists(`video/${newVideo}`);
        console.log(`🎯 Testing new video "${newVideo}": ${newVideoExists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
        
        // Run full discovery
        const videos = await discoverVideoFiles();
        console.log(`\n📊 DISCOVERY RESULTS:`);
        console.log(`   Total videos found: ${videos.length}`);
        console.log(`   Includes new video: ${videos.includes(newVideo) ? '✅ YES' : '❌ NO'}`);
        
        // Test video player update
        console.log(`\n🎬 UPDATING VIDEO PLAYER...`);
        await loadVideoPlaylist();
        
        return videos;
    } catch (error) {
        console.error('❌ Video discovery test failed:', error);
        return [];
    }
};

window.testSpecificVideo = async function(filename) {
    const exists = await videoFileExists(`video/${filename}`);
    console.log(`Testing video "${filename}": ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    return exists;
};

// Global functions for testing (accessible from browser console)
window.tropikal = {
    // Music functions
    refreshMusic: refreshMusicPlaylist,
    discoverMusic: discoverMusicFiles,
    getCurrentMusicFiles: () => musicFiles,
    testMusicFile: musicFileExists,
    testDiscovery: window.testMusicDiscovery,
    testFile: window.testSpecificFile,
    
    // Video functions
    refreshVideos: loadVideoPlaylist,
    discoverVideos: discoverVideoFiles,
    getCurrentVideoFiles: () => videoFiles,
    testVideoFile: videoFileExists,
    playVideo: playVideo,
    testVideoDiscovery: window.testVideoDiscovery,
    testVideo: window.testSpecificVideo
};

console.log('🎵🎬 Tropikal media player loaded. Use window.tropikal.testDiscovery() for music or window.tropikal.refreshVideos() for videos.');

// === VIDEO PLAYER FUNCTIONALITY ===

let videoFiles = [];
let currentVideo = null;

// Function to check if a video file exists
async function videoFileExists(filePath) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        
        video.oncanplaythrough = () => {
            resolve(true);
        };
        
        video.onerror = () => {
            resolve(false);
        };
        
        // Set a timeout to avoid hanging
        setTimeout(() => resolve(false), 3000);
        
        video.src = filePath;
        video.load();
    });
}

// Function to discover video files dynamically
async function discoverVideoFiles() {
    console.log('🎬 Starting video file discovery...');
    
    const foundFiles = [];
    
    // Known existing files
    const knownFiles = [
        "tropical.mp4",
        "TROPIKAL VISUAL.mp4"
    ];
    
    // Test all known files first
    console.log('🎬 Testing known video files...');
    for (const filename of knownFiles) {
        const filePath = `video/${filename}`;
        const exists = await videoFileExists(filePath);
        if (exists) {
            console.log(`✅ Found known video: ${filename}`);
            foundFiles.push(filename);
        } else {
            console.log(`❌ Known video not found: ${filename}`);
        }
    }
    
    // Generate potential new filenames based on common patterns
    const videoPatterns = [
        "Tropikal", "TROPIKAL", "tropical", "Tropical", "Visual", "VISUAL",
        "Broders", "BRODERS", "Music", "MUSIC", "Video", "VIDEO",
        "Caribe", "Caribbean", "Salsa", "Cumbia", "Mambo"
    ];
    
    const videoWords = ["Video", "Visual", "Clip", "Performance", "Live", "Show", "Concert"];
    const yearPattern = ["2025", "2024", "2023"];
    
    // Generate combinations for potential new files
    const potentialNewFiles = [];
    
    // Single pattern videos
    for (const pattern of videoPatterns) {
        for (const year of yearPattern) {
            potentialNewFiles.push(`${pattern} ${year}.mp4`);
            potentialNewFiles.push(`${pattern} (${year}).mp4`);
            potentialNewFiles.push(`${pattern}_${year}.mp4`);
            for (const word of videoWords) {
                potentialNewFiles.push(`${pattern} ${word} ${year}.mp4`);
                potentialNewFiles.push(`${pattern} ${word} (${year}).mp4`);
            }
        }
    }
    
    // Artist collaboration patterns
    for (let i = 0; i < videoPatterns.length; i++) {
        for (let j = i + 1; j < videoPatterns.length; j++) {
            for (const year of yearPattern) {
                potentialNewFiles.push(`${videoPatterns[i]} & ${videoPatterns[j]} ${year}.mp4`);
                potentialNewFiles.push(`${videoPatterns[i]} x ${videoPatterns[j]} (${year}).mp4`);
            }
        }
    }
    
    // Test potential new files in batches
    console.log(`🎬 Testing ${potentialNewFiles.length} potential new video files...`);
    const batchSize = 20;
    let totalTested = knownFiles.length;
    
    for (let i = 0; i < potentialNewFiles.length; i += batchSize) {
        const batch = potentialNewFiles.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (filename) => {
            // Skip if already found
            if (foundFiles.includes(filename)) return null;
            
            const filePath = `video/${filename}`;
            const exists = await videoFileExists(filePath);
            totalTested++;
            
            if (exists) {
                console.log(`✅ DISCOVERED NEW VIDEO: ${filename}`);
                return filename;
            }
            return null;
        });
        
        const batchResults = await Promise.all(batchPromises);
        const validFiles = batchResults.filter(file => file !== null);
        foundFiles.push(...validFiles);
        
        // Show progress
        if (i % (batchSize * 2) === 0) {
            console.log(`🔍 Video discovery progress: tested ${totalTested} files, found ${foundFiles.length} total...`);
        }
        
        // Small delay for browser performance
        await new Promise(resolve => setTimeout(resolve, 15));
    }
    
    console.log(`🎬 Video discovery complete!`);
    console.log(`📁 Total videos found: ${foundFiles.length}`);
    console.log(`📋 Video list:`, foundFiles.map(f => `  • ${f}`).join('\n'));
    
    return foundFiles;
}

// Function to get a clean display name for videos
function getVideoDisplayName(filename) {
    // Remove file extension
    let name = filename.replace(/\.(mp4|avi|mov|wmv|flv|webm)$/i, '');
    
    // Handle specific naming patterns with descriptions
    if (name.toLowerCase().includes('tropikal visual')) {
        return {
            title: 'Tropikal Visual Experience',
            subtitle: 'Una experiencia visual completa'
        };
    }
    if (name.toLowerCase() === 'tropical') {
        return {
            title: 'Tropical Dreams',
            subtitle: 'El sueño tropical'
        };
    }
    
    // Clean up common patterns
    name = name.replace(/[-_]/g, ' ');
    name = name.replace(/\s+/g, ' ');
    name = name.trim();
    
    // Capitalize words
    const cleanName = name.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    
    return {
        title: cleanName,
        subtitle: 'Video de Tropikal Broders'
    };
}

// Function to load and display video playlist
async function loadVideoPlaylist() {
    console.log('🎬 Loading video playlist...');
    
    try {
        videoFiles = await discoverVideoFiles();
        const videoPlaylist = document.getElementById('video-playlist');
        const videoPlayer = document.getElementById('tropical-video');
        
        if (!videoPlaylist || !videoPlayer) {
            console.error('❌ Video playlist or player elements not found');
            return;
        }
        
        // Clear existing playlist
        videoPlaylist.innerHTML = '';
        
        if (videoFiles.length === 0) {
            videoPlaylist.innerHTML = '<p style="color: rgba(255, 255, 255, 0.7); text-align: center; padding: 1rem;">No hay videos disponibles</p>';
            return;
        }
        
        // Set first video as default if no current video
        if (!currentVideo && videoFiles.length > 0) {
            currentVideo = videoFiles[0];
            videoPlayer.src = `video/${currentVideo}`;
        }
        
        // Create playlist items
        videoFiles.forEach((filename, index) => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item';
            if (filename === currentVideo) {
                videoItem.classList.add('active');
            }
            
            const videoInfo = getVideoDisplayName(filename);
            
            videoItem.innerHTML = `
                <div class="music-track-icon">
                    <i data-feather="play"></i>
                </div>
                <div class="music-track-name">${videoInfo.title}</div>
            `;
            
            // Add click handler
            videoItem.addEventListener('click', () => {
                playVideo(filename);
            });
            
            videoPlaylist.appendChild(videoItem);
        });
        
        // Replace feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        
        console.log(`🎬 Video playlist loaded with ${videoFiles.length} videos`);
        
    } catch (error) {
        console.error('❌ Error loading video playlist:', error);
    }
}

// Function to play a specific video
function playVideo(filename) {
    const videoPlayer = document.getElementById('tropical-video');
    const videoItems = document.querySelectorAll('.video-item');
    
    if (!videoPlayer) {
        console.error('❌ Video player not found');
        return;
    }
    
    // Update current video
    currentVideo = filename;
    videoPlayer.src = `video/${filename}`;
    
    // Update active state in playlist
    videoItems.forEach((item, index) => {
        item.classList.remove('active');
        if (videoFiles[index] === filename) {
            item.classList.add('active');
        }
    });
    
    // Auto-play the new video
    videoPlayer.load();
    videoPlayer.play().catch(error => {
        console.log('Auto-play prevented:', error);
    });
    
    console.log(`🎬 Now playing: ${getVideoDisplayName(filename).title}`);
}

// Initialize video player when page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎬 Initializing video player...');
    await loadVideoPlaylist();
});

// === END VIDEO PLAYER FUNCTIONALITY ===
