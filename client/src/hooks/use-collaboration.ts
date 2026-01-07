import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateCollaborationRequest } from "@shared/routes";

export function useCollaborationRequests(vendorId: number | null, type?: 'sent' | 'received') {
  return useQuery({
    queryKey: [api.collaboration.list.path, vendorId, type],
    queryFn: async () => {
      if (!vendorId) return [];
      const params = new URLSearchParams();
      if (vendorId) params.append('vendorId', vendorId.toString());
      if (type) params.append('type', type);
      
      const res = await fetch(`${api.collaboration.list.path}?${params.toString()}`, { 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to fetch collaboration requests");
      return api.collaboration.list.responses[200].parse(await res.json());
    },
    enabled: !!vendorId,
  });
}

export function useCreateCollaborationRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCollaborationRequest) => {
      const res = await fetch(api.collaboration.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send request");
      return api.collaboration.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.collaboration.list.path] });
    },
  });
}

export function useUpdateCollaborationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'accepted' | 'rejected' }) => {
      const url = buildUrl(api.collaboration.updateStatus.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      return api.collaboration.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.collaboration.list.path] });
    },
  });
}
