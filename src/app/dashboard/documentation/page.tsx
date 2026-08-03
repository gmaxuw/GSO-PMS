import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/supabase/auth";

const flow = [
  { n: "01", title: "Receive & Verify", desc: "Staff records the new asset — description, cost, category, useful life — in the Property Asset Registry." },
  { n: "02", title: "Generate QR Sticker", desc: "A printable label sheet is produced, unique to that asset's property code." },
  { n: "03", title: "Affix to Asset", desc: "Physical step — the sticker is cut and attached to the actual equipment." },
  { n: "04", title: "Assign Custody", desc: "Movement & Issuance records who receives the asset, and to which office." },
  { n: "05", title: "Auto-Numbered Receipt", desc: "A PAR or ICS record is generated automatically and linked to that transaction." },
  { n: "06", title: "Print & Sign", desc: "The receipt renders as an official document, ready to print for physical signature and filing." },
  { n: "07", title: "Verify Anytime", desc: "Any authorized user scans the sticker to instantly confirm status, custodian, and location." },
];

const modules = [
  { group: "Public Site", items: [["Homepage", "Editable team profiles, project overview, entry point to sign-in"]] },
  { group: "Access Control", items: [["Authentication & Roles", "Admin / Staff permissions enforced at the database level via Postgres Row-Level Security"]] },
  {
    group: "Custody & Paper Trail",
    items: [
      ["Property Asset Registry", "Full record-keeping, search, status & department filters"],
      ["Movement & Issuance", "Issue, return, and transfer log per asset"],
      ["PAR / ICS Records", "Auto-numbered, linked to the originating transaction"],
      ["Printable Receipts", "Official-format PAR & ICS documents, ready to sign"],
      ["QR Sticker Sheets", "Printable labels, configurable copy count, linked from the point custody is known"],
      ["Scan-to-Verify", "Camera or manual code lookup against live records"],
    ],
  },
  {
    group: "Compliance Tools",
    items: [
      ["Expiry & Lifecycle Tracker", "Warranty, useful-life, and maintenance thresholds with alerting"],
      ["Disposal & Write-off", "Condemned/disposed asset register (record-only, no approval workflow per thesis Scope 1.4)"],
      ["Reports", "CSV export and a printable RPCPPE-format report"],
    ],
  },
  {
    group: "Administration",
    items: [
      ["Staff Accounts", "Admin creates/deactivates Staff and Admin logins — no public sign-up"],
      ["Categories & Offices", "Reference data used across the registry"],
      ["Homepage Team", "Full CRUD for the public team profiles, including photo upload"],
      ["Branding", "Logo and favicon upload"],
      ["Accountable Officers", "Mandatory photo per officer for visual custody confirmation"],
    ],
  },
];

const faqs = [
  {
    q: "Why Next.js instead of a traditional CMS like WordPress?",
    a: [
      "A CMS like WordPress is built for publishing content — blog posts, brochure pages. This system is a transactional records system: structured relational data (11+ linked tables), role-based permissions, and an audit trail. Approximating that in WordPress means stacking plugins (Advanced Custom Fields, custom post types, membership add-ons) on top of a tool that wasn't designed for it, and plugin sprawl is one of the most common sources of security vulnerabilities in WordPress sites.",
      "Next.js is a framework for building applications, not just publishing pages. Every screen — the registry, the receipt printer, the QR sticker sheet — is built from reusable components, so a fix or a design change made once applies consistently everywhere it's used, instead of being copy-pasted across dozens of PHP template files.",
    ],
  },
  {
    q: "Why not just build it in plain HTML/PHP?",
    a: [
      "Plain HTML/PHP means hand-writing form validation, database queries, and authentication from scratch on every page, which is both slower to build and easier to get wrong — unvalidated SQL queries are still one of the most common vulnerabilities in student and small-business PHP projects.",
      "This build uses TypeScript, which checks that the code is internally consistent — correct field names, correct data types — before it ever runs, catching a whole category of bugs at build time instead of in front of a user. Database access goes through Supabase's typed client, generated directly from the actual schema, so the code and the database can't silently drift out of sync.",
    ],
  },
  {
    q: "What's the difference in hosting, and why does it matter?",
    a: [
      "Traditional shared hosting (the typical cPanel/FTP setup behind most PHP capstone projects) runs on a single server. If that server goes down, or the account lapses, the whole site is unreachable, and deploying an update means manually uploading changed files with no record of what's actually live.",
      "This system deploys through Vercel: every push to the codebase automatically builds and publishes within about a minute, HTTPS is included by default, and if an update ever breaks something, the previous working version is one click away — there's no manual rollback process.",
      "The database runs on Supabase, a managed PostgreSQL service — backups, security patching, and scaling are handled by the platform rather than something the team or GSO's IT staff has to maintain by hand. That's a meaningfully smaller operational burden for a municipal office than running its own server.",
    ],
  },
  {
    q: "Is this actually free, or will it cost the LGU money later?",
    a: [
      "Everything runs on free tiers today, as scoped from the start: GitHub for source control, Vercel for hosting, Supabase for the database. There's a transparent upgrade path if usage ever grows past free-tier limits, but nothing about the architecture requires a rebuild to scale — it's the same system, just on a paid tier of the same services.",
    ],
  },
  {
    q: "How is data kept secure, beyond just hiding buttons in the interface?",
    a: [
      "Permissions are enforced as database rules (Postgres Row-Level Security), not only as interface logic. That means even a direct request to the database — bypassing the website entirely — is still subject to the same Admin/Staff rules. Passwords are never stored or handled directly by this codebase; authentication is delegated to Supabase Auth, a dedicated identity provider.",
    ],
  },
];

