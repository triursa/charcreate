export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full px-6 py-12 bg-white/80 rounded-xl shadow-xl flex flex-col items-center gap-8">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-2">CharCreate</h1>
        <p className="text-lg text-slate-700 mb-4 text-center">
          Welcome to CharCreate! Effortlessly browse, manage, and create characters for your tabletop games.
        </p>
        <nav className="w-full flex flex-col gap-4">
          <a href="/data" className="block w-full rounded-lg bg-blue-600 text-white text-lg font-semibold py-4 text-center shadow hover:bg-blue-700 transition">Browse Data</a>
          <a href="/admin" className="block w-full rounded-lg bg-slate-800 text-white text-lg font-semibold py-4 text-center shadow hover:bg-slate-900 transition">Admin Panel</a>
          <a href="/charcreate" className="block w-full rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white text-lg font-semibold py-4 text-center shadow hover:from-green-600 hover:to-blue-600 transition">Character Creator</a>
        </nav>
        <footer className="mt-8 text-xs text-slate-500 text-center">
          &copy; {new Date().getFullYear()} CharCreate. All rights reserved.
        </footer>
      </div>
    </main>
  )
}
