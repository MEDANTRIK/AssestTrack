import React, { useState } from 'react';
import { Asset, Customer, Rental, PaymentMode, View } from '../types';
import { PlusIcon, CurrencyDollarIcon, HistoryIcon, DocumentReportIcon, EyeIcon, PrinterIcon } from './icons';
import PaymentHistoryModal from './PaymentHistoryModal';

interface RentalManagementProps {
  assets: Asset[];
  customers: Customer[];
  onReturnAsset: (assetId: string) => void;
  setCurrentView: (view: View) => void;
  onOpenPaymentModal: (assetId: string, rentalId: string) => void;
  isAuthenticated: boolean;
}

const RentalManagement: React.FC<RentalManagementProps> = ({ assets, customers, onReturnAsset, setCurrentView, onOpenPaymentModal, isAuthenticated }) => {
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedRental, setSelectedRental] = useState<{assetId: string, rental: Rental} | null>(null);
    const [viewMode, setViewMode] = useState<'active' | 'history'>('active');

    const getCustomerName = (customerId: string) => {
        return customers.find(c => c.id === customerId)?.name || 'Unknown Customer';
    };

    const openHistoryModal = (assetId: string, rental: Rental) => {
        setSelectedRental({assetId, rental});
        setIsHistoryModalOpen(true);
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
    
    const allRentals = assets
        .flatMap(asset => asset.rentalHistory.map(rental => ({ ...rental, assetName: asset.name, assetId: asset.id })));
    
    const activeRentals = allRentals.filter(r => !r.inDate);
    const completedRentals = allRentals.filter(r => r.inDate).sort((a,b) => new Date(b.inDate!).getTime() - new Date(a.inDate!).getTime());

    const handlePrint = (rentalsToPrint: any[], title: string) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          const tableHeaders = title === 'Active Rentals Report' 
            ? '<th>Asset</th><th>Customer</th><th>Rented On</th><th>Balance Due</th>'
            : '<th>Asset</th><th>Customer</th><th>Returned On</th><th>Final Balance</th>';
  
          const tableRows = rentalsToPrint.map(rental => {
            if (title === 'Active Rentals Report') {
              const estTotal = calculateTotalBilled(rental);
              const paid = totalPaid(rental);
              const balance = estTotal - paid;
              return `
                <tr>
                  <td>${rental.assetName}</td>
                  <td>${getCustomerName(rental.customerId)}</td>
                  <td>${new Date(rental.outDate).toLocaleDateString()}</td>
                  <td>$${balance.toFixed(2)}</td>
                </tr>
              `;
            } else {
              const finalBilled = calculateTotalBilled(rental);
              const paid = totalPaid(rental);
              const finalBalance = finalBilled - paid;
              return `
                <tr>
                  <td>${rental.assetName}</td>
                  <td>${getCustomerName(rental.customerId)}</td>
                  <td>${rental.inDate ? new Date(rental.inDate).toLocaleDateString() : 'N/A'}</td>
                  <td>$${finalBalance.toFixed(2)}</td>
                </tr>
              `;
            }
          }).join('');
  
          printWindow.document.write(`
            <html>
              <head>
                <title>${title}</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  h1 { color: #333; }
                  p { color: #555; }
                  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #f2f2f2; }
                  @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                  }
                </style>
              </head>
              <body>
                <h1>${title}</h1>
                <p>Date: ${new Date().toLocaleDateString()}</p>
                <table>
                  <thead>
                    <tr>${tableHeaders}</tr>
                  </thead>
                  <tbody>
                    ${tableRows}
                  </tbody>
                </table>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }
      };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Rental Management</h2>
        <button 
            onClick={() => setCurrentView('create-rental')} 
            className="flex items-center space-x-2 bg-primary hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isAuthenticated}
            title={isAuthenticated ? "Create New Rental" : "Login to create rentals"}
        >
          <PlusIcon />
          <span>Create Rental</span>
        </button>
      </div>
      
      <div className="flex border-b border-gray-200 mb-4">
        <button 
          onClick={() => setViewMode('active')} 
          className={`py-2 px-4 text-sm font-medium flex items-center space-x-2 ${viewMode === 'active' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <DocumentReportIcon />
          <span>Active Rentals</span>
        </button>
        <button 
          onClick={() => setViewMode('history')} 
          className={`py-2 px-4 text-sm font-medium flex items-center space-x-2 ${viewMode === 'history' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <HistoryIcon />
          <span>Rental History</span>
        </button>
      </div>

      {viewMode === 'active' ? (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Active Rentals</h3>
                <button 
                    onClick={() => handlePrint(activeRentals, 'Active Rentals Report')}
                    className="flex items-center space-x-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={activeRentals.length === 0}
                >
                    <PrinterIcon className="w-4 h-4" />
                    <span>Print</span>
                </button>
            </div>
            {activeRentals.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance Due</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {activeRentals.map(rental => {
                            const estTotal = calculateTotalBilled(rental);
                            const paid = totalPaid(rental);
                            const balance = estTotal - paid;
                            return (
                                <tr key={rental.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rental.assetName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getCustomerName(rental.customerId)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>${balance.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex items-center">
                                        <button onClick={() => openHistoryModal(rental.assetId, rental)} className="text-blue-600 hover:text-blue-900" title="View Payments"><DocumentReportIcon /></button>
                                        <button onClick={() => rental.agreementCopy && window.open(rental.agreementCopy, '_blank')} disabled={!rental.agreementCopy} className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-300 disabled:cursor-not-allowed" title="View Agreement"><EyeIcon /></button>
                                        {isAuthenticated && (
                                            <>
                                                <button onClick={() => onOpenPaymentModal(rental.assetId, rental.id)} className="text-green-600 hover:text-green-900" title="Add Payment"><CurrencyDollarIcon /></button>
                                                <button onClick={() => onReturnAsset(rental.assetId)} className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold py-1 px-3 rounded-full transition duration-300">Return</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-500 py-8">No active rentals.</p>
            )}
        </div>
      ) : (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Rental History</h3>
                 <button 
                    onClick={() => handlePrint(completedRentals, 'Rental History Report')}
                    className="flex items-center space-x-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={completedRentals.length === 0}
                >
                    <PrinterIcon className="w-4 h-4" />
                    <span>Print</span>
                </button>
            </div>
            {completedRentals.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Returned On</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Balance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {completedRentals.map(rental => {
                                const finalBilled = calculateTotalBilled(rental);
                                const paid = totalPaid(rental);
                                const finalBalance = finalBilled - paid;
                                return (
                                    <tr key={rental.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rental.assetName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getCustomerName(rental.customerId)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rental.inDate ? new Date(rental.inDate).toLocaleDateString() : 'N/A'}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${finalBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            ${finalBalance.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex items-center">
                                            <button onClick={() => openHistoryModal(rental.assetId, rental)} className="text-blue-600 hover:text-blue-900" title="View Payments">
                                                <DocumentReportIcon />
                                            </button>
                                            <button onClick={() => rental.agreementCopy && window.open(rental.agreementCopy, '_blank')} disabled={!rental.agreementCopy} className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-300 disabled:cursor-not-allowed" title="View Agreement">
                                                <EyeIcon />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-500 py-8">No completed rentals in history.</p>
            )}
        </div>
      )}

        {selectedRental && (
             <PaymentHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                rental={selectedRental.rental}
            />
        )}
    </div>
  );
};

export default RentalManagement;
