/**
 * Main Application Logic
 * Ties UI and API together
 */

class App {
    constructor() {
        // Initialize UI Controller
        this.ui = new UIController();
        
        // Initialize our API class
        this.api = new APIController();
        
        this.bindEvents();
    }

    bindEvents() {
        // Handle form submission
        this.ui.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Handle regeneration
        this.ui.regenerateBtn.addEventListener('click', () => this.handleRegenerate());
    }

    /**
     * Handles the form submission event
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (this.ui.generateBtn.disabled) return;
        
        // 1. Check API key first
        const apiKey = localStorage.getItem('geminiApiKey');
        if (!apiKey) {
            alert("Please enter your Gemini API key in the setup section first!");
            const apiCardDiv = document.getElementById('api-setup-card');
            const apiInput = document.getElementById('api-key-input');
            if (apiCardDiv) apiCardDiv.classList.remove('collapsed');
            if (apiInput) apiInput.focus();
            return;
        }
        
        // 2. Gather form data
        const formData = new FormData(this.ui.form);
        const data = Object.fromEntries(formData.entries());
        
        // 2. Set UI loading state
        this.ui.setLoadingState(true);
        
        try {
            // Call the Gemini API explicitly with user's key
            const generatedContent = await this.api.generateEmail(data, apiKey);
            
            // 3. Display the form data alongside response
            this.ui.displayGeneratedEmail(generatedContent.subject, generatedContent.body, data);
            
        } catch (error) {
            console.error("Failed to generate email:", error);
            this.ui.showError(error.message);
        } finally {
             this.ui.setLoadingState(false);
        }
    }

    /**
     * Handles the regenerate button click
     */
    async handleRegenerate() {
        // Trigger a fake submit event
        this.ui.form.dispatchEvent(new Event('submit'));
    }

    /**
     * Phase 3 Helper: Simulate API latency
     */
    simulateAPICall() {
        return new Promise(resolve => setTimeout(resolve, 1500));
    }

    /**
     * Phase 3 Helper: Format raw textarea points into bullets
     */
    formatKeyPoints(rawText) {
        return rawText.split('\n')
                      .filter(line => line.trim() !== '')
                      .map(line => line.startsWith('-') ? line : `- ${line}`)
                      .join('\n');
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
