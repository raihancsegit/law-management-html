// FAQ Management System for Admin Dashboard
class FAQManager {
    constructor() {
        this.clientFAQs = [];
        this.leadFAQs = [];
        this.currentEditId = null;
        this.currentSection = 'client';
        this.init();
    }

    init() {
        this.loadFAQs();
        this.bindEvents();
    }

    loadFAQs() {
        // Load examples as defaults
        this.clientFAQs = this.getExampleClientFAQs();
        this.leadFAQs = this.getExampleLeadFAQs();
        
        // Save examples to localStorage if not already saved
        if (!localStorage.getItem('clientFAQs')) {
            localStorage.setItem('clientFAQs', JSON.stringify(this.clientFAQs));
        } else {
            // Load from localStorage if it exists
            this.clientFAQs = JSON.parse(localStorage.getItem('clientFAQs'));
        }
        
        if (!localStorage.getItem('leadFAQs')) {
            localStorage.setItem('leadFAQs', JSON.stringify(this.leadFAQs));
        } else {
            // Load from localStorage if it exists
            this.leadFAQs = JSON.parse(localStorage.getItem('leadFAQs'));
        }
        
        this.renderFAQs();
    }

    getExampleClientFAQs() {
        return [
            {
                id: 'client-1',
                category: 'documents',
                question: 'How can I access my case documents?',
                answer: 'You can access all your case documents through your client portal. Simply log in with your credentials and navigate to the "Documents" section. All uploaded documents will be organized by folder for easy access.'
            },
            {
                id: 'client-2',
                category: 'account',
                question: 'What should I do if I need to update my contact information?',
                answer: 'To update your contact information, please log into your client portal and go to the "Profile" section. You can update your phone number, email address, and mailing address there. Alternatively, you can contact our office directly.'
            },
            {
                id: 'client-3',
                category: 'general',
                question: 'How do I schedule a consultation with my attorney?',
                answer: 'You can schedule a consultation through your client portal by clicking on "Schedule Appointment" or by calling our office directly. We offer both in-person and virtual consultations to accommodate your schedule.'
            },
            {
                id: 'client-4',
                category: 'documents',
                question: 'What documents do I need to provide for my bankruptcy case?',
                answer: 'For bankruptcy cases, you will need to provide income statements, tax returns (last 2 years), bank statements, credit card statements, mortgage documents, and a list of all debts and assets. Our team will provide you with a comprehensive checklist.'
            },
            {
                id: 'client-5',
                category: 'general',
                question: 'What happens after I file for bankruptcy?',
                answer: 'After filing, you will receive a case number and an automatic stay will go into effect, stopping most collection activities. Your attorney will guide you through the next steps including the 341 meeting of creditors.'
            },
            {
                id: 'client-6',
                category: 'account',
                question: 'How do I reset my portal password?',
                answer: 'To reset your password, go to the login page and click "Forgot Password". Enter your email address and you will receive instructions to create a new password.'
            }
        ];
    }

    getExampleLeadFAQs() {
        return [
            {
                id: 'lead-1',
                category: 'general',
                question: 'What types of bankruptcy cases do you handle?',
                answer: 'We handle both Chapter 7 and Chapter 13 bankruptcy cases for individuals and small businesses. Our experienced team can help determine which type of bankruptcy is best suited for your specific financial situation.'
            },
            {
                id: 'lead-2',
                category: 'general',
                question: 'How much does it cost to file for bankruptcy?',
                answer: 'Our fees vary depending on the complexity of your case. We offer competitive rates and payment plans to make our services accessible. Contact us for a free consultation to discuss your specific situation and get a detailed fee estimate.'
            },
            {
                id: 'lead-3',
                category: 'general',
                question: 'Do you offer free consultations?',
                answer: 'Yes, we offer free initial consultations to discuss your financial situation and explore your options. During this consultation, we will review your case and provide guidance on the best path forward.'
            },
            {
                id: 'lead-4',
                category: 'documents',
                question: 'What documents should I bring to my consultation?',
                answer: 'Please bring recent pay stubs, bank statements, tax returns, list of debts, and any correspondence from creditors. This will help us better assess your situation.'
            },
            {
                id: 'lead-5',
                category: 'documents',
                question: 'Do I need to gather all my financial records before calling?',
                answer: 'While it\'s helpful to have financial records ready, you don\'t need to wait to contact us. We can provide guidance on what documents to gather during your free consultation.'
            },
            {
                id: 'lead-6',
                category: 'account',
                question: 'How do I get started with your services?',
                answer: 'Contact us to schedule a free consultation. During this meeting, we will review your situation and explain your options. If you decide to proceed, we will help you create an account in our client portal.'
            },
            {
                id: 'lead-7',
                category: 'account',
                question: 'What happens after I sign up as a client?',
                answer: 'After you sign up, we will create your secure client portal account where you can upload documents, track your case progress, and communicate with your legal team.'
            }
        ];
    }

