// Admin Dashboard JavaScript Functions

// Global variables
let currentUserId = null;
let isUserProfileMode = false;

// Pagination variables
let currentPage = 1;
let entriesPerPage = 10;
let totalEntries = 0;
let filteredData = [];

// User type update function
function updateUserType(selectElement, userId) {
    const newType = selectElement.value;
    const confirmMessage = newType === 'client' 
        ? `Are you sure you want to promote user ${userId} from Lead to Client?`
        : `Are you sure you want to change user ${userId} from Client to Lead?`;
    
    if (confirm(confirmMessage)) {
        // Update the role badge
        const row = selectElement.closest('tr');
        const roleBadge = row.querySelector('td:nth-child(3) span');
        
        if (newType === 'client') {
            roleBadge.className = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800';
            roleBadge.textContent = 'Client';
        } else {
            roleBadge.className = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800';
            roleBadge.textContent = 'Lead';
        }
        
        showNotification(`User ${userId} type updated to ${newType}`, 'success');
    } else {
        // Revert the selection
        selectElement.value = selectElement.value === 'client' ? 'lead' : 'client';
    }
}

// Update user view count
function updateUserViewCount() {
    const viewCount = document.getElementById('user-view-count').value;
    entriesPerPage = parseInt(viewCount);
    currentPage = 1;
    showNotification(`Showing ${viewCount} entries per page`, 'success');
}

// Case status update function
function updateCaseStatus(selectElement, userId) {
    const newStatus = selectElement.value;
    const oldStatus = userData[userId]?.caseStatus;
    
    // If status hasn't changed, do nothing
    if (newStatus === oldStatus) {
        return;
    }
    
    // Show custom confirmation modal
    showCaseStatusConfirmation(selectElement, userId, newStatus, oldStatus);
}

// Show custom case status confirmation modal
function showCaseStatusConfirmation(selectElement, userId, newStatus, oldStatus) {
    const user = userData[userId];
    const userName = user?.name || userId;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    modal.id = 'case-status-modal';
    
    modal.innerHTML = `
        <div class="relative top-20 mx-auto p-0 border w-96 shadow-lg rounded-lg bg-white">
            <div class="px-6 py-4 border-b border-gray-200">
                <div class="flex items-center">
                    <div class="flex items-center justify-center h-10 w-10 rounded-full bg-amber-100 mr-3">
                        <i class="fa-solid fa-exclamation-triangle text-amber-600"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900">Confirm Status Change</h3>
                </div>
            </div>
            
            <div class="px-6 py-4">
                <p class="text-sm text-gray-600 mb-4">
                    Are you sure you want to change the case status for <strong>${userName}</strong>?
                </p>
                
                <div class="bg-gray-50 rounded-lg p-3 mb-4">
                    <div class="flex items-center justify-between text-sm">
                        <div class="flex items-center">
                            <span class="text-gray-500 mr-2">From:</span>
                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClass(oldStatus)}">${getCaseStatusText(oldStatus)}</span>
                        </div>
                        <i class="fa-solid fa-arrow-right text-gray-400 mx-2"></i>
                        <div class="flex items-center">
                            <span class="text-gray-500 mr-2">To:</span>
                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClass(newStatus)}">${getCaseStatusText(newStatus)}</span>
                        </div>
                    </div>
                </div>
                
                <p class="text-xs text-gray-500">
                    This change will be logged and may trigger automated notifications to the client.
                </p>
            </div>
            
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button onclick="cancelStatusChange('${userId}', '${oldStatus}')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200">
                    Cancel
                </button>
                <button onclick="confirmStatusChange('${userId}', '${newStatus}')" class="px-4 py-2 text-sm font-medium text-white bg-law-blue hover:bg-blue-700 rounded-lg transition-colors duration-200">
                    <i class="fa-solid fa-check mr-2"></i>
                    Confirm Change
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// Get status color class helper
function getStatusColorClass(status) {
    const statusColors = {
        'not-started': 'bg-gray-100 text-gray-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        'under-review': 'bg-amber-100 text-amber-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800',
        'not-set': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
}

// Confirm the status change
function confirmStatusChange(userId, newStatus) {
    // Update the user data
    if (userData[userId]) {
        userData[userId].caseStatus = newStatus;
    }
    
    // Close modal
    const modal = document.getElementById('case-status-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
    
    // Refresh table to show updated status
    renderClientsTable();
    
    // Show success notification
    showNotification(`Case status updated to "${getCaseStatusText(newStatus)}" for ${userData[userId]?.name || userId}`, 'success');
}

// Cancel the status change
function cancelStatusChange(userId, oldStatus) {
    // Revert the select element
    const selectElements = document.querySelectorAll(`select[onchange*="${userId}"]`);
    selectElements.forEach(select => {
        select.value = oldStatus;
    });
    
    // Close modal
    const modal = document.getElementById('case-status-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Helper function to get case status display text
function getCaseStatusText(status) {
    const statusMap = {
        'not-started': 'Not Started',
        'in-progress': 'In Progress',
        'under-review': 'Under Review',
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'not-set': 'Not Set'
    };
    return statusMap[status] || status;
}

// Sample user data
const userData = {
    'CL001': {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '(555) 123-4567',
        type: 'client',
        caseStatus: 'in-progress',
        caseType: 'chapter-7',
        newsletter: true,
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
        notes: 'Very responsive client. Has been proactive in providing all required documentation.'
    },
    'CL002': {
        name: 'Michael Johnson',
        email: 'michael.johnson@email.com',
        phone: '(555) 987-6543',
        type: 'lead',
        caseStatus: 'not-started',
        caseType: 'consultation',
        newsletter: false,
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
        notes: 'Initial consultation scheduled for next week.'
    },
    'CL003': {
        name: 'Emily Chen',
        email: 'emily.chen@email.com',
        phone: '(555) 456-7890',
        type: 'client',
        caseStatus: 'completed',
        caseType: 'chapter-13',
        newsletter: true,
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        notes: 'Case successfully completed. Very satisfied with our services.'
    },
    'CL004': {
        name: 'David Thompson',
        email: 'david.thompson@email.com',
        phone: '(555) 321-0987',
        type: 'lead',
        caseStatus: 'not-set',
        caseType: 'chapter-7',
        newsletter: true,
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
        notes: 'Considering bankruptcy options. Needs more information.'
    },
    'CL005': {
        name: 'Jennifer Martinez',
        email: 'jennifer.martinez@email.com',
        phone: '(555) 654-3210',
        type: 'client',
        caseStatus: 'in-progress',
        caseType: 'chapter-7',
        newsletter: false,
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
        notes: 'Documents submitted. Awaiting court date.'
    },
    'CL006': {
        name: 'Robert Wilson',
        email: 'robert.wilson@email.com',
        phone: '(555) 789-0123',
        type: 'lead',
        caseStatus: 'not-started',
        caseType: 'consultation',
        newsletter: true,
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
        notes: 'Referred by existing client. High priority.'
    },
    'CL007': {
        name: 'Lisa Anderson',
        email: 'lisa.anderson@email.com',
        phone: '(555) 234-5678',
        type: 'client',
        caseStatus: 'completed',
        caseType: 'chapter-13',
        newsletter: true,
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg',
        notes: 'Successfully completed payment plan. Case closed.'
    },
    'CL008': {
        name: 'James Brown',
        email: 'james.brown@email.com',
        phone: '(555) 876-5432',
        type: 'lead',
        caseStatus: 'not-set',
        caseType: 'consultation',
        newsletter: false,
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
        notes: 'Initial inquiry about debt relief options.'
    },
    'CL009': {
        name: 'Amanda Davis',
        email: 'amanda.davis@email.com',
        phone: '(555) 345-6789',
        type: 'client',
        caseStatus: 'in-progress',
        caseType: 'chapter-7',
        newsletter: true,
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg',
        notes: 'Documents under review. Client very cooperative.'
    },
    'CL010': {
        name: 'Kevin Lee',
        email: 'kevin.lee@email.com',
        phone: '(555) 567-8901',
        type: 'lead',
        caseStatus: 'not-started',
        caseType: 'chapter-13',
        newsletter: false,
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-10.jpg',
        notes: 'Exploring Chapter 13 options. Needs detailed consultation.'
    },
    'CL011': {
        name: 'Rachel Green',
        email: 'rachel.green@email.com',
        phone: '(555) 432-1098',
        type: 'client',
        caseStatus: 'completed',
        caseType: 'chapter-7',
        newsletter: true,
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-11.jpg',
        notes: 'Case completed successfully. Discharge granted.'
    },
    'CL012': {
        name: 'Thomas Garcia',
        email: 'thomas.garcia@email.com',
        phone: '(555) 765-4321',
        type: 'lead',
        caseStatus: 'not-set',
        caseType: 'consultation',
        newsletter: true,
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-12.jpg',
        notes: 'Interested in bankruptcy options. Scheduled consultation.'
    }
};

// Page titles configuration
const titles = {
    'dashboard': { title: 'Dashboard Overview', subtitle: 'Manage clients, leads, and system settings' },
    'clients-leads': { title: 'Clients & Leads', subtitle: 'Manage client relationships and lead conversion' },
    'user-management': { title: 'User Management', subtitle: 'Manage system users and access controls' },
    'folders': { title: 'Folder Management', subtitle: 'Configure document organization structure' },
    'forms': { title: 'Form Management', subtitle: 'Design and manage client intake forms' },
    'admin-profile': { title: 'Admin Profile', subtitle: 'Manage your account settings and preferences' },
    'user-profile': { title: 'User Profile', subtitle: 'View and manage individual user details' }
};

// Section navigation functions
function showSection(sectionName) {
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.add('hidden');
    });
    
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });

    const section = document.getElementById(sectionName + '-section');
    if (section) {
        section.classList.remove('hidden');
    }

    event.target.closest('.nav-item').classList.add('active');

    updatePageTitle(sectionName);
}

function updatePageTitle(sectionName) {
    const titleInfo = titles[sectionName] || { title: 'Admin Dashboard', subtitle: 'Cohen & Cohen P.C.' };
    document.getElementById('page-title').innerHTML = `
        <h2 class="text-2xl font-bold text-gray-900">${titleInfo.title}</h2>
        <p class="text-sm text-gray-600 mt-1 hidden sm:block">${titleInfo.subtitle}</p>
    `;
}

function loadClientsManagement() {
    showSection('clients-leads');
    // Ensure table is rendered when section becomes visible
    if (filteredData.length === 0) {
        filteredData = Object.entries(userData);
        totalEntries = filteredData.length;
    }
    renderClientsTable();
}

function loadSystemManagement(section) {
    showSection(section);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'login.html';
    }
}

// Profile management functions
function openProfileSettings() {
    window.open('adminProfileSettings.html', '_blank', 'width=1200,height=800,scrollbars=yes');
}

function changePassword() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    modal.innerHTML = `
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input type="password" id="currentPassword" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input type="password" id="newPassword" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input type="password" id="confirmPassword" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-law-blue focus:border-transparent">
                    </div>
                </div>
                <div class="flex justify-end space-x-3 mt-6">
                    <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200">
                        Cancel
                    </button>
                    <button onclick="updatePassword()" class="px-4 py-2 text-sm font-medium text-white bg-law-blue hover:bg-blue-700 rounded-lg transition-colors duration-200">
                        Update Password
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function updatePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }

    alert('Password updated successfully!');
    document.querySelector('.fixed').remove();
}

