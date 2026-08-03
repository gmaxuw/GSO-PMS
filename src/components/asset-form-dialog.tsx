"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { useFormSuccessEffect } from "@/hooks/use-form-success";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAsset, updateAsset } from "@/app/dashboard/assets/actions";
import type { Tables } from "@/lib/supabase/database.types";

type Category = Tables<"categories">;
type Office = Tables<"offices">;
type Asset = Tables<"assets">;

export function AssetFormDialog({
  categories,
  offices,
  asset,
  trigger,
}: {
  categories: Category[];
  offices: Office[];
  asset?: Asset;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const action = asset ? updateAsset.bind(null, asset.asset_id) : createAsset;
  const [state, formAction, isPending] = useActionState(action, null);

  useFormSuccessEffect(
    state,
    asset ? "Asset updated." : "Asset added to the registry.",
    () => setOpen(false),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4" /> Add Asset
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {asset ? "Edit Property Asset" : "Add New Property Asset"}
          </DialogTitle>
          <DialogDescription>
            Register a non-consumable government asset.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asset_code">Property / Asset Code</Label>
              <Input
                id="asset_code"
                name="asset_code"
                required
                defaultValue={asset?.asset_code}
                placeholder="e.g. PAR-2026-0500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select name="category_id" defaultValue={asset?.category_id?.toString()}>
                <SelectTrigger id="category_id" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.category_id}
                      value={category.category_id.toString()}
                    >
                      {category.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset_name">Asset Name</Label>
            <Input
              id="asset_name"
              name="asset_name"
              required
              defaultValue={asset?.asset_name}
              placeholder="e.g. HP LaserJet Pro M404n"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Asset Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={asset?.description ?? ""}
              placeholder="Full description of the asset"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" name="brand" defaultValue={asset?.brand ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" name="model" defaultValue={asset?.model ?? ""} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serial_number">Serial Number</Label>
            <Input
              id="serial_number"
              name="serial_number"
              defaultValue={asset?.serial_number ?? ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="acquisition_date">Acquisition Date</Label>
              <Input
                id="acquisition_date"
                name="acquisition_date"
                type="date"
                required
                defaultValue={asset?.acquisition_date ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acquisition_cost">Acquisition Cost (₱)</Label>
              <Input
                id="acquisition_cost"
                name="acquisition_cost"
                type="number"
                step="0.01"
                min="0"
                defaultValue={asset?.acquisition_cost ?? 0}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="useful_life_years">Useful Life (Years)</Label>
            <Input
              id="useful_life_years"
              name="useful_life_years"
              type="number"
              min="1"
              defaultValue={asset?.useful_life_years ?? 5}
            />
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Lifecycle & Expiry Dates
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiration_date">Expiry / End of Useful Life</Label>
                <Input
                  id="expiration_date"
                  name="expiration_date"
                  type="date"
                  defaultValue={asset?.expiration_date ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warranty_expiry">Warranty Expiry Date</Label>
                <Input
                  id="warranty_expiry"
                  name="warranty_expiry"
                  type="date"
                  defaultValue={asset?.warranty_expiry ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="next_service_date">Next Service / Maintenance</Label>
                <Input
                  id="next_service_date"
                  name="next_service_date"
                  type="date"
                  defaultValue={asset?.next_service_date ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert_days_before">Alert Notification (days before)</Label>
                <Input
                  id="alert_days_before"
                  name="alert_days_before"
                  type="number"
                  min="0"
                  defaultValue={asset?.alert_days_before ?? 30}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_office_id">Assigned Department</Label>
            <Select
              name="assigned_office_id"
              defaultValue={asset?.assigned_office_id?.toString()}
            >
              <SelectTrigger id="assigned_office_id" className="w-full">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {offices.map((office) => (
                  <SelectItem key={office.office_id} value={office.office_id.toString()}>
                    {office.office_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" name="remarks" defaultValue={asset?.remarks ?? ""} rows={2} />
          </div>

          {state && "error" in state && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Asset Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
