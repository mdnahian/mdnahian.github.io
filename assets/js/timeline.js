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
            this.renderTimeline();
            this.setupAnimations();
        }
    }
    
    async loadTimelineData() {
        try {
            const response = await fetch('data/timeline.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.timelineData = await response.json();
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
            this.timelineContainer.appendChild(timelineItem);
        });
    }
    
    createTimelineItem(item, index) {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item fade-in';
        timelineItem.dataset.type = item.type;
        
        const iconClass = this.getIconClass(item.type);
        
        timelineItem.innerHTML = `
            <div class="timeline-date">
                <i class="${iconClass}"></i>
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
                    const items = Array.from(this.timelineContainer.querySelectorAll('.timeline-item'));
                    const index = items.indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }
            });
        }, observerOptions);
        
        // Observe all timeline items
        const timelineItems = this.timelineContainer.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            observer.observe(item);
        });
        
        // Add hover effects
        this.addHoverEffects();
    }
    
    addHoverEffects() {
        const timelineItems = this.timelineContainer.querySelectorAll('.timeline-item');
        
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
        const items = this.timelineContainer.querySelectorAll('.timeline-item');
        
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
        const items = this.timelineContainer.querySelectorAll('.timeline-item');
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
        
        @media (max-width: 768px) {
            .tech-tags {
                gap: 0.2rem;
            }
            
            .tech-tag {
                font-size: 0.7rem;
                padding: 0.2rem 0.5rem;
            }
            
            .timeline-image img {
                max-height: 100px;
            }
            
            .timeline-title {
                font-size: 1rem;
            }
            
            .timeline-description {
                font-size: 0.85rem;
            }
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