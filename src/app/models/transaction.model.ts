export interface TransactionModel {
  id: string;
  memberId: string;
  memberName: string;
  city: string;
  category: string;
  amount: number;
  quantity: number;
  date: string;
  status: 'paid' | 'pending' | 'cancelled' | 'refunded';
}
