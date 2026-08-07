export default function ServisFormuLoading() {
  return (
    <div data-page-root className="min-h-screen bg-[var(--background)]">
      <div className="container px-4 md:px-6" style={{ paddingTop: "140px", paddingBottom: "80px" }}>
        <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
          <div className="h-10 w-48 mx-auto rounded-lg bg-[var(--glass-bg)]" />
          <div className="h-5 w-80 max-w-full mx-auto rounded bg-[var(--glass-bg)]" />
          <div className="glass-card-static rounded-3xl p-6 sm:p-10 space-y-4">
            <div className="h-9 w-full rounded-full bg-[var(--glass-bg)]" />
            <div className="h-8 w-56 rounded bg-[var(--glass-bg)]" />
            <div className="h-24 w-full rounded-2xl bg-[var(--glass-bg)]" />
            <div className="h-24 w-full rounded-2xl bg-[var(--glass-bg)]" />
            <div className="h-12 w-full rounded-xl bg-[var(--glass-bg)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
