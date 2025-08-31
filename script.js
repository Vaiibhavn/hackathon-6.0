// Global state
let currentTab = 'home';
let isMobileMenuOpen = false;
let issues = [
    {
        id: 'VMC2025001',
        title: 'Pothole on Sayajigunj Road',
        category: 'Roads & Infrastructure',
        location: 'Sayajigunj Road near Baroda High School',
        status: 'in-progress',
        priority: 'high',
        date: '2025-01-10',
        lastUpdate: '2025-01-12',
        description: 'Large pothole causing traffic issues and potential vehicle damage near the school area.',
        assignedTo: 'Roads Department'
    },
    {
        id: 'VMC2025002',
        title: 'Broken Street Light',
        category: 'Street Lighting',
        location: 'Alkapuri Circle near City Gold Cinema',
        status: 'pending',
        priority: 'medium',
        date: '2025-01-10',
        lastUpdate: '2025-01-10',
        description: 'Street light not working, creating safety concerns at night in busy area.',
    },
    {
        id: 'VMC2025003',
        title: 'Water Leak',
        category: 'Water & Sewage',
        location: 'Fatehgunj Main Road',
        status: 'resolved',
        priority: 'high',
        date: '2025-01-09',
        lastUpdate: '2025-01-11',
        description: 'Water leak in front of residential building causing road damage.',
        assignedTo: 'Water Department'
    },
    {
        id: 'VMC2025004',
        title: 'Missed Garbage Collection',
        category: 'Waste Management',
        location: 'Manjalpur Area, Sector 1',
        status: 'in-progress',
        priority: 'low',
        date: '2025-01-09',
        lastUpdate: '2025-01-11',
        description: 'Garbage not collected for three days in residential area.',
        assignedTo: 'Sanitation Department'
    },
    {
        id: 'VMC2025005',
        title: 'Traffic Signal Malfunction',
        category: 'Traffic & Parking',
        location: 'RC Dutt Road & Productivity Road Junction',
        status: 'resolved',
        priority: 'urgent',
        date: '2025-01-08',
        lastUpdate: '2025-01-09',
        description: 'Traffic signal not working properly causing traffic congestion.',
        assignedTo: 'Traffic Department'
    }
];

// DOM Elements
const tabButtons = document.querySelectorAll('.nav-btn, .nav-btn-mobile');
const tabContents = document.querySelectorAll('.tab-content');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileNav = document.querySelector('.nav-mobile');
const issueForm = document.getElementById('issue-form');
const successMessage = document.getElementById('success-message');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const priorityFilter = document.getElementById('priority-filter');
const issuesList = document.getElementById('issues-list');
const resultsCount = document.getElementById('results-count');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    renderIssues();
    setupServiceCardClicks();
});

// Event Listeners Setup
function setupEventListeners() {
    // Tab navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            switchTab(tab);
        });
    });

    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    // Form submission
    issueForm.addEventListener('submit', handleFormSubmit);

    // Search and filter functionality
    searchInput.addEventListener('input', filterIssues);
    statusFilter.addEventListener('change', filterIssues);
    priorityFilter.addEventListener('change', filterIssues);

    // File upload click handler
    const fileUpload = document.querySelector('.file-upload');
    const fileInput = fileUpload.querySelector('input[type="file"]');
    
    fileUpload.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            const fileNames = Array.from(files).map(file => file.name).join(', ');
            fileUpload.querySelector('p').textContent = `Selected: ${fileNames}`;
        }
    });
}

// Tab switching functionality
function switchTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-tab') === tabName) {
            button.classList.add('active');
        }
    });

    // Update tab content
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    const activeTab = document.getElementById(`${tabName}-tab`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Close mobile menu if open
    if (isMobileMenuOpen) {
        toggleMobileMenu();
    }

    // Render issues if switching to track tab
    if (tabName === 'track') {
        renderIssues();
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
    mobileNav.classList.toggle('active');
    
    const icon = mobileMenuBtn.querySelector('i');
    icon.className = isMobileMenuOpen ? 'fas fa-times' : 'fas fa-bars';
}

// Service card click handlers
function setupServiceCardClicks() {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.getAttribute('data-category');
            switchTab('report');
            
            // Pre-select the category in the form
            setTimeout(() => {
                const categorySelect = document.getElementById('category');
                if (categorySelect) {
                    categorySelect.value = category;
                }
            }, 100);
        });
    });
}

