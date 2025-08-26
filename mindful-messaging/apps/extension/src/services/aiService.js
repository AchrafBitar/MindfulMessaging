class AIService {
    apiKey = null;
    baseUrl = 'https://api-inference.huggingface.co/models';
    constructor() {
        this.loadApiKey();
    }
    async loadApiKey() {
        try {
            const result = await chrome.storage.local.get(['huggingface_api_key']);
            this.apiKey = result.huggingface_api_key || null;
        }
        catch (error) {
            console.warn('Failed to load API key:', error);
        }
    }
    async setApiKey(apiKey) {
        this.apiKey = apiKey;
        await chrome.storage.local.set({ huggingface_api_key: apiKey });
    }
    async analyzeText(text) {
        if (!this.apiKey) {
            throw new Error('Hugging Face API key not configured');
        }
        try {
            // Run multiple analyses in parallel
            const [sentiment, entities, intent] = await Promise.all([
                this.analyzeSentiment(text),
                this.extractEntities(text),
                this.detectIntent(text)
            ]);
            // Extract insights from analysis results
            const insights = this.extractInsights(text, sentiment, entities, intent);
            // Generate AI-powered contextual replies
            const suggestedReplies = await this.generateAIContextualReplies(text, sentiment, intent);
            return {
                id: this.generateId(),
                originalText: text,
                insights,
                suggestedReplies
            };
        }
        catch (error) {
            console.error('AI analysis failed:', error);
            // Fallback to basic analysis
            return this.fallbackAnalysis(text);
        }
    }
    async analyzeSentiment(text) {
        const response = await this.callHuggingFaceAPI('cardiffnlp/twitter-roberta-base-sentiment-latest', text);
        return response;
    }
    async extractEntities(text) {
        const response = await this.callHuggingFaceAPI('dslim/bert-base-NER', text);
        return response;
    }
    async detectIntent(text) {
        // Use a zero-shot classification model for intent detection
        const candidateLabels = [
            'question',
            'request',
            'statement',
            'complaint',
            'appreciation',
            'deadline',
            'meeting',
            'task',
            'urgent',
            'problem',
            'apology',
            'greeting'
        ];
        const response = await this.callHuggingFaceAPI('facebook/bart-large-mnli', text, { candidate_labels: candidateLabels });
        return response;
    }
    async generateAIContextualReplies(text, sentiment, intent) {
        try {
            // Use a text generation model for contextual replies
            const prompt = this.createContextualPrompt(text, sentiment, intent);
            const response = await this.callHuggingFaceAPI('microsoft/DialoGPT-medium', prompt, {
                max_length: 150,
                temperature: 0.7,
                do_sample: true,
                top_p: 0.9
            });
            // Parse and format the generated responses
            const generatedText = response.generated_text;
            const replies = this.parseGeneratedReplies(generatedText, text, sentiment, intent);
            return replies.slice(0, 3);
        }
        catch (error) {
            console.log('AI reply generation failed, using fallback:', error);
            return this.generateFallbackReplies(text);
        }
    }
    createContextualPrompt(text, sentiment, intent) {
        const positiveSentiment = sentiment.find(s => s.label === 'POSITIVE');
        const negativeSentiment = sentiment.find(s => s.label === 'NEGATIVE');
        const primaryIntent = intent[0]?.label || 'statement';
        let context = '';
        let tone = 'neutral';
        // Determine context and tone based on sentiment and intent
        if (negativeSentiment && negativeSentiment.score > 0.6) {
            context = 'empathetic and supportive';
            tone = 'warm';
        }
        else if (positiveSentiment && positiveSentiment.score > 0.6) {
            context = 'enthusiastic and appreciative';
            tone = 'warm';
        }
        else if (primaryIntent === 'urgent' || primaryIntent === 'deadline') {
            context = 'professional and efficient';
            tone = 'firm';
        }
        else if (primaryIntent === 'question') {
            context = 'helpful and informative';
            tone = 'calm';
        }
        else if (primaryIntent === 'complaint') {
            context = 'understanding and solution-focused';
            tone = 'calm';
        }
        else if (primaryIntent === 'apology') {
            context = 'forgiving and understanding';
            tone = 'warm';
        }
        return `Generate 3 professional, ${context} email replies to this message: "${text}"

Requirements:
- Keep each reply under 100 words
- Use a ${tone} tone
- Be specific to the message content
- Professional but friendly
- Include actionable responses when appropriate

Replies:`;
    }
    parseGeneratedReplies(generatedText, originalText, sentiment, intent) {
        // Extract replies from generated text
        const lines = generatedText.split('\n').filter(line => line.trim());
        const replies = [];
        // Determine tone based on sentiment and intent
        const positiveSentiment = sentiment.find(s => s.label === 'POSITIVE');
        const negativeSentiment = sentiment.find(s => s.label === 'NEGATIVE');
        const primaryIntent = intent[0]?.label || 'statement';
        let tone = 'calm';
        if (negativeSentiment && negativeSentiment.score > 0.6) {
            tone = 'warm';
        }
        else if (positiveSentiment && positiveSentiment.score > 0.6) {
            tone = 'warm';
        }
        else if (primaryIntent === 'urgent' || primaryIntent === 'deadline') {
            tone = 'firm';
        }
        // Process each line as a potential reply
        lines.forEach(line => {
            const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
            if (cleanLine && cleanLine.length > 10 && cleanLine.length < 200) {
                replies.push({
                    text: cleanLine,
                    tone
                });
            }
        });
        // If we don't have enough AI-generated replies, supplement with contextual ones
        if (replies.length < 3) {
            const contextualReplies = this.generateContextualReplies(originalText, sentiment, intent);
            replies.push(...contextualReplies.slice(0, 3 - replies.length));
        }
        return replies;
    }
    generateContextualReplies(text, sentiment, intent) {
        const replies = [];
        const lowerText = text.toLowerCase();
        const primaryIntent = intent[0]?.label || 'statement';
        const positiveSentiment = sentiment.find(s => s.label === 'POSITIVE');
        const negativeSentiment = sentiment.find(s => s.label === 'NEGATIVE');
        // Intent-specific contextual replies
        if (primaryIntent === 'question') {
            replies.push({ text: "That's an excellent question! Let me research this and provide you with a comprehensive answer by the end of the day.", tone: 'calm' }, { text: "Great question! I'll look into this right away and get back to you with detailed information.", tone: 'warm' });
        }
        if (primaryIntent === 'urgent' || primaryIntent === 'deadline') {
            replies.push({ text: "I understand this is time-sensitive. I'll prioritize this immediately and have it completed by the deadline.", tone: 'firm' }, { text: "Got it - this is urgent. I'm on it right now and will update you on progress within the hour.", tone: 'firm' });
        }
        if (primaryIntent === 'complaint') {
            replies.push({ text: "I sincerely apologize for the inconvenience. Let me address this issue immediately and ensure it's resolved to your satisfaction.", tone: 'calm' }, { text: "I understand your frustration, and I'm here to help resolve this. Let me take care of this right away.", tone: 'warm' });
        }
        if (primaryIntent === 'appreciation') {
            replies.push({ text: "Thank you so much for your kind words! I'm really glad I could help, and I appreciate you taking the time to let me know.", tone: 'warm' }, { text: "That means a lot to me! I'm happy to have been of assistance, and I'm here whenever you need help in the future.", tone: 'warm' });
        }
        if (primaryIntent === 'apology') {
            replies.push({ text: "No worries at all! I completely understand, and there's no need to apologize. These things happen.", tone: 'warm' }, { text: "Absolutely no problem! I appreciate you letting me know, and I'm happy to work around this.", tone: 'warm' });
        }
        // Sentiment-based replies
        if (negativeSentiment && negativeSentiment.score > 0.6) {
            replies.push({ text: "I can see this is concerning for you. Let me help resolve this situation and make sure you're satisfied with the outcome.", tone: 'warm' });
        }
        if (positiveSentiment && positiveSentiment.score > 0.6) {
            replies.push({ text: "I'm so glad this is working well for you! Your positive feedback really motivates me to keep delivering great results.", tone: 'warm' });
        }
        // Keyword-based contextual replies
        if (lowerText.includes('meeting')) {
            replies.push({ text: "Perfect! I'll make sure to prepare thoroughly for our meeting and bring all the relevant information we'll need.", tone: 'warm' });
        }
        if (lowerText.includes('project') || lowerText.includes('work')) {
            replies.push({ text: "I'm excited to work on this project with you! Let me know if you need any specific details or have particular requirements.", tone: 'warm' });
        }
        if (lowerText.includes('help') || lowerText.includes('assist')) {
            replies.push({ text: "I'm here to help! What specific assistance do you need? I'm ready to support you in any way I can.", tone: 'warm' });
        }
        // Add generic but contextual replies if we don't have enough
        if (replies.length < 3) {
            const genericReplies = [
                { text: "Thank you for reaching out! I'll review this carefully and get back to you with a thoughtful response.", tone: 'calm' },
                { text: "I appreciate you sharing this with me. Let me process this information and respond appropriately.", tone: 'calm' },
                { text: "Thanks for the message! I'll look into this and provide you with a comprehensive response.", tone: 'warm' }
            ];
            replies.push(...genericReplies.slice(0, 3 - replies.length));
        }
        return replies.slice(0, 3);
    }
    async callHuggingFaceAPI(model, inputs, parameters) {
        const url = `${this.baseUrl}/${model}`;
        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
        const body = { inputs };
        if (parameters) {
            body.parameters = parameters;
        }
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error(`Hugging Face API error: ${response.statusText}`);
        }
        return await response.json();
    }
    extractInsights(text, sentiment, entities, intent) {
        const insights = {
            tasks: [],
            dates: [],
            people: [],
            places: [],
            questions: [],
            risks: []
        };
        // Extract tasks from intent detection
        const taskIntents = intent.filter(item => ['request', 'task', 'deadline', 'meeting'].includes(item.label) && item.score > 0.5);
        taskIntents.forEach(item => {
            insights.tasks.push({
                text: `Action required: ${item.label}`,
                confidence: item.score
            });
        });
        // Extract people from NER
        const people = entities.filter(entity => entity.entity_group === 'PER');
        people.forEach(person => {
            insights.people.push({
                text: person.word,
                type: 'PERSON',
                confidence: person.score
            });
        });
        // Extract places from NER
        const places = entities.filter(entity => entity.entity_group === 'LOC');
        places.forEach(place => {
            insights.places.push({
                text: place.word,
                type: 'LOC',
                confidence: place.score
            });
        });
        // Extract dates using regex patterns
        const datePatterns = [
            { pattern: /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, type: 'DATE' },
            { pattern: /\b\d{1,2}-\d{1,2}-\d{2,4}\b/g, type: 'DATE' },
            { pattern: /\b(today|tomorrow|next week|next month)\b/gi, type: 'DATE' },
            { pattern: /\b\d{1,2}:\d{2}\s*(am|pm)?\b/gi, type: 'TIME' }
        ];
        datePatterns.forEach(({ pattern, type }) => {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(match => insights.dates.push({
                    text: match,
                    type,
                    confidence: 0.9
                }));
            }
        });
        // Extract questions
        const sentences = text.split(/[.!?]+/);
        sentences.forEach(sentence => {
            const trimmed = sentence.trim();
            if (trimmed.includes('?') ||
                trimmed.toLowerCase().startsWith('what') ||
                trimmed.toLowerCase().startsWith('how') ||
                trimmed.toLowerCase().startsWith('why') ||
                trimmed.toLowerCase().startsWith('when') ||
                trimmed.toLowerCase().startsWith('where') ||
                trimmed.toLowerCase().startsWith('can you') ||
                trimmed.toLowerCase().startsWith('could you')) {
                insights.questions.push(trimmed);
            }
        });
        // Detect risks based on sentiment and keywords
        const negativeSentiment = sentiment.find(s => s.label === 'NEGATIVE');
        const riskKeywords = ['urgent', 'emergency', 'problem', 'issue', 'conflict', 'deadline'];
        if (negativeSentiment && negativeSentiment.score > 0.6) {
            insights.risks.push({
                type: 'commitment_conflict',
                confidence: negativeSentiment.score,
                note: `Negative sentiment detected (${Math.round(negativeSentiment.score * 100)}% confidence) - may need attention`
            });
        }
        riskKeywords.forEach(keyword => {
            if (text.toLowerCase().includes(keyword)) {
                insights.risks.push({
                    type: 'commitment_conflict',
                    confidence: 0.7,
                    note: `Contains "${keyword}" - may need attention`
                });
            }
        });
        return insights;
    }
    generateFallbackReplies(text) {
        const replies = [];
        const lowerText = text.toLowerCase();
        // Context-based replies
        if (lowerText.includes('?')) {
            const questionReplies = [
                { text: "That's a great question! Let me look into this and get back to you.", tone: 'calm' },
                { text: "Good question! I'll find out and let you know.", tone: 'warm' },
                { text: "I'll research this and provide you with an answer.", tone: 'calm' }
            ];
            replies.push(...questionReplies.slice(0, 2));
        }
        if (lowerText.includes('urgent') || lowerText.includes('emergency')) {
            replies.push({
                text: "I understand this is urgent. I'll prioritize this immediately.",
                tone: 'firm'
            });
        }
        if (lowerText.includes('problem') || lowerText.includes('issue')) {
            replies.push({
                text: "I see there's an issue. Let me help you resolve this.",
                tone: 'calm'
            });
        }
        if (lowerText.includes('thank') || lowerText.includes('thanks')) {
            replies.push({
                text: "You're very welcome! I'm here to help.",
                tone: 'warm'
            });
        }
        if (lowerText.includes('sorry') || lowerText.includes('apologize')) {
            replies.push({
                text: "No worries at all! I understand completely.",
                tone: 'warm'
            });
        }
        if (lowerText.includes('help') || lowerText.includes('assist')) {
            replies.push({
                text: "I'm here to help! What can I assist you with?",
                tone: 'warm'
            });
        }
        if (lowerText.includes('meeting') || lowerText.includes('call')) {
            replies.push({
                text: "I'll be there for the meeting. Looking forward to it!",
                tone: 'warm'
            });
        }
        if (lowerText.includes('deadline') || lowerText.includes('due')) {
            replies.push({
                text: "I understand the deadline. I'll make sure this is completed on time.",
                tone: 'firm'
            });
        }
        // Add generic replies if we don't have enough context-specific ones
        if (replies.length < 2) {
            const genericReplies = [
                { text: "Thank you for sharing this. I'll review it and get back to you soon.", tone: 'calm' },
                { text: "Got it! I'll look into this and let you know what I find.", tone: 'warm' },
                { text: "I understand. Let me process this and respond appropriately.", tone: 'calm' },
                { text: "Thanks for reaching out! I'll get back to you shortly.", tone: 'warm' },
                { text: "I'll review this and provide you with a thoughtful response.", tone: 'calm' },
                { text: "Got your message! I'll respond as soon as I can.", tone: 'warm' }
            ];
            // Randomly select 2-3 generic replies
            const shuffled = genericReplies.sort(() => 0.5 - Math.random());
            replies.push(...shuffled.slice(0, 2));
        }
        // Remove duplicates and return top 3 unique replies
        const uniqueReplies = replies.filter((reply, index, self) => index === self.findIndex(r => r.text === reply.text));
        return uniqueReplies.slice(0, 3);
    }
    fallbackAnalysis(text) {
        // Basic fallback analysis without AI
        const insights = {
            tasks: [],
            dates: [],
            people: [],
            places: [],
            questions: [],
            risks: []
        };
        const lowerText = text.toLowerCase();
        // Simple keyword-based extraction
        const taskKeywords = ['need to', 'have to', 'should', 'must', 'task', 'todo', 'urgent', 'deadline', 'meeting'];
        const sentences = text.split(/[.!?]+/);
        sentences.forEach(sentence => {
            const lowerSentence = sentence.toLowerCase();
            if (taskKeywords.some(keyword => lowerSentence.includes(keyword))) {
                insights.tasks.push({
                    text: sentence.trim(),
                    confidence: 0.6
                });
            }
        });
        // Date extraction
        const datePatterns = [
            { pattern: /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, type: 'DATE' },
            { pattern: /\b(today|tomorrow|next week|next month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, type: 'DATE' },
            { pattern: /\b\d{1,2}:\d{2}\s*(am|pm)?\b/gi, type: 'TIME' }
        ];
        datePatterns.forEach(({ pattern, type }) => {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(match => insights.dates.push({
                    text: match,
                    type,
                    confidence: 0.8
                }));
            }
        });
        // Question detection
        sentences.forEach(sentence => {
            const trimmed = sentence.trim();
            if (trimmed.includes('?') ||
                trimmed.toLowerCase().startsWith('what') ||
                trimmed.toLowerCase().startsWith('how') ||
                trimmed.toLowerCase().startsWith('why') ||
                trimmed.toLowerCase().startsWith('when') ||
                trimmed.toLowerCase().startsWith('where') ||
                trimmed.toLowerCase().startsWith('can you') ||
                trimmed.toLowerCase().startsWith('could you') ||
                trimmed.toLowerCase().startsWith('would you')) {
                insights.questions.push(trimmed);
            }
        });
        // Risk detection
        const riskKeywords = ['urgent', 'emergency', 'problem', 'issue', 'conflict', 'deadline', 'stress', 'overwhelm'];
        riskKeywords.forEach(keyword => {
            if (lowerText.includes(keyword)) {
                insights.risks.push({
                    type: 'commitment_conflict',
                    confidence: 0.7,
                    note: `Contains "${keyword}" - may need attention`
                });
            }
        });
        // Generate contextual suggested replies
        const suggestedReplies = this.generateFallbackReplies(text);
        return {
            id: this.generateId(),
            originalText: text,
            insights,
            suggestedReplies
        };
    }
    generateId() {
        return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async testConnection() {
        try {
            await this.analyzeSentiment('Hello world');
            return true;
        }
        catch (error) {
            console.error('AI service connection test failed:', error);
            return false;
        }
    }
}
export default new AIService();
