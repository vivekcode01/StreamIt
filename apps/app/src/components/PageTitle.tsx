import type { ReactNode } from "react";

interface PageTitleProps {
  title: string;
  description: string;
  sideComponent?: ReactNode;
}
export function PageTitle({
  title,
  description,
  sideComponent,
}: PageTitleProps) {
  return (
    <div className="mb-4 flex items-center">
      <div>
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="text-default-400 text-sm">{description}</p>
      </div>
      {sideComponent ? <div className="ml-auto">{sideComponent}</div> : null}
    </div>
  );
}