// Form submission handler
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(issueForm);
    const issueData = {
        category: formData.get('category'),
        title: formData.get('title'),
        description: formData.get('description'),
        location: formData.get('location'),
        priority: formData.get('priority'),
        contactName: formData.get('contactName'),
        contactEmail: formData.get('contactEmail'),
        contactPhone: formData.get('contactPhone')
    };

    // Generate tracking ID
    const trackingId = generateTrackingId();
    
    // Create new issue
    const newIssue = {
        id: trackingId,
        title: issueData.title,
        category: getCategoryLabel(issueData.category),
        location: issueData.location,
        status: 'pending',
        priority: issueData.priority,
        date: new Date().toISOString().split('T')[0],
        lastUpdate: new Date().toISOString().split('T')[0],
        description: issueData.description
    };

    // Add to issues array
    issues.unshift(newIssue);

    // Show success message
    showSuccessMessage(trackingId);
}

// Generate tracking ID
function generateTrackingId() {
    const year = new Date().getFullYear();
    const number = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `VMC${year}${number}`;
}

// Get category label
function getCategoryLabel(value) {
    const categories = {
        'roads': 'Roads & Infrastructure',
        'water': 'Water & Sewage',
        'lighting': 'Street Lighting',
        'waste': 'Waste Management',
        'parks': 'Parks & Recreation',
        'traffic': 'Traffic & Parking',
        'noise': 'Noise Complaints',
        'other': 'Other'
    };
    return categories[value] || value;
}

// Show success message
function showSuccessMessage(trackingId) {
    issueForm.style.display = 'none';
    successMessage.classList.remove('hidden');
    document.getElementById('tracking-id').textContent = trackingId;
}

// Report new issue
function reportNewIssue() {
    issueForm.reset();
    issueForm.style.display = 'block';
    successMessage.classList.add('hidden');
    
    // Reset file upload text
    const fileUpload = document.querySelector('.file-upload p');
    fileUpload.textContent = 'Click to upload photos';
}

// Filter issues
function filterIssues() {
    const searchQuery = searchInput.value.toLowerCase();
    const statusFilterValue = statusFilter.value;
    const priorityFilterValue = priorityFilter.value;

    const filteredIssues = issues.filter(issue => {
        const matchesSearch = issue.id.toLowerCase().includes(searchQuery) ||
                             issue.title.toLowerCase().includes(searchQuery) ||
                             issue.location.toLowerCase().includes(searchQuery);
        const matchesStatus = statusFilterValue === 'all' || issue.status === statusFilterValue;
        const matchesPriority = priorityFilterValue === 'all' || issue.priority === priorityFilterValue;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });

    renderFilteredIssues(filteredIssues);
    updateResultsCount(filteredIssues.length, issues.length);
}

// Render issues
function renderIssues() {
    renderFilteredIssues(issues);
    updateResultsCount(issues.length, issues.length);
}

// Render filtered issues
function renderFilteredIssues(filteredIssues) {
    if (filteredIssues.length === 0) {
        issuesList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No Issues Found</h3>
                <p>No issues match your current search criteria. Try adjusting your filters.</p>
            </div>
        `;
        return;
    }

    issuesList.innerHTML = filteredIssues.map(issue => `
        <div class="issue-card">
            <div class="issue-header">
                <span class="issue-id">${issue.id}</span>
                <span class="status-badge status-${issue.status}">${issue.status.replace('-', ' ').toUpperCase()}</span>
                <span class="priority-badge priority-${issue.priority}">${issue.priority.toUpperCase()}</span>
            </div>
            <h3 class="issue-title">${issue.title}</h3>
            <p class="issue-description">${issue.description}</p>
            <div class="issue-meta">
                <div class="meta-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${issue.location}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span>Reported: ${issue.date}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span>Updated: ${issue.lastUpdate}</span>
                </div>
                ${issue.assignedTo ? `
                    <div class="meta-item">
                        <i class="fas fa-user"></i>
                        <span>Assigned to: ${issue.assignedTo}</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Update results count
function updateResultsCount(filtered, total) {
    resultsCount.textContent = `Showing ${filtered} of ${total} issues`;
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
}

// Initialize filters when track tab is opened
function initializeTrackTab() {
    searchInput.value = '';
    statusFilter.value = 'all';
    priorityFilter.value = 'all';
    renderIssues();
}