export enum AssetStatus {
  Available = 'Available',
  Rented = 'Rented',
}

export type PaymentMode = 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Other';

export interface Payment {
  id: string;
  amount: number;
  date: string;
  mode: PaymentMode;
}

export interface Rental {
  id: string;
  customerId: string;
  outDate: string;
  inDate: string | null;
  rate: number;
  billingCycle: 'day' | 'month';
  payments: Payment[];
  agreementCopy?: string;
}

export interface Asset {
  id: string;
  name: string;
  productType: string;
  make: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  photos: string[];
  status: AssetStatus;
  rentalHistory: Rental[];
  rate: number;
  billingCycle: 'day' | 'month';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  phone2?: string;
  aadhar?: string;
  address?: string;
  photo?: string;
}

// FIX: Add View type to be shared across components
export type View = 'dashboard' | 'assets' | 'customers' | 'rentals' | 'create-rental';