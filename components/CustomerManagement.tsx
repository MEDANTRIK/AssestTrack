import React, { useState } from 'react';
import { Customer, Asset } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, HistoryIcon } from './icons';
import CustomerFormModal from './CustomerFormModal';

interface CustomerRentalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  assets: Asset[];
}

const CustomerRentalHistoryModal: React.FC<CustomerRentalHistoryModalProps> = ({ isOpen, onClose, customer, assets }) => {
  if (!isOpen || !customer) return null;

  const customerRentals = assets
    .flatMap(asset => asset.rentalHistory.map(rental => ({ ...rental, assetName: asset.name, assetId: asset.id })))
    .filter(rental => rental.customerId === customer.id)
    .sort((a, b) => new Date(b.outDate).getTime() - new Date(a.outDate).getTime());

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Rental History for {customer.name}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-2xl font-semibold">&times;</button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {customerRentals.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rented Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Returned</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerRentals.map(rental => (
                  <tr key={rental.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rental.assetName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(rental.outDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(rental.inDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${!rental.inDate ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                         {!rental.inDate ? 'Rented' : 'Returned'}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500 py-8">No rental history found for this customer.</p>
          )}
        </div>
        <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Close</button>
        </div>
      </div>
    </div>
  );
};


interface CustomerManagementProps {
  customers: Customer[];
  assets: Asset[];
  onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  isAuthenticated: boolean;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ customers, assets, onAddCustomer, onUpdateCustomer, onDeleteCustomer, isAuthenticated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const openAddModal = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };
  
  const openHistoryModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsHistoryModalOpen(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Manage Customers</h2>
        <button onClick={openAddModal} className="flex items-center space-x-2 bg-primary hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!isAuthenticated} title={isAuthenticated ? "Add New Customer" : "Login to add customers"}>
          <PlusIcon />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Active Rentals</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map(customer => {
              const activeRentalsCount = assets.filter(asset => 
                asset.rentalHistory.some(rental => rental.customerId === customer.id && !rental.inDate)
              ).length;
              
              return (
              <tr key={customer.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                   <img className="h-10 w-10 rounded-full object-cover" src={customer.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=007bff&color=fff`} alt={customer.name} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{activeRentalsCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button onClick={() => openHistoryModal(customer)} className="text-blue-600 hover:text-blue-900" title="View Rental History"><HistoryIcon /></button>
                  {isAuthenticated && (
                    <>
                      <button onClick={() => openEditModal(customer)} className="text-yellow-600 hover:text-yellow-900" title="Edit"><PencilIcon /></button>
                      <button onClick={() => onDeleteCustomer(customer.id)} className="text-red-600 hover:text-red-900" title="Delete"><TrashIcon /></button>
                    </>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isAuthenticated && (
        <CustomerFormModal
          isOpen={isModalOpen}
          onClose={() => {
              setIsModalOpen(false);
              setSelectedCustomer(null);
          }}
          onSave={selectedCustomer ? onUpdateCustomer : onAddCustomer}
          customer={selectedCustomer}
        />
      )}
      <CustomerRentalHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
            setIsHistoryModalOpen(false);
            setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        assets={assets}
      />
    </div>
  );
};

export default CustomerManagement;
