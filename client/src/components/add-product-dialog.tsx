import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateProduct } from "@/hooks/use-products";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const formSchema = insertProductSchema.extend({
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createProduct = useCreateProduct();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      label: "",
      isActive: true,
    },
  });

  function onSubmit(values: FormValues) {
    createProduct.mutate(values, {
      onSuccess: () => {
        toast({
          title: "Product added",
          description: "We'll start tracking this URL immediately.",
        });
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-black/20 hover:shadow-primary/20 transition-all">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-border/50 bg-popover/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Monitor New Product</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Paste the URL of the product you want to track for inventory changes.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/90">Product Label</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., PS5 Pro Amazon" 
                      className="bg-background/50 border-border/50 focus-visible:ring-primary/20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/90">Product URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://..." 
                      className="bg-background/50 border-border/50 focus-visible:ring-primary/20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                disabled={createProduct.isPending}
                className="w-full sm:w-auto"
              >
                {createProduct.isPending ? "Adding..." : "Start Tracking"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
