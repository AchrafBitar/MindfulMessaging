import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
function App() {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        // Listen for results from the background script
        const listener = (message) => {
            if (message.type === 'ANALYSIS_COMPLETE') {
                setAnalysis(message.payload);
                setLoading(false);
            }
        };
        chrome.runtime.onMessage.addListener(listener);
        return () => chrome.runtime.onMessage.removeListener(listener);
    }, []);
    if (loading)
        return _jsx("div", { children: "Analyzing..." });
    if (!analysis)
        return _jsx("div", { children: "Select text on a page and click the extension icon." });
    return (_jsxs("div", { className: "panel", children: [_jsxs("section", { children: [_jsx("h3", { children: "Insights" }), analysis.insights.tasks.map(task => _jsxs("div", { children: [_jsx("strong", { children: "Task:" }), " ", task.text] }, task.text)), analysis.insights.people.map(p => _jsxs("div", { children: [_jsx("strong", { children: "Person:" }), " ", p.text] }, p.text))] }), _jsxs("section", { children: [_jsx("h3", { children: "Suggested Replies" }), analysis.suggestedReplies.map(reply => (_jsxs("button", { onClick: () => navigator.clipboard.writeText(reply.text), children: [reply.text, " ", _jsxs("em", { children: ["(", reply.tone, ")"] })] }, reply.text)))] })] }));
}
export default App;
