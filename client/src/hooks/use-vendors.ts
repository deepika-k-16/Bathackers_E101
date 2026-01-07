import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateVendorRequest } from "@shared/routes";

export function useVendor(id: number | null) {
  return useQuery({
    queryKey: [api.vendors.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.vendors.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch vendor");
      return api.vendors.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateVendorRequest) => {
      const res = await fetch(api.vendors.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create vendor");
      return api.vendors.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.vendors.list.path] });
    },
  });
}

export function useVendorDashboard(id: number | null) {
  return useQuery({
    queryKey: [api.vendors.getDashboard.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.vendors.getDashboard.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return api.vendors.getDashboard.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useVendorMatches(id: number | null) {
  return useQuery({
    queryKey: [api.vendors.getMatches.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.vendors.getMatches.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch matches");
      return api.vendors.getMatches.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
