import Image from "next/image";
import { UserRound } from "lucide-react";
import type { Tables } from "@/lib/supabase/database.types";

type TeamMember = Tables<"team_members">;

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/10 py-1.5 text-sm last:border-0">
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="truncate text-right font-medium text-slate-200">{value}</span>
    </div>
  );
}

export function TeamMemberCard({ member }: { member: TeamMember }) {
  const roster = String(member.sort_order).padStart(2, "0");

  return (
    <div className="group relative flex flex-col">
      <span
        aria-hidden
        className="absolute -top-2 left-0 z-10 font-mono text-6xl font-black text-white/5 select-none sm:text-7xl"
      >
        {roster}
      </span>

      <div className="relative aspect-[3/4] w-full">
        {member.photo_url ? (
          <Image
            src={member.photo_url}
            alt={member.name}
            fill
            className="object-contain object-bottom drop-shadow-[0_18px_28px_rgba(0,0,0,0.55)] transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-end gap-2 pb-6 text-slate-600">
            <UserRound className="h-16 w-16" strokeWidth={1} />
            <span className="text-xs">Photo coming soon</span>
          </div>
        )}
      </div>

      <div className="relative z-10 -mt-1 space-y-3 px-1 pt-3">
        <div>
          <div className="h-0.5 w-10 bg-sky-400" />
          <h3 className="mt-2 text-lg leading-tight font-black tracking-tight text-white uppercase">
            {member.name}
          </h3>
          <p className="text-xs font-medium text-sky-400">{member.course}</p>
        </div>

        <div>
          <StatRow label="Year Level" value={member.year_level} />
          <StatRow label="Age" value={member.age} />
          <StatRow label="Sex" value={member.sex} />
          <StatRow label="Address" value={member.address} />
          <StatRow label="Contact Number" value={member.contact_number} />
          <StatRow label="Email Address" value={member.email} />
        </div>

        <blockquote className="border-l-2 border-sky-400/60 pl-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            5 Years From Now
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-300 italic">
            &ldquo;{member.future_summary}&rdquo;
          </p>
        </blockquote>
      </div>
    </div>
  );
}
