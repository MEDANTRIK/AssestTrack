
import React, { useState, useEffect, useMemo } from 'react';
import { Asset, Customer, View } from '../types';
import { SearchIcon, DocumentTextIcon } from './icons';

interface CreateRentalProps {
  assets: Asset[];
  customers: Customer[];
  onRentAsset: (rentalData: { assetId: string, customerId: string, rate: number, billingCycle: 'day' | 'month', outDate: string, agreementCopy: string | null }) => void;
  onCancel: () => void;
  defaultAssetId?: string | null;
}

const CreateRental: React.FC<CreateRentalProps> = ({ assets, customers, onRentAsset, onCancel, defaultAssetId }) => {
  const [assetId, setAssetId] = useState(defaultAssetId || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [rate, setRate] = useState<number>(0);
  const [billingCycle, setBillingCycle] = useState<'day' | 'month'>('day');
  const [outDate, setOutDate] = useState(new Date().toISOString().split('T')[0]);
  const [agreementCopy, setAgreementCopy] = useState<string | null>(null);

  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerResults, setShowCustomerResults] = useState(false);

  useEffect(() => {
    if (assetId) {
      const selectedAsset = assets.find(a => a.id === assetId);
      if (selectedAsset) {
        setRate(selectedAsset.rate);
        setBillingCycle(selectedAsset.billingCycle);
      }
    } else {
      setRate(0);
      setBillingCycle('day');
    }
  }, [assetId, assets]);
  
  useEffect(() => {
    setAssetId(defaultAssetId || '');
  }, [defaultAssetId]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return [];
    const searchTerm = customerSearch.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm) ||
      c.phone.includes(searchTerm) ||
      (c.phone2 && c.phone2.includes(searchTerm)) ||
      (c.aadhar && c.aadhar.replace(/\s/g, '').includes(searchTerm.replace(/\s/g, '')))
    );
  }, [customerSearch, customers]);

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setCustomerSearch(customer.name);
    setShowCustomerResults(false);
  };

  const handleAgreementCopyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAgreementCopy(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const selectedCustomer = useMemo(() => {
      return customers.find(c => c.id === selectedCustomerId);
  }, [selectedCustomerId, customers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !selectedCustomerId) {
      alert('Please select both an asset and a customer.');
      return;
    }
    onRentAsset({
      assetId,
      customerId: selectedCustomerId,
      rate,
      billingCycle,
      outDate: new Date(outDate).toISOString(),
      agreementCopy,
    });
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Rental</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="asset" className="block text-sm font-medium text-gray-700 mb-1">Asset to Rent</label>
          <select 
            id="asset" 
            value={assetId} 
            onChange={e => setAssetId(e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
            required
          >
            <option value="" disabled>-- Select an available asset --</option>
            {assets.map(asset => (
              <option key={asset.id} value={asset.id}>{asset.name} ({asset.productType})</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="customer-search" className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
          {!selectedCustomer ? (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text"
                id="customer-search"
                value={customerSearch}
                onChange={e => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerResults(true);
                }}
                onFocus={() => setShowCustomerResults(true)}
                onBlur={() => setTimeout(() => setShowCustomerResults(false), 200)}
                placeholder="Search by Name, Phone, or Aadhar..."
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:outline-none focus:ring-primary focus:border-primary"
                autoComplete="off"
              />
              {showCustomerResults && filteredCustomers.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {filteredCustomers.map(customer => (
                    <li 
                      key={customer.id} 
                      onMouseDown={() => handleSelectCustomer(customer)}
                      className="cursor-pointer hover:bg-primary-50 p-3"
                    >
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.phone} | {customer.aadhar || 'N/A'}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
             <div className="mt-2 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-4">
                  <img src={selectedCustomer.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCustomer.name)}&background=007bff&color=fff`} alt={selectedCustomer.name} className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md" />
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-800">{selectedCustomer.name}</h3>
                        <button 
                            type="button" 
                            onClick={() => {
                                setSelectedCustomerId(null);
                                setCustomerSearch('');
                            }}
                            className="text-sm text-primary hover:underline"
                        >
                            Change
                        </button>
                    </div>
                    <p className="text-sm text-gray-600"><strong>Phone:</strong> {selectedCustomer.phone}</p>
                    <p className="text-sm text-gray-600"><strong>Aadhar:</strong> {selectedCustomer.aadhar || 'N/A'}</p>
                    <p className="text-sm text-gray-600"><strong>Address:</strong> {selectedCustomer.address}</p>
                  </div>
                </div>
             </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-1">Custom Rate</label>
              <input 
                type="number" 
                id="rate" 
                value={rate} 
                onChange={e => setRate(Number(e.target.value))} 
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
          </div>
           <div>
              <label htmlFor="billing-cycle" className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
              <select 
                id="billing-cycle" 
                value={billingCycle} 
                onChange={e => setBillingCycle(e.target.value as 'day' | 'month')} 
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
              >
                  <option value="day">Per Day</option>
                  <option value="month">Per Month</option>
              </select>
          </div>
        </div>
        
        <div>
            <label htmlFor="out-date" className="block text-sm font-medium text-gray-700 mb-1">Date of Issue</label>
            <input 
              type="date" 
              id="out-date" 
              value={outDate} 
              onChange={e => setOutDate(e.target.value)} 
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" 
              required
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Agreement Copy</label>
            <div className="mt-1 flex items-center space-x-4">
                {agreementCopy ? (
                <img className="h-16 w-auto rounded-md object-contain" src={agreementCopy} alt="Agreement preview" />
                ) : (
                <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center">
                    <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                </div>
                )}
                <input id="agreement-upload" type="file" accept="image/*,application/pdf" onChange={handleAgreementCopyChange} className="hidden" />
                <label htmlFor="agreement-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                {agreementCopy ? 'Change' : 'Upload'}
                </label>
                {agreementCopy && (
                <button type="button" onClick={() => setAgreementCopy(null)} className="text-sm text-red-600 hover:underline">
                    Remove
                </button>
                )}
            </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
          <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors">Create Rental</button>
        </div>
      </form>
    </div>
  );
};

export default CreateRental;
