import Link from "next/link"

export const metadata = {
  title: "Documentation"
}

const tableOfContents = [
  { id: "routes", label: "Routes" },
  { id: "state-management", label: "State management" },
  { id: "data-layer", label: "Data layer" },
  { id: "character-planner", label: "Character planner" },
  { id: "admin-tools", label: "Admin tools" },
  { id: "extensibility", label: "Extensibility" }
]

export default function DocumentationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200">
      <div className="max-w-5xl mx-auto py-12 px-6 lg:px-8 space-y-16">
        <header className="space-y-6 text-slate-800">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Documentation</p>
          <h1 className="text-4xl font-bold text-slate-900">Build, extend, and operate CharCreate</h1>
          <p className="text-lg leading-relaxed text-slate-700">
            This guide orients engineers around the key building blocks that power the CharCreate experience—from routing
            and providers to the character planner and data administration flows. Use the quick links below to jump to
            the systems you need to explore.
          </p>
          <nav aria-label="Table of contents" className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">On this page</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {tableOfContents.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={`#${entry.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    <span aria-hidden>→</span>
                    {entry.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <section id="routes" className="scroll-mt-28 space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Top-level routes</h2>
          <p className="text-slate-700 leading-relaxed">
            The landing page defined in <code>app/page.tsx</code> advertises core entry points through the prominent call-to-action
            buttons for <code>/data</code>, <code>/admin</code>, and <code>/charcreate</code>. Each of these routes maps to a dedicated
            experience, while the root <code>/</code> route remains a welcoming hub for first-time visitors.
          </p>
          <p className="text-slate-700 leading-relaxed">
            When you introduce additional surfaces, add them both to the home page navigation tiles and the primary site navigation in
            <code>app/(components)/SiteNav.tsx</code> so that users can discover them from any page.
          </p>
        </section>

        <section id="state-management" className="scroll-mt-28 space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Application providers</h2>
          <p className="text-slate-700 leading-relaxed">
            Global state and data hydration live in <code>app/providers.tsx</code>, which wires together the shared <code>ThemeContext</code>
            and the <code>ContentDataProvider</code>. The theme provider synchronizes the user&apos;s preference with <code>localStorage</code>
            and the DOM class list, while the content provider preloads catalogue data for the character tools.
          </p>
          <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-blue-700">State persistence</p>
            <p>
              Character builder sessions are saved through <code>src/state/character-storage.ts</code>, which the provider stack consumes
              to bootstrap the most recent build. Any stateful feature that should survive refreshes ought to integrate with this module
              rather than reinventing storage primitives.
            </p>
          </div>
        </section>

        <section id="data-layer" className="scroll-mt-28 space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Data layer &amp; caching</h2>
          <p className="text-slate-700 leading-relaxed">
            Requests for catalogue data flow through the Next.js route handler in <code>app/api/data/route.ts</code>. On the client,
            <code>src/lib/clientDataLoader.ts</code> orchestrates fetches and applies memoization so repeated queries hit the in-memory cache
            instead of the network. Keep this contract consistent whenever you expand the available datasets.
          </p>
        </section>

        <section id="character-planner" className="scroll-mt-28 space-y-6">
          <h2 className="text-2xl font-semibold text-slate-900">Character planner architecture</h2>
          <p className="text-slate-700 leading-relaxed">
            The core builder logic lives in <code>src/state/character-builder.tsx</code>, which exposes the <code>CharacterBuilderProvider</code>
            context. It coordinates ability scores, ancestry/background selections, and pending decisions before calling into the
            rules engine.
          </p>
          <p className="text-slate-700 leading-relaxed">
            Presentation splits between <code>src/components/character/CharacterLayout.tsx</code> (the advanced, free-form view) and
            <code>src/components/character/GuidedCharacterLayout.tsx</code> (the step-by-step assistant). Both layouts read from the same
            context, so new widgets should favor derived data over local state to remain consistent across flows.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Rules resolution</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Final character sheets are synthesized by <code>src/lib/rules/engine.ts</code>, which consumes the builder state and
                optional feature metadata. Whenever you add a new decision type, ensure the reducer emits enough context for the
                engine to compute derived stats and warnings.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Guided vs. advanced flows</h3>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-700">
                <li><code>GuidedCharacterLayout</code> presents sequential panels with guardrails for newcomers.</li>
                <li><code>CharacterLayout</code> surfaces the full form for experienced players who prefer manual control.</li>
                <li>
                  Both rely on persisted decisions via <code>character-storage</code> to keep selections synchronized when users switch
                  layouts mid-session.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="admin-tools" className="scroll-mt-28 space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Admin &amp; data browsing</h2>
          <p className="text-slate-700 leading-relaxed">
            Administrative workflows live under <code>app/admin</code>. <code>app/admin/AdminTableManager.tsx</code> manages CRUD interactions
            using the typed models from <code>app/admin/models.ts</code>. For read-only exploration, <code>app/data/ClientTable.tsx</code>
            provides a searchable table optimized for players browsing the catalogue.
          </p>
          <p className="text-slate-700 leading-relaxed">
            Both surfaces share the same loader APIs, so improvements to pagination or filtering should land in the shared data layer first.
          </p>
        </section>

        <section id="extensibility" className="scroll-mt-28 space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Extending the platform</h2>
          <p className="text-slate-700 leading-relaxed">
            When extending CharCreate, keep feature boundaries clear: providers handle cross-cutting state, the builder manages character
            progression, and route handlers broker persistence. Leverage the established hooks and context primitives rather than creating
            parallel systems so new capabilities inherit the robust persistence and rules resolution already in place.
          </p>
        </section>
      </div>
    </main>
  )
}

