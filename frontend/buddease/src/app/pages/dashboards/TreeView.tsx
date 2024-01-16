// TreeView.tsx

import { useState } from "react";


// Define a TreeNode component for individual nodes
const TreeNode = ({ node, onClick } : {node: any, onClick: (node: any) => void}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div style={{ cursor: "pointer" }} onClick={() => onClick(node)}>
        {node.name}
      </div>
      {node.children && isOpen && (
        <div style={{ marginLeft: 20 }}>
          {node.children.map((child: any) => (
            <TreeNode key={child.id} node={child} onClick={onClick} />
          ))}
        </div>
      )}
    </div>
  );
};

// Define the main TreeView component
const TreeView = ({ data, onClick }: { data: any[], onClick: (node: any) => void }) => {
  return (
    <div>
      {data.map((node) => (
        <TreeNode key={node.id} node={node} onClick={onClick} />
      ))}
    </div>
  );
};

export default TreeView;
