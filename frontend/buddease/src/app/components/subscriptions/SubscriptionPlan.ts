interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

interface Payment {
  id: string;
  userId: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  
}

interface Revenue {
  totalRevenue: number;
  payments: Payment[];
}