function viewActiveSessions() {
    window.open('adminProfileSettings.html?section=security', '_blank', 'width=1200,height=800,scrollbars=yes');
}

function viewFullActivityLog() {
    window.open('adminProfileSettings.html?section=activity', '_blank', 'width=1200,height=800,scrollbars=yes');
}

// User management functions
function viewUserProfile(userId) {
    currentUserId = userId;
    isUserProfileMode = true;
    
    const user = userData[userId];
    if (!user) {
        alert('User data not found');
        return;
    }
    
    // Update profile header
    document.getElementById('user-profile-avatar').src = user.avatar;
    document.getElementById('user-profile-avatar').alt = user.name;
    document.getElementById('user-profile-name').textContent = user.name;
    document.getElementById('user-profile-id').textContent = 'ID: #' + userId;
    
    // Update profile form
    document.getElementById('profile-name').value = user.name;
    document.getElementById('profile-email').value = user.email;
    document.getElementById('profile-phone').value = user.phone;
    document.getElementById('profile-user-type').value = user.type;
    document.getElementById('profile-case-status').value = user.caseStatus;
    document.getElementById('profile-case-type').value = user.caseType;
    document.getElementById('profile-notes').value = user.notes;
    
    // Hide clients list and show user profile
    document.getElementById('clients-leads-section').classList.add('hidden');
    document.getElementById('user-profile-section').classList.remove('hidden');
    showUserTab('profile');
    
    // Update page title
    updatePageTitle('user-profile');
}

function editUser(userId) {
    alert('Edit user functionality will be implemented');
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        alert('Delete user functionality will be implemented');
    }
}

function showAddUserModal() {
    alert('Add user modal functionality will be implemented');
}

// Folder Management Data and Functions
let folderData = {
    'personal-documents': {
        id: 'personal-documents',
        name: 'Personal Documents',
        description: 'Identity documents, personal records, and related files',
        icon: 'fa-user',
        required: true,
        active: true,
        order: 1
    },
    'financial-records': {
        id: 'financial-records',
        name: 'Financial Records',
        description: 'Bank statements, tax returns, pay stubs, and financial documentation',
        icon: 'fa-chart-line',
        required: true,
        active: true,
        order: 2
    },
    'debt-documentation': {
        id: 'debt-documentation',
        name: 'Debt Documentation',
        description: 'Credit card statements, loan documents, and debt-related paperwork',
        icon: 'fa-credit-card',
        required: true,
        active: true,
        order: 3
    },
    'property-documents': {
        id: 'property-documents',
        name: 'Property Documents',
        description: 'Real estate documents, mortgage papers, and property-related files',
        icon: 'fa-home',
        required: false,
        active: true,
        order: 4
    },
    'income-documentation': {
        id: 'income-documentation',
        name: 'Income Documentation',
        description: 'Employment records, income verification, and earning statements',
        icon: 'fa-dollar-sign',
        required: true,
        active: true,
        order: 5
    },
    'legal-documents': {
        id: 'legal-documents',
        name: 'Legal Documents',
        description: 'Court papers, legal notices, and other legal documentation',
        icon: 'fa-gavel',
        required: false,
        active: true,
        order: 6
    },
    'other-documents': {
        id: 'other-documents',
        name: 'Other Documents',
        description: 'Miscellaneous documents that don\'t fit in other categories',
        icon: 'fa-folder',
        required: false,
        active: true,
        order: 7
    }
};

let currentEditingFolderId = null;

// Initialize folder management on page load
document.addEventListener('DOMContentLoaded', function() {
    renderFoldersList();
    updateFolderStatistics();
});

