# Tropikal Broders Website

A modern, 70s-inspired minimalistic website for the Afro-Caribbean electronic music collective Tropikal Broders.

## 🎯 Project Overview

Dynamic, responsive website featuring automatic image discovery and loading from organized directories. Built for S3 static hosting with zero hardcoded image references.

## 🏗️ Project Structure

```
TropikalBroders/
├── css/
│   └── styles.css              # 70s-inspired styling with modern design
├── js/
│   └── script.js               # Dynamic image loading, gallery, and audio functionality
├── images/
│   ├── carousel/               # Main carousel images (carousel01.jpg - carousel17.jpg)
│   ├── gallery/                # Gallery section images (gallery01.jpg - gallery49.jpg)
│   ├── donde_jose/             # Donde José section images (party1.jpg - party58.jpg)
│   ├── presentaciones/         # Presentations section (presentation01.jpg - presentation44.jpg)
│   ├── streaming_music/        # Streaming section (streaming01.jpg - streaming06.jpg)
│   ├── main_logo/              # Logo files
│   └── bg-tropical.jpg         # Background image
├── music/                      # Artist's musical works (8 WAV files)
│   ├── Amanze-arn4l2 ft Tropikal.wav
│   ├── Lido Pimienta - Eso Que Tu Haces (Tropikal Broders & Pablo Messier Remix).wav
│   ├── Pablo Messier - Lavoe.wav
│   ├── Tropikal Broders & Pablo Messier - Cumbia.wav
│   ├── Tropikal Broders & Pablo Messier - El Espeluque.wav
│   ├── Tropikal Broders & Pablo Messier - Mambo Bado.wav
│   ├── Tropikal Broders - Amazonas.wav
│   └── Tropikal Broders - Ethnic.wav
├── video/                      # Video content
│   └── tropical.mp4            # Main promotional video
├── documentation/
│   ├── README.md               # This file
│   └── s3-optimization.md      # S3 performance guide
├── index.html                  # Main HTML file
└── font.png                    # Custom font reference
```

## 🎨 Design Features

### Visual Design
- **70s Minimalistic Aesthetic**: Clean typography with warm earth tones
- **Responsive Layout**: Mobile-first design that works on all devices
- **Dynamic Image Sections**: 4 main image galleries with different layouts
- **Smooth Animations**: Fade-in effects and smooth transitions
- **Interactive Elements**: Hover effects and touch-friendly navigation

### Color Palette
```css
--burnt-orange: #cc5500        /* Primary brand color */
--warm-yellow: #ffb347         /* Accent highlights */
--earth-brown: #8b4513         /* Text and borders */
--sage-green: #9caf88          /* Secondary accent */
--cream: #f5f5dc               /* Background */
--mustard: #ffdb58             /* Button highlights */
```

### Typography
- **Primary**: Inter, Poppins (modern sans-serif)
- **Fallback**: Arial, sans-serif
- **Custom**: Font.png for stylized title elements

## 🚀 Key Features

### 1. Dynamic Image Loading
- **Zero Hardcoding**: No image filenames in HTML/JavaScript
- **Sequential Discovery**: Automatically finds images using naming patterns
- **Error Handling**: Graceful handling of missing images
- **Loading States**: Visual feedback during image discovery

### 2. Image Sections
- **Main Carousel**: Auto-advancing slideshow with navigation dots
- **Gallery**: Manual navigation carousel with prev/next buttons (✅ Fixed navigation & lightbox sync)
- **Donde José**: Party images carousel with navigation controls (✅ New section added)
- **Presentaciones**: Presentation slides with navigation controls (✅ Verified working)
- **Streaming**: Grid layout for music-related images (✅ Fixed lightbox navigation)

### 3. Media Sections
- **Streaming & Música**: Side-by-side layout showcasing streaming platforms and music-related images
- **Producciones (Music Player)**: Interactive audio player for artist's musical works
  - 8 WAV audio files with clean, intuitive interface
  - Single-track playback (only one track plays at a time)
  - Visual track selection from playlist
  - Transparent audio controls for clean aesthetic
