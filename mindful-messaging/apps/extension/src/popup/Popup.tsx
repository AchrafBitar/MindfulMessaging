import React, { useState, useEffect } from 'react';
import { AnalysisResponse } from '@mindful/common/types';
import './Popup.css';

interface MessageContext {
  id: string;
  text: string;
  source: string;
  timestamp: number;
  analysis?: AnalysisResponse;
}

const Popup: React.FC = () => {
  const [contexts, setContexts] = useState<MessageContext[]>([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);

  useEffect(() => {
    // Load saved dark mode preference
    chrome.storage.local.get(['darkMode'], (result) => {
      setDarkMode(result.darkMode || false);
    });

    // Load contexts from background
    loadContexts();

    // Listen for new analysis results
    const listener = (message: any) => {
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

  const handleCopyReply = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification('Reply copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const showNotification = (message: string) => {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 2000);
  };

  const toggleContext = (contextId: string) => {
    setSelectedContext(selectedContext === contextId ? null : contextId);
  };

  const clearContext = (contextId: string) => {
    chrome.runtime.sendMessage({ type: 'CLEAR_CONTEXT', payload: contextId });
    setContexts(contexts.filter(ctx => ctx.id !== contextId));
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'tasks': return '📋';
      case 'dates': return '📅';
      case 'people': return '👥';
      case 'risks': return '⚠️';
      default: return '💡';
    }
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'professional': return '#667eea';
      case 'friendly': return '#4facfe';
      case 'casual': return '#fa709a';
      default: return '#667eea';
    }
  };

  if (contexts.length === 0) {
    return (
      <div className="popup-container">
        <div className="popup-header">
          <h1>Mindful Assistant</h1>
          <button 
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        
        <div className="empty-state">
          <div className="empty-icon">🤔</div>
          <h3>No messages analyzed yet</h3>
          <p>Select text on a messaging page and right-click to analyze with Mindful</p>
          <div className="supported-platforms">
            <span>Supports:</span>
            <div className="platform-tags">
              <span className="platform-tag">WhatsApp</span>
              <span className="platform-tag">Messenger</span>
              <span className="platform-tag">Gmail</span>
              <span className="platform-tag">Slack</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <div className="popup-header">
        <h1>Mindful Assistant</h1>
        <button 
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="contexts-list">
        {contexts.map((context) => (
          <div key={context.id} className="context-card">
            <div 
              className="context-header"
              onClick={() => toggleContext(context.id)}
            >
              <div className="context-info">
                <div className="context-text">
                  {context.text.length > 50 
                    ? `${context.text.substring(0, 50)}...` 
                    : context.text
                  }
                </div>
                <div className="context-meta">
                  <span className="context-source">{context.source}</span>
                  <span className="context-time">{formatTime(context.timestamp)}</span>
                </div>
              </div>
              <div className="context-actions">
                <button 
                  className="expand-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleContext(context.id);
                  }}
                >
                  {selectedContext === context.id ? '▼' : '▶'}
                </button>
                <button 
                  className="clear-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearContext(context.id);
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {selectedContext === context.id && context.analysis && (
              <div className="context-details">
                <div className="insights-section">
                  <h3>💡 Insights</h3>
                  <div className="insights-grid">
                    {context.analysis.insights.tasks.length > 0 && (
                      <div className="insight-card">
                        <div className="insight-header">
                          <span className="insight-icon">📋</span>
                          <span className="insight-title">Action Items</span>
                        </div>
                        <ul className="insight-list">
                          {context.analysis.insights.tasks.map((task, i) => (
                            <li key={i}>{task.text}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {context.analysis.insights.dates.length > 0 && (
                      <div className="insight-card">
                        <div className="insight-header">
                          <span className="insight-icon">📅</span>
                          <span className="insight-title">Dates Mentioned</span>
                        </div>
                        <ul className="insight-list">
                          {context.analysis.insights.dates.map((date, i) => (
                            <li key={i}>{date.text}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {context.analysis.insights.people.length > 0 && (
                      <div className="insight-card">
                        <div className="insight-header">
                          <span className="insight-icon">👥</span>
                          <span className="insight-title">People</span>
                        </div>
                        <div className="people-tags">
                          {context.analysis.insights.people.map((person, i) => (
                            <span key={i} className="person-tag">{person.text}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {context.analysis.insights.risks.length > 0 && (
                      <div className="insight-card risk">
                        <div className="insight-header">
                          <span className="insight-icon">⚠️</span>
                          <span className="insight-title">Potential Risks</span>
                        </div>
                        <ul className="insight-list">
                          {context.analysis.insights.risks.map((risk, i) => (
                            <li key={i}>{risk.note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {context.analysis.suggestedReplies.length > 0 && (
                  <div className="replies-section">
                    <h3>💬 Suggested Replies</h3>
                    <div className="replies-grid">
                      {context.analysis.suggestedReplies.map((reply, i) => (
                        <div 
                          key={i} 
                          className="reply-card"
                          style={{ borderLeftColor: getToneColor(reply.tone) }}
                        >
                          <div className="reply-content">{reply.text}</div>
                          <div className="reply-footer">
                            <span 
                              className="tone-badge"
                              style={{ backgroundColor: getToneColor(reply.tone) }}
                            >
                              {reply.tone}
                            </span>
                            <button 
                              className="copy-reply-btn"
                              onClick={() => handleCopyReply(reply.text)}
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Popup;
