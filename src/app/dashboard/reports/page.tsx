import Link from "next/link";
import { Download, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";

export default async function ReportsPage() {
  const supabase = await createClient();

  const [{ count: totalAssets }, { data: assets }] = await Promise.all([
    supabase.from("assets").select("*", { count: "exact", head: true }),
    supabase.from("assets").select("acquisition_cost, status"),
  ]);

  const totalValue = (assets ?? []).reduce((sum, a) => sum + a.acquisition_cost, 0);
  const activeValue = (assets ?? [])
    .filter((a) => a.status !== "disposed")
    .reduce((sum, a) => sum + a.acquisition_cost, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Export and print property inventory reports
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold tabular-nums">
            {totalAssets ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Acquisition Value
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold tabular-nums">
            {formatCurrency(totalValue)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Property Value
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold tabular-nums">
            {formatCurrency(activeValue)}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asset Registry (CSV)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Export the full property asset registry as a spreadsheet-ready
              CSV file, including category, department, cost, and lifecycle
              dates.
            </p>
            <Button asChild>
              <a href="/api/reports/assets" download>
                <Download className="h-4 w-4" /> Export CSV
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Report on the Physical Count of Property, Plant and Equipment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Generate a printable RPCPPE document for physical inventory
              verification and COA reporting.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/reports/rpcppe">
                <Printer className="h-4 w-4" /> Open Printable Report
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
