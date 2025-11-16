
import React, { useState } from 'react';
import { PaymentMode } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPayment: (paymentData: { assetId: string, rentalId: string, amount: number, date: string, mode: PaymentMode }) => void;
  assetId: string;
  rentalId: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onAddPayment, assetId, rentalId }) => {
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mode, setMode] = useState<PaymentMode>('Cash');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    onAddPayment({ assetId, rentalId, amount, date: new Date(date).toISOString(), mode });
    onClose();
    setAmount(0);
    setDate(new Date().toISOString().split('T')[0]);
    setMode('Cash');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Payment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount Received</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
              required
              min="0.01"
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="payment-mode" className="block text-sm font-medium text-gray-700">Payment Mode</label>
            <select
                id="payment-mode"
                value={mode}
                onChange={e => setMode(e.target.value as PaymentMode)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
            >
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="payment-date" className="block text-sm font-medium text-gray-700">Payment Date</label>
            <input
              type="date"
              id="payment-date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div className="flex justify-end space-x-4 pt-2">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-600">Save Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
