import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Trash2, Sparkles } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { chatbotSuggestionsByRole } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import * as chatbotService from "../../services/chatbotService";

export default function StudentChatbot() {
  const { user } = useAuth();
  const role = user?.role || "student";
  const suggestions = chatbotSuggestionsByRole[role] || chatbotSuggestionsByRole.student;

  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: "Hi! I'm your EduCloud assistant. Ask me about your attendance, timetable, subjects, or results." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  async function send(text) {
    const content = text ?? input;
    if (!content.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), from: "user", text: content }]);
    setInput("");
    setTyping(true);
    const reply = await chatbotService.getBotReply(content, { role, user });
    setTyping(false);
    setMessages((m) => [...m, { id: Date.now() + 1, from: "bot", text: reply }]);
  }

  function clearChat() {
    setMessages([{ id: 1, from: "bot", text: "Chat cleared. How can I help you today?" }]);
  }

  return (
    <div>
      <PageHeader title="AI Chatbot" subtitle="Ask quick questions about your academic record" actions={<button className="btn-secondary" onClick={clearChat}><Trash2 size={15} /> Clear chat</button>} />

      <div className="card flex flex-col h-[65vh]">
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-2.5 ${m.from === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.from === "user" ? "bg-navy-800 text-white" : "bg-navy-50 text-navy-700"}`}>
                {m.from === "user" ? <User size={15} /> : <Bot size={15} />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.from === "user" ? "bg-navy-800 text-white rounded-tr-sm" : "bg-navy-50 text-navy-800 rounded-tl-sm"}`}>
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-2.5">
              <div className="h-8 w-8 rounded-full bg-navy-50 text-navy-700 flex items-center justify-center"><Bot size={15} /></div>
              <div className="bg-navy-50 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-navy-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-navy-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-navy-300 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="px-5 py-3 border-t border-surface-border">
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)} className="text-xs font-medium text-navy-600 bg-navy-50 hover:bg-navy-100 rounded-full px-3 py-1.5 flex items-center gap-1">
                <Sparkles size={11} /> {s}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
            <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question..." />
            <button type="submit" className="btn-primary shrink-0"><Send size={16} /></button>
          </form>
        </div>
      </div>
    </div>
  );
}
