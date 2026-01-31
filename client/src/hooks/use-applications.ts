import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ApplicationInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useApplications() {
  return useQuery({
    queryKey: [api.applications.list.path],
    queryFn: async () => {
      const res = await fetch(api.applications.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch applications");
      return api.applications.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ApplicationInput) => {
      const validated = api.applications.create.input.parse(data);
      const res = await fetch(api.applications.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to create application");
      return api.applications.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
      toast({
        title: "Success",
        description: "Application created successfully",
      });
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<ApplicationInput>) => {
      const validated = api.applications.update.input.parse(updates);
      const url = buildUrl(api.applications.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update application");
      return api.applications.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
      toast({
        title: "Success",
        description: "Application updated successfully",
      });
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.applications.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete application");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
      toast({
        title: "Success",
        description: "Application deleted successfully",
      });
    },
  });
}
