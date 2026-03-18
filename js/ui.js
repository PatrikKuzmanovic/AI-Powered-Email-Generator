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
        this.generateLoader = document.getElementById('generate-loader');
        this.btnText = this.generateBtn.querySelector('.btn-text');

        // Output elements
        this.outputContainer = document.getElementById('output-container');
        this.emptyState = document.getElementById('empty-state');
        this.generatedContent = document.getElementById('generated-content');
        this.outputSubject = document.getElementById('output-subject');
        this.outputBody = document.getElementById('output-body');

        // Action buttons
        this.copyBtn = document.getElementById('copy-btn');
        this.editBtn = document.getElementById('edit-btn');
        this.regenerateBtn = document.getElementById('regenerate-btn');

        // Notifications
        this.toast = document.getElementById('toast-notification');

        // State
        this.isEditing = false;
    }

    bindEvents() {
        // Ensure auto-resize of textareas works smoothly
        this.outputBody.addEventListener('input', () => this.autoResizeTextarea(this.outputBody));

        // Action buttons
        this.copyBtn.addEventListener('click', () => this.handleCopy());
        this.editBtn.addEventListener('click', () => this.toggleEditMode());
    }

    /**
     * Toggles the loading state for the generate button
     * @param {boolean} isLoading - Whether the application is currently loading
     */
    setLoadingState(isLoading) {
        if (isLoading) {
            this.generateBtn.disabled = true;
            this.btnText.classList.add('hidden');
            this.generateLoader.classList.remove('hidden');

            // Disable actionable buttons during generation
            this.setActionsEnabled(false);

            // If it's the first time generating, show content structure but maybe add a loading skeleton or fade
            if (!this.emptyState.classList.contains('hidden')) {
                this.emptyState.classList.add('fade-out');
                setTimeout(() => {
                    this.emptyState.classList.add('hidden');
                    this.generatedContent.classList.remove('hidden');
                    this.outputSubject.value = "Generating subject...";
                    this.outputBody.value = "Generating email based on your inputs. Please wait...";
                }, 250); // matches var(--transition-normal)
            } else {
                this.outputSubject.value = "Generating subject...";
                this.outputBody.value = "Generating improved email based on your inputs. Please wait...";
            }

            // Revert back from edit mode if generating again
            if (this.isEditing) {
                this.toggleEditMode(false);
            }
        } else {
            this.generateBtn.disabled = false;
            this.btnText.classList.remove('hidden');
            this.generateLoader.classList.add('hidden');
            this.setActionsEnabled(true);
        }
    }

    /**
     * Enables or disables the action buttons (Copy, Edit, Regenerate)
     */
    setActionsEnabled(isEnabled) {
        this.copyBtn.disabled = !isEnabled;
        this.editBtn.disabled = !isEnabled;
        this.regenerateBtn.disabled = !isEnabled;
    }

    /**
     * Displays the generated email in the UI
     * @param {string} subject - The generated subject line
     * @param {string} body - The generated email body
     */
    displayGeneratedEmail(subject, body) {
        this.emptyState.classList.add('hidden');
        this.generatedContent.classList.remove('hidden');

        this.outputSubject.value = subject;
        this.outputBody.value = body;

        // Reset scroll position and resize
        this.outputBody.scrollTop = 0;
        this.autoResizeTextarea(this.outputBody);

        // Make sure actions are enabled
        this.setActionsEnabled(true);
    }

    /**
     * Handles displaying errors gracefully
     */
    showError(message) {
        this.outputSubject.value = "Error generating email";
        this.outputBody.value = message + "\n\nPlease try again or check your API key.";
        this.setActionsEnabled(false); // Can't copy/edit an error easily
        this.regenerateBtn.disabled = false; // Allow regeneration though
    }

    /**
     * Toggles whether the generated output is read-only or editable
     */
    toggleEditMode(forceState = null) {
        this.isEditing = forceState !== null ? forceState : !this.isEditing;

        if (this.isEditing) {
            this.outputContainer.classList.add('is-editing');
            this.outputSubject.readOnly = false;
            this.outputBody.readOnly = false;
            this.editBtn.innerHTML = "💾 Save";
            this.editBtn.classList.add('active');
            // Focus contextually
            this.outputBody.focus();
        } else {
            this.outputContainer.classList.remove('is-editing');
            this.outputSubject.readOnly = true;
            this.outputBody.readOnly = true;
            this.editBtn.innerHTML = "✏️ Edit";
            this.editBtn.classList.remove('active');
        }
    }

    /**
     * Copies the generated content to the user's clipboard
     */
    async handleCopy() {
        const subject = this.outputSubject.value;
        const body = this.outputBody.value;

        const textToCopy = `Subject: ${subject}\n\n${body}`;

        try {
            await navigator.clipboard.writeText(textToCopy);
            this.showToast("Copied to clipboard! ✓");
        } catch (err) {
            console.error('Failed to copy text: ', err);

            // Fallback for older browsers
            this.outputBody.select();
            document.execCommand('copy');
            this.showToast("Copied to clipboard! ✓");
            window.getSelection().removeAllRanges();
        }
    }

    /**
     * Shows a temporary toast notification
     */
    showToast(message) {
        this.toast.textContent = message;
        this.toast.classList.remove('hidden');
        // Trigger reflow to ensure animation restarts if called rapidly
        void this.toast.offsetWidth;
        this.toast.classList.add('show');

        // Clear existing timeout if any
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }

        this.toastTimeout = setTimeout(() => {
            this.toast.classList.remove('show');
            setTimeout(() => {
                this.toast.classList.add('hidden');
            }, 250); // Matches transition time
        }, 3000);
    }

    /**
     * Auto-resizes a textarea to fit its content
     */
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto'; // Reset first
        textarea.style.height = (textarea.scrollHeight) + 'px';
    }
}

// Export for app.js if using modules, but since we use simple script tags, 
// we assign it to the window for accessibility.
window.UIController = UIController;
