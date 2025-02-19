// GroupGenerator.tsx
import React from "react";
import Group from "../components/communications/chat/Group";

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
