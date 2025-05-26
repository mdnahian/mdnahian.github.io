// Activities functionality
class Activities {
    constructor() {
        this.activitiesContainer = document.getElementById('activities-grid');
        this.activitiesData = [];
        this.init();
    }
    
    async init() {
        if (this.activitiesContainer) {
            await this.loadActivitiesData();
            this.renderActivities();
        }
    }
    
    async loadActivitiesData() {
        try {
            const response = await fetch('data/activities.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.activitiesData = await response.json();
        } catch (error) {
            console.error('Error loading activities data:', error);
            this.activitiesData = [];
            this.showError();
        }
    }
    
    showError() {
        this.activitiesContainer.innerHTML = `
            <div class="activities-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load activities</h3>
                <p>There was an error loading the activities data. Please try again later.</p>
            </div>
        `;
    }
    
    renderActivities() {
        // Clear existing content
        this.activitiesContainer.innerHTML = '';
        
        // Add all activity items
        this.activitiesData.forEach(activity => {
            const activityCard = this.createActivityCard(activity);
            this.activitiesContainer.appendChild(activityCard);
        });
    }
    
    createActivityCard(activity) {
        const div = document.createElement('div');
        div.className = 'activity-card fade-in';
        
        div.innerHTML = `
            ${activity.image ? `
                <div class="activity-image">
                    <img src="${activity.image}" alt="${activity.title}" loading="lazy">
                </div>
            ` : ''}
            <div class="activity-content">
                <h3 class="activity-title">${activity.title}</h3>
                ${activity.description.map(desc => `
                    <p class="activity-description">${desc}</p>
                `).join('')}
                ${activity.link ? `
                    <div class="activity-links">
                        <a href="${activity.link}" target="_blank" class="btn btn-small">
                            ${activity.text || 'Learn More'}
                        </a>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Set up intersection observer for fade-in animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        observer.observe(div);
        
        return div;
    }
}

// Initialize activities when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('activities-grid')) {
        const activities = new Activities();
    }
}); 