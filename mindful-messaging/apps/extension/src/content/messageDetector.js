"use strict";
class MessageDetector {
    platforms = {
        whatsapp: {
            selectors: [
                'div[role="row"] .copyable-text',
                '.message-in .selectable-text',
                '.message-out .selectable-text',
                '[data-testid="conversation-message"] .selectable-text'
            ],
            name: 'WhatsApp Web'
        },
        messenger: {
            selectors: [
                '[data-testid="message_bubble"] .text-content',
                '.uiScrollableArea ._5yl5',
                '[role="main"] ._1p1t'
            ],
            name: 'Facebook Messenger'
        },
        gmail: {
            selectors: [
                '.zA .zF .yP',
                '.gmail_default .yW',
                '[role="main"] .zA .zF'
            ],
            name: 'Gmail'
        },
        slack: {
            selectors: [
                '.c-message__body',
                '.c-message_kit__text',
                '[data-qa="message_text"]'
            ],
            name: 'Slack'
        },
        telegram: {
            selectors: [
                '.message .text',
                '.bubble .text',
                '[data-peer-id] .text'
            ],
            name: 'Telegram Web'
        }
    };
    currentPlatform = '';
    observer = null;
    constructor() {
        this.detectPlatform();
        this.setupMessageListeners();
        this.setupMutationObserver();
    }
    detectPlatform() {
        const url = window.location.hostname;
        if (url.includes('web.whatsapp.com')) {
            this.currentPlatform = 'whatsapp';
        }
        else if (url.includes('messenger.com') || url.includes('facebook.com')) {
            this.currentPlatform = 'messenger';
        }
        else if (url.includes('mail.google.com')) {
            this.currentPlatform = 'gmail';
        }
        else if (url.includes('app.slack.com')) {
            this.currentPlatform = 'slack';
        }
        else if (url.includes('web.telegram.org')) {
            this.currentPlatform = 'telegram';
        }
        else {
            this.currentPlatform = 'generic';
        }
        console.log(`Mindful: Detected platform: ${this.currentPlatform}`);
    }
    setupMessageListeners() {
        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            try {
                if (message.type === 'ANALYZE_TEXT') {
                    this.handleAnalyzeRequest(message.payload);
                    // Send response to acknowledge receipt
                    sendResponse({ success: true });
                }
            }
            catch (error) {
                console.error('Mindful: Error handling message:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                sendResponse({ success: false, error: errorMessage });
            }
            return true; // Keep message channel open for async response
        });
        // Auto-detect new messages
        document.addEventListener('click', () => {
            setTimeout(() => {
                this.extractLatestMessages();
            }, 100);
        });
    }
    setupMutationObserver() {
        // Watch for new messages being added to the DOM
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node;
                            if (this.isMessageElement(element)) {
                                this.extractMessageFromElement(element);
                            }
                        }
                    });
                }
            });
        });
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    isMessageElement(element) {
        const platform = this.platforms[this.currentPlatform];
        if (!platform)
            return false;
        return platform.selectors.some(selector => {
            try {
                return element.matches(selector) || element.querySelector(selector);
            }
            catch {
                return false;
            }
        });
    }
    extractMessageFromElement(element) {
        const messageData = this.extractMessageData(element);
        if (messageData && messageData.text.trim()) {
            console.log('Mindful: Detected new message:', messageData);
            this.sendToBackground(messageData);
        }
    }
    extractMessageData(element) {
        const platform = this.platforms[this.currentPlatform];
        if (!platform)
            return null;
        let text = '';
        let sender = '';
        // Try to extract text using platform-specific selectors
        for (const selector of platform.selectors) {
            try {
                const textElement = element.querySelector(selector) ||
                    (element.matches(selector) ? element : null);
                if (textElement) {
                    text = textElement.textContent || textElement.innerText || '';
                    break;
                }
            }
            catch (error) {
                console.warn('Mindful: Error extracting text with selector:', selector, error);
            }
        }
        // Extract sender information
        sender = this.extractSender(element);
        if (!text.trim())
            return null;
        return {
            text: text.trim(),
            platform: platform.name,
            timestamp: Date.now(),
            sender
        };
    }
    extractSender(element) {
        const senderSelectors = [
            '[data-testid="conversation-title"]',
            '.chat-title',
            '.sender-name',
            '.author',
            '[data-qa="message_sender"]'
        ];
        for (const selector of senderSelectors) {
            try {
                const senderElement = element.querySelector(selector) ||
                    element.closest(selector);
                if (senderElement) {
                    return senderElement.textContent?.trim() || '';
                }
            }
            catch {
                continue;
            }
        }
        return '';
    }
    extractLatestMessages() {
        const platform = this.platforms[this.currentPlatform];
        if (!platform)
            return;
        const messages = [];
        // Extract messages from the last 5 minutes
        const recentElements = this.getRecentMessageElements();
        recentElements.forEach(element => {
            const messageData = this.extractMessageData(element);
            if (messageData && messageData.text.trim()) {
                messages.push(messageData);
            }
        });
        if (messages.length > 0) {
            console.log('Mindful: Extracted recent messages:', messages);
            // Send the most recent message for analysis
            this.sendToBackground(messages[messages.length - 1]);
        }
    }
    getRecentMessageElements() {
        const platform = this.platforms[this.currentPlatform];
        if (!platform)
            return [];
        const elements = [];
        platform.selectors.forEach(selector => {
            try {
                const found = document.querySelectorAll(selector);
                elements.push(...Array.from(found));
            }
            catch {
                // Ignore invalid selectors
            }
        });
        // Return unique elements
        return [...new Set(elements)];
    }
    handleAnalyzeRequest(payload) {
        try {
            const { text, contextId } = payload;
            // Extract additional context from the current page
            const context = this.extractPageContext();
            // Send enhanced data to background
            chrome.runtime.sendMessage({
                type: 'ANALYZE_TEXT',
                payload: {
                    text,
                    contextId,
                    context
                }
            }).catch((error) => {
                console.log('Mindful: Failed to send analysis request to background:', error);
            });
        }
        catch (error) {
            console.error('Mindful: Error handling analyze request:', error);
        }
    }
    extractPageContext() {
        const context = {
            platform: this.currentPlatform,
            url: window.location.href,
            title: document.title,
            timestamp: Date.now()
        };
        // Platform-specific context
        switch (this.currentPlatform) {
            case 'whatsapp':
                context.conversation = this.extractWhatsAppContext();
                break;
            case 'messenger':
                context.conversation = this.extractMessengerContext();
                break;
            case 'gmail':
                context.email = this.extractGmailContext();
                break;
            case 'slack':
                context.channel = this.extractSlackContext();
                break;
        }
        return context;
    }
    extractWhatsAppContext() {
        const titleElement = document.querySelector('[data-testid="conversation-title"]');
        return {
            contact: titleElement?.textContent?.trim() || 'Unknown Contact',
            type: 'chat'
        };
    }
    extractMessengerContext() {
        const titleElement = document.querySelector('[data-testid="conversation-title"]') ||
            document.querySelector('.chat-title');
        return {
            contact: titleElement?.textContent?.trim() || 'Unknown Contact',
            type: 'chat'
        };
    }
    extractGmailContext() {
        const subjectElement = document.querySelector('[data-thread-perm-id] h2') ||
            document.querySelector('.hP');
        const senderElement = document.querySelector('.gD');
        return {
            subject: subjectElement?.textContent?.trim() || 'No Subject',
            sender: senderElement?.textContent?.trim() || 'Unknown Sender',
            type: 'email'
        };
    }
    extractSlackContext() {
        const channelElement = document.querySelector('[data-qa="channel_name"]') ||
            document.querySelector('.p-channel_sidebar__channel');
        return {
            channel: channelElement?.textContent?.trim() || 'Unknown Channel',
            type: 'chat'
        };
    }
    sendToBackground(messageData) {
        try {
            chrome.runtime.sendMessage({
                type: 'ANALYZE_TEXT',
                payload: {
                    text: messageData.text,
                    platform: messageData.platform,
                    sender: messageData.sender,
                    timestamp: messageData.timestamp
                }
            }).catch((error) => {
                console.log('Mindful: Background script not available:', error);
            });
        }
        catch (error) {
            console.log('Mindful: Failed to send message to background:', error);
        }
    }
    getSelectedText() {
        const selection = window.getSelection();
        return selection?.toString().trim() || null;
    }
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}
// Initialize message detector
const messageDetector = new MessageDetector();
// Export for use in other content scripts
window.mindfulMessageDetector = messageDetector;
