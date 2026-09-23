"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const PREPOPULATED_PROMPTS = [
  "Which railway projects in Assam have cost overruns > 20%?",
  "What is the total original cost vs revised cost for projects in Maharashtra?",
  "Summarize critical projects showing highest delays"
];

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am the MoSPI Project Intelligence Assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = text.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const url = "/api/chat";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to communicate with API. Status: ${response.status}. URL: ${url}. Response: ${errText}`);
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `**Error:** Unable to reach the assistant API. Details: ${error?.message || "Unknown error"}. Make sure the backend is running.` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 flex items-center justify-center"
          aria-label="Open Project Intelligence Assistant"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Widget Panel */}
      {isOpen && (
        <>
        <style>{`
          @keyframes macOpen {
            0% { opacity: 0; transform: scale(0.85) translateY(20px); transform-origin: bottom right; }
            100% { opacity: 1; transform: scale(1) translateY(0); transform-origin: bottom right; }
          }
        `}</style>
        <div 
          className="fixed bottom-6 right-6 w-[750px] max-w-[95vw] h-[800px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden"
          style={{ animation: 'macOpen 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <h3 className="font-semibold text-lg">MoSPI Intelligence</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-blue-100 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-gray-300" : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm prose prose-sm max-w-none"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="whitespace-pre-wrap m-0">{msg.content}</p>
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-3 rounded border border-gray-200">
                            <table className="w-full border-collapse text-sm" {...props} />
                          </div>
                        ),
                        thead: ({ node, ...props }) => <thead className="bg-gray-100 text-gray-800 font-mono" {...props} />,
                        tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200" {...props} />,
                        tr: ({ node, ...props }) => <tr className="hover:bg-gray-50 transition-colors" {...props} />,
                        th: ({ node, ...props }) => <th className="p-2 text-left font-semibold border-b border-gray-200" {...props} />,
                        td: ({ node, ...props }) => <td className="p-2 text-gray-700" {...props} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 flex-row">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Bot size={18} />
                </div>
                <div className="max-w-[80%] rounded-2xl p-4 bg-white border border-gray-200 rounded-tl-none shadow-sm">
                  <Loader2 className="animate-spin text-blue-600" size={20} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200 shrink-0">
            {/* Prompt Chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {PREPOPULATED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(prompt)}
                  disabled={isLoading}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded-full transition-colors text-left disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Field */}
            <div className="flex gap-2 items-center bg-gray-50 border border-gray-300 rounded-full p-1 pl-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about project intelligence..."
                className="flex-1 bg-transparent border-none outline-none text-sm py-2"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
        </>
      )}
    </>
  );
}
