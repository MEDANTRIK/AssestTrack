import React from 'react';
import Barcode from 'react-barcode';
import { Asset, Customer, AssetStatus } from '../types';
import { PrinterIcon } from './icons';

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  customers: Customer[];
  isAuthenticated: boolean;
  onRent: (assetId: string) => void;
  onReturn: (assetId: string) => void;
  onAddPayment: (assetId: string) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-sm text-gray-900">{value || 'N/A'}</p>
  </div>
);

const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ isOpen, onClose, asset, customers, isAuthenticated, onRent, onReturn, onAddPayment }) => {
  if (!isOpen) return null;

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'Unknown Customer';
  };
  
  const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString();
  }

  const handlePrintBarcode = () => {
    const printContents = document.getElementById('barcode-to-print')?.innerHTML;
    if (printContents) {
      const printWindow = window.open('', '', 'height=400,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Asset Barcode</title>');
        printWindow.document.write('<style>body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; } .asset-id { text-align: center; font-family: monospace; font-size: 14px; margin-top: 8px; letter-spacing: 2px; } </style>');
        printWindow.document.write('</head><body style="text-align: center;">');
        printWindow.document.write(printContents);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex-grow overflow-y-auto">
          <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{asset.name}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          
          <div className="space-y-6">
              <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Asset Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <DetailItem label="Product Type" value={asset.productType} />
                      <DetailItem label="Make" value={asset.make} />
                      <DetailItem label="Model" value={asset.model} />
                      <DetailItem label="Serial Number" value={asset.serialNumber} />
                      <DetailItem label="Purchase Date" value={formatDate(asset.purchaseDate)} />
                      <DetailItem label="Status" value={<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${asset.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{asset.status}</span>} />
                      <DetailItem label="Rental Rate" value={`$${asset.rate.toFixed(2)} / ${asset.billingCycle}`} />
                  </div>
              </div>
              
               {asset.photos && asset.photos.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {asset.photos.map((photo, index) => (
                      <img key={index} src={photo} alt={`Asset photo ${index + 1}`} className="h-32 w-full object-cover rounded-md" />
                    ))}
                  </div>
                </div>
              )}
              
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">Asset Barcode</h3>
                  <button
                    onClick={handlePrintBarcode}
                    className="flex items-center space-x-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded-lg transition duration-300"
                    title="Print Barcode Label"
                  >
                    <PrinterIcon className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                </div>
                <div id="barcode-to-print">
                  <div className="flex flex-col items-center justify-center bg-white p-4">
                    <Barcode value={asset.id} />
                    <p className="asset-id mt-2 font-mono text-center tracking-widest">{asset.id}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Rental History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rented Out</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Returned</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {asset.rentalHistory.length > 0 ? asset.rentalHistory.map(r => (
                        <tr key={r.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{getCustomerName(r.customerId)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatDate(r.outDate)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{r.inDate ? formatDate(r.inDate) : 'Still Rented'}</td>
                        </tr>
                      )) : (
                        <tr>
                            <td colSpan={3} className="text-center py-4 text-sm text-gray-500">No rental history for this asset.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t flex justify-between items-center">
            <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Close</button>
            {isAuthenticated && (
                <div className="flex justify-end space-x-3">
                    {asset.status === AssetStatus.Available ? (
                    <button
                        onClick={() => onRent(asset.id)}
                        className="bg-primary hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                    >
                        Rent this Asset
                    </button>
                    ) : (
                    <>
                        <button
                        onClick={() => onAddPayment(asset.id)}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                        >
                        Add Payment
                        </button>
                        <button
                        onClick={() => onReturn(asset.id)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                        >
                        Return Asset
                        </button>
                    </>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AssetDetailModal;