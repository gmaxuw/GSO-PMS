import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { AlertActions } from "@/components/alert-actions";
import { SendNotificationsButton } from "@/components/send-notifications-button";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

const typeLabels: Record<string, string> = {
  warranty: "Warranty",
  useful_life: "Useful Life",
  maintenance: "Maintenance",
};

export default async function AlertsPage() {
  const supabase = await createClient();

  const { data: alerts } = await supabase
    .from("alerts")
    .select("*, assets(asset_code, asset_name)")
    .order("status", { ascending: true })
    .order("alert_date", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
          <p className="text-sm text-muted-foreground">
            Warranty expiry, useful life, and maintenance notifications
          </p>
        </div>
        <SendNotificationsButton />
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts && alerts.length > 0 ? (
                alerts.map((alert) => (
                  <TableRow key={alert.alert_id}>
                    <TableCell>
                      <div className="font-medium">
                        {alert.assets?.asset_name ?? "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {alert.assets?.asset_code}
                      </div>
                    </TableCell>
                    <TableCell>{typeLabels[alert.alert_type]}</TableCell>
                    <TableCell className="max-w-80 text-muted-foreground">
                      {alert.alert_message}
                    </TableCell>
                    <TableCell>{formatDate(alert.alert_date)}</TableCell>
                    <TableCell>
                      <StatusBadge status={alert.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertActions alertId={alert.alert_id} status={alert.status} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No alerts. Use &quot;Send Notifications&quot; on the Expiry
                    Tracker to scan for approaching thresholds.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
