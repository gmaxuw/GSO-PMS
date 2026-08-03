"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { FormActionState } from "@/hooks/use-form-success";

export async function createDisposal(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireUser();
  const supabase = await createClient();

  const assetId = Number(formData.get("asset_id"));
  const appraisalValue = formData.get("appraisal_value");
  const inspectionDate = formData.get("inspection_date");

  const { error } = await supabase.from("disposal").insert({
    asset_id: assetId,
    disposal_date: formData.get("disposal_date") as string,
    disposal_method: formData.get("disposal_method") as string,
    appraisal_value: appraisalValue ? Number(appraisalValue) : null,
    inspection_date: inspectionDate ? (inspectionDate as string) : null,
    approved_by: (formData.get("approved_by") as string) || null,
    remarks: (formData.get("remarks") as string) || null,
    status: "pending",
  });

  if (error) return { error: error.message };

  // Recording a disposal removes the asset from active circulation.
  await supabase.from("assets").update({ status: "disposed" }).eq("asset_id", assetId);

  revalidatePath("/dashboard/disposal");
  revalidatePath("/dashboard/assets");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function markDisposalApproved(disposalId: number) {
  const profile = await requireUser();
  if (profile.role !== "admin") {
    return { error: "Only administrators can approve disposal records." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("disposal")
    .update({ status: "approved" })
    .eq("disposal_id", disposalId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/disposal");
  return undefined;
}
