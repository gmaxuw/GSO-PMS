import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SiteLogo } from "@/components/site-logo";
import { createClient } from "@/lib/supabase/server";

const sections = [
  { id: "stack", label: "1. Tech Stack" },
  { id: "why", label: "2. Why This Stack" },
  { id: "tree", label: "3. Project Tree" },
  { id: "flow", label: "4. Architecture & Data Flow" },
  { id: "security", label: "5. Database & Security" },
  { id: "features", label: "6. Core Features" },
  { id: "faq", label: "7. Panel Q&A" },
  { id: "limits", label: "8. Limitations" },
  { id: "reviewer", label: "9. Reviewer Cheat Sheet" },
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
  { name: "Authentication & Role-Based Dashboard", body: "Supabase Auth handles identity; profiles.role (admin/staff) drives permissions, checked both by database RLS and by requireUser()/requireAdmin() in code. AppSidebar hides Settings entirely from Staff accounts." },
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

const reviewerQAs: { q: string; a: string }[] = [
  { q: "Is it fair to call Vercel and Supabase “hosting” too?", a: "Yes — both are hosting, they just host two different halves of the system. Vercel hosts and runs the actual application: it takes the code, builds it, and serves the pages when someone visits the URL. Supabase hosts the data side: the database, the login system, and the uploaded photos. Simple way to say it: Vercel is the storefront that's always open; Supabase is the warehouse and records room behind it that the storefront calls into whenever it needs information." },
  { q: "So is it “one hosts frontend, one hosts backend”?", a: "Close, but worth tightening — a panel likes to poke at exactly this. Vercel doesn't only host what the browser shows, it also runs the server-side part of the app (fetching data, handling form submissions) before the page ever reaches the browser. So Vercel hosts and runs the whole application, front and back. Supabase isn't “the backend” in the sense of running code at all — it's the data layer the app calls out to. Cleaner phrasing: Vercel runs the app. Supabase remembers everything the app needs to remember." },
  { q: "Is JavaScript the same thing as TypeScript?", a: "Not exactly — TypeScript is a superset of JavaScript. Every valid JavaScript file is already valid TypeScript; TypeScript just lets you add optional type annotations on top (“this must always be a string”), and a compiler checks that promise before the code runs. Once checked, TypeScript is compiled straight into plain JavaScript — the browser never actually sees TypeScript, only JavaScript. So: this project is written in TypeScript, but it ships as, and runs as, JavaScript." },
  { q: "What does “compile” or “build” actually mean here?", a: "It means turning the TypeScript/React source code into the plain HTML, CSS, and JavaScript a browser can run — checking types, bundling files together, and optimizing them along the way. That's the next build step, the exact one Vercel runs automatically on every push." },
  { q: "If Supabase holds the data, is Supabase “the website”?", a: "No — Supabase has no idea what the website looks like. It only stores data and answers requests for it. Its own dashboard shows tables and rows, not the property registry screen. The actual website — pages, layout, forms — is entirely defined by the Next.js code hosted on Vercel. Supabase is a service the website talks to, not the website itself." },
  { q: "If PHP works, why isn't it used here?", a: "PHP genuinely works — WordPress runs on it. It's not that PHP can't do this job, it's that plain PHP means hand-building everything Next.js and Supabase already hand us for free: reusable interactive components, type-checking that catches mistakes before code runs, permission rules enforced at the database itself instead of just the page, and a deploy pipeline triggered automatically by a git push. A modern PHP framework like Laravel gets closer, but that's rebuilding the same toolkit under a different name, still on older single-server hosting instead of this project's push-to-deploy pipeline." },
  { q: "Is this project mobile-friendly?", a: "Reasonably, yes, though it isn't mobile-first. Tailwind's responsive classes run throughout: the homepage's team grid reflows from four columns down to one on a phone, the sidebar collapses into a slide-out drawer on small screens (that's what useIsMobile() in use-mobile.ts is for), and dialogs resize to fit. What isn't fully optimized: the data tables (Asset Registry, Officers, Movement & Issuance, Records) scroll sideways on a phone instead of restacking as cards — a normal, honest trade-off for a back-office tool GSO staff mostly use at a desk, and a contained next step rather than a rebuild if this engagement continues." },
];

function SyntaxBreakdown({ items }: { items: [string, string][] }) {
  return (
    <div className="divide-y divide-border rounded-lg border border-border/60">
      {items.map(([token, desc]) => (
        <div key={token} className="grid grid-cols-1 gap-1 p-2.5 sm:grid-cols-[220px_1fr] sm:gap-4">
          <code className="h-fit w-fit rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-bold text-primary">
            {token}
          </code>
          <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
        </div>
      ))}
    </div>
  );
}

const inputLineBreakdown: [string, string][] = [
  ["id=\"email\"", "Connects this input to its <Label htmlFor=\"email\"> above it, so clicking the label focuses the box. This is not what the server reads."],
  ["name=\"email\"", "This is what the server actually reads. When the form submits, formData.get(\"email\") matches this name, not the id."],
  ["type=\"email\"", "Tells the browser to show an email-style keyboard on mobile and do basic \"does this look like an email\" checking before it even submits."],
  ["required", "Tells the browser to block the form from submitting at all if this field is empty, before any of my own code even runs."],
];

const loginLineBreakdown: [string, string][] = [
  ["const", "Not let, because email is set once from the form data and never reassigned anywhere in this function. If a value won't change after I set it, const is the safer default — TypeScript actually stops the build if I try to reassign it later by mistake."],
  ["formData.get(\"email\")", "formData is the raw data the browser packaged up from the form. .get(\"email\") pulls the value out of whichever input has name=\"email\" — not id, name. That's how the browser and my code agree on which field is which."],
  ["as string", "This is TypeScript only, not plain JavaScript. formData.get() is typed to return more than one possible kind of value (it could technically be a string, a File, or null), so as string is me telling the compiler to trust that in this specific case it's a string. It changes nothing at runtime — it only changes what TypeScript lets me do with the value afterward."],
  ["await", "signInWithPassword doesn't answer instantly — it's a real request going out over the network to Supabase's servers. await pauses this function right there until that response actually arrives, instead of racing ahead to the next line with no answer yet."],
  ["const { error } = ...", "This is destructuring. signInWithPassword actually returns an object with more than one property on it (data and error), and instead of grabbing the whole object and writing result.error every time, { error } reaches in and pulls out just that one property into its own variable directly. I only need error here — if it comes back null, the sign-in worked."],
];

const assetsQueryBreakdown: [string, string][] = [
  ["supabase.from(\"assets\")", "Points the query at the assets table specifically."],
  [".select(\"*, categories(category_name)...\")", "The * means \"give me every column on the asset itself.\" categories(category_name) rides along on that same request and pulls in the related category's name through the foreign key, so I don't need a second, separate query just to show a category name next to each asset."],
  ["await", "Same reason as the login example — this is a real network call, so the function pauses here until Supabase actually answers."],
  ["const { data: assets } = ...", "Destructuring again, but this time with a rename. Supabase always hands back an object shaped like { data, error }. { data: assets } reaches in, grabs the data property, and immediately renames it to assets for the rest of the file — shorter than writing result.data everywhere, and assets reads clearer than data on a page with more than one query."],
];

const tableCellBreakdown: [string, string][] = [
  ["<TableCell>", "One of this project's table components — visually it's just a table cell, a <td>, in the end."],
  ["{ }", "Curly braces inside JSX mean \"stop treating this as plain text, run this as real TypeScript and print whatever it returns.\" Anything outside curly braces in JSX is static text; anything inside is a live value."],
  ["asset.asset_name", "Plain dot notation — reading the asset_name property off whichever asset object is currently being rendered, one per row of the table."],
];

export default async function PublicDocumentationPage() {
  const supabase = await createClient();
  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select("logo_url")
    .eq("id", true)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <SiteLogo logoUrl={siteSettings?.logo_url} className="h-5 w-5 text-primary" />
            <span>GSO-PMS</span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            Back to homepage
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-6 py-10 pb-20">
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

        <Separator />

        <section id="reviewer" className="scroll-mt-16 space-y-4">
          <h2 className="text-xl font-bold tracking-tight">9. Reviewer Cheat Sheet</h2>
          <p className="text-sm text-muted-foreground">
            The concepts that come up most in conversation, explained the way
            you&apos;d actually say them out loud &mdash; not reworded code
            comments. Read this section once before a defense-prep session so
            it flows without needing to look anything up mid-explanation.
          </p>

          <Card className="border-sky-200 bg-sky-50/50">
            <CardHeader>
              <CardTitle className="text-base">
                The example that proves it: HTML input &rarr; TypeScript &rarr; Supabase &rarr; HTML output
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                <strong className="text-foreground">Step 1 &mdash; the HTML.</strong>{" "}
                The sign-in screen has this literal tag in{" "}
                <code className="rounded bg-muted px-1">src/app/login/page.tsx</code>:
              </p>
              <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
{`<input id="email" name="email" type="email" required />`}
              </pre>
              <p>
                That&apos;s pure HTML. It has no idea what a database is &mdash;
                it just sits there and waits for someone to type.
              </p>
              <SyntaxBreakdown items={inputLineBreakdown} />

              <p>
                <strong className="text-foreground">Step 2 &mdash; the TypeScript.</strong>{" "}
                When the form is submitted,{" "}
                <code className="rounded bg-muted px-1">src/app/login/actions.ts</code>{" "}
                runs:
              </p>
              <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
{`const email = formData.get("email") as string;
const password = formData.get("password") as string;
const { error } = await supabase.auth.signInWithPassword({ email, password });`}
              </pre>
              <p>
                This is the actual &ldquo;fetch&rdquo; &mdash; TypeScript
                reading what was typed into that HTML input, then making a
                real network call to Supabase.
              </p>
              <p>
                In plain terms: when someone submits the sign-in form, this
                function runs on the server. I pull the email and password
                straight out of the submitted form data, then hand both off
                to Supabase&apos;s own sign-in method &mdash; I&apos;m not
                writing any password-checking logic myself, Supabase handles
                that securely on its end. That&apos;s a real network call, so
                I use <code className="rounded bg-muted px-1">await</code>{" "}
                to pause the code until Supabase actually responds. What
                comes back includes an{" "}
                <code className="rounded bg-muted px-1">error</code> field,
                and that&apos;s the only piece I grab, because that&apos;s
                what tells me whether the login worked or not.
              </p>
              <SyntaxBreakdown items={loginLineBreakdown} />

              <p>
                <strong className="text-foreground">Step 3 &mdash; back to HTML, the other direction.</strong>{" "}
                On the Asset Registry,{" "}
                <code className="rounded bg-muted px-1">src/app/dashboard/assets/page.tsx</code>{" "}
                runs:
              </p>
              <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
{`const { data: assets } = await supabase.from("assets").select("*, categories(category_name)...");`}
              </pre>
              <p>
                In plain terms: here I&apos;m asking Supabase for every row
                in the assets table, and for each one, also pulling in its
                related category&apos;s name &mdash; one request instead of
                two separate queries. Since it&apos;s a network call, I wait
                for it with <code className="rounded bg-muted px-1">await</code>,
                and I grab just the data part of the response, naming it{" "}
                <code className="rounded bg-muted px-1">assets</code> so the
                rest of the page can use it directly.
              </p>
              <SyntaxBreakdown items={assetsQueryBreakdown} />
              <p>and then, further down the same file:</p>
              <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
{`<TableCell>{asset.asset_name}</TableCell>`}
              </pre>
              <p>
                That second line <em>looks</em> like it&apos;s just sitting on
                the page as HTML. It isn&apos;t.{" "}
                <code className="rounded bg-muted px-1">asset.asset_name</code>{" "}
                is a live value that came out of the Supabase query a few
                lines above &mdash; every time that page loads, TypeScript
                asks the database fresh, and only then builds that{" "}
                <code className="rounded bg-muted px-1">&lt;td&gt;</code> tag
                with whatever the database currently says. Rename that asset
                in the database right now, and the very next page load shows
                the new name &mdash; nobody edited an HTML file.{" "}
                <strong className="text-foreground">
                  The HTML on that screen was never typed by a person;
                  TypeScript generated it, live, from Supabase, the moment the
                  page was requested.
                </strong>
              </p>
              <SyntaxBreakdown items={tableCellBreakdown} />
            </CardContent>
          </Card>

          <div className="space-y-3">
            {reviewerQAs.map((item) => (
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
      </main>
    </div>
  );
}
