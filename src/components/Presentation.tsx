import React, { type ReactNode } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { usePluginData } from "@docusaurus/useGlobalData";

type Entry = {
  id: string;
  title: string;
  parent: string | null;
  route: string;
  status: string;
  summary: string;
  links: { label: string; url: string }[];
};
type Asset = {
  url: string;
  alt: string;
  caption: string;
  attribution: string;
  citation_url: string;
  width: number;
  height: number;
};
type Catalog = { pages: Entry[]; assets: Record<string, Asset> };
function useCatalog() {
  return usePluginData("retinalysis-catalog") as Catalog;
}
export function Page({ id, children }: { id: string; children?: ReactNode }) {
  const { pages } = useCatalog();
  const entry = pages.find((p) => p.id === id)!;
  const parents: Entry[] = [];
  let parent = pages.find((p) => p.id === entry.parent);
  while (parent) {
    parents.unshift(parent);
    parent = pages.find((p) => p.id === parent!.parent);
  }
  return (
    <Layout
      title={id === "home" ? "Tools for retinal research" : entry.title}
      description={entry.summary || `${entry.title} — retinalysis`}
    >
      <main
        className={id === "home" ? "presentation home" : "presentation detail"}
      >
        {id !== "home" && (
          <header className="page-heading wrap">
            <nav className="breadcrumbs-line" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              {parents.map((p) => (
                <React.Fragment key={p.id}>
                  <span aria-hidden="true">/</span>
                  <Link to={p.route}>{p.title}</Link>
                </React.Fragment>
              ))}
            </nav>
            <p className="eyebrow">
              {entry.parent
                ? pages.find((p) => p.id === entry.parent)?.title
                : "Explore retinalysis"}
            </p>
            <h1>{entry.title}</h1>
            {entry.summary && <p className="lead">{entry.summary}</p>}
          </header>
        )}
        <div className={id === "home" ? "" : "wrap page-body"}>{children}</div>
      </main>
    </Layout>
  );
}
export function Figure({ id, eager = false }: { id: string; eager?: boolean }) {
  const { assets } = useCatalog();
  const asset = assets[id];
  const src = useBaseUrl(asset.url);
  return (
    <figure className={`science-figure figure-${id}`}>
      <a href={src} aria-label={`Open full figure: ${asset.alt}`}>
        <img
          src={src}
          alt={asset.alt}
          width={asset.width}
          height={asset.height}
          loading={eager ? "eager" : "lazy"}
        />
      </a>
      <figcaption>
        {asset.caption} <a href={asset.citation_url}>{asset.attribution} ↗</a>
      </figcaption>
    </figure>
  );
}
export function CardGrid({ parent }: { parent: string }) {
  const { pages } = useCatalog();
  const entries = pages.filter((p) => p.parent === parent);
  return (
    <div className={`card-grid cards-${parent}`}>
      {entries.map((p, i) => (
        <Link className="catalog-card" key={p.id} to={p.route}>
          <span className="card-top">
            <span className="card-number">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span aria-hidden="true">↗</span>
          </span>
          <h3>
            {p.title.startsWith("retinalysis-")
              ? p.id === "retinalysis-vascx"
                ? "VascX"
                : p.title
                    .replace(/^retinalysis-/, "")
                    .replace(/^./, (s) => s.toUpperCase())
              : p.title}
          </h3>
          <p>
            {p.status === "placeholder" ? "Model card forthcoming" : p.summary}
          </p>
          <span className="card-link">
            {p.status === "placeholder" ? "View page" : "Explore"}{" "}
            <span aria-hidden="true">→</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
export function Resources({ id }: { id: string }) {
  const { pages } = useCatalog();
  const links = pages.find((p) => p.id === id)!.links;
  return links.length ? (
    <div className="resource-links">
      {links.map((l) => (
        <a key={l.url} href={l.url}>
          {l.label} <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  ) : null;
}
export function HomeHero() {
  return (
    <section className="hero-section wrap">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="status-dot" /> Retinal imaging · Research tools
        </p>
        <h1>
          See more.
          <br />
          <em>Understand more.</em>
        </h1>
        <p className="hero-description">
          Turn retinal images into meaningful research. Explore tools, deep
          learning models and reference datasets for robust, explainable
          analysis.
        </p>
        <div className="hero-actions">
          <Link className="primary-link" to="/software">
            Explore the software <span aria-hidden="true">↗</span>
          </Link>
          <Link className="text-link" to="/datasets">
            Find a dataset <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="hero-footnote">
          <span className="tiny-rule" />
          Built around the image. Grounded in evidence.
        </div>
      </div>
      <div className="hero-visual">
        <div className="image-label">
          <span>01 / THE RETINA</span>
          <span>Color fundus imaging</span>
        </div>
        <Figure id="retina-hero" eager />
      </div>
    </section>
  );
}
export function SectionHeader({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <p className="eyebrow">
        {number} / {title}
      </p>
      <div>{children}</div>
    </div>
  );
}
export function Publication({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <aside className="publication">
      <span className="eyebrow">Research & evidence</span>
      <h3>
        <a href={href}>
          {title} <span aria-hidden="true">↗</span>
        </a>
      </h3>
      {children}
    </aside>
  );
}
