import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreateExpansionRequest } from "@shared/routes";

export function useExpansionRequests() {
  return useQuery({
    queryKey: [api.expansion.list.path],
    queryFn: async () => {
      const res = await fetch(api.expansion.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch expansion requests");
      return api.expansion.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateExpansionRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateExpansionRequest) => {
      const res = await fetch(api.expansion.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to post pitch");
      return api.expansion.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.expansion.list.path] });
    },
  });
}
