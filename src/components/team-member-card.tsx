import Image from "next/image";
import { UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Tables } from "@/lib/supabase/database.types";

type TeamMember = Tables<"team_members">;

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5 py-1.5 text-sm">
      <span className="text-xs font-medium whitespace-nowrap uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <Card className="group overflow-hidden py-0 transition-shadow hover:shadow-lg">
      <div className="relative aspect-[3/4] w-full bg-muted">
        {member.photo_url ? (
          <Image
            src={member.photo_url}
            alt={member.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 border-b border-dashed border-border bg-gradient-to-b from-muted to-muted/60 text-muted-foreground">
            <UserRound className="h-16 w-16" strokeWidth={1.25} />
            <span className="text-xs">Photo coming soon</span>
          </div>
        )}
      </div>

      <CardContent className="space-y-1 px-5 pb-6">
        <h3 className="pt-1 text-lg font-semibold leading-tight">
          {member.name}
        </h3>

        <div className="divide-y divide-border/60">
          <InfoRow label="Year Level" value={member.year_level} />
          <InfoRow label="Course" value={member.course} />
          <InfoRow label="Age" value={member.age} />
          <InfoRow label="Sex" value={member.sex} />
          <InfoRow label="Address" value={member.address} />
          <InfoRow label="Contact Number" value={member.contact_number} />
          <InfoRow label="Email Address" value={member.email} />
        </div>

        <div className="mt-3 rounded-lg bg-muted/60 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            5 Years From Now
          </p>
          <p className="mt-1 text-sm italic leading-relaxed text-foreground/90">
            &ldquo;{member.future_summary}&rdquo;
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