    saveFAQs() {
        localStorage.setItem('clientFAQs', JSON.stringify(this.clientFAQs));
        localStorage.setItem('leadFAQs', JSON.stringify(this.leadFAQs));
    }

    bindEvents() {
        // Tab switching
        document.getElementById('client-faq-tab').addEventListener('click', () => this.switchSection('client'));
        document.getElementById('lead-faq-tab').addEventListener('click', () => this.switchSection('lead'));
        
        // Form submission
        document.getElementById('faq-form').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Cancel editing
        document.getElementById('cancel-edit-btn').addEventListener('click', () => this.cancelEdit());
    }

    switchSection(section) {
        this.currentSection = section;
        
        // Update tab styling
        const clientTab = document.getElementById('client-faq-tab');
        const leadTab = document.getElementById('lead-faq-tab');
        
        if (section === 'client') {
            clientTab.classList.add('border-law-blue');
            clientTab.classList.remove('border-gray-200');
            leadTab.classList.remove('border-law-blue');
            leadTab.classList.add('border-gray-200');
        } else {
            leadTab.classList.add('border-law-blue');
            leadTab.classList.remove('border-gray-200');
            clientTab.classList.remove('border-law-blue');
            clientTab.classList.add('border-gray-200');
        }
        
        // Update form label and render FAQs
        document.getElementById('section-label').textContent = section === 'client' ? 'Client' : 'Lead';
        this.renderFAQs();
        this.cancelEdit();
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const category = document.getElementById('faq-category').value.trim();
        const question = document.getElementById('faq-question').value.trim();
        const answer = document.getElementById('faq-answer').value.trim();
        
        if (!category || !question || !answer) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        const faq = {
            id: this.currentEditId || Date.now().toString(),
            category,
            question,
            answer
        };
        
        if (this.currentEditId) {
            this.updateFAQ(faq);
        } else {
            this.addFAQ(faq);
        }
        
        this.resetForm();
        this.renderFAQs();
        this.saveFAQs();
        this.showNotification(`FAQ ${this.currentEditId ? 'updated' : 'added'} successfully!`, 'success');
    }

    addFAQ(faq) {
        if (this.currentSection === 'client') {
            this.clientFAQs.unshift(faq);
        } else {
            this.leadFAQs.unshift(faq);
        }
    }

    updateFAQ(faq) {
        const faqs = this.currentSection === 'client' ? this.clientFAQs : this.leadFAQs;
        const index = faqs.findIndex(f => f.id === faq.id);
        if (index !== -1) {
            faqs[index] = faq;
        }
    }

    deleteFAQ(id) {
        if (confirm('Are you sure you want to delete this FAQ?')) {
            if (this.currentSection === 'client') {
                this.clientFAQs = this.clientFAQs.filter(f => f.id !== id);
            } else {
                this.leadFAQs = this.leadFAQs.filter(f => f.id !== id);
            }
            this.renderFAQs();
            this.saveFAQs();
            this.showNotification('FAQ deleted successfully!', 'success');
        }
    }

