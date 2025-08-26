import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import './Popup.css';
const Popup = () => {
    const [contexts, setContexts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [selectedContext, setSelectedContext] = useState(null);
    useEffect(() => {
        // Load saved dark mode preference
        chrome.storage.local.get(['darkMode'], (result) => {
            setDarkMode(result.darkMode || false);
        });
        // Load contexts from background
        loadContexts();
        // Listen for new analysis results
        const listener = (message) => {
            if (message.type === 'ANALYSIS_COMPLETE') {
                loadContexts();
            }
        };
        chrome.runtime.onMessage.addListener(listener);
        return () => chrome.runtime.onMessage.removeListener(listener);
    }, []);
    useEffect(() => {
        // Apply dark mode
        document.body.className = darkMode ? 'dark-mode' : 'light-mode';
        chrome.storage.local.set({ darkMode });
    }, [darkMode]);
    const loadContexts = () => {
        chrome.runtime.sendMessage({ type: 'GET_CONTEXTS' }, (response) => {
            if (response?.contexts) {
                setContexts(response.contexts);
            }
        });
    };
    const handleCopyReply = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            showNotification('Reply copied to clipboard!');
        }
        catch (error) {
            console.error('Failed to copy:', error);
        }
    };
    const showNotification = (message) => {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 2000);
    };
    const toggleContext = (contextId) => {
        setSelectedContext(selectedContext === contextId ? null : contextId);
    };
    const clearContext = (contextId) => {
        chrome.runtime.sendMessage({ type: 'CLEAR_CONTEXT', payload: contextId });
        setContexts(contexts.filter(ctx => ctx.id !== contextId));
    };
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff < 60000)
            return 'Just now';
        if (diff < 3600000)
            return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000)
            return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };
    const getInsightIcon = (type) => {
        switch (type) {
            case 'tasks': return '📋';
            case 'dates': return '📅';
            case 'people': return '👥';
            case 'risks': return '⚠️';
            default: return '💡';
        }
    };
    const getToneColor = (tone) => {
        switch (tone) {
            case 'professional': return '#667eea';
            case 'friendly': return '#4facfe';
            case 'casual': return '#fa709a';
            default: return '#667eea';
        }
    };
    if (contexts.length === 0) {
        return (_jsxs("div", { className: "popup-container", children: [_jsxs("div", { className: "popup-header", children: [_jsx("h1", { children: "Mindful Assistant" }), _jsx("button", { className: "theme-toggle", onClick: () => setDarkMode(!darkMode), children: darkMode ? '☀️' : '🌙' })] }), _jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-icon", children: "\uD83E\uDD14" }), _jsx("h3", { children: "No messages analyzed yet" }), _jsx("p", { children: "Select text on a messaging page and right-click to analyze with Mindful" }), _jsxs("div", { className: "supported-platforms", children: [_jsx("span", { children: "Supports:" }), _jsxs("div", { className: "platform-tags", children: [_jsx("span", { className: "platform-tag", children: "WhatsApp" }), _jsx("span", { className: "platform-tag", children: "Messenger" }), _jsx("span", { className: "platform-tag", children: "Gmail" }), _jsx("span", { className: "platform-tag", children: "Slack" })] })] })] })] }));
    }
    return (_jsxs("div", { className: "popup-container", children: [_jsxs("div", { className: "popup-header", children: [_jsx("h1", { children: "Mindful Assistant" }), _jsx("button", { className: "theme-toggle", onClick: () => setDarkMode(!darkMode), children: darkMode ? '☀️' : '🌙' })] }), _jsx("div", { className: "contexts-list", children: contexts.map((context) => (_jsxs("div", { className: "context-card", children: [_jsxs("div", { className: "context-header", onClick: () => toggleContext(context.id), children: [_jsxs("div", { className: "context-info", children: [_jsx("div", { className: "context-text", children: context.text.length > 50
                                                ? `${context.text.substring(0, 50)}...`
                                                : context.text }), _jsxs("div", { className: "context-meta", children: [_jsx("span", { className: "context-source", children: context.source }), _jsx("span", { className: "context-time", children: formatTime(context.timestamp) })] })] }), _jsxs("div", { className: "context-actions", children: [_jsx("button", { className: "expand-button", onClick: (e) => {
                                                e.stopPropagation();
                                                toggleContext(context.id);
                                            }, children: selectedContext === context.id ? '▼' : '▶' }), _jsx("button", { className: "clear-button", onClick: (e) => {
                                                e.stopPropagation();
                                                clearContext(context.id);
                                            }, children: "\u00D7" })] })] }), selectedContext === context.id && context.analysis && (_jsxs("div", { className: "context-details", children: [_jsxs("div", { className: "insights-section", children: [_jsx("h3", { children: "\uD83D\uDCA1 Insights" }), _jsxs("div", { className: "insights-grid", children: [context.analysis.insights.tasks.length > 0 && (_jsxs("div", { className: "insight-card", children: [_jsxs("div", { className: "insight-header", children: [_jsx("span", { className: "insight-icon", children: "\uD83D\uDCCB" }), _jsx("span", { className: "insight-title", children: "Action Items" })] }), _jsx("ul", { className: "insight-list", children: context.analysis.insights.tasks.map((task, i) => (_jsx("li", { children: task.text }, i))) })] })), context.analysis.insights.dates.length > 0 && (_jsxs("div", { className: "insight-card", children: [_jsxs("div", { className: "insight-header", children: [_jsx("span", { className: "insight-icon", children: "\uD83D\uDCC5" }), _jsx("span", { className: "insight-title", children: "Dates Mentioned" })] }), _jsx("ul", { className: "insight-list", children: context.analysis.insights.dates.map((date, i) => (_jsx("li", { children: date.text }, i))) })] })), context.analysis.insights.people.length > 0 && (_jsxs("div", { className: "insight-card", children: [_jsxs("div", { className: "insight-header", children: [_jsx("span", { className: "insight-icon", children: "\uD83D\uDC65" }), _jsx("span", { className: "insight-title", children: "People" })] }), _jsx("div", { className: "people-tags", children: context.analysis.insights.people.map((person, i) => (_jsx("span", { className: "person-tag", children: person.text }, i))) })] })), context.analysis.insights.risks.length > 0 && (_jsxs("div", { className: "insight-card risk", children: [_jsxs("div", { className: "insight-header", children: [_jsx("span", { className: "insight-icon", children: "\u26A0\uFE0F" }), _jsx("span", { className: "insight-title", children: "Potential Risks" })] }), _jsx("ul", { className: "insight-list", children: context.analysis.insights.risks.map((risk, i) => (_jsx("li", { children: risk.note }, i))) })] }))] })] }), context.analysis.suggestedReplies.length > 0 && (_jsxs("div", { className: "replies-section", children: [_jsx("h3", { children: "\uD83D\uDCAC Suggested Replies" }), _jsx("div", { className: "replies-grid", children: context.analysis.suggestedReplies.map((reply, i) => (_jsxs("div", { className: "reply-card", style: { borderLeftColor: getToneColor(reply.tone) }, children: [_jsx("div", { className: "reply-content", children: reply.text }), _jsxs("div", { className: "reply-footer", children: [_jsx("span", { className: "tone-badge", style: { backgroundColor: getToneColor(reply.tone) }, children: reply.tone }), _jsx("button", { className: "copy-reply-btn", onClick: () => handleCopyReply(reply.text), children: "Copy" })] })] }, i))) })] }))] }))] }, context.id))) })] }));
};
export default Popup;
