'use client'; // Client component for hooks

import { useState, useEffect } from 'react';

interface ResponseData {
  thought?: string;
  reply: string;
}

interface HistoryItem {
  id: string;
  userMessage: string;
  thought: string;
  reply: string;
  timestamp: string;
}

export default function Home() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('aiAgentHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('aiAgentHistory', JSON.stringify(history));
  }, [history]);

  // Handle send message
  const handleSend = async () => {
    if (!message.trim()) return;

    setLoading(true);
    const userMessage = message;
    setMessage('');

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data: ResponseData = await res.json();
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        userMessage,
        thought: data.thought || 'No thought provided',
        reply: data.reply,
        timestamp: new Date().toLocaleString(),
      };
      setHistory(prev => [newItem, ...prev]);
    } catch (error) {
      const errorItem: HistoryItem = {
        id: Date.now().toString(),
        userMessage,
        thought: 'Error',
        reply: 'Error: Unable to connect to server',
        timestamp: new Date().toLocaleString(),
      };
      setHistory(prev => [errorItem, ...prev]);
    }

    setLoading(false);
  };

  // Delete history item
  const deleteItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              BrowserBrain
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Ask me to perform actions or answer questions
            </p>
          </div>

          {/* Input Section */}
          <div className="mb-8">
            <div className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Thinking...
                  </div>
                ) : (
                  'Send'
                )}
              </button>
            </div>
          </div>

          {/* Current Response */}
          {history.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    U
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">You</p>
                    <p className="text-gray-700 dark:text-gray-300">{history[0].userMessage}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    AI
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">AI Thought</p>
                    <p className="text-gray-600 dark:text-gray-400 italic mb-3">{history[0].thought}</p>
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">Response</p>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{history[0].reply}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Sidebar */}
      <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Interaction History</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Your recent conversations and actions
          </p>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-80px)]">
          {history.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No interactions yet
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {history.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-gray-900 dark:text-white truncate max-w-48">
                      {item.userMessage}
                    </p>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Thought: {item.thought}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                    {item.reply}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {item.timestamp}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}