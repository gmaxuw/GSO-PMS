import { FileText } from "lucide-react";
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
import { MovementFormDialog } from "@/components/movement-form-dialog";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export default async function MovementsPage() {
  const supabase = await createClient();

  const [
    { data: assignments },
    { data: assets },
    { data: officers },
    { data: offices },
    { data: parRecords },
    { data: icsRecords },
  ] = await Promise.all([
    supabase
      .from("asset_assignments")
      .select(
        "*, assets(asset_code, asset_name), accountable_officers(first_name, last_name), offices(office_name)",
      )
      .order("assigned_date", { ascending: false }),
    supabase
      .from("assets")
      .select("*")
      .neq("status", "disposed")
      .order("asset_name"),
    supabase.from("accountable_officers").select("*").eq("status", "active"),
    supabase.from("offices").select("*").order("office_name"),
    supabase.from("par_records").select("par_no, assignment_id"),
    supabase.from("ics_records").select("ics_no, assignment_id"),
  ]);

  const docByAssignment = new Map<number, string>();
  parRecords?.forEach((r) => {
    if (r.assignment_id) docByAssignment.set(r.assignment_id, r.par_no);
  });
  icsRecords?.forEach((r) => {
    if (r.assignment_id) docByAssignment.set(r.assignment_id, r.ics_no);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Movement & Issuance
          </h1>
          <p className="text-sm text-muted-foreground">
            Track asset transfers, issuances, and returns
          </p>
        </div>
        <MovementFormDialog
          assets={assets ?? []}
          officers={officers ?? []}
          offices={offices ?? []}
        />
      </div>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doc No.</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Officer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments && assignments.length > 0 ? (
                  assignments.map((row) => (
                    <TableRow key={row.assignment_id}>
                      <TableCell className="font-medium">
                        {docByAssignment.has(row.assignment_id) ? (
                          <span className="inline-flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            {docByAssignment.get(row.assignment_id)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {row.assets?.asset_name ?? "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {row.assets?.asset_code}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} />
                      </TableCell>
                      <TableCell>{row.offices?.office_name ?? "—"}</TableCell>
                      <TableCell>
                        {row.accountable_officers
                          ? `${row.accountable_officers.first_name} ${row.accountable_officers.last_name}`
                          : "—"}
                      </TableCell>
                      <TableCell>{formatDate(row.assigned_date)}</TableCell>
                      <TableCell className="max-w-48 truncate text-muted-foreground">
                        {row.remarks ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No transactions recorded yet.
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
