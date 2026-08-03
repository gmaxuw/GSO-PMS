import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/status-badge";
import { DeleteButton } from "@/components/delete-button";
import { CreateStaffDialog } from "@/components/create-staff-dialog";
import { UserRowActions } from "@/components/user-row-actions";
import { CategoryFormDialog } from "@/components/category-form-dialog";
import { OfficeFormDialog } from "@/components/office-form-dialog";
import { requireAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { deleteCategory, deleteOffice } from "./actions";

export default async function SettingsPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const [{ data: users }, { data: categories }, { data: offices }] =
    await Promise.all([
      supabase.from("profiles").select("*").order("created_at"),
      supabase.from("categories").select("*").order("category_name"),
      supabase.from("offices").select("*").order("office_name"),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage staff accounts, categories, and offices
        </p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Staff Accounts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="offices">Offices</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-end">
            <CreateStaffDialog />
          </div>
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Role / Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users && users.length > 0 ? (
                    users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">
                          {u.full_name ?? "—"}
                          {u.id === profile.id && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (you)
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <StatusBadge status={u.status} />
                        </TableCell>
                        <TableCell>
                          <UserRowActions
                            userId={u.id}
                            role={u.role}
                            status={u.status}
                            isSelf={u.id === profile.id}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                        No accounts yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end">
            <CategoryFormDialog />
          </div>
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories && categories.length > 0 ? (
                    categories.map((c) => (
                      <TableRow key={c.category_id}>
                        <TableCell className="font-medium">
                          {c.category_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {c.description ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DeleteButton
                            action={deleteCategory.bind(null, c.category_id)}
                            confirmMessage={`Delete category "${c.category_name}"?`}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                        No categories yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offices" className="space-y-4">
          <div className="flex justify-end">
            <OfficeFormDialog />
          </div>
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Head</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offices && offices.length > 0 ? (
                    offices.map((o) => (
                      <TableRow key={o.office_id}>
                        <TableCell className="font-medium">{o.office_name}</TableCell>
                        <TableCell>{o.office_head ?? "—"}</TableCell>
                        <TableCell>{o.location ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <DeleteButton
                            action={deleteOffice.bind(null, o.office_id)}
                            confirmMessage={`Delete office "${o.office_name}"?`}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                        No offices yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
