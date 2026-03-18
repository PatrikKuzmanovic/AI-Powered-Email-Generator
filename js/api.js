/**
 * API Controller
 * Handles communication with the Gemini API
 */
class APIController {
    constructor() {
        // Provided API Key for Phase 4
        this.apiKey = 'AIzaSyAcsZQtAKlWazXm5VD6YLMlXidsSSpO_vM';
        // Endpoint for Gemini Flash latest version (supports system instructions & JSON)
        this.endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${this.apiKey}`;
    }

    /**
     * Generates an email using the Gemini API based on user input
     * @param {Object} data - The form data
     * @returns {Promise<{subject: string, body: string}>}
     */
    async generateEmail(data) {
        const prompt = this.constructPrompt(data);

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
            }
        };

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to generate email');
            }

            const result = await response.json();
            
            if (result.candidates && result.candidates[0].content.parts[0].text) {
                const responseText = result.candidates[0].content.parts[0].text;
                // Parse the JSON response
                return JSON.parse(responseText);
            } else {
                throw new Error('Unexpected API response format');
            }
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    }

    /**
     * Constructs the structured prompt for the Gemini API
     */
    constructPrompt(data) {
        return `You are an expert professional email copywriter. You write highly effective, well-formatted emails.
        
Please generate an email based on the following context:

Email Type: ${data.emailType.replace('_', ' ')}
Recipient Name: ${data.recipientName}
Company / Context: ${data.companyContext}
Key Points to Include:
${data.keyPoints}

Tone: ${data.tone}
Length: ${data.length}

Instructions:
1. Write a compelling subject line based on the context.
2. Write the body of the email incorporating all the key points seamlessly.
3. Ensure the tone and length precisely match the user's request.
4. Format the output strictly as a JSON object with two keys: "subject" and "body".
5. Do NOT include any markdown formatting blocks like \`\`\`json. Just raw valid JSON. The body should include line breaks (\\n) for paragraphs.`;
    }
}

window.APIController = APIController;
