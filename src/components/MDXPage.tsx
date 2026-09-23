import React from "react";
import MDXContent from "@theme/MDXContent";
export default function MDXPage({
  content: Content,
}: {
  content: React.ComponentType;
}) {
  return (
    <MDXContent>
      <Content />
    </MDXContent>
  );
}
