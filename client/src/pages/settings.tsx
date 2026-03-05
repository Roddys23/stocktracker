import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSettingsSchema } from "@shared/schema";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { Bell, Save } from "lucide-react";

const formSchema = insertSettingsSchema;
type FormValues = z.infer<typeof formSchema>;

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discordWebhookUrl: "",
    },
  });

  // Pre-fill form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        discordWebhookUrl: settings.discordWebhookUrl || "",
      });
    }
  }, [settings, form]);

  function onSubmit(values: FormValues) {
    updateSettings.mutate(values, {
      onSuccess: () => {
        toast({
          title: "Settings saved",
          description: "Your notification preferences have been updated.",
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Failed to save settings",
          description: error.message,
        });
      }
    });
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your application preferences and notifications.</p>
      </div>

      <div className="max-w-2xl">
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl shadow-black/10">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure how you want to be alerted when a product comes back in stock.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse flex flex-col gap-4">
                <div className="h-4 w-32 bg-muted rounded"></div>
                <div className="h-10 w-full bg-muted/50 rounded"></div>
                <div className="h-10 w-24 bg-muted rounded mt-2"></div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="discordWebhookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/90">Discord Webhook URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://discord.com/api/webhooks/..." 
                            className="bg-background/50 border-border/50 focus-visible:ring-primary/20"
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Create a webhook in your Discord server channel settings and paste the URL here.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={updateSettings.isPending || !form.formState.isDirty}
                    className="gap-2 shadow-lg shadow-primary/10 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    {updateSettings.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
