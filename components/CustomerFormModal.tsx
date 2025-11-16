import React, { useState, useEffect } from 'react';
import { Customer } from '../types';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: any) => void;
  customer: Customer | null;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ isOpen, onClose, onSave, customer }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phone2, setPhone2] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setEmail(customer.email);
      setPhone(customer.phone);
      setPhone2(customer.phone2 || '');
      setAadhar(customer.aadhar || '');
      setAddress(customer.address || '');
      setPhoto(customer.photo || null);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setPhone2('');
      setAadhar('');
      setAddress('');
      setPhoto(null);
    }
  }, [customer, isOpen]);

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<string | null>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customerData = { ...customer, name, email, phone, phone2, aadhar, address, photo: photo || '' };
    onSave(customerData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Photo</label>
            <div className="mt-1 flex items-center space-x-4">
              <span className="inline-block h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                {photo ? (
                  <img className="h-full w-full object-cover" src={photo} alt="Customer" />
                ) : (
                  <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.993A1 1 0 001 19.007v-2.01A1 1 0 000 16.007V15c0-1.107.895-2 2-2h1.107A1 1 0 004 12.893v-2.01A1 1 0 003 9.893V9c0-1.107.895-2 2-2h1.107A1 1 0 007 5.893V3.882A1 1 0 006 2.892V1a1 1 0 00-1-1H4a1 1 0 00-1 1v1.892A1 1 0 004 4.882v2.01A1 1 0 003 7.893v1.01A1 1 0 002 9.893v2.114A1 1 0 003 13.017v2.01a1 1 0 001 1h.107a1 1 0 001-.893v-1.107A1 1 0 005 13.017v-2.114a1 1 0 00-1-1H3V9a1 1 0 011-1h1v1.107A1 1 0 006 8.107v2.01A1 1 0 007 11.118v1.892a1 1 0 001 1h2a1 1 0 001-1v-1.892a1 1 0 00-1-1.007V8.107A1 1 0 009 7.107V6H8a1 1 0 01-1-1V4h1.107a1 1 0 001-.893V2.107A1 1 0 009 1.107V0h2a1 1 0 011 1v1.107a1 1 0 01-1 1.007v1.892a1 1 0 01-1 1.007v2.01a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2.01a1 1 0 011-1.007V8.107a1 1 0 011-1.007V6a1 1 0 011-1h1v1.107a1 1 0 01-1 1.007v2.01a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2.01a1 1 0 011-1.007V8.107a1 1 0 011-1.007V6a1 1 0 011-1h1v1.107a1 1 0 01-1 1.007v2.01a1 1 0 01-1 1h-1.107a1 1 0 00-1 1.107v2.01a1 1 0 001 1h1.107a1 1 0 001-.893v-1.107a1 1 0 00-1-1.007V13.9a1 1 0 00-1-1h-2a1 1 0 00-1 1v2.107a1 1 0 001 1h1.107a1 1 0 001-.893V16a1 1 0 011-1h2a1 1 0 011 1v1.893a1 1 0 001 1.107h.107a1 1 0 001-1V17a1 1 0 00-1-1h-2a1 1 0 00-1 1v2.107a1 1 0 001 1h2a1 1 0 001-1v-1.107a1 1 0 00-1-1.007V12a1 1 0 00-1-1h-2a1 1 0 00-1 1v2.107a1 1 0 001 1h1.107a1 1 0 001-.893v-1.107a1 1 0 00-1-1.007V11a1 1 0 00-1-1h-1a1 1 0 00-1 1v1.893a1 1 0 001 1.107h1.107a1 1 0 001-.893V12a1 1 0 011-1h2a1 1 0 011 1v1.893a1 1 0 001 1.107H22a1 1 0 001-1v-1.893a1 1 0 00-1-1.007v-2.01a1 1 0 00-1-1.107H20a1 1 0 00-1 1v2.107a1 1 0 001 1h1v-1.107a1 1 0 00-1-1.007V13.9a1 1 0 00-1-1h-1a1 1 0 00-1 1v1.893a1 1 0 001 1.107h1.107a1 1 0 001-.893V15a1 1 0 011-1h1v1.107a1 1 0 01-1 1.007v2.01a1 1 0 01-1 1h-1.107a1 1 0 01-1-.893v-1.107a1 1 0 011-1.007V17a1 1 0 011-1h2a1 1 0 011 1v2.993z" /></svg>
                )}
              </span>
              <input id="photo-upload" type="file" accept="image/*" onChange={handleFileChange(setPhoto)} className="hidden" />
              <label htmlFor="photo-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Change</label>
            </div>
          </div>
          <div>
            <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" id="customer-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
          </div>
          <div>
            <label htmlFor="aadhar" className="block text-sm font-medium text-gray-700">Aadhar Number</label>
            <input type="text" id="aadhar" value={aadhar} onChange={e => setAadhar(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number 1</label>
                <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
            </div>
            <div>
                <label htmlFor="phone2" className="block text-sm font-medium text-gray-700">Phone Number 2</label>
                <input type="tel" id="phone2" value={phone2} onChange={e => setPhone2(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <textarea id="address" value={address} onChange={e => setAddress(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
          </div>
          <div className="flex justify-end space-x-4 pt-2">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-600">{customer ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;