export default async function DocumentationPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documentation</h1>
        <p className="text-sm text-muted-foreground">
          System overview, process flow, and technical FAQ — admin-only reference.
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="flow">Process Flow</TabsTrigger>
          <TabsTrigger value="status">Feature Status</TabsTrigger>
          <TabsTrigger value="stack">Tech Stack</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What This System Does</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                GSO-PMS records, monitors, and reports on government-owned
                non-consumable property (Property, Plant & Equipment) for the
                General Services Office, LGU Villanueva — replacing manual,
                paper-based tracking with a single cloud-based system covering
                the full asset lifecycle: receiving, labeling, issuance,
                maintenance, expiry, and disposal.
              </p>
              <p>
                It follows the eleven-table data dictionary and system flow
                originally specified in Chapter 3, extended with a physical
                labeling and receipt-printing workflow that the original
                screens didn&apos;t cover on their own (see Process Flow tab).
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flow" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The system walks an officer through one continuous path, from the
            moment a new asset arrives to the moment its custody can be
            verified by anyone with a phone.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {flow.map((step) => (
              <Card key={step.n}>
                <CardContent className="space-y-1.5">
                  <p className="font-mono text-xs font-bold text-primary">{step.n}</p>
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          {modules.map((group) => (
            <div key={group.group}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {group.group}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {group.items.map(([name, desc]) => (
                  <Card key={name}>
                    <CardContent className="flex items-start justify-between gap-3 py-3">
                      <div>
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Badge className="shrink-0 gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> Live
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="stack" className="space-y-4">
          <Card>
            <CardContent className="divide-y divide-border">
              {[
                ["Next.js + TypeScript", "The application itself. Renders every screen and handles the receipt/sticker printing engine. TypeScript is JavaScript with stricter type-checking, catching a category of bugs before they reach a browser."],
                ["Tailwind CSS", "The styling system behind every screen — layout, spacing, color, responsiveness."],
                ["Supabase (PostgreSQL)", "The database, hosted in the cloud. Admin/Staff permissions are enforced as database rules, not just interface logic — access control holds even if someone bypasses the screen."],
                ["Vercel", "Hosting. Every update to the codebase publishes automatically within about a minute."],
                ["GitHub", "Version control — a complete, recoverable history of every change made to the system."],
              ].map(([name, desc]) => (
                <div key={name} className="grid grid-cols-1 gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[180px_1fr] sm:gap-4">
                  <p className="font-mono text-sm font-bold text-primary">{name}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            Under the hood, every page ultimately compiles down to HTML, CSS,
            and JavaScript — the three languages every browser understands —
            through the Next.js build process.
          </p>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          {faqs.map((item) => (
            <Card key={item.q}>
              <CardHeader>
                <CardTitle className="text-base">{item.q}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                {item.a.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
