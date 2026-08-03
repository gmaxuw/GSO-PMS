import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { SendNotificationsButton } from "@/components/send-notifications-button";
import { createClient } from "@/lib/supabase/server";
import { formatDate, daysUntil } from "@/lib/format";
import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";

export default async function ExpiryPage() {
  const supabase = await createClient();

  const { data: assets } = await supabase
    .from("assets")
    .select("*, categories(category_name), offices:assigned_office_id(office_name)")
    .neq("status", "disposed")
    .order("expiration_date", { ascending: true, nullsFirst: false });

  const rows = (assets ?? []).map((asset) => {
    const remaining = daysUntil(asset.expiration_date);
    const acquired = new Date(asset.acquisition_date).getTime();
    const expires = asset.expiration_date
      ? new Date(asset.expiration_date).getTime()
      : null;
    const totalDays = expires ? (expires - acquired) / 86_400_000 : null;
    const elapsedDays = (Date.now() - acquired) / 86_400_000;
    const lifeConsumed =
      totalDays && totalDays > 0
        ? Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)))
        : null;

    let bucket: "expired" | "critical" | "warning" | "good" = "good";
    if (remaining !== null) {
      if (remaining < 0) bucket = "expired";
      else if (remaining <= 30) bucket = "critical";
      else if (remaining <= 90) bucket = "warning";
    }

    return { asset, remaining, lifeConsumed, bucket };
  });

  const counts = {
    expired: rows.filter((r) => r.bucket === "expired").length,
    critical: rows.filter((r) => r.bucket === "critical").length,
    warning: rows.filter((r) => r.bucket === "warning").length,
    good: rows.filter((r) => r.bucket === "good").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Expiry & Lifecycle Tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor warranty, useful life, and service schedules
          </p>
        </div>
        <SendNotificationsButton />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Expired"
          value={counts.expired}
          hint="Needs disposal action"
          icon={XCircle}
        />
        <StatCard
          label="Expiring ≤ 30 days"
          value={counts.critical}
          hint="Urgent renewal"
          icon={AlertTriangle}
        />
        <StatCard
          label="Expiring ≤ 90 days"
          value={counts.warning}
          hint="Plan ahead"
          icon={Clock}
        />
        <StatCard
          label="Good Standing"
          value={counts.good}
          hint="No action needed"
          icon={CheckCircle2}
        />
      </div>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Dept / Location</TableHead>
                  <TableHead>Acquisition</TableHead>
                  <TableHead>Useful Life</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Days Remaining</TableHead>
                  <TableHead>Life Consumed</TableHead>
                  <TableHead>Warranty Expiry</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length > 0 ? (
                  rows.map(({ asset, remaining, lifeConsumed, bucket }) => (
                    <TableRow key={asset.asset_id}>
                      <TableCell>
                        <div className="font-medium">{asset.asset_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {asset.asset_code}
                        </div>
                      </TableCell>
                      <TableCell>{asset.offices?.office_name ?? "—"}</TableCell>
                      <TableCell>{formatDate(asset.acquisition_date)}</TableCell>
                      <TableCell>{asset.useful_life_years} yrs</TableCell>
                      <TableCell>{formatDate(asset.expiration_date)}</TableCell>
                      <TableCell>
                        {remaining === null ? (
                          "—"
                        ) : (
                          <span
                            className={
                              bucket === "expired"
                                ? "font-medium text-rose-600 dark:text-rose-400"
                                : bucket === "critical"
                                  ? "font-medium text-amber-600 dark:text-amber-400"
                                  : ""
                            }
                          >
                            {remaining < 0
                              ? `Expired ${Math.abs(remaining)}d ago`
                              : `${remaining} days`}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {lifeConsumed !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                              <div
                                className={
                                  "h-full rounded-full " +
                                  (lifeConsumed >= 100
                                    ? "bg-rose-500"
                                    : lifeConsumed >= 75
                                      ? "bg-amber-500"
                                      : "bg-emerald-500")
                                }
                                style={{ width: `${lifeConsumed}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {lifeConsumed}%
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{formatDate(asset.warranty_expiry)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No assets to track yet.
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
