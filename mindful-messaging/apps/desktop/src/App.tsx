import React, { useState, useEffect, useRef } from 'react';

import { window, event, clipboard } from '@tauri-apps/api';

import { AnalysisResponse } from '@mindful/common/types';
import './App.css'; 
import NlpWorker from '@mindful/nlp-worker/src/index.ts?worker';

const App: React.FC = () => {
    // State for the UI
    const [inputText, setInputText] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(false); 
    const [error, setError] = useState<string | null>(null);
    const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

    const workerRef = useRef<Worker | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Get a handle to the current window instance using the v2 API
    const appWindow = window.getCurrent();

    // --- EFFECT 1: Initialize Worker and Tauri Listeners ---
    useEffect(() => {
        if (!workerRef.current) {
            workerRef.current = new NlpWorker();
            workerRef.current.onmessage = (e) => {
                const { type, payload } = e.data;
                if (type === 'ANALYSIS_COMPLETE') {
                    setAnalysisResult(payload);
                    setIsLoading(false);
                    setError(null);
                } else {
                    setIsReady(true);
                    console.log('NLP Worker is ready.');
                }
            };
            workerRef.current.onerror = (e) => {
                console.error('Error from NLP Worker:', e);
                setError('Analysis failed. Please try again.');
                setIsLoading(false);
            };
        }

        const unlistenFocus = event.listen('tauri://focus', async () => {
            textareaRef.current?.focus();
            try {
                // Use the namespaced clipboard API
                const clipboardText = await clipboard.readText();
                if (clipboardText) {
                    setInputText(clipboardText);
                    handleAnalyze(clipboardText);
                }
            } catch (err) {
                console.warn('Could not read from clipboard:', err);
            }
        });

        const unlistenBlur = event.listen('tauri://blur', () => {
            appWindow.hide();
        });

        // Cleanup function
        return () => {
            workerRef.current?.terminate();
            unlistenFocus.then(f => f());
            unlistenBlur.then(f => f());
        };
    }, []);

    // --- EFFECT 2: Manage "Copied!" notification timeout ---
    useEffect(() => {
        if (copiedNotification) {
            const timer = setTimeout(() => setCopiedNotification(null), 1500);
            return () => clearTimeout(timer);
        }
    }, [copiedNotification]);

    const handleAnalyze = (textToAnalyze: string) => {
        if (!workerRef.current || !isReady || isLoading || !textToAnalyze.trim()) return;

        setIsLoading(true);
        setAnalysisResult(null);
        setError(null);
        workerRef.current.postMessage({ text: textToAnalyze });
    };

    const handleCopyReply = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedNotification('Copied!');
        setTimeout(() => appWindow.hide(), 500);
    };

    // --- Render Logic (This part remains the same) ---
    return (
        <div className="container">
            {copiedNotification && <div className="notification">{copiedNotification}</div>}
            
            <header>
                <h2>Mindful Assistant</h2>
            </header>

            <main>
                <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste text here to analyze..."
                    autoFocus
                />
                <button 
                    onClick={() => handleAnalyze(inputText)} 
                    disabled={!isReady || isLoading || !inputText}
                >
                    {isLoading ? 'Analyzing...' : !isReady ? 'Loading AI...' : 'Analyze'}
                </button>

                {error && <div className="error-display">{error}</div>}
                
                {analysisResult ? (
                    <div className="results-container">
                        <section className="insights-section">
                            <h3><i className="fas fa-lightbulb" style={{marginRight: '8px'}}></i> Insights</h3>
                            
                            {analysisResult.insights.tasks.length > 0 && (
                                <div className="insight-group">
                                    <h4>Action Items</h4>
                                    <ul>{analysisResult.insights.tasks.map((task, i) => <li key={`task-${i}`}>{task.text}</li>)}</ul>
                                </div>
                            )}

                            {analysisResult.insights.dates.length > 0 && (
                                <div className="insight-group">
                                    <h4>Dates Mentioned</h4>
                                    <ul>{analysisResult.insights.dates.map((date, i) => <li key={`date-${i}`}>{date.text}</li>)}</ul>
                                </div>
                            )}
                             
                             {analysisResult.insights.people.length > 0 && (
                                <div className="insight-group">
                                    <h4>People</h4>
                                    <div className="tag-container">{analysisResult.insights.people.map((p, i) => <span key={`person-${i}`} className="tag person">{p.text}</span>)}</div>
                                </div>
                            )}

                             {analysisResult.insights.risks.length > 0 && (
                                <div className="insight-group">
                                    <h4>Potential Risks</h4>
                                    <ul>{analysisResult.insights.risks.map((risk, i) => <li key={`risk-${i}`}>{risk.note}</li>)}</ul>
                                </div>
                            )}
                        </section>

                        {analysisResult.suggestedReplies.length > 0 && (
                             <section className="replies-section">
                                <h3><i className="fas fa-reply" style={{marginRight: '8px'}}></i> Suggested Replies</h3>
                                <div className="replies-grid">
                                    {analysisResult.suggestedReplies.map((reply, i) => (
                                        <button key={i} className={`reply-btn ${reply.tone}`} onClick={() => handleCopyReply(reply.text)}>
                                            {reply.text}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                ) : !isLoading && (
                     <div className="placeholder">
                        <p>Your insights will appear here.</p>
                        <p>Use <strong>Cmd/Ctrl+Shift+M</strong> to open this window anytime.</p>
                     </div>
                )}
            </main>
        </div>
    );
};

export default App;