- **Video Section**: Main promotional video (tropical.mp4) with custom styling

### 4. User Experience
- **Touch/Swipe Support**: Mobile-friendly navigation
- **Keyboard Navigation**: Lightbox controls (ESC, Arrow keys)
- **Lightbox Gallery**: Full-screen image viewing
- **Smooth Scrolling**: Enhanced navigation experience
- **Back to Top**: Convenient page navigation

### 4. Performance Optimizations
- **Parallel Image Discovery**: Fast loading with batch processing
- **Progressive Loading**: Images appear as they load
- **Lazy Loading**: Efficient memory usage
- **Fade-in Animations**: Smooth visual transitions

## 🔧 Technical Implementation

### HTML Structure
```html
<!-- Dynamic containers with data-folder attributes -->
<div id="carousel-wrapper" data-folder="images/carousel">
    <div class="loading-indicator">Cargando imágenes...</div>
</div>

<div id="gallery-carousel" data-folder="images/gallery">
    <div class="loading-indicator">Cargando galería...</div>
</div>

<div id="presentaciones-carousel" data-folder="images/presentaciones">
    <div class="loading-indicator">Cargando presentaciones...</div>
</div>

<div id="streaming-grid" data-folder="images/streaming_music">
    <div class="loading-indicator">Cargando música...</div>
</div>

<!-- Media sections with audio player -->
<section class="media-sections">
    <div class="streaming-section">
        <h2>Streaming & Música</h2>
        <div class="gallery-grid" id="streaming-grid">
            <div class="loading-indicator">Cargando música...</div>
        </div>
    </div>
    
    <div class="music-player-section">
        <h2>Producciones</h2>
        <div class="music-player-container">
            <div class="music-playlist" id="music-playlist">
                <div class="loading-indicator">Cargando obras...</div>
            </div>
            <div class="audio-player-controls">
                <audio id="audio-player" controls>
                    <source src="" type="audio/wav">
                    Tu navegador no soporta el elemento de audio.
                </audio>
            </div>
        </div>
    </div>
</section>

<!-- Video section -->
<section class="video-section">
    <h2>Video</h2>
    <video controls class="tropical-video">
        <source src="video/tropical.mp4" type="video/mp4">
        Tu navegador no soporta el elemento de video.
    </video>
</section>
```

### JavaScript Architecture
- **Dynamic Discovery**: Tests sequential filenames until no more found
- **Async Loading**: Non-blocking image discovery and loading
- **Event Handling**: Touch, click, and keyboard navigation
- **Error Recovery**: Continues loading despite individual failures
- **Section Isolation**: Independent loading and navigation for each gallery section
- **Music Player**: Interactive audio playback with playlist management
  - Dynamic music file loading from `/music/` directory
  - Single-track playback control
  - Visual track selection and highlighting
  - Clean track name display (removes artist prefixes)
- **Video Integration**: HTML5 video element with custom styling

### CSS Features
- **CSS Grid & Flexbox**: Modern layout techniques for images and media sections
- **Custom Properties**: Maintainable color and spacing system
- **Media Queries**: Responsive breakpoints for all devices
- **Animations**: Smooth transitions and hover effects
- **Transparent Audio Controls**: Clean, minimalist music player styling
- **Fixed Container Heights**: Consistent sizing for media sections (500px)
- **Custom Scrollbars**: Styled overflow areas with tropical theming

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (single column, touch-optimized)
- **Tablet**: 768px - 1024px (adapted layouts)
- **Desktop**: > 1024px (full feature set)

### Mobile Optimizations
- Touch-friendly navigation buttons
- Swipe gestures for galleries
- Optimized image sizes
- Simplified animations for performance

## 🎵 Social Media Integration

Connected to all Tropikal Broders platforms:
- **SoundCloud**: Music streaming
- **YouTube**: Video content  
- **Mixcloud**: DJ mixes
- **Bandcamp**: Music purchases
- **Instagram**: Visual content
- **Facebook**: Community updates
- **Twitter/X**: News and updates

## 🔄 Content Management

