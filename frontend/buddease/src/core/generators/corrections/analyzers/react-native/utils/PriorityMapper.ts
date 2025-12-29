// PriorityMapper.ts
export function getPriority(severity: string): number {
  const priorityMap = {
    critical: 1,
    high: 2,
    medium: 3,
    low: 4,
  };

  return priorityMap[severity as keyof typeof priorityMap] || 5;
}