function openFolderModal(folderId = null) {
    currentEditingFolderId = folderId;
    const modal = document.getElementById('folder-modal');
    const title = document.getElementById('folder-modal-title');
    const submitText = document.getElementById('folder-submit-text');
    
    if (folderId) {
        // Edit mode
        title.textContent = 'Edit Folder';
        submitText.textContent = 'Update Folder';
        
        const folder = folderData[folderId];
        document.getElementById('folder-name').value = folder.name;
        document.getElementById('folder-description').value = folder.description;
        document.getElementById('folder-icon').value = folder.icon;
        document.getElementById('folder-required').value = folder.required.toString();
        document.getElementById('folder-active').checked = folder.active;
    } else {
        // Add mode
        title.textContent = 'Add New Folder';
        submitText.textContent = 'Add Folder';
        
        document.getElementById('folder-form').reset();
        document.getElementById('folder-active').checked = true;
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeFolderModal() {
    const modal = document.getElementById('folder-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    currentEditingFolderId = null;
    document.getElementById('folder-form').reset();
}

// Handle folder form submission
document.getElementById('folder-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('folder-name').value.trim();
    const description = document.getElementById('folder-description').value.trim();
    const icon = document.getElementById('folder-icon').value;
    const required = document.getElementById('folder-required').value === 'true';
    const active = document.getElementById('folder-active').checked;
    
    if (!name) {
        alert('Please enter a folder name');
        return;
    }
    
    if (currentEditingFolderId) {
        // Update existing folder
        folderData[currentEditingFolderId] = {
            ...folderData[currentEditingFolderId],
            name,
            description,
            icon,
            required,
            active
        };
        showNotification(`Folder "${name}" updated successfully`, 'success');
    } else {
        // Add new folder
        const folderId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const maxOrder = Math.max(...Object.values(folderData).map(f => f.order)) + 1;
        
        folderData[folderId] = {
            id: folderId,
            name,
            description,
            icon,
            required,
            active,
            order: maxOrder
        };
        showNotification(`Folder "${name}" added successfully`, 'success');
    }
    
    renderFoldersList();
    updateFolderStatistics();
    closeFolderModal();
});

function deleteFolder(folderId) {
    const folder = folderData[folderId];
    if (!folder) return;
    
    if (confirm(`Are you sure you want to delete the folder "${folder.name}"? This action cannot be undone.`)) {
        delete folderData[folderId];
        renderFoldersList();
        updateFolderStatistics();
        showNotification(`Folder "${folder.name}" deleted successfully`, 'success');
    }
}

function renderFoldersList() {
    const foldersList = document.getElementById('folders-list');
    foldersList.innerHTML = '';
    
    // Sort folders by order
    const sortedFolders = Object.values(folderData).sort((a, b) => a.order - b.order);
    
    sortedFolders.forEach(folder => {
        const folderElement = document.createElement('div');
        folderElement.className = 'folder-item bg-gray-50 border border-gray-200 rounded-lg p-4 cursor-move hover:shadow-md transition-shadow duration-200';
        folderElement.draggable = true;
        folderElement.dataset.folderId = folder.id;
        
        folderElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="drag-handle text-gray-400 hover:text-gray-600 cursor-grab">
                        <i class="fa-solid fa-grip-vertical"></i>
                    </div>
                    <div class="folder-icon text-law-blue">
                        <i class="fa-solid ${folder.icon} text-xl"></i>
                    </div>
                    <div class="folder-details">
                        <h5 class="font-medium text-gray-900">${folder.name}</h5>
                        <p class="text-sm text-gray-500">${folder.description}</p>
                        <div class="flex items-center mt-1 space-x-3">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${folder.required ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">
                                <i class="fa-solid ${folder.required ? 'fa-asterisk' : 'fa-circle-question'} mr-1 text-xs"></i>
                                ${folder.required ? 'Required' : 'Optional'}
                            </span>
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${folder.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                <i class="fa-solid ${folder.active ? 'fa-check' : 'fa-times'} mr-1 text-xs"></i>
                                ${folder.active ? 'Active' : 'Inactive'}
                            </span>
                            <span class="text-xs text-gray-400">Order: ${folder.order}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-2 flex-shrink-0">
                    <button onclick="openFolderModal('${folder.id}')" class="p-2 text-gray-600 hover:text-law-blue rounded-lg hover:bg-gray-100 transition-colors duration-200" title="Edit Folder">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button onclick="deleteFolder('${folder.id}')" class="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors duration-200" title="Delete Folder">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        foldersList.appendChild(folderElement);
    });
    
    // Add drag and drop event listeners
    addDragAndDropListeners();
}

function updateFolderStatistics() {
    const folders = Object.values(folderData);
    const totalCount = folders.length;
    const requiredCount = folders.filter(f => f.required).length;
    const optionalCount = folders.filter(f => !f.required).length;
    const activeCount = folders.filter(f => f.active).length;
    
    document.getElementById('total-folders-count').textContent = totalCount;
    document.getElementById('required-folders-count').textContent = requiredCount;
    document.getElementById('optional-folders-count').textContent = optionalCount;
    document.getElementById('active-folders-count').textContent = activeCount;
}

function resetFolderOrder() {
    if (confirm('Are you sure you want to reset the folder order to default? This will reorder all folders alphabetically.')) {
        // Reset to alphabetical order
        const sortedFolders = Object.values(folderData).sort((a, b) => a.name.localeCompare(b.name));
        sortedFolders.forEach((folder, index) => {
            folderData[folder.id].order = index + 1;
        });
        
        renderFoldersList();
        showNotification('Folder order reset to default', 'success');
    }
}

// Drag and Drop Functionality
function addDragAndDropListeners() {
    const folderItems = document.querySelectorAll('.folder-item');
    
    folderItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
    });
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (draggedElement !== this) {
        const draggedId = draggedElement.dataset.folderId;
        const targetId = this.dataset.folderId;
        
        // Get current orders
        const draggedOrder = folderData[draggedId].order;
        const targetOrder = folderData[targetId].order;
        
        // Swap orders
        folderData[draggedId].order = targetOrder;
        folderData[targetId].order = draggedOrder;
        
        renderFoldersList();
        showNotification('Folder order updated', 'success');
    }
    
    return false;
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    draggedElement = null;
}

// Legacy function for backward compatibility
function addNewFolder() {
    openFolderModal();
}

function openFormEditor() {
    alert('Form editor functionality will be implemented');
}

function exitUserProfileMode() {
    currentUserId = null;
    isUserProfileMode = false;
    document.getElementById('user-profile-section').classList.add('hidden');
    document.getElementById('clients-leads-section').classList.remove('hidden');
    updatePageTitle('clients-leads');
}

function showUserTab(tabName) {
    document.querySelectorAll('.user-tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    document.querySelectorAll('.user-tab-btn').forEach(btn => {
        btn.classList.remove('border-law-blue', 'text-law-blue');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    
    document.getElementById('user-tab-' + tabName).classList.remove('hidden');
    
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.remove('border-transparent', 'text-gray-500');
        activeBtn.classList.add('border-law-blue', 'text-law-blue');
    }
    
    // Load documents when documents tab is selected
    if (tabName === 'documents' && currentUserId) {
        loadUserDocuments();
        // Initialize expandable text for admin documents
        setTimeout(initializeAdminExpandableText, 100);
    }
    
    // Load application data when application tab is selected
    if (tabName === 'application' && currentUserId) {
        loadUserApplicationData();
    }
}

function editUserFromProfile() {
    alert('Edit user from profile functionality will be implemented');
}

function saveProfileChanges() {
    if (!currentUserId || !userData[currentUserId]) {
        alert('No user selected');
        return;
    }
    
    const user = userData[currentUserId];
    
    // Get form values
    const newUserType = document.getElementById('profile-user-type').value;
    const newCaseStatus = document.getElementById('profile-case-status').value;
    const newCaseType = document.getElementById('profile-case-type').value;
    const newNotes = document.getElementById('profile-notes').value;
    
    // Update user data
    user.type = newUserType;
    user.caseStatus = newCaseStatus;
    user.caseType = newCaseType;
    user.notes = newNotes;
    
    showNotification(`Profile changes saved for ${user.name}`, 'success');
}

// Table rendering and pagination functions
function renderClientsTable() {
    const tbody = document.getElementById('clients-leads-tbody');
    tbody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
    
    pageData.forEach(([userId, user]) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        const typeClass = user.type === 'client' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
        const typeText = user.type === 'client' ? 'Client' : 'Lead';
        
        const caseStatusClass = {
            'not-started': 'bg-gray-100 text-gray-800',
            'in-progress': 'bg-blue-100 text-blue-800',
            'completed': 'bg-green-100 text-green-800',
            'not-set': 'bg-red-100 text-red-800'
        }[user.caseStatus] || 'bg-gray-100 text-gray-800';
        
        const caseStatusText = {
            'not-started': 'Not Started',
            'in-progress': 'In Progress',
            'completed': 'Completed',
            'not-set': 'Not Set'
        }[user.caseStatus] || 'Not Set';
        
        const caseTypeText = {
            'chapter-7': 'Chapter 7',
            'chapter-13': 'Chapter 13',
            'consultation': 'Consultation'
        }[user.caseType] || user.caseType;
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <input type="checkbox" class="rounded border-gray-300 text-law-blue focus:ring-law-blue">
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <img src="${user.avatar}" alt="${user.name}" class="w-10 h-10 rounded-full">
                    <div class="ml-4">
                        <button onclick="viewUserProfile('${userId}')" class="text-sm font-medium text-law-blue hover:text-blue-700 cursor-pointer text-left">
                            ${user.name}
                        </button>
                        <div class="text-sm text-gray-500">${caseTypeText}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${user.email}</div>
                <div class="text-sm text-gray-500">${user.phone}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeClass}">${typeText}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                <div class="relative inline-block">
                    <select onchange="updateCaseStatus(this, '${userId}')" class="status-dropdown appearance-none bg-transparent px-2 py-1 pr-6 text-xs font-semibold rounded-full ${caseStatusClass} border-0 focus:outline-none focus:ring-2 focus:ring-law-blue cursor-pointer">
                        <option value="${user.caseStatus}" selected>${getCaseStatusText(user.caseStatus)}</option>
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="under-review">Under Review</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <div class="absolute inset-y-0 right-1 flex items-center pointer-events-none">
                        <i class="fa-solid fa-chevron-down text-xs opacity-70"></i>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.newsletter ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}">
                    <i class="fa-solid ${user.newsletter ? 'fa-check' : 'fa-times'} mr-1"></i>
                    ${user.newsletter ? 'Subscribed' : 'Not Subscribed'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="viewUserProfile('${userId}')" class="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-law-blue rounded-full hover:bg-blue-700 transition-colors duration-200">
                    <i class="fa-solid fa-eye mr-1"></i>
                    View Profile
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    updatePaginationInfo();
    renderPaginationControls();
}

function updatePaginationInfo() {
    const start = (currentPage - 1) * entriesPerPage + 1;
    const end = Math.min(currentPage * entriesPerPage, totalEntries);
    const info = document.getElementById('entries-info');
    info.textContent = `Showing ${start} to ${end} of ${totalEntries} entries`;
}

function renderPaginationControls() {
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const pageNumbers = document.getElementById('page-numbers');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    // Update prev/next buttons
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    // Clear page numbers
    pageNumbers.innerHTML = '';
    
    // Add page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = `px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-law-blue ${
            i === currentPage 
                ? 'bg-law-blue text-white border-law-blue' 
                : 'border-gray-300 hover:bg-gray-100'
        }`;
        pageBtn.onclick = () => goToPage(i);
        pageNumbers.appendChild(pageBtn);
    }
}

function goToPage(page) {
    currentPage = page;
    renderClientsTable();
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderClientsTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderClientsTable();
    }
}

function updateEntriesPerPage() {
    const select = document.getElementById('entries-per-page');
    entriesPerPage = parseInt(select.value);
    currentPage = 1;
    renderClientsTable();
}

// Filtering functions
function filterData() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const caseTypeFilter = document.getElementById('case-type-filter').value;
    const newsletterFilter = document.getElementById('newsletter-filter').value;
    
    filteredData = Object.entries(userData).filter(([userId, user]) => {
        const matchesSearch = !searchInput || 
            user.name.toLowerCase().includes(searchInput) ||
            user.email.toLowerCase().includes(searchInput) ||
            user.phone.includes(searchInput);
            
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'lead' && user.type === 'lead') ||
            (statusFilter === 'client' && user.type === 'client');
            
        const matchesCaseType = caseTypeFilter === 'all' || user.caseType === caseTypeFilter;
        
        const matchesNewsletter = newsletterFilter === 'all' ||
            (newsletterFilter === 'subscribed' && user.newsletter) ||
            (newsletterFilter === 'unsubscribed' && !user.newsletter);
            
        return matchesSearch && matchesStatus && matchesCaseType && matchesNewsletter;
    });
    
    totalEntries = filteredData.length;
    currentPage = 1;
    renderClientsTable();
}

function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('status-filter').value = 'all';
    document.getElementById('case-type-filter').value = 'all';
    document.getElementById('newsletter-filter').value = 'all';
    filterData();
}

// Initialize the application
// Sidebar toggle functionality
let sidebarCollapsed = false;

function toggleSidebar() {
    console.log('Toggle sidebar called');
    const sidebar = document.getElementById('admin-sidebar');
    const toggleIcon = document.getElementById('sidebar-toggle-icon');
    
    console.log('Sidebar element:', sidebar);
    console.log('Toggle icon element:', toggleIcon);
    
    if (!sidebarCollapsed) {
        // Collapse sidebar
        sidebar.classList.remove('w-64');
        sidebar.classList.add('w-16');
        
        // Hide text labels
        const navTexts = sidebar.querySelectorAll('nav button span');
        navTexts.forEach(text => text.classList.add('hidden'));
        
        // Hide sidebar header text
        const headerTitle = document.getElementById('sidebar-header').querySelector('h1');
        if (headerTitle) {
            headerTitle.classList.add('hidden');
        }
        
        // Change toggle icon to expand arrow
        toggleIcon.className = 'fa-solid fa-chevron-right text-gray-600';
        
        sidebarCollapsed = true;
    } else {
        // Expand sidebar
        sidebar.classList.remove('w-16');
        sidebar.classList.add('w-64');
        
        // Show text labels
        const navTexts = sidebar.querySelectorAll('nav button span');
        navTexts.forEach(text => text.classList.remove('hidden'));
        
        // Show sidebar header text
        const headerTitle = document.getElementById('sidebar-header').querySelector('h1');
        if (headerTitle) {
            headerTitle.classList.remove('hidden');
        }
        
        // Change toggle icon back to hamburger
        toggleIcon.className = 'fa-solid fa-bars text-gray-600';
        
        sidebarCollapsed = false;
    }
}

// Document Management Functions
let currentDocumentCategory = null;

// Sample document data for users (same as in adminUserDocuments.js)
const userDocuments = {
    'CL001': {
        'financial': [
            { name: 'bank_statement_dec.pdf', uploaded: '2025-01-15', status: 'approved', size: '2.4 MB' },
            { name: 'paystub_latest.pdf', uploaded: '2025-01-16', status: 'approved', size: '1.2 MB' }
        ],
        'debt': [
            { name: 'credit_card_stmt.pdf', uploaded: '2025-01-14', status: 'pending_review', size: '3.1 MB' }
        ],
        'property': [],
        'income': [],
        'legal': [],
        'misc': []
    },
    'CL002': {
        'financial': [
            { name: 'bank_statement_jan.pdf', uploaded: '2025-01-20', status: 'approved', size: '2.8 MB' }
        ],
        'debt': [],
        'property': [],
        'income': [],
        'legal': [],
        'misc': []
    }
};

// Application data for users
const userApplicationData = {
    'CL001': {
        basicInfo: {
            primaryClient: {
                lastName: 'Smith',
                firstName: 'John',
                middleInitial: 'A'
            },
            secondClient: {
                lastName: 'Smith',
                firstName: 'Jane',
                middleInitial: 'B'
            },
            address: {
                city: 'Denver',
                state: 'Colorado',
                zipCode: '80202'
            },
            contact: {
                cellPhone: '(303) 555-0123',
                homePhone: '(303) 555-0124',
                workPhone: '(303) 555-0125',
                bestPhone: 'Cell Phone',
                fax: '(303) 555-0126',
                email: 'john.smith@email.com'
            }
        },
        referralInfo: {
            source: 'Internet (Google Search)',
            details: ''
        },
        legalProblem: 'I am facing overwhelming debt due to medical bills and job loss. I have approximately $85,000 in credit card debt and medical bills that I cannot pay. I need to explore bankruptcy options to get a fresh start and protect my family home.',
        legalNoticesAcknowledged: true,
        signatures: {
            primaryClient: {
                date: '2025-01-15',
                printedName: 'John A Smith',
                hasSignature: true
            },
            secondClient: {
                date: '2025-01-15',
                printedName: 'Jane B Smith',
                hasSignature: true
            }
        },
        detailedQuestions: {
            bankruptcyReason: 'I lost my job in December 2024 and have been unable to keep up with credit card payments. My wife also had a medical emergency that resulted in significant medical bills not covered by insurance. We are now facing potential foreclosure and need immediate relief.',
            livedElsewhere: false,
            residenceDetails: '',
            paidCreditors: true,
            creditorDetails: 'Paid $1,200 to Chase Credit Card in December 2024 before realizing bankruptcy was necessary.',
            behindPayments: true,
            housingDetails: '2 months behind on mortgage payments ($3,400 total). Received notice of default.',
            inForeclosure: false,
            foreclosureDate: '',
            inEviction: false,
            evictionDate: '',
            assetsOwned: {
                realEstate: true,
                vehicles: true,
                business: false,
                investments: false,
                retirement: true,
                collections: false
            }
        },
        applicationStatus: {
            submittedDate: 'January 15, 2025',
            status: 'Under Review',
            lastUpdated: 'January 16, 2025'
        }
    },
    'CL002': {
        basicInfo: {
            primaryClient: {
                lastName: 'Johnson',
                firstName: 'Michael',
                middleInitial: 'R'
            },
            secondClient: {
                lastName: '',
                firstName: '',
                middleInitial: ''
            },
            address: {
                city: 'Boulder',
                state: 'Colorado',
                zipCode: '80301'
            },
            contact: {
                cellPhone: '(720) 555-0198',
                homePhone: '',
                workPhone: '(720) 555-0199',
                bestPhone: 'Cell Phone',
                fax: '',
                email: 'michael.johnson@email.com'
            }
        },
        referralInfo: {
            source: 'Referred by your client: Sarah Martinez',
            details: 'Sarah Martinez'
        },
        legalProblem: 'Business failure due to COVID-19 impacts. Unable to pay business debts and personal guarantees. Need Chapter 7 or 11 guidance.',
        legalNoticesAcknowledged: true,
        signatures: {
            primaryClient: {
                date: '2025-01-20',
                printedName: 'Michael R Johnson',
                hasSignature: true
            },
            secondClient: {
                date: '',
                printedName: '',
                hasSignature: false
            }
        },
        detailedQuestions: {
            bankruptcyReason: 'My restaurant business was severely impacted by COVID-19 and never fully recovered. I had to close permanently in November 2024 and now face personal liability for business debts.',
            livedElsewhere: true,
            residenceDetails: 'Lived in Austin, Texas from March 2022 to August 2023',
            paidCreditors: false,
            creditorDetails: '',
            behindPayments: false,
            housingDetails: '',
            inForeclosure: false,
            foreclosureDate: '',
            inEviction: false,
            evictionDate: '',
            assetsOwned: {
                realEstate: false,
                vehicles: true,
                business: true,
                investments: false,
                retirement: false,
                collections: false
            }
        },
        applicationStatus: {
            submittedDate: 'January 20, 2025',
            status: 'Pending Review',
            lastUpdated: 'January 20, 2025'
        }
    }
};

// Load documents for current user
function loadUserDocuments() {
    if (!currentUserId) return;
    
    const documents = userDocuments[currentUserId] || {
        financial: [], debt: [], property: [], income: [], legal: [], misc: []
    };
    
    // Render document categories and load notes
    renderDocumentCategories(documents);
    loadDocumentNotes();
    
    // Also populate the admin document view file listings
    populateAdminDocumentFiles(documents);
}

// Populate the admin document view with file listings
function populateAdminDocumentFiles(documents) {
    const categories = ['financial', 'property', 'debt', 'income', 'legal', 'misc'];
    
    categories.forEach(category => {
        const container = document.getElementById(`admin-${category}-files`);
        if (container) {
            const files = documents[category] || [];
            
            if (files.length === 0) {
                container.innerHTML = '<p class="text-xs text-gray-400 italic">No files uploaded yet</p>';
            } else {
                container.innerHTML = files.map(file => `
                    <div class="flex items-center justify-between text-xs">
                        <div class="flex items-center min-w-0 flex-1">
                            <i class="fa-solid fa-file-pdf text-red-500 mr-2"></i>
                            <span class="text-gray-700 truncate">${file.name}</span>
                        </div>
                        <div class="flex items-center space-x-2 flex-shrink-0 ml-2">
                            <button onclick="viewDocument('${file.name}')" class="text-law-blue hover:text-blue-800" title="View">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                            <button onclick="downloadDocument('${file.name}')" class="text-gray-600 hover:text-gray-800" title="Download">
                                <i class="fa-solid fa-download"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
    });
}