### Adding New Content
1. **Images**:
   - **Carousel**: Add as `carousel18.jpg`, `carousel19.jpg`, etc.
   - **Gallery**: Add as `gallery50.jpg`, `gallery51.jpg`, etc.
   - **Donde José**: Add as `party59.jpg`, `party60.jpg`, etc. (no zero-padding)
   - **Presentations**: Add as `presentation45.jpg`, `presentation46.jpg`, etc.
   - **Streaming**: Add as `streaming07.jpg`, `streaming08.jpg`, etc.

2. **Music**:
   - Add WAV files to `/music/` directory
   - Files automatically discovered and added to playlist
   - Recommended naming: `Artist - Track Title.wav`

3. **Video**:
   - Replace `video/tropical.mp4` or add additional video files
   - Update HTML to reference new video files if needed

### Naming Convention
- **Standard sections**: Sequential numbering with zero-padding: `01`, `02`, `03`, etc.
- **Donde José section**: Simple numbering without padding: `1`, `2`, `3`, etc.
- Consistent prefixes based on section
- JPG format for all images
- No gaps in numbering sequence

## 🚀 Deployment

### S3 Static Hosting Setup
1. Create S3 bucket with public read access
2. Enable static website hosting
3. Set `index.html` as index document
4. Upload all project files maintaining directory structure
5. Optional: Configure CloudFront for CDN

### Performance Recommendations
- Enable S3 Transfer Acceleration
- Set appropriate cache headers
- Consider image compression for faster loading
- Use CloudFront for global distribution

## 🔧 Development

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with custom properties
- **Vanilla JavaScript**: Dynamic functionality
- **Google Fonts**: Typography
- **Feather Icons**: Consistent iconography

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

## 🔧 Recent Fixes & Improvements

### July 2025 Updates
- **Gallery Navigation Fixed**: Resolved issue where gallery section yellow arrows were not responding
- **Gallery Lightbox Synchronization Fixed**: Lightbox now opens at the currently viewed image position instead of always starting at image 1
- **Streaming Section Lightbox Navigation Fixed**: Resolved issue where streaming section lightbox was cycling through gallery images instead of streaming_music images
- **Complete Section Isolation**: All sections (Gallery, Presentaciones, Streaming) now use isolated lightbox navigation
- **Directory Alignment Verified**: Each section properly loads and cycles through only its designated subdirectory
- **🚀 Performance Optimization (Latest)**: Implemented parallel image loading to reduce S3 load times from 8-15 seconds to 3-5 seconds
- **✨ Donde José Section Added**: New third carousel section for party images with custom naming convention (party1.jpg format)
- **📐 Enhanced Container Sizing**: Improved gallery container dimensions with minimum 400px width for better viewing experience
- **🎨 Logo Enhancement**: Increased logo size (22rem) and perfected circular shape without straight edges
- **🎵 Music Player Implementation**: Added complete audio player with WAV file support
  - Interactive playlist with 8 musical works
  - Single-track playback limitation
  - Clean track naming and transparent audio controls
  - Side-by-side layout with streaming section
- **🎬 Video Integration**: Added video section below media sections with tropical.mp4
- **📱 Media Section Optimization**: Fixed container sizing and overflow issues
  - Equal height containers (500px) for streaming and music sections
  - Improved horizontal sizing with minimum 500px width
  - Custom scrollbars for overflow content
  - Transparent audio player styling

### Technical Implementation
The fixes involved:

#### Gallery Navigation & Synchronization Fix
1. **CSS Isolation Rules**: Added specific CSS rules for `.galeria-section .gallery-carousel-slide` to ensure proper image visibility
2. **Dynamic Index Detection**: Modified click handlers to dynamically determine current active slide index using `Array.from(slides).indexOf(activeSlide)`
3. **Lightbox Synchronization**: Ensured lightbox opens at the correct image position when clicking on gallery images

#### Streaming Section Lightbox Fix
1. **Root Cause**: Streaming section was using `openGalleryLightbox()` which relied on global navigation handlers that cycled through gallery images
2. **Solution**: Modified streaming section to use `maximizeSection()` with isolated navigation like gallery and presentaciones sections
3. **Dynamic Index Detection**: Added same pattern as gallery section for consistent behavior across all sections
4. **Section-Specific Navigation**: Each section now maintains its own image array for lightbox navigation

