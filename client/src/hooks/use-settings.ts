import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type SettingsResponse, type SettingsInput } from "@shared/routes";

export function useSettings() {
  return useQuery({
    queryKey: [api.settings.get.path],
    queryFn: async () => {
      const res = await fetch(api.settings.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      return api.settings.get.responses[200].parse(data);
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SettingsInput) => {
      const res = await fetch(api.settings.update.path, {
        method: api.settings.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(api.settings.update.input.parse(input)),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update settings");
      const data = await res.json();
      return api.settings.update.responses[200].parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settings.get.path] });
    },
  });
}
