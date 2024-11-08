import cn from "clsx";
import { useLayoutEffect, useRef, useState } from "react";

interface LogsProps {
  lines: string[];
}

export function Logs({ lines }: LogsProps) {
  return (
    <ul className="flex flex-col gap-2">
      {lines.map((line, index) => (
        <Line key={line} line={line} index={index + 1} />
      ))}
    </ul>
  );
}

function Line({ line, index }: { line: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  const [show, setShow] = useState(false);

  useLayoutEffect(() => {
    const onResize = () => {
      setMore(ref.current!.clientHeight < ref.current!.scrollHeight);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [line]);

  return (
    <div className="flex text-xs gap-2">
      {index}
      <div>
        <div
          ref={ref}
          className={cn(
            "break-all overflow-hidden",
            show ? "max-h-max" : "max-h-12",
          )}
        >
          {line}
        </div>
        {more ? (
          <button
            className="font-medium"
            onClick={() => setShow((old) => !old)}
          >
            {show ? "collapse" : "expand"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
