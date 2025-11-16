import React from 'react';
import { Customer } from '../types';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const DetailItem: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900">{value || 'N/A'}</dd>
    </div>
);


const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ isOpen, onClose, customer }) => {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Customer Details</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-2xl font-semibold">&times;</button>
        </div>
        <div className="flex-grow overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:space-x-6">
                <div className="sm:w-1/3 text-center">
                    <img 
                        className="h-32 w-32 rounded-full object-cover mx-auto shadow-lg border-4 border-white" 
                        src={customer.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=007bff&color=fff&size=128`} 
                        alt={customer.name} 
                    />
                    <h3 className="text-lg font-bold mt-4">{customer.name}</h3>
                </div>
                <div className="sm:w-2/3 mt-6 sm:mt-0">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <DetailItem label="Phone Number 1" value={customer.phone} />
                        <DetailItem label="Phone Number 2" value={customer.phone2} />
                        <DetailItem label="Email Address" value={customer.email} />
                        <DetailItem label="Aadhar Number" value={customer.aadhar} />
                        <div className="sm:col-span-2">
                            <DetailItem label="Address" value={customer.address} />
                        </div>
                    </dl>
                </div>
            </div>
        </div>
        <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Close</button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailModal;