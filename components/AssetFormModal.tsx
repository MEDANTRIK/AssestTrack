import React, { useState, useEffect } from 'react';
import { Asset, AssetStatus } from '../types';

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: any) => void;
  asset: Asset | null;
  defaultProductType?: string;
}

const AssetFormModal: React.FC<AssetFormModalProps> = ({ isOpen, onClose, onSave, asset, defaultProductType }) => {
  const [name, setName] = useState('');
  const [productType, setProductType] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [rate, setRate] = useState<number>(0);
  const [billingCycle, setBillingCycle] = useState<'day' | 'month'>('day');
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (asset) {
      setName(asset.name);
      setProductType(asset.productType);
      setMake(asset.make);
      setModel(asset.model);
      setSerialNumber(asset.serialNumber);
      setPurchaseDate(asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '');
      setRate(asset.rate);
      setBillingCycle(asset.billingCycle);
      setPhotos(asset.photos || []);
    } else {
      setName('');
      setProductType(defaultProductType || '');
      setMake('');
      setModel('');
      setSerialNumber('');
      setPurchaseDate('');
      setRate(0);
      setBillingCycle('day');
      setPhotos([]);
    }
  }, [asset, isOpen, defaultProductType]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newPhotos: string[] = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPhotos.push(reader.result as string);
          if (newPhotos.length === files.length) {
            setPhotos(prev => [...prev, ...newPhotos].slice(0, 4));
          }
        };
        // FIX: Explicitly cast file to Blob to satisfy readAsDataURL's parameter type, resolving a potential type inference issue.
        reader.readAsDataURL(file as Blob);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assetData = {
      ...asset,
      name,
      productType,
      make,
      model,
      serialNumber,
      purchaseDate: purchaseDate ? new Date(purchaseDate).toISOString() : '',
      rate,
      billingCycle,
      photos,
      status: asset?.status || AssetStatus.Available,
      rentalHistory: asset?.rentalHistory || [],
    };
    onSave(assetData);
    onClose();
  };

  if (!isOpen) return null;
  
  // FIX: Coerce `isNewAssetInTypeContext` to a boolean for the `readOnly` prop.
  const isNewAssetInTypeContext = !asset && !!defaultProductType;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{asset ? 'Edit Asset' : 'Add New Asset'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="asset-name" className="block text-sm font-medium text-gray-700">Asset Name</label>
            <input type="text" id="asset-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-type" className="block text-sm font-medium text-gray-700">Product Type</label>
              <input type="text" id="product-type" value={productType} onChange={e => setProductType(e.target.value)} className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary ${isNewAssetInTypeContext ? 'bg-gray-100' : ''}`} readOnly={isNewAssetInTypeContext} />
            </div>
            <div>
              <label htmlFor="make" className="block text-sm font-medium text-gray-700">Make</label>
              <input type="text" id="make" value={make} onChange={e => setMake(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
              <input type="text" id="model" value={model} onChange={e => setModel(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label htmlFor="serial" className="block text-sm font-medium text-gray-700">Serial Number</label>
              <input type="text" id="serial" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="purchase-date" className="block text-sm font-medium text-gray-700">Purchase Date</label>
              <input type="date" id="purchase-date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rate" className="block text-sm font-medium text-gray-700">Rental Rate ($)</label>
              {/* FIX: Use Number() to parse the rate to avoid NaN issues with empty input. */}
              <input type="number" id="rate" value={rate} onChange={e => setRate(Number(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
            </div>
            <div>
              <label htmlFor="billing-cycle" className="block text-sm font-medium text-gray-700">Billing Cycle</label>
              <select id="billing-cycle" value={billingCycle} onChange={e => setBillingCycle(e.target.value as 'day' | 'month')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary">
                <option value="day">Per Day</option>
                <option value="month">Per Month</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Photos (up to 4)</label>
            <div className="mt-1 flex items-center">
              <input id="photo-upload" type="file" multiple accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={photos.length >= 4} />
              <label htmlFor="photo-upload" className={`cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 ${photos.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}>Upload Photos</label>
            </div>
            {photos.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img src={photo} alt={`Asset photo ${index + 1}`} className="h-24 w-full object-cover rounded" />
                    <button type="button" onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs leading-none">&times;</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-4 pt-2">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-600">{asset ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetFormModal;
