import { formatDistanceToNow } from "date-fns";
import { Link2, RefreshCw, Trash2, Activity, ExternalLink } from "lucide-react";
import { useProducts, useDeleteProduct, useUpdateProduct, useCheckProduct } from "@/hooks/use-products";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout";
import { AddProductDialog } from "@/components/add-product-dialog";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Dashboard() {
  const { data: products, isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();
  const checkProduct = useCheckProduct();
  const { toast } = useToast();

  const handleToggleActive = (id: number, isActive: boolean) => {
    updateProduct.mutate({ id, isActive });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to stop tracking this product?")) {
      deleteProduct.mutate(id, {
        onSuccess: () => {
          toast({ title: "Product removed" });
        }
      });
    }
  };

  const handleCheckNow = (id: number) => {
    checkProduct.mutate(id, {
      onSuccess: (data) => {
        toast({ 
          title: "Check complete", 
          description: `Current status: ${data.status}` 
        });
      },
      onError: () => {
        toast({ 
          variant: "destructive",
          title: "Check failed", 
          description: "Could not fetch current status." 
        });
      }
    });
  };

  // Helper to extract domain for clean display
  const getDomain = (urlStr: string) => {
    try {
      return new URL(urlStr).hostname.replace('www.', '');
    } catch {
      return 'Link';
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Monitored Products</h1>
          <p className="text-muted-foreground mt-1">Keep track of inventory changes in real-time.</p>
        </div>
        <AddProductDialog />
      </div>

      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/10">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-[300px]">Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Checked</TableHead>
                <TableHead className="text-center">Tracking</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Activity className="h-8 w-8 animate-pulse text-muted-foreground/50" />
                      <span>Loading products...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : !products || products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                        <Link2 className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <span>No products being monitored.</span>
                      <span className="text-sm">Click "Add Product" to get started.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} className="border-border/50 group transition-colors">
                    <TableCell>
                      <div className="flex flex-col max-w-[300px]">
                        <span className="font-semibold truncate text-foreground/90">{product.label}</span>
                        <a 
                          href={product.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 mt-1 truncate w-fit"
                        >
                          <ExternalLink className="h-3 w-3 inline" />
                          {getDomain(product.url)}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={product.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {product.lastCheckedAt 
                        ? formatDistanceToNow(new Date(product.lastCheckedAt), { addSuffix: true })
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Switch 
                          checked={product.isActive}
                          onCheckedChange={(checked) => handleToggleActive(product.id, checked)}
                          disabled={updateProduct.isPending}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleCheckNow(product.id)}
                          disabled={checkProduct.isPending && checkProduct.variables === product.id}
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          title="Check Now"
                        >
                          <RefreshCw className={`h-4 w-4 ${checkProduct.isPending && checkProduct.variables === product.id ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          disabled={deleteProduct.isPending && deleteProduct.variables === product.id}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </Layout>
  );
}
