import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { requireAdmin } from "@/lib/supabase/auth";

const sections = [
  { id: "stack", label: "1. Tech Stack" },
  { id: "why", label: "2. Why This Stack" },
  { id: "tree", label: "3. Project Tree" },
  { id: "flow", label: "4. Architecture & Data Flow" },
  { id: "security", label: "5. Database & Security" },
  { id: "features", label: "6. Core Features" },
  { id: "faq", label: "7. Panel Q&A" },
  { id: "limits", label: "8. Limitations" },
];

const stackItems: [string, string][] = [
  ["TypeScript", "Primary language for the whole codebase, front end and back end alike — JavaScript plus a compile-time type checker that catches mismatched fields and wrong data types before the code ever runs."],
  ["JavaScript", "What TypeScript compiles down to. The only language a web browser executes natively."],
  ["SQL (PostgreSQL dialect)", "The database schema, Row-Level Security policies, and helper functions are all written directly in Postgres SQL."],
  ["Next.js 16.2.12", "The application framework — routing, server-side rendering, the build pipeline, and Turbopack (its default bundler in v16)."],
  ["React 19.2.4", "The UI library every screen is built from, via react-dom 19.2.4."],
  ["Supabase (PostgreSQL 17)", "The backend: hosted database, authentication, and file storage in one platform. There is no separate hand-built backend server."],
  ["@supabase/ssr + @supabase/supabase-js", "Official client libraries connecting the app to Supabase from both the browser and the Next.js server, with cookie-based session handling."],
  ["radix-ui + shadcn", "Accessible, unstyled UI primitives (dialogs, dropdowns, the sidebar) wrapped into this project's styled components under src/components/ui, generated via the shadcn CLI in the “radix-nova” style."],
  ["qrcode / html5-qrcode", "Generates QR codes for asset stickers, and reads them back via device camera for Scan-to-Verify."],
  ["Tailwind CSS v4", "The styling system behind every screen, driven by CSS variables defined in globals.css."],
  ["lucide-react, sonner, tailwind-merge, clsx, class-variance-authority", "Icons, toast notifications, and small class-name utilities used throughout the UI."],
];

const treeGroups: { path: string; note: string }[] = [
  { path: "next.config.ts", note: "Nearly empty — its one real setting allow-lists the Supabase Storage domain so Next's <Image> component can load photos from it." },
  { path: "src/proxy.ts", note: "Next.js 16's renamed middleware file. Refreshes the session cookie on every request and redirects unauthenticated visitors away from /dashboard." },
  { path: "src/app/layout.tsx", note: "Root HTML shell — fonts, toast provider, and a generateMetadata() function that swaps in a custom favicon if one was uploaded in Settings." },
  { path: "src/app/page.tsx", note: "The public homepage — fetches team_members and site_settings with no login required and renders the team cards." },
  { path: "src/app/login/", note: "page.tsx is the sign-in form; actions.ts holds the login() Server Action." },
  { path: "src/app/dashboard/", note: "Every authenticated screen, one folder per feature, each pairing a page.tsx (fetch + render) with an actions.ts (Server Actions for every write)." },
  { path: "src/app/api/reports/assets/route.ts", note: "The one plain HTTP API route in the project — needed because a CSV download requires a real downloadable URL, which a Server Action can't provide directly." },
  { path: "src/components/", note: "Shared building blocks: form dialogs, action buttons, and the two components that do real work beyond forms — ImageUploadField (upload + WebP compression) and AssetScanner (camera QR reading)." },
  { path: "src/components/ui/", note: "The shadcn/Radix primitives everything else is built from — Button, Dialog, Table, Sidebar, Select, Tabs, and so on." },
  { path: "src/hooks/", note: "use-form-success.ts (the shared FormActionState type + useFormSuccessEffect hook every form dialog uses) and use-mobile.ts (responsive sidebar behavior)." },
  { path: "src/lib/", note: "Non-visual logic: format.ts (dates/currency/day-math), qrcode.ts, image-compress.ts, utils.ts, and supabase/ (client.ts, server.ts, admin.ts, auth.ts, database.types.ts)." },
];

