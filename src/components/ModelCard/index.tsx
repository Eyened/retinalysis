import React, {
  Children, createContext, isValidElement, useContext, useEffect, useId,
  useRef, useState, type ComponentProps, type ComponentType, type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { MDXComponents, MDXProps } from "mdx/types";
import MDXA from "@theme/MDXComponents/A";
import styles from "./styles.module.css";

type ImagePreview = { src: string; alt: string };
const ImageContext = createContext<(image: ImagePreview) => void>(() => {});

function textContent(children: ReactNode): string {
  return Children.toArray(children).map((child) => {
    if (typeof child === "string" || typeof child === "number") return String(child);
    if (isValidElement<{ children?: ReactNode }>(child)) return textContent(child.props.children);
    return "";
  }).join("");
}

function Label({ children }: ComponentProps<"h2">) {
  return <strong className={styles.label} data-model-card-heading>{children}: </strong>;
}

function Paragraph({ children }: ComponentProps<"p">) {
  return <p className={styles.paragraph}>{children}</p>;
}

function Section({ children, ...props }: ComponentProps<"section"> & {
  "data-model-card-section"?: boolean;
}) {
  if (!props["data-model-card-section"]) return <section {...props}>{children}</section>;
  const [heading, ...body] = Children.toArray(children).filter((child) =>
    typeof child !== "string" || child.trim(),
  );
  const rawText = body.map(textContent).join("\n");
  const text = rawText.replace(/\s+/g, " ").trim();
  const expandable = text.length > 280 || rawText.split("\n").filter((line) => line.trim()).length > 6;
  const preview = text.length > 180 ? text.slice(0, 180).replace(/\s+\S*$/, "") + "…" : text;
  return (
    <section className={styles.section} data-model-card-section aria-label={textContent(heading)}>
      {heading}
      {expandable ? (
        <details className={styles.description}>
          <summary>
            <span className={styles.preview}>{preview} </span>
            <span className={styles.more}>Show more</span>
            <span className={styles.less}>Show less</span>
          </summary>
          <div className={styles.body}>{body}</div>
        </details>
      ) : body}
    </section>
  );
}

function Thumbnail({ src, alt = "", title }: ComponentProps<"img">) {
  const open = useContext(ImageContext);
  if (!src) return null;
  return (
    <button
      type="button"
      className={styles.thumbnail}
      aria-label={`Enlarge image: ${alt || "Model card image"}`}
      onClick={() => open({ src, alt })}
    >
      <img src={src} alt={alt} title={title} loading="lazy" decoding="async" />
    </button>
  );
}

function containsImage(children: ReactNode): boolean {
  return Children.toArray(children).some((child) =>
    isValidElement<{ children?: ReactNode }>(child)
    && (child.type === Thumbnail || child.type === "img" || containsImage(child.props.children)),
  );
}

function CardLink({ children, ...props }: ComponentProps<"a">) {
  // A Markdown image may already be wrapped in a link. Avoid nesting the
  // thumbnail button inside another interactive element.
  return containsImage(children)
    ? <>{children}</>
    : <MDXA {...props}>{children}</MDXA>;
}

const components: MDXComponents = {
  h1: Label, h2: Label, h3: Label, h4: Label, h5: Label, h6: Label,
  p: Paragraph,
  section: Section,
  img: Thumbnail,
  a: CardLink,
};

function ImageDialog({ image, onClose }: { image: ImagePreview; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const captionId = useId();
  useEffect(() => {
    const element = dialog.current!;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  return createPortal(
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-label="Image preview"
      aria-describedby={image.alt ? captionId : undefined}
      onClose={onClose}
      onKeyDown={(event) => {
        // The close button is the dialog's only focusable control. Keep both
        // Tab and Shift+Tab inside it instead of moving to browser chrome.
        if (event.key === "Tab") {
          event.preventDefault();
          dialog.current?.querySelector("button")?.focus();
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
    >
      <div className={styles.dialogContent}>
        <button type="button" autoFocus className={styles.close} onClick={() => dialog.current?.close()}>
          Close image <span aria-hidden="true">×</span>
        </button>
        <img src={image.src} alt={image.alt} />
        {image.alt && <p id={captionId} className={styles.caption}>{image.alt}</p>}
      </div>
    </dialog>,
    document.body,
  );
}

/** Render an imported Markdown card inside a manually maintained MDX page. */
export default function ModelCard({
  content: Content, name,
}: { content: ComponentType<MDXProps>; name?: string }) {
  const [image, setImage] = useState<ImagePreview | null>(null);
  return (
    <ImageContext.Provider value={setImage}>
      <div className={styles.card} data-model-card>
        <div className={styles.content}>
          {name?.trim() && <span className={styles.name} data-model-card-name>{name}</span>}
          <Content components={components} />
        </div>
      </div>
      {image && <ImageDialog image={image} onClose={() => setImage(null)} />}
    </ImageContext.Provider>
  );
}
