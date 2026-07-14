// The one site header — same everywhere, so you always find your way back.

export default function SiteNav() {
  return (
    <nav className="nav">
      <a className="logo" href="/" aria-label="Uniq">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="uniq." height={34} />
      </a>
      <div className="links">
        <a href="/#examples">Examples</a>
        <a href="/pricing">Pricing</a>
        <a href="/integrations">Integrations</a>
        <a href="/install">Install</a>
        <a href="/dashboard">Dashboard</a>
        <a href="https://github.com/getuniq/uniq">GitHub</a>
        <a className="cta-nav" href="/start">Start free</a>
      </div>
    </nav>
  );
}