const flowSteps = [
  { n: "01", title: "Request Hits proxy.ts", desc: "Session cookie refreshed; unauthenticated visitors to /dashboard/* are redirected to /login." },
  { n: "02", title: "Server Component Fetches Data", desc: "page.tsx calls requireUser(), then queries Supabase directly — e.g. supabase.from(\"assets\").select(...) in assets/page.tsx." },
  { n: "03", title: "Postgres Applies RLS", desc: "The query only succeeds because the logged-in user's profiles row satisfies is_active_user() or is_admin()." },
  { n: "04", title: "HTML Renders on the Server", desc: "The Server Component renders straight to HTML; Client Components like AssetFormDialog hydrate afterward for interactivity." },
  { n: "05", title: "Form Submits to a Server Action", desc: "No hand-written fetch() call — the form calls a Server Action directly via useActionState, e.g. createAsset in assets/actions.ts." },
  { n: "06", title: "Action Re-Checks Permissions & Writes", desc: "requireUser()/requireAdmin() run again inside the action itself, never trusting the UI already checked, then the row is inserted/updated." },
  { n: "07", title: "revalidatePath() Invalidates the Cache", desc: "Next.js discards its cached render for that URL; the next view re-runs step 2 with fresh data." },
];

const features: { name: string; body: string }[] = [
  { name: "Public Homepage & Editable Team Profiles", body: "src/app/page.tsx renders one TeamMemberCard per team_members row, in the exact field order the thesis specifies (Name, Year Level, Course, Age, Sex, Address, Contact Number, Email Address, then a “5 Years From Now” quote). Every field, including the photo, is editable from Settings → Homepage Team rather than hard-coded." },
  { name: "Authentication & Role-Based Dashboard", body: "Supabase Auth handles identity; profiles.role (admin/staff) drives permissions, checked both by database RLS and by requireUser()/requireAdmin() in code. AppSidebar hides Settings and Documentation entirely from Staff accounts." },
  { name: "Property Asset Registry", body: "assets/page.tsx lists every asset with live status/department filtering (AssetFilterBar, driven by URL search params) and search. AssetFormDialog handles both create and edit through the same component, switching between createAsset/updateAsset." },
  { name: "QR Sticker Generation & Printing", body: "generateQrDataUrl() encodes each asset's asset_code as a QR image. The sticker sheet is linked from the asset detail page and directly from each Movement & Issuance row once a transaction is saved — deliberately after custody is known, not before, since you can't label a sticker for an officer you haven't assigned yet." },
  { name: "Movement & Issuance + Automatic PAR/ICS", body: "createMovement records the transaction, keeps the asset's assigned_office_id in sync, and — when issuing or transferring to a named officer — auto-generates a linked par_records or ics_records row with an auto-numbered document like PAR-2026-0007, tied back to the exact transaction via assignment_id." },
  { name: "Printable PAR/ICS Receipts", body: "/dashboard/records/par/[id] and .../ics/[id] render official-format receipts server-side; PrintButton just calls window.print() — no PDF library involved, the browser's own print engine handles it." },
  { name: "Scan-to-Verify", body: "AssetScanner lazy-loads html5-qrcode only when scanning starts, reads a QR code via the device camera, and looks the decoded text up against assets.asset_code, with a manual text-entry fallback for damaged labels or camera-less devices." },
  { name: "Expiry & Lifecycle Tracker + Alerts", body: "Computes days remaining and a “life consumed” percentage per asset. “Send Notifications” (generateAlerts()) scans warranty/useful-life/maintenance thresholds and creates alerts rows for anything newly due. Worth being direct: this only creates in-app alerts — there is no email or SMS sending wired up." },
  { name: "Disposal & Write-off", body: "createDisposal records the disposal and flips the asset's status to disposed. An Admin can mark it approved via markDisposalApproved. This is a record-and-flag flow, not a multi-stage approval workflow — matching the thesis's own Chapter 1 scope exclusion." },
  { name: "Reports", body: "/api/reports/assets is a real GET endpoint returning a hand-built CSV (needed because downloads require a real URL). /dashboard/reports/rpcppe renders a printable, live-computed RPCPPE compliance document." },
  { name: "Settings", body: "One admin-only page (requireAdmin()) covering Staff Accounts (no public sign-up exists anywhere — every login is admin-provisioned), Categories, Offices, Homepage Team, and Branding (logo/favicon upload, falling back to the default mark if blank)." },
  { name: "Accountable Officer Photos", body: "OfficerFormDialog requires a photo; createOfficer/updateOfficer explicitly reject the submission server-side if photo_url is empty. Photos display as clickable PhotoLightbox thumbnails that open into a modal, closing on outside click or Escape — both handled by the underlying Radix Dialog for free." },
];

const faqs: { q: string; a: string }[] = [
  { q: "Where's the Java?", a: "There isn't any — and that's correct for a web app. This runs on JavaScript (written as TypeScript), the only language browsers execute natively. Java is a separately-compiled language for a different job; the two share part of a name from 1995 marketing and nothing else." },
  { q: "Why Next.js instead of plain PHP or WordPress?", a: "This is a transactional records system with linked tables and role permissions, not a content-publishing site. WordPress is built for the latter. Next.js gives reusable components — one AssetFormDialog used everywhere an asset form is needed — and TypeScript catches a class of bugs before the code runs." },
  { q: "Is Row Level Security actually enforced, or just UI hiding?", a: "It's enforced at the database level on all 13 tables. Every policy is backed by is_active_user()/is_admin(), checked by Postgres on every query — even a request that bypassed this website entirely would still be blocked." },
  { q: "What data is real versus seeded/demo?", a: "Only categories (5 fixed rows) and offices (7 fixed rows) were seeded once, matching the thesis's own mockups. Everything else — every asset, officer, movement, receipt, alert, disposal, and login — was created through the app's own forms." },
  { q: "How does login work — where are passwords stored?", a: "Never touched by this codebase. Supabase Auth verifies credentials and issues a secure session cookie, refreshed on every request by proxy.ts." },
  { q: "What stops a Staff account from reaching an admin page by URL?", a: "Two independent checks: proxy.ts redirects unauthenticated visitors, and every admin page/action separately calls requireAdmin(), which re-checks the role from the database. That second check exists specifically because route-matching alone isn't trustworthy on its own." },
  { q: "Why print the sticker at issuance instead of at registration?", a: "At registration, nobody necessarily knows yet who the asset is going to. Printing before custody is known means guessing or leaving it blank — so the sticker page is linked from the point custody actually becomes known." },
  { q: "Does this send real email/SMS alerts?", a: "No. “Send Notifications” creates in-app alert rows only. There's no email/SMS service wired up — it's a manual scan-and-flag tool, not a push pipeline." },
  { q: "Why is disposal only one approval step?", a: "That matches the thesis's Chapter 1 scope, which excludes a full approval-routing engine. What exists is a compliant record with a single admin-only approval flag." },
  { q: "Is this actually free to run?", a: "Yes — GitHub, Vercel, and Supabase free tiers, as scoped from the start. If usage ever outgrows those limits, the same code moves to a paid tier of the same services; no rebuild required." },
];

const limitations = [
  "No real outbound notifications — alerts are in-app only, no email/SMS integration.",
  "No automated test suite or CI pipeline — verification so far has been manual, click-through testing.",
  "No scheduled background jobs — alert generation is triggered manually, not run on a timer.",
  "No pagination on list views — fine at current data volume, would need it at real municipal scale.",
  "No optimistic concurrency control — simultaneous edits to the same record are last-write-wins.",
  "No soft-delete or audit-log table — admin deletes are permanent with no change history.",
  "Single-tenant branding — “Municipality of Villanueva” is written directly into print templates, not a setting.",
  "No login rate limiting beyond Supabase Auth's own defaults.",
  "next-themes is present but inert — wired into the toast component from the shadcn scaffold, but there's no user-facing theme toggle.",
];