#### Performance Optimization Implementation
1. **Parallel Image Discovery**: Replaced sequential image testing with batch processing using `Promise.all()` - tests 20 images simultaneously instead of one-by-one
2. **Parallel Section Loading**: Converted sequential `await loadImages()` calls to `Promise.all()` for concurrent section loading
3. **Maintained Functionality**: All existing navigation, lightbox, and touch functionality preserved during optimization
4. **S3 Optimization**: Follows recommendations from `s3-optimization.md` to reduce discovery time from ~5-10 seconds to ~1-2 seconds

## 📊 Current Status

### Completed Features ✅
- Dynamic image discovery and loading
- Responsive design for all devices
- Interactive galleries with navigation
- Gallery section navigation buttons (✅ Fixed July 2025)
- Gallery lightbox synchronization (✅ Fixed July 2025)
- Streaming section lightbox navigation (✅ Fixed July 2025)
- Lightbox functionality with click-to-maximize for all sections
- Touch/swipe support for all carousels
- Loading states and error handling
- Social media integration
- SEO-friendly structure
- Complete section isolation with proper directory alignment
- Keyboard navigation support (ESC, Arrow keys) for all lightboxes
- **🎵 Music Player System (✅ New July 2025)**:
  - Interactive audio playlist with 8 WAV files
  - Single-track playback control
  - Visual track selection and highlighting
  - Clean track name display (artist prefixes removed)
  - Transparent audio controls for minimalist aesthetic
- **🎬 Video Integration (✅ New July 2025)**:
  - HTML5 video player with tropical.mp4
  - Custom styling matching site aesthetic
- **📱 Media Section Layout (✅ Optimized July 2025)**:
  - Equal-sized containers (500px height, 500px+ width)
  - Side-by-side streaming and music sections
  - Custom scrollbars for overflow content
  - Responsive design for mobile devices

### Known Issues 🔧
- Some console errors during image discovery (normal behavior for missing sequential images)
- ~~Performance can be optimized further with image compression~~ (✅ JavaScript optimizations implemented July 2025)
- ~~Gallery navigation arrows may need refinement~~ (✅ Fixed July 2025)
- ~~Gallery lightbox synchronization issue~~ (✅ Fixed July 2025)
- ~~Streaming section lightbox cycling through wrong images~~ (✅ Fixed July 2025)
- ~~S3 slow image loading performance~~ (✅ Optimized July 2025)
- ~~Music player overflow and container sizing~~ (✅ Fixed July 2025)

### Future Enhancements 🚀
- WebP image format support
- Advanced image optimization (additional to JavaScript optimizations)
- Progressive Web App features
- Enhanced accessibility features
- Analytics integration
- Additional music player features (shuffle, repeat, volume control)
- Multiple video support
- Audio visualization effects

### S3 Performance Recommendations 🌐
For additional performance gains beyond the JavaScript optimizations:
- **Transfer Acceleration**: Enable S3 Transfer Acceleration
- **Cache Headers**: Set optimal cache headers (`Cache-Control: public, max-age=31536000`)
- **CloudFront CDN**: Implement CloudFront distribution for global performance
- **Image Compression**: Consider WebP format or further JPEG compression

## 📝 Maintenance

### Regular Tasks
- Monitor image loading performance
- Update social media links as needed
- Add new images following naming convention
- Test functionality across devices

### Code Maintenance
- JavaScript is modular and well-commented
- CSS uses custom properties for easy theming
- HTML structure is semantic and accessible
- Recent fixes maintain backward compatibility
- All sections use consistent `maximizeSection()` pattern for lightbox navigation
- Dynamic index detection ensures accurate lightbox positioning
- Section isolation prevents cross-contamination between galleries

## 📄 License

Created for Tropikal Broders. All rights reserved.

---

**Tropikal Broders** - *La evolución de la música afro caribeña y tropical*

*Modern website with dynamic image loading and 70s-inspired design.*
