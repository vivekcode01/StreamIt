import { Card } from "@nextui-org/react";
import { DataView } from "./DataView";
import { usePlayer } from "../context/PlayerContext";

export function PlayerStats() {
  const { player } = usePlayer();

  return (
    <Card className="h-full overflow-y-auto p-4">
      <DataView
        data={{
          nulled: null,
          undef: undefined,
          obj: {
            int: 10,
            float: 1.5,
          },
          items: [
            {
              foo: "bar",
            },
            {
              foo: "bar",
            },
            {
              foo: "bar",
            },
            {
              foo: "bar",
            },
            {
              foo: "bar",
            },
          ],
        }}
      />
    </Card>
  );
}
