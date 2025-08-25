import React, { useState, useEffect } from 'react';
import { AnalysisResponse } from '@mindful/common/types';

function App() {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for results from the background script
    const listener = (message: any) => {
      if (message.type === 'ANALYSIS_COMPLETE') {
        setAnalysis(message.payload);
        setLoading(false);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  if (loading) return <div>Analyzing...</div>;
  if (!analysis) return <div>Select text on a page and click the extension icon.</div>;

  return (
    <div className="panel">
      <section>
        <h3>Insights</h3>
        {analysis.insights.tasks.map(task => <div key={task.text}><strong>Task:</strong> {task.text}</div>)}
        {analysis.insights.people.map(p => <div key={p.text}><strong>Person:</strong> {p.text}</div>)}
      </section>
      <section>
        <h3>Suggested Replies</h3>
        {analysis.suggestedReplies.map(reply => (
          <button key={reply.text} onClick={() => navigator.clipboard.writeText(reply.text)}>
            {reply.text} <em>({reply.tone})</em>
          </button>
        ))}
      </section>
    </div>
  );
}

export default App;