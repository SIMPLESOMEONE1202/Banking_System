"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Bot, Send, User, Loader2, FileText } from "lucide-react";
import clsx from "clsx";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function CopilotPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: 'Hello. I am your AI Banking Compliance Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/ai/chat`, { message: userMessage }, {
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` }
      });
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: res.data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: "Sorry, I encountered an error connecting to the intelligence engine." }]);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await axios.get(`${API_URL}/ai/report`, {
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` }
      });
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: "assistant", 
        content: `I have generated the requested report:\n\n\`\`\`text\n${res.data.report}\n\`\`\`` 
      }]);
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bot className="w-6 h-6 text-zinc-400" />
          AI Copilot
        </h2>
        
        {((session?.user as any)?.role === 'COMPLIANCE_OFFICER' || (session?.user as any)?.role === 'ADMIN') && (
          <button 
            onClick={generateReport}
            disabled={generatingReport}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {generatingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Generate Compliance Report
          </button>
        )}
      </div>

      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={clsx("flex gap-4 max-w-3xl", msg.role === 'user' ? "ml-auto" : "")}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-black" />
                </div>
              )}
              <div className={clsx(
                "px-4 py-3 rounded-2xl whitespace-pre-wrap",
                msg.role === 'user' ? "bg-white text-black rounded-tr-sm" : "bg-zinc-800 text-white rounded-tl-sm"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-black" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-zinc-800 text-white rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-zinc-900 border-t border-zinc-800">
          <form onSubmit={handleSend} className="relative max-w-3xl mx-auto flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot about compliance, fraud, or generate reports..."
              className="w-full bg-black border border-zinc-700 text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-white transition-all"
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 p-1.5 bg-white text-black rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-xs text-zinc-500">AI Copilot can make mistakes. Verify important compliance info.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
