interface Reward {
  userId: string;
  amount: number;
  date: string;
}

interface RewardHistory {
  userId: string;
  rewards: Reward[];
}

interface RewardParameters {
  criteria: string;
  value: number;
}
