import React, { useState } from 'react';
import { Asset, Customer, Rental, PaymentMode } from '../types';
import { CubeIcon, UsersIcon, CheckCircleIcon, ClockIcon, CurrencyDollarIcon } from './icons';
import CustomerDetailModal from './CustomerDetailModal';

interface DashboardProps {
  stats: {
    totalAssets: number;
    rentedAssets: number;
    availableAssets: number;
    totalCustomers: number;
  };
  recentlyRented: Asset[];
  customers: Customer[];
  onOpenPaymentModal: (assetId: string, rentalId: string) => void;
  onReturnAsset: (assetId: string) => void;
  isAuthenticated: boolean;
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm flex items-center space-x-4">
    <div className="bg-primary-100 rounded-full p-3">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ stats, recentlyRented, customers, onOpenPaymentModal, onReturnAsset, isAuthenticated }) => {
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'Unknown Customer';
  };
  
  const openCustomerModal = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setIsCustomerModalOpen(true);
    }
  };

  const calculateDaysRented = (outDate: string, inDate: string | null): number => {
      const startDate = new Date(outDate);
      const endDate = inDate ? new Date(inDate) : new Date();
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return days === 0 ? 1 : days;
  };

  const calculateMonthsRented = (outDate: string, inDate: string | null): number => {
      const start = new Date(outDate);
      const end = inDate ? new Date(inDate) : new Date();

      const yearDiff = end.getFullYear() - start.getFullYear();
      const monthDiff = end.getMonth() - start.getMonth();

      const totalMonthsDiff = yearDiff * 12 + monthDiff;
      
      return totalMonthsDiff + 1;
  };
  
  const calculateTotalBilled = (rental: Rental) => {
    if (rental.billingCycle === 'day') {
        const days = calculateDaysRented(rental.outDate, rental.inDate);
        return days * rental.rate;
    } else { // month
        const months = calculateMonthsRented(rental.outDate, rental.inDate);
        return months * rental.rate;
    }
  };

  const totalPaid = (rental: Rental) => (rental.payments || []).reduce((sum, p) => sum + p.amount, 0);
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Assets" value={stats.totalAssets} icon={<CubeIcon className="text-primary" />} />
        <StatCard title="Total Customers" value={stats.totalCustomers} icon={<UsersIcon className="text-primary" />} />
        <StatCard title="Assets Available" value={stats.availableAssets} icon={<CheckCircleIcon className="text-primary" />} />
        <StatCard title="Assets Rented" value={stats.rentedAssets} icon={<ClockIcon className="text-primary" />} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Currently Rented Assets</h2>
        {recentlyRented.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rented To</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rental Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance Due</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentlyRented.map(asset => {
                    const latestRental = asset.rentalHistory.find(r => !r.inDate);
                    if (!latestRental) return null;

                    const estTotal = calculateTotalBilled(latestRental);
                    const paid = totalPaid(latestRental);
                    const balance = estTotal - paid;

                    return(
                      <tr key={asset.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{asset.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button onClick={() => openCustomerModal(latestRental.customerId)} className="text-primary hover:underline font-medium">
                                {getCustomerName(latestRental.customerId)}
                            </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(latestRental.outDate).toLocaleDateString()}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>${balance.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-3">
                            <button onClick={() => onOpenPaymentModal(asset.id, latestRental.id)} className="text-green-600 hover:text-green-900 disabled:text-gray-300 disabled:cursor-not-allowed" title={isAuthenticated ? "Add Payment" : "Login to add payment"} disabled={!isAuthenticated}>
                                <CurrencyDollarIcon />
                            </button>
                             <button onClick={() => onReturnAsset(asset.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold py-1 px-3 rounded-full transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!isAuthenticated} title={isAuthenticated ? "Return Asset" : "Login to return asset"}>
                                Return
                            </button>
                        </td>
                      </tr>
                    )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No assets are currently rented out.</p>
        )}
      </div>
       {selectedCustomer && (
        <CustomerDetailModal
            isOpen={isCustomerModalOpen}
            onClose={() => setIsCustomerModalOpen(false)}
            customer={selectedCustomer}
        />
      )}
    </div>
  );
};

export default Dashboard;
