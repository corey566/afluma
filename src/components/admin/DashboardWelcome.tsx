export default function DashboardWelcome() {
  return <section className="afluma-admin-welcome">
    <div>
      <span className="afluma-admin-kicker">Afluma Content Studio · Source Fidelity</span>
      <h1>Control the full site without touching source code.</h1>
      <p>Manage all 1,669 pages, exact NextSaaS templates, 1,528 approved or restricted source assets, clients, projects, evidence, SEO, careers and enquiries through one governed interface.</p>
    </div>
    <div className="afluma-admin-actions">
      <a href="/admin/collections/pages">Pages & page templates</a>
      <a href="/admin/collections/asset-library">NextSaaS asset library</a>
      <a href="/admin/collections/source-templates">Source templates</a>
      <a href="/admin/collections/clients">Clients & permissions</a>
      <a href="/admin/collections/client-projects">Client projects</a>
      <a href="/admin/collections/media">Production media</a>
      <a href="/" target="_blank" rel="noreferrer">Open website</a>
    </div>
  </section>
}
