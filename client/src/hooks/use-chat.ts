import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Conversation, type Message } from "@shared/models/chat";

// Define message type as per the schema
interface MessageWithRole {
  role: "user" | "assistant";
  content: string;
}

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    },
  });
}

export function useConversation(id: number | null) {
  return useQuery<Conversation & { messages: Message[] }>({
    queryKey: ["/api/conversations", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/conversations/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      return res.json() as Promise<Conversation>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: number; content: string }) => {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to send message");
      // Note: This endpoint streams SSE, but for basic mutation we just need to know it started
      // The actual message handling usually happens via SSE listener in the component
      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", variables.conversationId] });
    },
  });
}
