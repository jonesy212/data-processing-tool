import React from "react";

// ContributionItem.tsx
interface ContributionItem {
  contributorId: string;
  contributionType: ContributionType;
  amount: number;
  timestamp: Date;
 
}

// Define the ContributionType enum if needed
enum ContributionType {
  Development,
  Marketing,
  Support,
  Other,
}

const ContributionItem: React.FC<{ contribution: ContributionItem }> = ({ contribution }) => {
  return (
    <div>
      <p>
        Contribution of {contribution.amount} {contribution.contributionType} by contributor {contribution.contributorId} on {contribution.timestamp.toLocaleString()}
      </p>
    </div>
  );
};

export default ContributionItem;
