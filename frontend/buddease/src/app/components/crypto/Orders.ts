// Orders.ts
interface Order {
  orderId: number;
  price: number;
  quantity: number;
  type: "buy" | "sell";
}
export type { Order };
;