// Helper function to get file status styling
function getFileStatusClass(status) {
    const statusClasses = {
        'approved': 'bg-green-100 text-green-800',
        'pending_review': 'bg-amber-100 text-amber-800',
        'rejected': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
}

// Helper function to get file status text
function getFileStatusText(status) {
    const statusTexts = {
        'approved': 'Approved',
        'pending_review': 'Pending',
        'rejected': 'Rejected'
    };
    return statusTexts[status] || 'Unknown';
}

// Load application data for current user
function loadUserApplicationData() {
    if (!currentUserId) return;
    
    const container = document.getElementById('application-data-container');
    if (!container) return;
    
    // Check if user has application data
    const applicationData = userApplicationData[currentUserId];
    
    if (applicationData) {
        // Render application data HTML directly
        container.innerHTML = renderApplicationDataHTML(applicationData);
    } else {
        // Show no application data message
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fa-solid fa-file-circle-exclamation text-gray-300 text-6xl mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No Application Data</h3>
                <p class="text-sm text-gray-500">This client has not submitted a bankruptcy application yet.</p>
            </div>
        `;
    }
}

// Render application data HTML
function renderApplicationDataHTML(applicationData) {
    return `
        ${renderBasicInfoSection(applicationData)}
        ${renderReferralSection(applicationData)}
        ${renderLegalProblemSection(applicationData)}
        ${renderLegalNoticesSection()}
        ${renderSignaturesSection(applicationData)}
        ${renderDetailedQuestionsSection(applicationData)}
        ${renderApplicationStatusSection(applicationData)}
        ${renderAdminNotesSection()}
    `;
}

// Render basic information section
function renderBasicInfoSection(applicationData) {
    return `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div class="flex items-center mb-3">
                <div class="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 mr-2">
                    <i class="fa-solid fa-user text-law-blue text-sm"></i>
                </div>
                <h5 class="text-sm font-medium text-gray-900">Basic Information</h5>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="space-y-3">
                    <h6 class="text-xs font-medium text-gray-700 uppercase tracking-wide">Primary Client</h6>
                    <div class="grid grid-cols-3 gap-2 text-xs">
                        <div>
                            <span class="text-gray-500">Last Name:</span>
                            <p class="font-medium text-gray-900">${applicationData.basicInfo.primaryClient.lastName}</p>
                        </div>
                        <div>
                            <span class="text-gray-500">First Name:</span>
                            <p class="font-medium text-gray-900">${applicationData.basicInfo.primaryClient.firstName}</p>
                        </div>
                        <div>
                            <span class="text-gray-500">MI:</span>
                            <p class="font-medium text-gray-900">${applicationData.basicInfo.primaryClient.middleInitial || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-3">
                    <h6 class="text-xs font-medium text-gray-700 uppercase tracking-wide">Second Client</h6>
                    <div class="grid grid-cols-3 gap-2 text-xs">
                        <div>
                            <span class="text-gray-500">Last Name:</span>
                            <p class="font-medium text-gray-900">${applicationData.basicInfo.secondClient.lastName || 'Not provided'}</p>
                        </div>
                        <div>
                            <span class="text-gray-500">First Name:</span>
                            <p class="font-medium text-gray-900">${applicationData.basicInfo.secondClient.firstName || 'Not provided'}</p>
                        </div>
                        <div>
                            <span class="text-gray-500">MI:</span>
                            <p class="font-medium text-gray-900">${applicationData.basicInfo.secondClient.middleInitial || 'Not provided'}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-4 pt-3 border-t border-gray-100">
                <h6 class="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Address Information</h6>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                        <span class="text-gray-500">City:</span>
                        <p class="font-medium text-gray-900">${applicationData.basicInfo.address.city}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">State:</span>
                        <p class="font-medium text-gray-900">${applicationData.basicInfo.address.state}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">ZIP Code:</span>
                        <p class="font-medium text-gray-900">${applicationData.basicInfo.address.zipCode}</p>
                    </div>
                </div>
            </div>
            
            <div class="mt-4 pt-3 border-t border-gray-100">
                <h6 class="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Contact Information</h6>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                        <span class="text-gray-500">Cell Phone:</span>
                        <p class="font-medium text-gray-900">${applicationData.basicInfo.contact.cellPhone || 'Not provided'}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Home Phone:</span>
                        <p class="font-medium text-gray-900">${applicationData.basicInfo.contact.homePhone || 'Not provided'}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Work Phone:</span>
                        <p class="font-medium text-gray-900">${applicationData.basicInfo.contact.workPhone || 'Not provided'}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Best Phone:</span>
                        <p class="font-medium text-gray-900">${applicationData.basicInfo.contact.bestPhone || 'Not provided'}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">FAX:</span>
                        <p class="font-medium text-gray-900">${applicationData.basicInfo.contact.fax || 'Not provided'}</p>
                    </div>
                    <div>
                        <span class="text-gray-500">Email:</span>
                        <p class="font-medium text-gray-900">${applicationData.basicInfo.contact.email}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render referral section
function renderReferralSection(applicationData) {
    return `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div class="flex items-center mb-3">
                <div class="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 mr-2">
                    <i class="fa-solid fa-share-nodes text-green-600 text-sm"></i>
                </div>
                <h5 class="text-sm font-medium text-gray-900">Referral Information</h5>
            </div>
            
            <div class="text-xs">
                <span class="text-gray-500">How were you referred to our office:</span>
                <p class="font-medium text-gray-900 mt-1">${applicationData.referralInfo.source}</p>
            </div>
        </div>
    `;
}

// Render legal problem section
function renderLegalProblemSection(applicationData) {
    return `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div class="flex items-center mb-3">
                <div class="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 mr-2">
                    <i class="fa-solid fa-scale-balanced text-red-600 text-sm"></i>
                </div>
                <h5 class="text-sm font-medium text-gray-900">Legal Problem Description</h5>
            </div>
            
            <div class="text-xs">
                <span class="text-gray-500">Description of legal problem:</span>
                <p class="font-medium text-gray-900 mt-1 leading-relaxed">${applicationData.legalProblem}</p>
            </div>
        </div>
    `;
}

// Render legal notices section
function renderLegalNoticesSection() {
    return `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div class="flex items-center mb-3">
                <div class="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 mr-2">
                    <i class="fa-solid fa-file-contract text-amber-600 text-sm"></i>
                </div>
                <h5 class="text-sm font-medium text-gray-900">Legal Notices Acknowledgment</h5>
            </div>
            
            <div class="flex items-center text-xs">
                <i class="fa-solid fa-check-circle text-green-500 mr-2"></i>
                <span class="text-gray-700">Client has read and acknowledged legal notices</span>
            </div>
        </div>
    `;
}

// Render signatures section
function renderSignaturesSection(applicationData) {
    return `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div class="flex items-center mb-3">
                <div class="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 mr-2">
                    <i class="fa-solid fa-signature text-purple-600 text-sm"></i>
                </div>
                <h5 class="text-sm font-medium text-gray-900">Digital Signatures</h5>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <h6 class="text-xs font-medium text-gray-700">Primary Client</h6>
                    <div class="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div class="flex items-center justify-center h-16 bg-white rounded border border-dashed border-gray-300">
                            <span class="text-xs text-gray-500">Digital Signature on File</span>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <span class="text-gray-500">Date:</span>
                            <p class="font-medium text-gray-900">${applicationData.signatures.primaryClient.date}</p>
                        </div>
                        <div>
                            <span class="text-gray-500">Printed Name:</span>
                            <p class="font-medium text-gray-900">${applicationData.signatures.primaryClient.printedName}</p>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-2">
                    <h6 class="text-xs font-medium text-gray-700">Second Client</h6>
                    <div class="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div class="flex items-center justify-center h-16 bg-white rounded border border-dashed border-gray-300">
                            ${applicationData.signatures.secondClient.hasSignature ? 
                                '<span class="text-xs text-gray-500">Digital Signature on File</span>' : 
                                '<span class="text-xs text-gray-400">No signature provided</span>'
                            }
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <span class="text-gray-500">Date:</span>
                            <p class="font-medium text-gray-900">${applicationData.signatures.secondClient.date || 'Not provided'}</p>
                        </div>
                        <div>
                            <span class="text-gray-500">Printed Name:</span>
                            <p class="font-medium text-gray-900">${applicationData.signatures.secondClient.printedName || 'Not provided'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render detailed questions section
function renderDetailedQuestionsSection(applicationData) {
    return `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div class="flex items-center mb-3">
                <div class="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 mr-2">
                    <i class="fa-solid fa-clipboard-question text-indigo-600 text-sm"></i>
                </div>
                <h5 class="text-sm font-medium text-gray-900">Detailed Questions</h5>
            </div>
            
            <div class="space-y-4">
                <div>
                    <span class="text-xs text-gray-500">What prompted you to look into bankruptcy:</span>
                    <p class="font-medium text-gray-900 mt-1 text-xs leading-relaxed">${applicationData.detailedQuestions.bankruptcyReason}</p>
                </div>
                
                <div class="pt-3 border-t border-gray-100">
                    <div class="flex items-center space-x-2 mb-2">
                        <span class="text-xs text-gray-500">Lived outside Colorado in past 2 years:</span>
                        <span class="text-xs px-2 py-1 ${applicationData.detailedQuestions.livedElsewhere ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-full font-medium">${applicationData.detailedQuestions.livedElsewhere ? 'Yes' : 'No'}</span>
                    </div>
                    ${applicationData.detailedQuestions.residenceDetails ? `
                        <div class="ml-4 text-xs">
                            <span class="text-gray-500">Details:</span>
                            <p class="font-medium text-gray-900 mt-1">${applicationData.detailedQuestions.residenceDetails}</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="pt-3 border-t border-gray-100">
                    <div class="flex items-center space-x-2 mb-2">
                        <span class="text-xs text-gray-500">Paid creditors >$600 in last 90 days:</span>
                        <span class="text-xs px-2 py-1 ${applicationData.detailedQuestions.paidCreditors ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-full font-medium">${applicationData.detailedQuestions.paidCreditors ? 'Yes' : 'No'}</span>
                    </div>
                    ${applicationData.detailedQuestions.creditorDetails ? `
                        <div class="ml-4 text-xs">
                            <span class="text-gray-500">Details:</span>
                            <p class="font-medium text-gray-900 mt-1">${applicationData.detailedQuestions.creditorDetails}</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="pt-3 border-t border-gray-100">
                    <div class="flex items-center space-x-2 mb-2">
                        <span class="text-xs text-gray-500">Behind on mortgage/rent payments:</span>
                        <span class="text-xs px-2 py-1 ${applicationData.detailedQuestions.behindPayments ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-full font-medium">${applicationData.detailedQuestions.behindPayments ? 'Yes' : 'No'}</span>
                    </div>
                    ${applicationData.detailedQuestions.housingDetails ? `
                        <div class="ml-4 space-y-2">
                            <div class="text-xs">
                                <span class="text-gray-500">Details:</span>
                                <p class="font-medium text-gray-900 mt-1">${applicationData.detailedQuestions.housingDetails}</p>
                            </div>
                            <div class="grid grid-cols-2 gap-3 text-xs">
                                <div class="flex items-center space-x-2">
                                    <i class="fa-solid fa-${applicationData.detailedQuestions.inForeclosure ? 'check' : 'times'}-circle text-${applicationData.detailedQuestions.inForeclosure ? 'green' : 'red'}-500"></i>
                                    <span class="text-gray-700">${applicationData.detailedQuestions.inForeclosure ? 'In foreclosure' : 'Not in foreclosure'}</span>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <i class="fa-solid fa-${applicationData.detailedQuestions.inEviction ? 'check' : 'times'}-circle text-${applicationData.detailedQuestions.inEviction ? 'green' : 'red'}-500"></i>
                                    <span class="text-gray-700">${applicationData.detailedQuestions.inEviction ? 'Eviction proceedings' : 'No eviction proceedings'}</span>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="pt-3 border-t border-gray-100">
                    <span class="text-xs text-gray-500 block mb-2">Assets owned:</span>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div class="flex items-center space-x-2">
                            <i class="fa-solid fa-${applicationData.detailedQuestions.assetsOwned.realEstate ? 'check' : 'times'}-circle text-${applicationData.detailedQuestions.assetsOwned.realEstate ? 'green' : 'red'}-500"></i>
                            <span class="text-gray-700">Real estate property</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fa-solid fa-${applicationData.detailedQuestions.assetsOwned.vehicles ? 'check' : 'times'}-circle text-${applicationData.detailedQuestions.assetsOwned.vehicles ? 'green' : 'red'}-500"></i>
                            <span class="text-gray-700">Vehicle(s)</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fa-solid fa-${applicationData.detailedQuestions.assetsOwned.business ? 'check' : 'times'}-circle text-${applicationData.detailedQuestions.assetsOwned.business ? 'green' : 'red'}-500"></i>
                            <span class="text-gray-700">Business interests</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fa-solid fa-${applicationData.detailedQuestions.assetsOwned.investments ? 'check' : 'times'}-circle text-${applicationData.detailedQuestions.assetsOwned.investments ? 'green' : 'red'}-500"></i>
                            <span class="text-gray-700">Investment accounts</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fa-solid fa-${applicationData.detailedQuestions.assetsOwned.retirement ? 'check' : 'times'}-circle text-${applicationData.detailedQuestions.assetsOwned.retirement ? 'green' : 'red'}-500"></i>
                            <span class="text-gray-700">Retirement accounts</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fa-solid fa-${applicationData.detailedQuestions.assetsOwned.collections ? 'check' : 'times'}-circle text-${applicationData.detailedQuestions.assetsOwned.collections ? 'green' : 'red'}-500"></i>
                            <span class="text-gray-700">Valuable collections</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render application status section
function renderApplicationStatusSection(applicationData) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Under Review': return 'bg-amber-100 text-amber-800';
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Pending Review': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div class="flex items-center mb-3">
                <div class="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 mr-2">
                    <i class="fa-solid fa-info-circle text-law-blue text-sm"></i>
                </div>
                <h5 class="text-sm font-medium text-gray-900">Application Status</h5>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                    <span class="text-gray-500">Submitted:</span>
                    <p class="font-medium text-gray-900">${applicationData.applicationStatus.submittedDate}</p>
                </div>
                <div>
                    <span class="text-gray-500">Status:</span>
                    <span class="px-2 py-1 ${getStatusColor(applicationData.applicationStatus.status)} rounded-full font-medium">${applicationData.applicationStatus.status}</span>
                </div>
                <div>
                    <span class="text-gray-500">Last Updated:</span>
                    <p class="font-medium text-gray-900">${applicationData.applicationStatus.lastUpdated}</p>
                </div>
            </div>
        </div>
    `;
}

// Render admin notes section
function renderAdminNotesSection() {
    const savedNotes = getSavedApplicationNotesForDashboard(currentUserId);
    
    return `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h5 class="text-sm font-medium text-gray-900 mb-3">Application Review Notes</h5>
            <textarea 
                id="application-notes" 
                rows="3" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-law-blue focus:border-transparent" 
                placeholder="Add notes about the application review, required follow-ups, or client communication...">${savedNotes}</textarea>
            <div class="flex justify-end mt-2">
                <button onclick="saveApplicationNotes()" class="px-4 py-2 text-xs bg-law-blue text-white rounded hover:bg-blue-800 transition-colors">
                    <i class="fa-solid fa-save mr-1"></i>
                    Save Notes
                </button>
            </div>
        </div>
    `;
}


// Get saved application notes (simulate) - dashboard version
function getSavedApplicationNotesForDashboard(userId) {
    const sampleNotes = {
        'CL001': 'Application complete. Need to schedule initial consultation to review debt details and discuss Chapter 7 vs Chapter 13 options.',
        'CL002': 'Business bankruptcy case. Need to review business assets and determine if Chapter 7 or Chapter 11 is appropriate.'
    };
    return sampleNotes[userId] || '';
}

// Save application notes - dashboard version
function saveApplicationNotes() {
    const notes = document.getElementById('application-notes').value;
    if (notes.trim()) {
        alert('Application notes saved successfully.');
        console.log(`Application notes saved for user ${currentUserId}: ${notes}`);
    } else {
        alert('Please enter some notes before saving.');
    }
}

// Render document categories
function renderDocumentCategories(documents) {
    const container = document.getElementById('document-categories');
    if (!container) return;
    
    const categories = [
        { id: 'financial', name: 'Financial Documents', icon: 'fa-chart-line', color: 'green', required: true },
        { id: 'property', name: 'Property Documents', icon: 'fa-home', color: 'blue', required: false },
        { id: 'debt', name: 'Debt Documentation', icon: 'fa-receipt', color: 'red', required: true },
        { id: 'income', name: 'Income Verification', icon: 'fa-dollar-sign', color: 'purple', required: true },
        { id: 'legal', name: 'Legal Documents', icon: 'fa-gavel', color: 'indigo', required: false },
        { id: 'misc', name: 'Other Documents', icon: 'fa-file', color: 'gray', required: false }
    ];
    
    container.innerHTML = categories.map(category => {
        const categoryDocs = documents[category.id] || [];
        const hasFiles = categoryDocs.length > 0;
        
        return `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div class="flex items-center mb-3">
                    <div class="flex items-center justify-center h-8 w-8 rounded-full bg-${category.color}-100 mr-2">
                        <i class="fa-solid ${category.icon} text-${category.color}-600 text-sm"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h5 class="text-sm font-medium text-gray-900 truncate">${category.name}</h5>
                        <span class="text-xs bg-${category.required ? 'red' : 'amber'}-100 text-${category.required ? 'red' : 'amber'}-800 px-2 py-1 rounded-full">${category.required ? 'Required' : 'Optional'}</span>
                    </div>
                </div>
                
                ${hasFiles ? 
                    `<div class="space-y-2 mb-3">
                        ${categoryDocs.map(doc => `
                            <div class="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                                <div class="flex items-center min-w-0 flex-1">
                                    <i class="fa-solid fa-file-pdf text-red-500 mr-2"></i>
                                    <span class="text-gray-700 truncate">${doc.name}</span>
                                </div>
                                <div class="flex items-center space-x-2 flex-shrink-0 ml-2">
                                    <i class="fa-solid fa-check text-green-500"></i>
                                    <button onclick="viewDocument('${doc.name}')" class="text-law-blue hover:text-blue-800" title="View">
                                        <i class="fa-solid fa-eye"></i>
                                    </button>
                                    <button onclick="downloadDocument('${doc.name}')" class="text-gray-600 hover:text-gray-800" title="Download">
                                        <i class="fa-solid fa-download"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>` : 
                    `<div class="text-center py-4 mb-3">
                        <i class="fa-solid fa-folder-open text-gray-300 text-2xl mb-2"></i>
                        <p class="text-xs text-gray-500">No documents uploaded</p>
                    </div>`
                }
                
                <div class="flex space-x-2">
                    <button onclick="uploadDocumentForUser('${category.id}')" class="flex-1 text-xs px-3 py-2 bg-law-blue text-white rounded hover:bg-blue-800 transition-colors">
                        <i class="fa-solid fa-upload mr-1"></i>
                        Upload
                    </button>
                    <button onclick="requestDocuments('${category.id}')" class="flex-1 text-xs px-3 py-2 border border-law-blue text-law-blue rounded hover:bg-blue-50 transition-colors">
                        <i class="fa-solid fa-paper-plane mr-1"></i>
                        Request
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Document action functions
function viewDocument(filename) {
    const modal = document.getElementById('document-viewer-modal');
    const title = document.getElementById('document-viewer-title');
    const content = document.getElementById('document-viewer-content');
    
    title.textContent = `Viewing: ${filename}`;
    content.innerHTML = `
        <div class="bg-gray-100 p-4 rounded-lg text-center">
            <i class="fa-solid fa-file-pdf text-red-500 text-6xl mb-4"></i>
            <p class="text-gray-700 mb-4">PDF Document: ${filename}</p>
            <p class="text-sm text-gray-600 mb-4">This is a preview placeholder. In a real implementation, you would display the actual PDF content here.</p>
            <div class="flex justify-center space-x-3">
                <button onclick="downloadDocument('${filename}')" class="px-4 py-2 bg-law-blue text-white rounded-lg hover:bg-blue-800 transition-colors">
                    <i class="fa-solid fa-download mr-2"></i>
                    Download
                </button>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function downloadDocument(filename) {
    alert(`Downloading ${filename}...`);
    console.log(`Admin downloading document: ${filename} for user: ${currentUserId}`);
}


function uploadDocumentForUser(category) {
    currentDocumentCategory = category;
    const modal = document.getElementById('upload-modal');
    const title = document.getElementById('upload-modal-title');
    
    const categoryNames = {
        'financial': 'Financial Documents',
        'property': 'Property Documents',
        'debt': 'Debt Documentation',
        'income': 'Income Verification',
        'legal': 'Legal Documents',
        'misc': 'Other Documents'
    };
    
    title.textContent = `Upload ${categoryNames[category]}`;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function requestDocuments(category) {
    const categoryNames = {
        'financial': 'Financial Documents',
        'property': 'Property Documents',
        'debt': 'Debt Documentation',
        'income': 'Income Verification',
        'legal': 'Legal Documents',
        'misc': 'Other Documents'
    };
    
    const message = `Send a request to the client for ${categoryNames[category]}?`;
    if (confirm(message)) {
        alert(`Document request sent to client for ${categoryNames[category]}.`);
        console.log(`Document request sent: ${category} for user: ${currentUserId}`);
    }
}

function performUpload() {
    const fileInput = document.getElementById('admin-file-input');
    const files = fileInput.files;
    
    if (files.length === 0) {
        alert('Please select files to upload.');
        return;
    }
    
    // Simulate upload process
    let uploadedFiles = [];
    for (let i = 0; i < files.length; i++) {
        uploadedFiles.push({
            name: files[i].name,
            size: (files[i].size / (1024 * 1024)).toFixed(1) + ' MB',
            uploaded: new Date().toISOString().split('T')[0],
            status: 'pending_review'
        });
    }
    
    // Add to user documents
    if (currentUserId && currentDocumentCategory) {
        if (!userDocuments[currentUserId]) {
            userDocuments[currentUserId] = {
                financial: [], debt: [], property: [], income: [], legal: [], misc: []
            };
        }
        userDocuments[currentUserId][currentDocumentCategory].push(...uploadedFiles);
    }
    
    alert(`Successfully uploaded ${files.length} file(s) for the client.`);
    closeUploadModal();
    loadUserDocuments(); // Refresh the view
}

function saveDocumentNotes() {
    const notes = document.getElementById('document-notes').value;
    if (notes.trim()) {
        alert('Document notes saved successfully.');
        console.log(`Document notes saved for user ${currentUserId}: ${notes}`);
    } else {
        alert('Please enter some notes before saving.');
    }
}

function loadDocumentNotes() {
    // Simulate some saved notes
    const sampleNotes = {
        'CL001': 'Client has uploaded most required documents. Still waiting for income verification documents.',
        'CL002': 'Initial consultation completed. Client needs to provide tax returns.'
    };
    const notesTextarea = document.getElementById('document-notes');
    if (notesTextarea && sampleNotes[currentUserId]) {
        notesTextarea.value = sampleNotes[currentUserId];
    }
}

function closeDocumentViewer() {
    const modal = document.getElementById('document-viewer-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function closeUploadModal() {
    const modal = document.getElementById('upload-modal');
    const fileInput = document.getElementById('admin-file-input');
    
    modal.classList.add('hidden');
    fileInput.value = '';
    currentDocumentCategory = null;
    document.body.style.overflow = 'auto';
}

// LinkedIn-style text truncation functionality for admin dashboard
function initializeAdminExpandableText() {
    const expandableElements = document.querySelectorAll('#user-tab-documents .expandable-text');
    
    expandableElements.forEach(element => {
        const textContent = element.querySelector('.text-content');
        const originalText = textContent.textContent.trim();
        
        // Ensure element is visible for accurate measurements
        if (textContent.offsetWidth === 0) {
            return; // Skip if element is not visible
        }
        
        // Store original text and setup truncation
        setupAdminTruncation(element, textContent, originalText);
    });
}

function setupAdminTruncation(element, textContent, originalText) {
    let isExpanded = false;
    
    // Calculate a truncated version manually (65 characters)
    const maxLength = 65;
    let truncatedText = originalText;
    
    if (originalText.length > maxLength) {
        // Find the last space before the character limit to avoid cutting words
        const cutPoint = originalText.lastIndexOf(' ', maxLength);
        truncatedText = originalText.substring(0, cutPoint > 0 ? cutPoint : maxLength);
    }
    
    // Only setup truncation if we actually truncated text
    const needsTruncation = truncatedText.length < originalText.length;
    
    if (!needsTruncation) {
        // Short text, no truncation needed
        textContent.innerHTML = originalText;
        return;
    }
    
    function updateDisplay() {
        if (isExpanded) {
            textContent.innerHTML = originalText + ' <span class="see-more">See less</span>';
        } else {
            textContent.innerHTML = truncatedText + '<span class="ellipsis">... </span><span class="see-more">See more</span>';
        }
        
        // Add click event to see more/see less
        const seeMoreBtn = textContent.querySelector('.see-more');
        if (seeMoreBtn) {
            seeMoreBtn.addEventListener('click', function(e) {
                e.preventDefault();
                isExpanded = !isExpanded;
                updateDisplay();
            });
        }
    }
    
    // Initialize with collapsed state
    updateDisplay();
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    showSection('dashboard');
    
    // Initialize filtered data for clients table
    filteredData = Object.entries(userData);
    totalEntries = filteredData.length;
    
    // Add event listeners for filters (don't render table initially since dashboard is shown)
    document.getElementById('search-input').addEventListener('input', filterData);
    document.getElementById('status-filter').addEventListener('change', filterData);
    document.getElementById('case-type-filter').addEventListener('change', filterData);
    document.getElementById('newsletter-filter').addEventListener('change', filterData);
    
    // Add sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Mobile sidebar toggle functionality
    const mobileToggle = document.getElementById('mobile-sidebar-toggle');
    const sidebar = document.getElementById('admin-sidebar');
    const mainContent = document.getElementById('admin-main-content');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.toggle('hidden');
            sidebar.classList.toggle('fixed');
            sidebar.classList.toggle('inset-y-0');
            sidebar.classList.toggle('left-0');
            sidebar.classList.toggle('z-50');
            
            if (!sidebar.classList.contains('hidden')) {
                // Create overlay
                const overlay = document.createElement('div');
                overlay.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden';
                overlay.id = 'sidebar-overlay';
                overlay.addEventListener('click', function() {
                    sidebar.classList.add('hidden');
                    sidebar.classList.remove('fixed', 'inset-y-0', 'left-0', 'z-50');
                    this.remove();
                });
                document.body.appendChild(overlay);
            } else {
                const overlay = document.getElementById('sidebar-overlay');
                if (overlay) overlay.remove();
            }
        });
    }
    
    // Close modals when clicking outside
    window.onclick = function(event) {
        const documentModal = document.getElementById('document-viewer-modal');
        const uploadModal = document.getElementById('upload-modal');
        const folderModal = document.getElementById('folder-modal');
        const caseStatusModal = document.getElementById('case-status-modal');
        
        if (event.target === documentModal) {
            closeDocumentViewer();
        }
        if (event.target === uploadModal) {
            closeUploadModal();
        }
        if (event.target === folderModal) {
            closeFolderModal();
        }
        if (event.target === caseStatusModal) {
            // Find the current user and revert status
            const userId = caseStatusModal.querySelector('button[onclick*="cancelStatusChange"]')
                ?.getAttribute('onclick')?.match(/'([^']*)',/)?.[1];
            const oldStatus = caseStatusModal.querySelector('button[onclick*="cancelStatusChange"]')
                ?.getAttribute('onclick')?.match(/'([^']*)'\)/)?.[1];
            if (userId && oldStatus) {
                cancelStatusChange(userId, oldStatus);
            }
        }
    }
});