import { Sidebar } from "@/components/Sidebar";
import { useCreateConversation, useSendMessage, useConversation } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Advisor() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  
  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    setMessages([{
      role: "assistant", 
      content: "Hello! I'm your Iron Lady Program Advisor. I can help you identify the perfect leadership program for your career stage. Tell me a bit about your current role and goals."
    }]);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    
    // Optimistic update
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);

    try {
      let currentId = conversationId;
      
      // Create conversation if doesn't exist
      if (!currentId) {
        const convo = await createConversation.mutateAsync("Program Advice Session");
        currentId = convo.id;
        setConversationId(currentId);
      }

      // Add placeholder for streaming response
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      // Start SSE Stream
      const response = await fetch(`/api/conversations/${currentId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMsg })
      });

      if (!response.ok || !response.body) throw new Error("Failed to send");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              assistantMessage += data.content;
              
              // Update last message with new token
              setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1] = { role: "assistant", content: assistantMessage };
                return newMsgs;
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <main className="md:pl-64 h-screen flex flex-col">
        <div className="p-6 border-b bg-white dark:bg-slate-800 shadow-sm z-10">
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Bot className="text-primary h-6 w-6" /> 
            Program Advisor AI
          </h1>
          <p className="text-sm text-muted-foreground">
            Get personalized recommendations based on your profile.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={cn(
                "flex w-full max-w-3xl mx-auto gap-4",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              )}
              
              <div 
                className={cn(
                  "rounded-2xl px-5 py-3 shadow-sm text-sm leading-relaxed max-w-[80%]",
                  msg.role === "user" 
                    ? "bg-primary text-white rounded-br-sm" 
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm border"
                )}
              >
                {msg.content}
                {msg.role === "assistant" && msg.content === "" && (
                  <span className="animate-pulse">Thinking...</span>
                )}
              </div>

              {msg.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-slate-600" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 border-t">
          <div className="max-w-3xl mx-auto flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1"
              autoFocus
            />
            <Button onClick={handleSend} disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
