import type { ReactNode } from "react";

interface OpaqueCardProps {
  title: string;
  children: ReactNode;
}

export function OpaqueCard({ title, children }: OpaqueCardProps) {
  return (
    <div>
      <div className="font-medium">{title}</div>
      {children}
    </div>
  );
}
