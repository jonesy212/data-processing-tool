interface SubscriptionPlan {
  id: string;
  price: number;
  features: string[];
  planName: string;
  expiryDate: string | null;
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