    editFAQ(id) {
        const faq = this.getCurrentFAQ(id);
        if (faq) {
            this.currentEditId = id;
            document.getElementById('faq-category').value = faq.category || '';
            document.getElementById('faq-question').value = faq.question;
            document.getElementById('faq-answer').value = faq.answer;
            document.getElementById('form-title').textContent = 'Edit FAQ';
            document.getElementById('submit-btn').textContent = 'Update FAQ';
            document.getElementById('cancel-edit-btn').classList.remove('hidden');
            
            // Scroll to form
            document.getElementById('faq-form-section').scrollIntoView({ behavior: 'smooth' });
        }
    }

    getCurrentFAQ(id = null) {
        const targetId = id || this.currentEditId;
        const faqs = this.currentSection === 'client' ? this.clientFAQs : this.leadFAQs;
        return faqs.find(f => f.id === targetId);
    }

    cancelEdit() {
        this.currentEditId = null;
        this.resetForm();
        document.getElementById('form-title').textContent = 'Add New FAQ';
        document.getElementById('submit-btn').textContent = 'Add FAQ';
        document.getElementById('cancel-edit-btn').classList.add('hidden');
    }

    resetForm() {
        document.getElementById('faq-form').reset();
    }

    renderFAQs() {
        const faqs = this.currentSection === 'client' ? this.clientFAQs : this.leadFAQs;
        
        // Update section title
        document.getElementById('current-section-title').textContent = this.currentSection.charAt(0).toUpperCase() + this.currentSection.slice(1);
        
        // Group FAQs by category
        const categories = {
            general: faqs.filter(faq => faq.category === 'general'),
            documents: faqs.filter(faq => faq.category === 'documents'),
            account: faqs.filter(faq => faq.category === 'account')
        };
        
        // Render each category
        this.renderCategoryFAQs('general', categories.general);
        this.renderCategoryFAQs('documents', categories.documents);
        this.renderCategoryFAQs('account', categories.account);
    }
    
    renderCategoryFAQs(category, faqs) {
        const container = document.getElementById(`${category}-faq-list`);
        
        if (faqs.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-500 text-sm">No FAQs in this category yet</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = faqs.map((faq, index) => `
            <div class="border border-gray-200 rounded-lg">
                <div class="flex items-center">
                    <button class="flex-1 px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none" onclick="faqManager.toggleFAQ('${category}-${index}')">
                        <span class="font-medium text-gray-900">${this.escapeHtml(faq.question)}</span>
                        <i class="fa-solid fa-chevron-down text-gray-400 transform transition-transform" id="${category}-${index}-icon"></i>
                    </button>
                    <div class="flex items-center space-x-1 px-3 border-l border-gray-200">
                        <button onclick="faqManager.editFAQ('${faq.id}')" class="p-2 text-gray-400 hover:text-law-blue transition-colors duration-200 rounded-md hover:bg-blue-50" title="Edit FAQ">
                            <i class="fa-solid fa-edit text-sm"></i>
                        </button>
                        <button onclick="faqManager.deleteFAQ('${faq.id}')" class="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200 rounded-md hover:bg-red-50" title="Delete FAQ">
                            <i class="fa-solid fa-trash text-sm"></i>
                        </button>
                    </div>
                </div>
                <div id="${category}-${index}" class="hidden px-4 pb-3 border-t border-gray-100">
                    <p class="text-law-gray pt-3">${this.escapeHtml(faq.answer).replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `).join('');
    }
    
    toggleFAQ(faqId) {
        const faqContent = document.getElementById(faqId);
        const faqIcon = document.getElementById(faqId + '-icon');
        
        if (faqContent && faqIcon) {
            if (faqContent.classList.contains('hidden')) {
                faqContent.classList.remove('hidden');
                faqIcon.classList.add('rotate-180');
            } else {
                faqContent.classList.add('hidden');
                faqIcon.classList.remove('rotate-180');
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize FAQ Manager when the DOM is loaded
let faqManager;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('faq-management-section')) {
        faqManager = new FAQManager();
    }
});