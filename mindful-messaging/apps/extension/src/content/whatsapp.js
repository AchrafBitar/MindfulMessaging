"use strict";
// This script is programmatically injected by the background script on user action.
function getSelectedText() {
    return window.getSelection()?.toString() || null;
}
// Robust selectors
function getLatestThreadText() {
    // (this will change and needs maintenance)
    const messageNodes = document.querySelectorAll('div[role="row"] .copyable-text');
    if (!messageNodes.length)
        return '';
    // Return text from the last 5 messages as a fallback.
    return Array.from(messageNodes).slice(-5).map(node => node.innerText).join('\n');
}
// Send the extracted text to the background script's NLP worker
const textToAnalyze = getSelectedText() || getLatestThreadText();
if (textToAnalyze) {
    chrome.runtime.sendMessage({ type: 'ANALYZE_TEXT', payload: textToAnalyze });
}
else {
}
