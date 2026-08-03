"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FormActionState } from "@/hooks/use-form-success";

export async function createStaffAccount(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdmin();

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      error:
        "SUPABASE_SERVICE_ROLE_KEY is not configured on the server. Add it to .env.local (get it from Supabase Dashboard > Project Settings > API Keys) to enable account creation.",
    };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const role = formData.get("role") as string;

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateUserRole(userId: string, role: "admin" | "staff") {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  return undefined;
}

export async function updateUserStatus(
  userId: string,
  status: "active" | "inactive",
) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  return undefined;
}

export async function createCategory(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("categories").insert({
    category_name: formData.get("category_name") as string,
    description: (formData.get("description") as string) || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function deleteCategory(categoryId: number) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("category_id", categoryId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  return undefined;
}

export async function createOffice(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("offices").insert({
    office_name: formData.get("office_name") as string,
    office_head: (formData.get("office_head") as string) || null,
    location: (formData.get("location") as string) || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function deleteOffice(officeId: number) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("offices").delete().eq("office_id", officeId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  return undefined;
}