export default async function DocumentationPage() {
  await requireAdmin();

  return (
    <div className="space-y-10 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documentation</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          A single, continuous technical reference for GSO-PMS &mdash; what
          this system does, why it was built this way, and how each part
          works, written for the team to read once and then explain
          confidently in a thesis defense.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2 border-y border-border/60 py-3">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <section id="stack" className="scroll-mt-16 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">1. Tech Stack, Named and Justified</h2>
        <Card>
          <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">Is Java used anywhere? No.</strong>{" "}
              JavaScript and Java are unrelated languages that share part of a
              name from 1995 marketing. JavaScript (written here as
              TypeScript, its typed superset) is the only language a browser
              runs natively. Java is a separately-compiled language for a
              different job entirely &mdash; there is no Java file, JVM, or
              Android component anywhere in this project.
            </p>
          </CardContent>
        </Card>
        <div className="divide-y divide-border rounded-lg border border-border/60">
          {stackItems.map(([name, desc]) => (
            <div key={name} className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-[260px_1fr] sm:gap-4">
              <p className="font-mono text-sm font-bold text-primary">{name}</p>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section id="why" className="scroll-mt-16 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">2. Why This Stack</h2>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            The thesis&apos;s own Chapter 3 already specifies something closer to
            a small enterprise records system than a brochure site: an
            eleven-plus-table relational schema, role-based access, a
            physical document trail (PAR/ICS receipts), and compliance
            reporting. That shape of problem is what dictated every tool
            choice here.
          </p>
          <p>
            <strong className="text-foreground">Next.js over plain HTML/PHP or WordPress</strong>{" "}
            &mdash; hand-written PHP re-implements validation, queries, and
            auth on every page, which is slow to build correctly and easy to
            get wrong. WordPress is built for publishing content, not
            transactional, permissioned, relational data. Next.js gives
            reusable components: fix a bug once in{" "}
            <code className="rounded bg-muted px-1">AssetFormDialog</code>,
            it&apos;s fixed everywhere that form is used.
          </p>
          <p>
            <strong className="text-foreground">TypeScript specifically</strong> &mdash;{" "}
            <code className="rounded bg-muted px-1">database.types.ts</code>{" "}
            is generated directly from the live Supabase schema, so every
            query is checked against real columns at build time, not
            discovered broken in front of a user.
          </p>
          <p>
            <strong className="text-foreground">Supabase over a hand-rolled backend or Firebase</strong>{" "}
            &mdash; the schema is explicitly relational (assets &rarr;
            assignments &rarr; receipts), a natural fit for Postgres and a
            poor fit for a NoSQL document store. Supabase also provides Row
            Level Security, authentication, and file storage without any of
            them being hand-built here.
          </p>
          <p>
            <strong className="text-foreground">Vercel for hosting</strong> &mdash; automatic
            rebuild and republish on every GitHub push, HTTPS included, and
            one-click rollback if an update breaks something &mdash; less to
            maintain by hand than traditional shared hosting.
          </p>
        </div>
      </section>

      <Separator />

      <section id="tree" className="scroll-mt-16 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">3. Full Project Tree, Explained</h2>
        <div className="space-y-2">
          {treeGroups.map((g) => (
            <div key={g.path} className="rounded-lg border border-border/60 p-3">
              <p className="font-mono text-xs font-bold text-primary">{g.path}</p>
              <p className="mt-1 text-sm text-muted-foreground">{g.note}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section id="flow" className="scroll-mt-16 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">4. Architecture &amp; Data Flow</h2>
        <p className="text-sm text-muted-foreground">
          The overall pattern: Server Components fetch data directly from the
          database when a page loads; Server Actions handle every write.
          There&apos;s no separate hand-written REST/GraphQL layer for normal
          CRUD &mdash; Next.js Server Actions are that layer.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {flowSteps.map((step) => (
            <Card key={step.n}>
              <CardContent className="space-y-1.5 pt-6">
                <p className="font-mono text-xs font-bold text-primary">{step.n}</p>
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Concrete example &mdash; issuing an asset:{" "}
          <code className="rounded bg-muted px-1">MovementFormDialog</code>{" "}
          calls <code className="rounded bg-muted px-1">createMovement</code>,
          which inserts an{" "}
          <code className="rounded bg-muted px-1">asset_assignments</code>{" "}
          row, syncs the asset&apos;s{" "}
          <code className="rounded bg-muted px-1">assigned_office_id</code>,
          and &mdash; when issuing or transferring to a named officer &mdash;
          auto-generates a numbered{" "}
          <code className="rounded bg-muted px-1">par_records</code> or{" "}
          <code className="rounded bg-muted px-1">ics_records</code> row
          (e.g. <code className="rounded bg-muted px-1">PAR-2026-0007</code>),
          immediately viewable and printable at{" "}
          <code className="rounded bg-muted px-1">/dashboard/records/par/[id]</code>.
        </p>
      </section>

      <Separator />

      <section id="security" className="scroll-mt-16 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">5. Database &amp; Security, Explained Plainly</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What&apos;s used</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            A hosted <strong className="text-foreground">PostgreSQL 17</strong>{" "}
            database on Supabase, across 13 tables: profiles, categories,
            offices, accountable_officers, assets, asset_assignments,
            par_records, ics_records, maintenance, disposal, alerts,
            team_members, and site_settings. No separate backend server
            exists outside of Next.js and Supabase.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Row Level Security &mdash; enabled on all 13 tables, no exceptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Two SQL helper functions back nearly every policy in the
              database:
            </p>
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
{`is_active_user()  -- true if the caller's profiles row has status = 'active'
is_admin()        -- true if additionally role = 'admin'`}
            </pre>
            <p>
              Everyday tables (assets, accountable_officers,
              asset_assignments, alerts, maintenance, par_records,
              ics_records, disposal) follow the same shape: any active user
              can read/insert/update &mdash; e.g. policy{" "}
              <code className="rounded bg-muted px-1">&quot;active users write assets&quot;</code>{" "}
              (INSERT, condition <code className="rounded bg-muted px-1">is_active_user()</code>)
              &mdash; while only an Admin can delete &mdash; policy{" "}
              <code className="rounded bg-muted px-1">&quot;admin delete assets&quot;</code>{" "}
              (DELETE, condition <code className="rounded bg-muted px-1">is_admin()</code>).
            </p>
            <p>
              Reference tables (categories, offices) are readable by any
              active user but only writable by an Admin.{" "}
              <code className="rounded bg-muted px-1">profiles</code> has no
              INSERT policy at all &mdash; new rows are created exclusively
              by a database trigger,{" "}
              <code className="rounded bg-muted px-1">handle_new_user()</code>,
              firing automatically when a new{" "}
              <code className="rounded bg-muted px-1">auth.users</code> row
              appears.{" "}
              <code className="rounded bg-muted px-1">team_members</code> and{" "}
              <code className="rounded bg-muted px-1">site_settings</code>{" "}
              are publicly readable (policy condition simply{" "}
              <code className="rounded bg-muted px-1">true</code>) since the
              homepage is unauthenticated, but writes still require{" "}
              <code className="rounded bg-muted px-1">is_admin()</code>.
            </p>
            <p>
              File storage follows the same pattern: three public buckets
              (team-photos, officer-photos, branding) are readable by
              anyone, but every upload/update/delete policy checks{" "}
              <code className="rounded bg-muted px-1">is_active_user()</code>{" "}
              or <code className="rounded bg-muted px-1">is_admin()</code>{" "}
              depending on the bucket.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Seeded vs. dynamic data</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Only <code className="rounded bg-muted px-1">categories</code>{" "}
            (5 fixed rows) and <code className="rounded bg-muted px-1">offices</code>{" "}
            (7 fixed rows) were seeded once, directly in Supabase, matching
            the departments and categories already named in the thesis&apos;s own
            mockups &mdash; no seed script file exists in the repo. Every
            other row in the system &mdash; every asset, officer, movement,
            receipt, alert, and login &mdash; was created through the app&apos;s
            own forms.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Authentication</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Email + password via Supabase Auth. No public self-registration
            route exists anywhere &mdash; every account is created by an
            Admin through <code className="rounded bg-muted px-1">createStaffAccount</code>.
            Passwords are never stored or handled by this codebase directly.
            Session state is a secure cookie managed by{" "}
            <code className="rounded bg-muted px-1">@supabase/ssr</code>,
            refreshed on every request by{" "}
            <code className="rounded bg-muted px-1">proxy.ts</code>. Every
            protected page/action independently re-checks the role via{" "}
            <code className="rounded bg-muted px-1">requireUser()</code>/
            <code className="rounded bg-muted px-1">requireAdmin()</code>,
            since &mdash; as the comment in{" "}
            <code className="rounded bg-muted px-1">auth.ts</code> puts it
            &mdash; &quot;proxy.ts route matching alone is not sufficient.&quot;
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section id="features" className="scroll-mt-16 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">6. Core Features, One by One</h2>
        <div className="space-y-3">
          {features.map((f) => (
            <Card key={f.name}>
              <CardHeader>
                <CardTitle className="text-base">{f.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section id="faq" className="scroll-mt-16 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">7. Likely Panel Questions, With Ready Answers</h2>
        <div className="space-y-3">
          {faqs.map((item) => (
            <Card key={item.q}>
              <CardHeader>
                <CardTitle className="text-base">{item.q}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section id="limits" className="scroll-mt-16 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">8. Limitations &amp; Possible Improvements</h2>
        <Card>
          <CardContent className="pt-6">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {limitations.map((item) => (
                <li key={item} className="flex gap-2">
                  <Badge variant="outline" className="mt-0.5 h-5 shrink-0 px-1.5 text-[10px]">
                    note
                  </Badge>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground">
          None of the above are hidden gaps &mdash; they&apos;re conscious
          trade-offs appropriate for a capstone-scoped system, each with a
          clear path forward if the project continues past thesis defense.
        </p>
      </section>
    </div>
  );
}
