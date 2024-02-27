// GroupGenerator.tsx
import React from "react";

interface Group<T> {
  groupName: string;
  items: T[];
}

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
