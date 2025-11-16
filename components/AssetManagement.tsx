import React, { useState, useMemo } from 'react';
import { Asset, Customer, AssetStatus } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, CubeIcon } from './icons';
import AssetFormModal from './AssetFormModal';

interface AssetManagementProps {
  assets: Asset[];
  customers: Customer[];
  productTypes: string[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => void;
  onUpdateAsset: (asset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
  onAddProductType: (typeName: string) => void;
  onDeleteProductType: (typeName: string) => void;
  isAuthenticated: boolean;
  onOpenDetailModal: (asset: Asset) => void;
}

const AssetManagement: React.FC<AssetManagementProps> = ({ assets, customers, productTypes, onAddAsset, onUpdateAsset, onDeleteAsset, onAddProductType, onDeleteProductType, isAuthenticated, onOpenDetailModal }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedAssetForForm, setSelectedAssetForForm] = useState<Asset | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isAddingType, setIsAddingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const productTypesInUse = useMemo(() => {
    return new Set(assets.map(asset => asset.productType));
  }, [assets]);

  const openAddModal = () => {
    setSelectedAssetForForm(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (asset: Asset) => {
    setSelectedAssetForForm(asset);
    setIsFormModalOpen(true);
  };
  
  const handleSaveAsset = (assetData: any) => {
    if(selectedAssetForForm) {
        onUpdateAsset(assetData);
    } else {
        onAddAsset(assetData);
    }
  };

  const handleConfirmAddType = () => {
    onAddProductType(newTypeName);
    setNewTypeName('');
    setIsAddingType(false);
  };
  
  const assetsByType = useMemo(() => {
    if (!selectedType) return [];
    return assets.filter(asset => asset.productType === selectedType);
  }, [selectedType, assets]);
  
  const typeCounts = useMemo(() => {
      const counts: {[key: string]: { total: number, available: number }} = {};
      productTypes.forEach(type => {
          counts[type] = { total: 0, available: 0 };
      });
      assets.forEach(asset => {
          if (counts[asset.productType]) {
              counts[asset.productType].total++;
              if (asset.status === AssetStatus.Available) {
                  counts[asset.productType].available++;
              }
          }
      });
      return counts;
  }, [assets, productTypes]);

  return (
    <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
        <div className="md:w-1/3">
            <div className="bg-white p-4 rounded-lg shadow-sm h-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Product Types</h2>
                    {!isAddingType && isAuthenticated && (
                        <button onClick={() => setIsAddingType(true)} className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded-lg text-sm transition duration-300">
                            <PlusIcon className="w-4 h-4" />
                            <span>Add Type</span>
                        </button>
                    )}
                </div>
                {isAddingType ? (
                    <div className="p-2 space-y-3">
                        <input
                            type="text"
                            value={newTypeName}
                            onChange={(e) => setNewTypeName(e.target.value)}
                            placeholder="New type name..."
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                            autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => { setIsAddingType(false); setNewTypeName(''); }} className="bg-gray-200 text-gray-700 text-sm font-bold py-1 px-3 rounded-lg hover:bg-gray-300">Cancel</button>
                            <button onClick={handleConfirmAddType} className="bg-primary text-white text-sm font-bold py-1 px-3 rounded-lg hover:bg-primary-600">Save</button>
                        </div>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {productTypes.map(type => {
                          const isInUse = productTypesInUse.has(type);
                          return (
                            <li key={type}>
                                <div className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedType === type ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-primary-50'}`}
                                     onClick={() => setSelectedType(type)}>
                                    <div>
                                        <p className="font-semibold">{type}</p>
                                        <p className={`text-xs ${selectedType === type ? 'text-primary-200' : 'text-gray-500'}`}>
                                            Total: {typeCounts[type]?.total || 0} | Available: {typeCounts[type]?.available || 0}
                                        </p>
                                    </div>
                                    {isAuthenticated && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm(`Are you sure you want to delete the product type "${type}"?`)) {
                                                onDeleteProductType(type);
                                                if (selectedType === type) setSelectedType(null);
                                            }
                                        }}
                                        disabled={isInUse}
                                        title={isInUse ? "Cannot delete a type that is in use." : "Delete product type"}
                                        className={`text-xs p-1 rounded-full transition-colors ${
                                            isInUse 
                                                ? 'text-gray-300 cursor-not-allowed' 
                                                : (selectedType === type ? 'hover:bg-primary-500' : 'text-gray-400 hover:bg-red-100 hover:text-red-600')
                                        }`}>
                                        <TrashIcon className="w-4 h-4"/>
                                    </button>
                                    )}
                                </div>
                            </li>
                        )})}
                    </ul>
                )}
            </div>
        </div>
        <div className="md:w-2/3">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                {!selectedType ? (
                    <div className="text-center py-20">
                        <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No Product Type Selected</h3>
                        <p className="mt-1 text-sm text-gray-500">Select a product type from the left to view its assets.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">Assets for <span className="text-primary">{selectedType}</span></h2>
                            <button onClick={openAddModal} className="flex items-center space-x-2 bg-primary hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!isAuthenticated} title={isAuthenticated ? 'Add New Asset' : 'Login to add assets'}>
                                <PlusIcon />
                                <span>Add Asset</span>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {assetsByType.map(asset => (
                                    <tr key={asset.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{asset.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${asset.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {asset.status}
                                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button onClick={() => onOpenDetailModal(asset)} className="text-blue-600 hover:text-blue-900" title="View Details"><EyeIcon /></button>
                                            {isAuthenticated && (
                                                <>
                                                    <button onClick={() => openEditModal(asset)} className="text-yellow-600 hover:text-yellow-900" title="Edit"><PencilIcon /></button>
                                                    <button onClick={() => onDeleteAsset(asset.id)} className="text-red-600 hover:text-red-900" title="Delete"><TrashIcon /></button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
        {isAuthenticated && (
            <AssetFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveAsset}
                asset={selectedAssetForForm}
                defaultProductType={selectedType && !selectedAssetForForm ? selectedType : undefined}
            />
        )}
    </div>
  );
};

export default AssetManagement;
