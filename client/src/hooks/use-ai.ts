import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useGenerateContent() {
  return useMutation({
    mutationFn: async (data: { topic: string; platform: string; tone?: string }) => {
      const res = await fetch(api.ai.generateContent.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate content");
      return api.ai.generateContent.responses[200].parse(await res.json());
    },
  });
}
