import cn from "clsx";

export interface CheckListItem {
  id: number | null;
  label: React.ReactNode;
  checked: boolean;
}

interface CheckListProps {
  onSelect(id: CheckListItem["id"]): void;
  items: CheckListItem[];
}

export function CheckList({ items, onSelect }: CheckListProps) {
  return (
    <ul className="min-w-28">
      {items.map((item) => (
        <li
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={cn(
            "h-8 flex items-center rounded-md px-4 transition-colors cursor-pointer",
            item.checked && "bg-white/20",
          )}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
