import React, { type ReactNode } from "react";
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
function useCatalog() {
  return usePluginData("retinalysis-catalog") as {
    pages: Entry[];
    assets: Record<string, Asset>;
  };
}
// Docusaurus owns the title, breadcrumbs, sidebar, table of contents and layout.
export function Page({ id, children }: { id: string; children?: ReactNode }) {
  return (
    <div className="page-body" data-page-id={id}>
      {children}
    </div>
  );
}
export function Figure({ id, eager = false }: { id: string; eager?: boolean }) {
  const asset = useCatalog().assets[id];
  const src = useBaseUrl(asset.url);
  return (
    <figure className="science-figure">
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
        {asset.caption} <a href={asset.citation_url}>{asset.attribution}</a>
      </figcaption>
    </figure>
  );
}
export function Catalogue({ parent }: { parent: string }) {
  return (
    <ul>
      {useCatalog()
        .pages.filter((p) => p.parent === parent)
        .map((p) => (
          <li key={p.id}>
            <Link to={p.route}>{p.title}</Link>
            {p.status === "placeholder"
              ? " — Model card forthcoming."
              : p.summary
                ? ` — ${p.summary}`
                : ""}
          </li>
        ))}
    </ul>
  );
}
export function Resources({ id }: { id: string }) {
  const links = useCatalog().pages.find((p) => p.id === id)!.links;
  return links.length ? (
    <ul>
      {links.map((l) => (
        <li key={l.url}>
          <a href={l.url}>{l.label}</a>
        </li>
      ))}
    </ul>
  ) : null;
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
    <section>
      <h3>
        <a href={href}>{title}</a>
      </h3>
      {children}
    </section>
  );
}
