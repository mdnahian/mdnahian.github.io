// Current Projects functionality
class CurrentProjects {
    constructor() {
        this.projectsContainer = document.querySelector('.projects-grid');
        this.projectsData = [];
        this.init();
    }
    
    async init() {
        if (this.projectsContainer) {
            await this.loadProjectsData();
            this.renderProjects();
        }
    }
    
    async loadProjectsData() {
        try {
            const response = await fetch('data/current_projects.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.projectsData = await response.json();
        } catch (error) {
            console.error('Error loading current projects data:', error);
            this.projectsData = [];
            this.showError();
        }
    }
    
    showError() {
        this.projectsContainer.innerHTML = `
            <div class="projects-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load current projects</h3>
                <p>There was an error loading the projects data. Please try again later.</p>
            </div>
        `;
    }
    
    renderProjects() {
        // Clear existing content
        this.projectsContainer.innerHTML = '';
        
        // Add all project items
        this.projectsData.forEach((project, index) => {
            const projectCard = this.createProjectCard(project, false);
            this.projectsContainer.appendChild(projectCard);
        });
    }
    
    createProjectCard(project, isFeatured) {
        const div = document.createElement('div');
        div.className = `project-card${isFeatured ? ' featured' : ''}`;
        
        const techTags = project.technologies.map(tech => 
            `<span class="tech-tag">${tech}</span>`
        ).join('');
        
        div.innerHTML = `
            ${project.image ? `
                <div class="project-image">
                    <img src="${project.image}" alt="${project.title}" loading="lazy">
                    ${project.link ? `
                        <div class="project-overlay">
                            <a href="${project.link}" target="_blank" class="project-link">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
            <div class="project-content">
                <div class="project-header">
                    <h3 class="project-title">${project.title}</h3>
                </div>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">
                    ${techTags}
                </div>
                ${project.link ? `
                    <div class="project-links">
                        <a href="${project.link}" target="_blank" class="btn btn-small btn-secondary">
                            <i class="fas fa-external-link-alt" style="margin-right: 0.5rem;"></i>
                            View Project
                        </a>
                    </div>
                ` : ''}
            </div>
        `;
        
        return div;
    }
}

// Initialize current projects when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.projects-grid')) {
        const currentProjects = new CurrentProjects();
    }
}); 