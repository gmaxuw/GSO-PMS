import { notFound } from "next/navigation";
import { PrintButton } from "@/components/print-button";
import { createClient } from "@/lib/supabase/server";
import { generateQrDataUrl } from "@/lib/qrcode";

export default async function AssetStickerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ copies?: string }>;
}) {
  const { id } = await params;
  const { copies } = await searchParams;
  const supabase = await createClient();

  const { data: asset } = await supabase
    .from("assets")
    .select("asset_code, asset_name")
    .eq("asset_id", Number(id))
    .single();

  if (!asset) notFound();

  const qrDataUrl = await generateQrDataUrl(asset.asset_code);
  const count = Math.min(Math.max(Number(copies) || 6, 1), 24);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Printable Asset Sticker
          </h1>
          <p className="text-sm text-muted-foreground">
            Print, cut along the borders, and affix to the physical asset.
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex h-[1in] w-[2.5in] items-center gap-2 border border-dashed border-foreground/40 p-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR code" className="h-[0.85in] w-[0.85in] shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide">
                GSO-PMS &middot; Villanueva
              </p>
              <p className="truncate text-xs font-bold">{asset.asset_code}</p>
              <p className="truncate text-[10px] text-muted-foreground">
                {asset.asset_name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
