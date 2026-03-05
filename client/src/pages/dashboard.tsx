import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Link2, RefreshCw, Trash2, Activity, ExternalLink, History, Package } from "lucide-react";
import { useProducts, useDeleteProduct, useUpdateProduct, useCheckProduct, useProductHistory, usePageItems } from "@/hooks/use-products";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout";
import { AddProductDialog } from "@/components/add-product-dialog";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function ItemStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "in stock" || s === "new") {
    return (
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs no-default-active-elevate">
        {status}
      </Badge>
    );
  }
  if (s === "out of stock") {
    return (
      <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs no-default-active-elevate">
        {status}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 text-xs no-default-active-elevate">
      {status}
    </Badge>
  );
}

export default function Dashboard() {
  const { data: products, isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();
  const checkProduct = useCheckProduct();
  const { toast } = useToast();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const { data: history, isLoading: historyLoading } = useProductHistory(selectedProductId);
  const { data: pageItemsList, isLoading: itemsLoading } = usePageItems(selectedProductId);

  const selectedProduct = products?.find((p: any) => p.id === selectedProductId);

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

  const handleCheckNow = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    checkProduct.mutate(id, {
      onSuccess: (data) => {
        const desc = data.changes.length > 0
          ? data.changes.slice(0, 3).join('; ')
          : 'No changes detected';
        toast({
          title: "Check complete",
          description: desc,
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

  const getDomain = (urlStr: string) => {
    try {
      return new URL(urlStr).hostname.replace('www.', '');
    } catch {
      return 'Link';
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground" data-testid="text-page-title">Monitored Products</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Track inventory changes in real-time.</p>
        </div>
        <AddProductDialog />
      </div>

      {/* Mobile card layout */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          <Card className="border border-border/50 bg-card/50 p-8">
            <div className="flex flex-col items-center justify-center gap-3">
              <Activity className="h-8 w-8 animate-pulse text-muted-foreground/50" />
              <span className="text-muted-foreground">Loading products...</span>
            </div>
          </Card>
        ) : !products || products.length === 0 ? (
          <Card className="border border-border/50 bg-card/50 p-8">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                <Link2 className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <span className="text-muted-foreground">No products being monitored.</span>
              <span className="text-sm text-muted-foreground">Tap "Add Product" to get started.</span>
            </div>
          </Card>
        ) : (
          products.map((product: any) => (
            <Card
              key={product.id}
              className="border border-border/50 bg-card/50 p-4 cursor-pointer active:bg-accent/30 transition-colors"
              onClick={() => setSelectedProductId(product.id)}
              data-testid={`card-product-${product.id}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate text-foreground/90" data-testid={`text-label-${product.id}`}>{product.label}</p>
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate w-fit"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    {getDomain(product.url)}
                  </a>
                </div>
                <StatusBadge status={product.status} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {product.lastCheckedAt
                    ? formatDistanceToNow(new Date(product.lastCheckedAt), { addSuffix: true })
                    : "Never checked"}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Switch
                    checked={product.isActive}
                    onCheckedChange={(checked) => handleToggleActive(product.id, checked)}
                    disabled={updateProduct.isPending}
                    onClick={(e) => e.stopPropagation()}
                    data-testid={`switch-active-${product.id}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleCheckNow(product.id, e)}
                    disabled={checkProduct.isPending && checkProduct.variables === product.id}
                    data-testid={`button-check-${product.id}`}
                  >
                    <RefreshCw className={`h-4 w-4 ${checkProduct.isPending && checkProduct.variables === product.id ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                    disabled={deleteProduct.isPending && deleteProduct.variables === product.id}
                    className="text-muted-foreground"
                    data-testid={`button-delete-${product.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Desktop table layout */}
      <Card className="hidden md:block border border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl shadow-black/10">
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
                products.map((product: any) => (
                  <TableRow
                    key={product.id}
                    className="border-border/50 group transition-colors cursor-pointer"
                    onClick={() => setSelectedProductId(product.id)}
                    data-testid={`row-product-${product.id}`}
                  >
                    <TableCell>
                      <div className="flex flex-col max-w-[300px]">
                        <span className="font-semibold truncate text-foreground/90" data-testid={`text-label-${product.id}`}>{product.label}</span>
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 mt-1 truncate w-fit"
                          onClick={(e) => e.stopPropagation()}
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
                      <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={product.isActive}
                          onCheckedChange={(checked) => handleToggleActive(product.id, checked)}
                          disabled={updateProduct.isPending}
                          data-testid={`switch-active-${product.id}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleCheckNow(product.id, e)}
                          disabled={checkProduct.isPending && checkProduct.variables === product.id}
                          title="Check Now"
                          data-testid={`button-check-${product.id}`}
                        >
                          <RefreshCw className={`h-4 w-4 ${checkProduct.isPending && checkProduct.variables === product.id ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                          disabled={deleteProduct.isPending && deleteProduct.variables === product.id}
                          className="text-muted-foreground"
                          title="Delete"
                          data-testid={`button-delete-${product.id}`}
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

      {/* Product Detail Dialog with Tabs */}
      <Dialog open={selectedProductId !== null} onOpenChange={(open) => { if (!open) setSelectedProductId(null); }}>
        <DialogContent className="max-w-lg w-[calc(100vw-2rem)] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg" data-testid="text-history-title">
              <History className="h-5 w-5" />
              {selectedProduct?.label ?? "Product"}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="notifications" className="flex-1 min-h-0 flex flex-col">
            <TabsList className="w-full" data-testid="tabs-detail">
              <TabsTrigger value="notifications" className="flex-1" data-testid="tab-notifications">Notifications</TabsTrigger>
              <TabsTrigger value="items" className="flex-1" data-testid="tab-items">Current Items</TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="flex-1 overflow-y-auto mt-4">
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Activity className="h-6 w-6 animate-pulse text-muted-foreground" />
                </div>
              ) : !history || history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No changes recorded yet. Run a check to start tracking.
                </div>
              ) : (
                <div className="space-y-3" data-testid="list-history">
                  {history.map((entry: any) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 p-3 rounded-md bg-muted/30 border border-border/30"
                      data-testid={`history-entry-${entry.id}`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-amber-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground/90">{entry.changeDescription}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <ItemStatusBadge status={entry.status} />
                          <span className="text-xs text-muted-foreground">
                            {entry.detectedAt
                              ? format(new Date(entry.detectedAt), "MMM d, yyyy 'at' h:mm a")
                              : "Unknown date"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="items" className="flex-1 overflow-y-auto mt-4">
              {itemsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Activity className="h-6 w-6 animate-pulse text-muted-foreground" />
                </div>
              ) : !pageItemsList || pageItemsList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No items found yet. Run a check to scan the page.
                </div>
              ) : (
                <div className="space-y-2" data-testid="list-items">
                  <p className="text-xs text-muted-foreground mb-3">{pageItemsList.length} item{pageItemsList.length !== 1 ? 's' : ''} found on this page</p>
                  {pageItemsList.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-md bg-muted/30 border border-border/30"
                      data-testid={`page-item-${item.id}`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Package className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate text-foreground/90">{item.itemName}</span>
                      </div>
                      <ItemStatusBadge status={item.itemStatus} />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
