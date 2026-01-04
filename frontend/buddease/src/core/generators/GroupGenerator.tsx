GroupGenerator.tsx
import Group from "@/core/components/communications/chat/Group";
import React from "react";

interface GroupGeneratorProps<T> {
  groups: Group<T>[];
  renderGroup: (group: Group<T>) => React.ReactNode;
}

function GroupGenerator<T>({ groups, renderGroup }: GroupGeneratorProps<T>) {
  return (
    <div>
      {groups.map((group, index) => (
        <div key={index}>
          <h2>{group.groupName}</h2>
          {renderGroup(group)}
        </div>
      ))}
    </div>
  );
}

export default GroupGenerator;
export type { Group };
