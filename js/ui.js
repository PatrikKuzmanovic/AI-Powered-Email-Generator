/**
 * Handles all User Interface interactions and DOM manipulations
 */

class UIController {
    constructor() {
        this.cacheDOM();
        this.bindEvents();
    }

    cacheDOM() {
        // Form elements
        this.form = document.getElementById('email-generator-form');
        this.generateBtn = document.getElementById('generate-btn');
        this.btnText = this.generateBtn.querySelector('.btn-text');
        this.btnIcon = this.generateBtn.querySelector('.btn-icon');

        // Output elements
        this.outputContainer = document.getElementById('output-container');
        this.emptyState = document.getElementById('empty-state');
        this.generatedContent = document.getElementById('generated-content');
        this.outputSubject = document.getElementById('output-subject');
        this.outputBody = document.getElementById('output-body');
        this.outputTo = document.getElementById('output-to');
        
        // Loaders
        this.loaderOverlay = document.getElementById('loader-overlay');
        
        // Action buttons
        this.copyBtn = document.getElementById('copy-btn');
        this.editBtn = document.getElementById('edit-btn');
        this.regenerateBtn = document.getElementById('regenerate-btn');
        
        // Notifications
        this.toast = document.getElementById('toast-notification');
        
        // State
        this.isEditing = false;
        this.isTyping = false;
    }

    bindEvents() {
        this.outputBody.addEventListener('input', () => this.autoResizeTextarea(this.outputBody));
        this.copyBtn.addEventListener('click', () => this.handleCopy());
        this.editBtn.addEventListener('click', () => this.toggleEditMode());
        
        // Dynamically update 'To:' field based on form input
        const recipientInput = document.getElementById('recipient-name');
        recipientInput.addEventListener('input', (e) => {
            if (this.outputTo) {
                this.outputTo.textContent = e.target.value || 'Recipient';
            }
        });
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            this.generateBtn.disabled = true;
            this.btnText.textContent = "Drafting...";
            this.btnIcon.textContent = "⏳";
            this.setActionsEnabled(false);
            
            this.emptyState.classList.add('hidden');
            this.generatedContent.classList.add('hidden');
            this.loaderOverlay.classList.remove('hidden');
            
            if (this.isEditing) this.toggleEditMode(false);
        } else {
            this.generateBtn.disabled = false;
            this.btnText.textContent = "Generate Email";
            this.btnIcon.textContent = "✨";
            this.loaderOverlay.classList.add('hidden');
        }
    }

    setActionsEnabled(isEnabled) {
        this.copyBtn.disabled = !isEnabled;
        this.editBtn.disabled = !isEnabled;
        this.regenerateBtn.disabled = !isEnabled;
    }

    async displayGeneratedEmail(subject, body, formData) {
        this.loaderOverlay.classList.add('hidden');
        this.generatedContent.classList.remove('hidden');
        
        this.outputTo.textContent = formData && formData.recipientName ? formData.recipientName : 'Recipient';
        this.outputSubject.value = subject;
        
        // Clear body for typing effect
        this.outputBody.value = '';
        this.autoResizeTextarea(this.outputBody);
        
        // Fire Confetti!
        this.fireConfetti();
        
        // Start typing effect
        await this.typeWriterEffect(body);
        
        this.setActionsEnabled(true);
    }

    async typeWriterEffect(text) {
        this.isTyping = true;
        this.outputBody.classList.add('typing-cursor');
        
        let i = 0;
        // Speed up typing to keep it snappy but visible
        const speed = 10; 
        
        return new Promise(resolve => {
            const type = () => {
                if (i < text.length) {
                    this.outputBody.value += text.charAt(i);
                    i++;
                    
                    if (i % 25 === 0) {
                        this.autoResizeTextarea(this.outputBody);
                        // Scroll to bottom as it types
                        this.outputBody.scrollTop = this.outputBody.scrollHeight;
                    }
                    setTimeout(type, speed);
                } else {
                    this.isTyping = false;
                    this.outputBody.classList.remove('typing-cursor');
                    this.autoResizeTextarea(this.outputBody);
                    resolve();
                }
            };
            type();
        });
    }

    showError(message) {
        this.loaderOverlay.classList.add('hidden');
        this.generatedContent.classList.remove('hidden');
        this.outputSubject.value = "Error generating email";
        this.outputBody.value = message + "\n\nPlease try again.";
        this.setActionsEnabled(false);
        this.regenerateBtn.disabled = false; 
    }

    toggleEditMode(forceState = null) {
        // Prevent editing during typing animation
        if (this.isTyping) return;
        
        this.isEditing = forceState !== null ? forceState : !this.isEditing;
        
        if (this.isEditing) {
            this.outputSubject.readOnly = false;
            this.outputBody.readOnly = false;
            this.editBtn.innerHTML = "💾 Save";
            this.outputBody.focus();
        } else {
            this.outputSubject.readOnly = true;
            this.outputBody.readOnly = true;
            this.editBtn.innerHTML = "✏️ Edit";
        }
    }

    async handleCopy() {
        if (this.isTyping) return;
        
        const subject = this.outputSubject.value;
        const body = this.outputBody.value;
        const textToCopy = `Subject: ${subject}\n\n${body}`;
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            this.showToast("Copied to clipboard!");
            this.fireConfetti(0.5); // Minor confetti on copy
        } catch (err) {
            console.error('Failed to copy text: ', err);
            this.outputBody.select();
            document.execCommand('copy');
            this.showToast("Copied to clipboard!");
            window.getSelection().removeAllRanges();
        }
    }

    showToast(message) {
        const toastText = this.toast.querySelector('.toast-text');
        if(toastText) toastText.textContent = message;
        
        this.toast.classList.remove('hidden');
        void this.toast.offsetWidth;
        this.toast.classList.add('show');
        
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        
        this.toastTimeout = setTimeout(() => {
            this.toast.classList.remove('show');
            setTimeout(() => this.toast.classList.add('hidden'), 400);
        }, 3000);
    }
    
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    }

    fireConfetti(particleRatio = 1) {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: Math.floor(100 * particleRatio),
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#4f46e5', '#a855f7', '#10b981'],
                zIndex: 1000
            });
        }
    }
}

window.UIController = UIController;
