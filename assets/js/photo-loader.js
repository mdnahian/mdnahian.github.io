// Photo loader for S3 travel photos
class PhotoLoader {
    constructor() {
        this.bucketName = 'mdislam-ig-photos';
        this.region = 'us-east-1';
        this.baseUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com`;
        this.photos = [];
        this.filteredPhotos = [];
        this.currentPage = 0;
        this.photosPerPage = 12;
        this.currentFilter = 'all';
        this.isLoading = false;
        
        this.photoGrid = document.getElementById('photo-grid');
        this.loadMoreBtn = document.getElementById('load-more-btn');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        
        this.init();
    }
    
    async init() {
        try {
            await this.loadPhotoList();
            this.setupEventListeners();
            this.displayPhotos();
        } catch (error) {
            console.error('Error initializing photo loader:', error);
            this.showError();
        }
    }
    
    async loadPhotoList() {
        try {
            // Fetch the photo list from your S3 bucket
            const response = await fetch(`${this.baseUrl}/photos.json`);
            if (!response.ok) throw new Error('Failed to load photo list');
            
            const photoList = await response.json();
            
            // Transform the data into our photo format
            this.photos = photoList.map(filename => {
                // Extract date from filename (format: YYYYMMDD_HHMMSS.jpg)
                const dateParts = filename.match(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
                const date = dateParts ? 
                    new Date(
                        parseInt(dateParts[1]), // year
                        parseInt(dateParts[2]) - 1, // month (0-based)
                        parseInt(dateParts[3]), // day
                        parseInt(dateParts[4]), // hour
                        parseInt(dateParts[5]), // minute
                        parseInt(dateParts[6]) // second
                    ) : new Date();

                return {
                    id: filename,
                    filename: filename,
                    url: `${this.baseUrl}/${filename}`,
                    thumbnail: `${this.baseUrl}/thumbnails/${filename}`,
                    date: date,
                    caption: this.generateCaption(date)
                };
            });

            // Sort by date, newest first
            this.photos.sort((a, b) => b.date - a.date);
            this.filteredPhotos = [...this.photos];
        } catch (error) {
            console.error('Error loading photo list:', error);
            throw error;
        }
    }
    
    generateCaption(date) {
        return `Photo taken on ${this.formatDate(date)}`;
    }
    
    setupEventListeners() {
        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterChange(e.target.dataset.filter);
            });
        });
        
        // Load more button
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => {
                this.loadMorePhotos();
            });
        }
        
        // Intersection Observer for lazy loading
        this.setupLazyLoading();
    }
    
    handleFilterChange(filter) {
        // Update active filter button
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.currentFilter = filter;
        this.currentPage = 0;
        
        // Filter photos
        if (filter === 'all') {
            this.filteredPhotos = [...this.photos];
        } else {
            this.filteredPhotos = this.photos.filter(photo => photo.category === filter);
        }
        
        // Clear grid and display filtered photos
        this.clearPhotoGrid();
        this.displayPhotos();
    }
    
    displayPhotos() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingSpinner();
        
        // Simulate loading delay
        setTimeout(() => {
            const startIndex = this.currentPage * this.photosPerPage;
            const endIndex = startIndex + this.photosPerPage;
            const photosToShow = this.filteredPhotos.slice(startIndex, endIndex);
            
            if (photosToShow.length === 0 && this.currentPage === 0) {
                this.showNoPhotos();
                this.isLoading = false;
                return;
            }
            
            this.hideLoadingSpinner();
            this.renderPhotos(photosToShow);
            
            // Show/hide load more button
            const hasMorePhotos = endIndex < this.filteredPhotos.length;
            this.toggleLoadMoreButton(hasMorePhotos);
            
            this.isLoading = false;
        }, 500);
    }
    
    renderPhotos(photos) {
        photos.forEach(photo => {
            const photoElement = this.createPhotoElement(photo);
            this.photoGrid.appendChild(photoElement);
        });
        
        // Trigger fade-in animation
        setTimeout(() => {
            const newPhotos = this.photoGrid.querySelectorAll('.photo-item:not(.visible)');
            newPhotos.forEach(photo => {
                photo.classList.add('visible');
            });
        }, 100);
    }
    
    createPhotoElement(photo) {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item fade-in';
        
        photoItem.innerHTML = `
            <img 
                data-src="${photo.url}" 
                alt="${photo.caption}"
                class="lazy-load"
                loading="lazy"
            >
            <div class="photo-overlay">
                <p>${photo.caption}</p>
                <span class="photo-date">${this.formatDate(photo.date)}</span>
            </div>
        `;
        
        // Add click handler for lightbox
        photoItem.addEventListener('click', () => {
            this.openLightbox(photo);
        });
        
        return photoItem;
    }
    
    setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;
                    
                    if (src) {
                        img.src = src;
                        img.classList.add('loaded');
                        
                        img.onload = () => {
                            img.classList.add('fade-in-complete');
                        };
                        
                        img.onerror = () => {
                            img.src = this.getPlaceholderImage();
                            img.classList.add('error');
                        };
                        
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        // Observe new images
        const observeImages = () => {
            const lazyImages = document.querySelectorAll('.lazy-load:not(.loaded)');
            lazyImages.forEach(img => imageObserver.observe(img));
        };
        
        // Initial observation
        observeImages();
        
        // Re-observe when new images are added
        const gridObserver = new MutationObserver(() => {
            observeImages();
        });
        
        gridObserver.observe(this.photoGrid, {
            childList: true,
            subtree: true
        });
    }
    
    loadMorePhotos() {
        this.currentPage++;
        this.displayPhotos();
    }
    
    clearPhotoGrid() {
        const photoItems = this.photoGrid.querySelectorAll('.photo-item');
        photoItems.forEach(item => item.remove());
    }
    
    showLoadingSpinner() {
        const existingSpinner = this.photoGrid.querySelector('.loading-spinner');
        if (!existingSpinner) {
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            spinner.innerHTML = `
                <div class="spinner"></div>
                <p>Loading travel photos...</p>
            `;
            this.photoGrid.appendChild(spinner);
        }
    }
    
    hideLoadingSpinner() {
        const spinner = this.photoGrid.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    }
    
    showError() {
        this.photoGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load photos</h3>
                <p>There was an error loading the travel photos. Please try again later.</p>
                <button class="btn btn-primary" onclick="location.reload()">Retry</button>
            </div>
        `;
    }
    
