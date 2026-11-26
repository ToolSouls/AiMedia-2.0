import { MaterialGroupOption } from "./MaterialGroupOption";
import { useMaterialsContext } from "./workspace-context";

export function MaterialGroupSidebar() {
  const { groups, active, setActiveId } = useMaterialsContext();
  return (
    <nav
      aria-label="素材组"
      className="flex min-h-0 min-w-0 flex-col gap-0.5 lg:overflow-y-auto lg:pr-1"
    >
      {groups.map((group) => (
        <MaterialGroupOption
          key={group.id}
          group={group}
          selected={group.id === active?.id}
          onSelect={() => setActiveId(group.id)}
        />
      ))}
    </nav>
  );
}
