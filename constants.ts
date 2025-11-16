import { Asset, Customer, AssetStatus } from './types';

export const INITIAL_PASSWORD = 'admin123';
export const INITIAL_SECURITY_QUESTION = '';
export const INITIAL_SECURITY_ANSWER = '';


export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'ASSET-001',
    name: 'Concrete Mixer 500L',
    productType: 'Construction Equipment',
    make: 'BuildRight',
    model: 'CM-500',
    serialNumber: 'BR-CM500-1001',
    purchaseDate: '2022-01-15T00:00:00.000Z',
    photos: [],
    status: AssetStatus.Available,
    rentalHistory: [],
    rate: 50,
    billingCycle: 'day',
  },
  {
    id: 'ASSET-002',
    name: 'Scaffolding Set (10ft)',
    productType: 'Construction Equipment',
    make: 'SafeScaffold',
    model: 'SS-10',
    serialNumber: 'SS-10-2023',
    purchaseDate: '2022-03-20T00:00:00.000Z',
    photos: [],
    status: AssetStatus.Available,
    rentalHistory: [],
    rate: 150,
    billingCycle: 'month',
  },
  {
    id: 'ASSET-003',
    name: 'Canon EOS R5',
    productType: 'Cameras',
    make: 'Canon',
    model: 'EOS R5',
    serialNumber: 'CAN-R5-1234',
    purchaseDate: '2023-05-10T00:00:00.000Z',
    photos: [],
    status: AssetStatus.Available,
    rentalHistory: [],
    rate: 75,
    billingCycle: 'day',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'John Doe Construction',
    email: 'john.doe@construction.com',
    phone: '123-456-7890',
    address: '123 Main St, Anytown, USA',
    aadhar: '1234 5678 9012'
  },
  {
    id: 'CUST-002',
    name: 'Jane Smith Builders',
    email: 'jane.smith@builders.com',
    phone: '987-654-3210',
    address: '456 Oak Ave, Othertown, USA',
    aadhar: '9876 5432 1098'
  },
];

export const INITIAL_PRODUCT_TYPES: string[] = Array.from(new Set(INITIAL_ASSETS.map(a => a.productType)));