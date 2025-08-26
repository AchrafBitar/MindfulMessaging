import aiService from '../services/aiService';
class BackgroundManager {
    messageContexts = new Map();
    isAnalyzing = false;
    constructor() {
        this.setupMessageListeners();
        this.setupContextMenu();
    }
    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            switch (message.type) {
                case 'ANALYZE_TEXT':
                    this.handleAnalyzeText(message.payload, sender.tab?.id);
                    break;
                case 'GET_ANALYSIS':
                    this.handleGetAnalysis(message.payload);
                    break;
                case 'GET_CONTEXTS':
                    this.handleGetContexts(sendResponse);
                    return true; // Keep message channel open for async response
                case 'CLEAR_CONTEXT':
                    this.handleClearContext(message.payload);
                    break;
            }
        });
    }
    setupContextMenu() {
        // Remove existing context menu items first
        chrome.contextMenus.removeAll(() => {
            // Create new context menu item
            chrome.contextMenus.create({
                id: 'analyze-selection',
                title: 'Analyze with Mindful',
                contexts: ['selection']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.log('Context menu creation error:', chrome.runtime.lastError);
                }
            });
        });
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            if (info.menuItemId === 'analyze-selection' && info.selectionText) {
                this.handleAnalyzeText(info.selectionText, tab?.id);
            }
        });
    }
    async handleAnalyzeText(text, tabId) {
        if (this.isAnalyzing) {
            console.log('Analysis already in progress...');
            return;
        }
        this.isAnalyzing = true;
        const contextId = this.generateContextId();
        const context = {
            id: contextId,
            text,
            source: tabId ? `tab-${tabId}` : 'manual',
            timestamp: Date.now()
        };
        this.messageContexts.set(contextId, context);
        try {
            // Send to content script for analysis (with error handling)
            if (tabId) {
                try {
                    await chrome.tabs.sendMessage(tabId, {
                        type: 'ANALYZE_TEXT',
                        payload: { text, contextId }
                    });
                }
                catch (error) {
                    console.log('Content script not available or not ready:', error);
                    // Continue with background analysis even if content script fails
                }
            }
            // Use the improved AI service for analysis
            const analysis = await this.performAnalysis(text);
            context.analysis = analysis;
            this.messageContexts.set(contextId, context);
            // Notify popup if open
            this.notifyPopup('ANALYSIS_COMPLETE', { contextId, analysis });
            // Automatically open the popup to show results
            this.openPopup();
        }
        catch (error) {
            console.error('Analysis failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.notifyPopup('ANALYSIS_ERROR', { contextId, error: errorMessage });
        }
        finally {
            this.isAnalyzing = false;
        }
    }
    async performAnalysis(text) {
        try {
            // Try to use the AI service first
            return await aiService.analyzeText(text);
        }
        catch (error) {
            console.log('AI service failed, using fallback analysis:', error);
            // Fallback to basic analysis if AI service fails
            return this.fallbackAnalysis(text);
        }
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
        // Generate contextual suggested replies using the improved method
        const suggestedReplies = this.generateFallbackReplies(text);
        return {
            id: this.generateContextId(),
            originalText: text,
            insights,
            suggestedReplies
        };
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
    handleGetAnalysis(contextId) {
        const context = this.messageContexts.get(contextId);
        return context?.analysis || null;
    }
    handleGetContexts(sendResponse) {
        const contexts = Array.from(this.messageContexts.values());
        sendResponse({ contexts });
    }
    handleClearContext(contextId) {
        this.messageContexts.delete(contextId);
    }
    notifyPopup(type, payload) {
        try {
            chrome.runtime.sendMessage({ type, payload }).catch((error) => {
                // Popup might not be open, ignore error silently
                console.log('Popup not available:', error.message);
            });
        }
        catch (error) {
            // Handle any other communication errors
            console.log('Failed to notify popup:', error);
        }
    }
    openPopup() {
        try {
            // Open the popup programmatically
            chrome.action.openPopup();
        }
        catch (error) {
            console.log('Failed to open popup:', error);
            // Fallback: try to focus the popup if it's already open
            try {
                chrome.action.setPopup({ popup: 'popup.html' });
            }
            catch (fallbackError) {
                console.log('Failed to set popup:', fallbackError);
            }
        }
    }
    generateContextId() {
        return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
// Initialize background manager
new BackgroundManager();
