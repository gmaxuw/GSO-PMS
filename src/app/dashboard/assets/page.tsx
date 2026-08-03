import { Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssetFormDialog } from "@/components/asset-form-dialog";
import { AssetFilterBar } from "@/components/asset-filter-bar";
import { DeleteButton } from "@/components/delete-button";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { deleteAsset } from "./actions";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; office?: string; q?: string }>;
}) {
  const profile = await requireUser();
  const { status, office, q } = await searchParams;
  const supabase = await createClient();

  const [{ data: categories }, { data: offices }] = await Promise.all([
    supabase.from("categories").select("*").order("category_name"),
    supabase.from("offices").select("*").order("office_name"),
  ]);

  let query = supabase
    .from("assets")
    .select("*, categories(category_name), offices:assigned_office_id(office_name)")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (office && office !== "all") {
    query = query.eq("assigned_office_id", Number(office));
  }
  if (q) {
    query = query.or(`asset_name.ilike.%${q}%,asset_code.ilike.%${q}%`);
  }

  const { data: assets } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Property Asset Registry
          </h1>
          <p className="text-sm text-muted-foreground">
            View, search, and manage all registered assets
          </p>
        </div>
        <AssetFormDialog categories={categories ?? []} offices={offices ?? []} />
      </div>

      <Card>
        <CardContent className="space-y-4">
          <AssetFilterBar offices={offices ?? []} />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property No.</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Acquisition Date</TableHead>
                  <TableHead>Useful Life</TableHead>
                  <TableHead>Expiry / Warranty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets && assets.length > 0 ? (
                  assets.map((asset) => (
                    <TableRow key={asset.asset_id}>
                      <TableCell className="font-medium">
                        {asset.asset_code}
                      </TableCell>
                      <TableCell>{asset.asset_name}</TableCell>
                      <TableCell>{asset.categories?.category_name ?? "—"}</TableCell>
                      <TableCell>{asset.offices?.office_name ?? "—"}</TableCell>
                      <TableCell>{formatDate(asset.acquisition_date)}</TableCell>
                      <TableCell>{asset.useful_life_years} yrs</TableCell>
                      <TableCell>{formatDate(asset.expiration_date)}</TableCell>
                      <TableCell>
                        <StatusBadge status={asset.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <AssetFormDialog
                            categories={categories ?? []}
                            offices={offices ?? []}
                            asset={asset}
                            trigger={
                              <Button variant="ghost" size="icon-sm">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            }
                          />
                          {profile.role === "admin" && (
                            <DeleteButton
                              action={deleteAsset.bind(null, asset.asset_id)}
                              confirmMessage={`Delete asset "${asset.asset_name}"? This cannot be undone.`}
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No assets found. Add your first asset to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
