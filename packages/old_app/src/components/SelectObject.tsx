import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectObjectItem<T> {
  label?: React.ReactNode;
  value: T;
}

interface SelectObjectProps<T> {
  items: SelectObjectItem<T>[];
  value: T;
  onChange(value: T): void;
  className?: string;
}

export function SelectObject<T extends string | number | null>({
  items,
  value,
  onChange,
  className,
}: SelectObjectProps<T>) {
  return (
    <Select
      value={toString(value)}
      onValueChange={(value) => {
        const item = items.find((item) => toString(item.value) === value);
        if (item) {
          onChange(item.value);
        }
      }}
    >
      <SelectTrigger className={cn("w-[180px]", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => {
          const value = toString(item.value);
          return (
            <SelectItem key={value} value={value}>
              {item.label ?? value}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function toString(value: unknown) {
  if (value === null) {
    return "null";
  }
  return String(value);
}