    showNoPhotos() {
        this.photoGrid.innerHTML = `
            <div class="no-photos-message">
                <i class="fas fa-camera"></i>
                <h3>No photos found</h3>
                <p>No photos match the current filter. Try selecting a different category.</p>
            </div>
        `;
    }
    
    toggleLoadMoreButton(show) {
        if (this.loadMoreBtn) {
            this.loadMoreBtn.style.display = show ? 'block' : 'none';
        }
    }
    
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }
    
    getPlaceholderImage() {
        // Return a placeholder image URL or data URI
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
    }
    
    openLightbox(photo) {
        // Simple lightbox implementation
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close">&times;</button>
                <img src="${photo.url}" alt="${photo.caption}">
                <div class="lightbox-info">
                    <h3>${photo.caption}</h3>
                    <span class="lightbox-date">${this.formatDate(photo.date)}</span>
                </div>
            </div>
            <div class="lightbox-backdrop"></div>
        `;
        
        // Add styles
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const backdrop = lightbox.querySelector('.lightbox-backdrop');
        backdrop.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
        `;
        
        const content = lightbox.querySelector('.lightbox-content');
        content.style.cssText = `
            position: relative;
            max-width: 90vw;
            max-height: 90vh;
            background: white;
            border-radius: 0.5rem;
            overflow: hidden;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        `;
        
        const closeBtn = lightbox.querySelector('.lightbox-close');
        closeBtn.style.cssText = `
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 1.5rem;
            cursor: pointer;
            z-index: 1;
        `;
        
        const img = lightbox.querySelector('img');
        img.style.cssText = `
            width: 100%;
            height: auto;
            max-height: 70vh;
            object-fit: contain;
        `;
        
        const info = lightbox.querySelector('.lightbox-info');
        info.style.cssText = `
            padding: 1.5rem;
        `;
        
        document.body.appendChild(lightbox);
        
        // Animate in
        setTimeout(() => {
            lightbox.style.opacity = '1';
            content.style.transform = 'scale(1)';
        }, 10);
        
        // Close handlers
        const closeLightbox = () => {
            lightbox.style.opacity = '0';
            content.style.transform = 'scale(0.9)';
            setTimeout(() => lightbox.remove(), 300);
        };
        
        closeBtn.addEventListener('click', closeLightbox);
        backdrop.addEventListener('click', closeLightbox);
        
        // ESC key to close
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                closeLightbox();
                document.removeEventListener('keydown', handleKeydown);
            }
        };
        document.addEventListener('keydown', handleKeydown);
    }
}

// Initialize photo loader when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('photo-grid')) {
        new PhotoLoader();
    }
}); 