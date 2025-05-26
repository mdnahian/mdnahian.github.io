// Timeline functionality for past work and projects
class Timeline {
    constructor() {
        this.timelineContainer = document.getElementById('timeline');
        this.timelineData = [];
        this.init();
    }
    
    async init() {
        if (this.timelineContainer) {
            await this.loadTimelineData();
            // Preserve the section header and add wrapper for timeline items
            const header = this.timelineContainer.querySelector('.section-header');
            this.timelineContainer.innerHTML = `
                ${header ? header.outerHTML : ''}
                <div class="timeline-wrapper"></div>
            `;
            this.timelineWrapper = this.timelineContainer.querySelector('.timeline-wrapper');
            this.renderTimeline();
            this.setupAnimations();
        }
    }
    
    sortTimelineData() {
        return this.timelineData.sort((a, b) => {
            // Convert dates to comparable format (YYYY-MM)
            const dateA = new Date(a.date + " 1"); // Add day to make valid date
            const dateB = new Date(b.date + " 1");
            // Sort in descending order (newest first)
            return dateB - dateA;
        });
    }
    
    async loadTimelineData() {
        try {
            const response = await fetch('data/timeline.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.timelineData = await response.json();
            // Sort the timeline data chronologically
            this.timelineData = this.sortTimelineData();
        } catch (error) {
            console.error('Error loading timeline data:', error);
            // Fallback to empty array or show error message
            this.timelineData = [];
            this.showError();
        }
    }
    
    showError() {
        this.timelineContainer.innerHTML = `
            <div class="timeline-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load timeline</h3>
                <p>There was an error loading the timeline data. Please try again later.</p>
            </div>
        `;
    }
    
    renderTimeline() {
        // Add all timeline items
        this.timelineData.forEach((item, index) => {
            const timelineItem = this.createTimelineItem(item, index);
            this.timelineWrapper.appendChild(timelineItem);
        });
    }
    
    createTimelineItem(item, index) {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item fade-in';
        timelineItem.dataset.type = item.type;
        
        timelineItem.innerHTML = `
            <div class="timeline-date">
                ${item.date}
            </div>
            <div class="timeline-content">
                <h3 class="timeline-title">${item.title}</h3>
                ${this.renderImage(item.image)}
                <p class="timeline-description">${item.description}</p>
                ${this.renderTechnologies(item.technologies)}
                ${this.renderLink(item.link)}
            </div>
        `;
        
        return timelineItem;
    }
    
    getIconClass(type) {
        const icons = {
            work: 'fas fa-briefcase',
            project: 'fas fa-code',
            education: 'fas fa-graduation-cap',
            achievement: 'fas fa-trophy'
        };
        return icons[type] || 'fas fa-circle';
    }
    
    renderImage(image) {
        if (!image) return '';
        
        return `
            <div class="timeline-image">
                <img src="${image}" alt="Project screenshot" loading="lazy" 
                     onerror="this.parentElement.style.display='none'" />
            </div>
        `;
    }
    
    renderTechnologies(technologies) {
        if (!technologies || technologies.length === 0) return '';
        
        const techTags = technologies.map(tech => 
            `<span class="tech-tag">${tech}</span>`
        ).join('');
        
        return `
            <div class="timeline-technologies">
                <div class="tech-tags">${techTags}</div>
            </div>
        `;
    }
    
    renderLink(link) {
        if (!link) return '';
        
        return `
            <div class="timeline-link">
                <a href="${link}" target="_blank" class="btn btn-small btn-secondary">
                    <i class="fas fa-external-link-alt" style="margin-right: 0.5rem;"></i>
                    View Project
                </a>
            </div>
        `;
    }
    
    setupAnimations() {
        // Intersection Observer for timeline animations
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Add staggered animation delay
                    const items = Array.from(this.timelineWrapper.querySelectorAll('.timeline-item'));
                    const index = items.indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }
            });
        }, observerOptions);
        
        // Observe all timeline items
        const timelineItems = this.timelineWrapper.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            observer.observe(item);
        });
        
        // Add hover effects
        this.addHoverEffects();
    }
    
    addHoverEffects() {
        const timelineItems = this.timelineWrapper.querySelectorAll('.timeline-item');
        
        timelineItems.forEach(item => {
            const content = item.querySelector('.timeline-content');
            
            item.addEventListener('mouseenter', () => {
                content.style.transform = 'translateY(-5px)';
                content.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
            });
            
            item.addEventListener('mouseleave', () => {
                content.style.transform = 'translateY(0)';
                content.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)';
            });
        });
    }
    
    // Method to filter timeline by type
    filterByType(type) {
        const items = this.timelineWrapper.querySelectorAll('.timeline-item');
        
        items.forEach(item => {
            if (type === 'all' || item.dataset.type === type) {
                item.style.display = 'flex';
                item.classList.add('fade-in');
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // Method to search timeline
    search(query) {
        const items = this.timelineWrapper.querySelectorAll('.timeline-item');
        const searchTerm = query.toLowerCase();
        
        items.forEach(item => {
            const title = item.querySelector('.timeline-title').textContent.toLowerCase();
            const description = item.querySelector('.timeline-description').textContent.toLowerCase();
            
            const matches = title.includes(searchTerm) || 
                          description.includes(searchTerm);
            
            if (matches || searchTerm === '') {
                item.style.display = 'flex';
                
                // Highlight matching text
                if (searchTerm !== '') {
                    this.highlightText(item, searchTerm);
                } else {
                    this.removeHighlight(item);
                }
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    highlightText(item, searchTerm) {
        const textElements = item.querySelectorAll('.timeline-title, .timeline-description');
        
        textElements.forEach(element => {
            const text = element.textContent;
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            const highlightedText = text.replace(regex, '<mark>$1</mark>');
            element.innerHTML = highlightedText;
        });
    }
    
    removeHighlight(item) {
        const highlightedElements = item.querySelectorAll('mark');
        highlightedElements.forEach(element => {
            element.outerHTML = element.textContent;
        });
    }
}

// Additional CSS for timeline-specific styles
function addTimelineStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .timeline-wrapper {
            position: relative;
            max-width: 1200px;
            margin: 0 auto;
            padding: 4rem 2rem;
        }

        /* Vertical timeline line */
        .timeline-wrapper::before {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            left: 50%;
            width: 2px;
            background-color: #e5e7eb;
            transform: translateX(-50%);
            border-left: 2px dashed #e5e7eb;
            background: none;
        }

        .timeline-item {
            position: relative;
            margin-bottom: 4rem;
            width: 100%;
            display: flex;
            justify-content: center;
        }

        .timeline-date {
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            background-color: #fff;
            color: var(--text-primary);
            padding: 0.5rem 1.5rem;
            border-radius: 20px;
            font-weight: 500;
            z-index: 1;
            border: 2px solid #e5e7eb;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .timeline-content {
            width: 100%;
            background: white;
            padding: 2rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-md);
            margin-top: 3rem;
            position: relative;
        }

        .timeline-item:nth-child(odd) .timeline-content {
            margin-left: auto;
            margin-right: 4rem;
        }

        .timeline-item:nth-child(even) .timeline-content {
            margin-right: auto;
            margin-left: 4rem;
        }

        @media (max-width: 768px) {
            .timeline-wrapper {
                padding: 1rem;
            }

            /* Hide the timeline line on mobile */
            .timeline-wrapper::before {
                display: none;
            }

            .timeline-item {
                margin-bottom: 2rem;
                display: block;
            }

            .timeline-date {
                display: none;
            }

            .timeline-content {
                width: 100%;
                margin: 0 !important;
                margin-top: 0 !important;
            }

            /* Reset alternating layout */
            .timeline-item:nth-child(odd) .timeline-content,
            .timeline-item:nth-child(even) .timeline-content {
                margin: 0 !important;
            }
        }
        
        .timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.5rem;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .timeline-organization {
            color: var(--primary-color);
            font-weight: 500;
            margin-bottom: 1rem;
            font-size: 0.9rem;
        }
        
        .timeline-type {
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 500;
            white-space: nowrap;
        }
        
        .timeline-type.work {
            background-color: #dbeafe;
            color: #1e40af;
        }
        
        .timeline-type.project {
            background-color: #dcfce7;
            color: #166534;
        }
        
        .timeline-type.education {
            background-color: #fef3c7;
            color: #92400e;
        }
        
        .timeline-type.achievement {
            background-color: #fce7f3;
            color: #be185d;
        }
        
        .timeline-technologies {
            margin: 1rem 0;
        }
        
        .tech-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        
        .timeline-achievements {
            margin: 1rem 0;
        }
        
        .timeline-achievements ul {
            margin: 0.5rem 0 0 1.5rem;
            padding: 0;
        }
        
        .timeline-achievements li {
            margin-bottom: 0.25rem;
            color: var(--text-secondary);
        }
        
        .timeline-link {
            margin-top: 1rem;
        }
        
        .timeline-date i {
            margin-right: 0.5rem;
        }
        
        .timeline-image {
            margin: 0.5rem 0;
            border-radius: 0.5rem;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            background-color: #f8f9fa;
        }
        
        .timeline-image img {
            width: 100%;
            height: auto;
            max-height: 120px;
            object-fit: contain;
            display: block;
            transition: transform 0.2s ease;
        }
        
        .timeline-image:hover img {
            transform: scale(1.02);
        }
        
        .timeline-title {
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }
        
        .timeline-description {
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            line-height: 1.4;
        }
        
        .timeline-technologies {
            margin: 0.5rem 0;
        }
        
        .tech-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.25rem;
            margin-top: 0.25rem;
        }
        
        .timeline-link {
            margin-top: 0.5rem;
        }
        
        /* Animation for timeline items */
        .timeline-item.fade-in {
            opacity: 0;
            transform: translateY(30px);
            animation: timelineSlideIn 0.6s ease forwards;
        }
        
        .timeline-item.visible {
            animation-play-state: running;
        }
        
        @keyframes timelineSlideIn {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Timeline error styles */
        .timeline-error {
            text-align: center;
            padding: 3rem;
            color: var(--text-secondary);
        }
        
        .timeline-error i {
            font-size: 3rem;
            color: var(--accent-color);
            margin-bottom: 1rem;
        }
        
        .timeline-error h3 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            color: var(--text-primary);
        }
        
        /* Highlight styles for search */
        mark {
            background-color: #fef08a;
            color: #854d0e;
            padding: 0.1rem 0.2rem;
            border-radius: 0.2rem;
        }
    `;
    document.head.appendChild(style);
}

// Initialize timeline when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('timeline')) {
        addTimelineStyles();
        const timeline = new Timeline();
        
        // Make timeline instance globally available for potential filtering/searching
        window.timeline = timeline;
    }
}); 