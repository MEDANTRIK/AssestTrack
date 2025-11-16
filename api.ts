import { Asset, Customer, PaymentMode, Rental, AssetStatus } from './types';
import { INITIAL_ASSETS, INITIAL_CUSTOMERS, INITIAL_PRODUCT_TYPES, INITIAL_PASSWORD, INITIAL_SECURITY_QUESTION, INITIAL_SECURITY_ANSWER } from './constants';

const SIMULATED_DELAY = 300; // ms

// --- Helper Functions ---

const simulate = <T,>(data: T): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), SIMULATED_DELAY);
  });
};

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    window.localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};


// --- API Service ---

// Assets
export const getAssets = (): Promise<Asset[]> => {
  const assets = getFromStorage('assets', INITIAL_ASSETS);
  return simulate(assets);
};

export const addAsset = async (assetData: Omit<Asset, 'id'>): Promise<Asset> => {
  const assets = getFromStorage('assets', INITIAL_ASSETS);
  const newAsset = { ...assetData, id: `ASSET-${Date.now()}` };
  saveToStorage('assets', [...assets, newAsset]);
  return simulate(newAsset);
};

export const updateAsset = async (updatedAsset: Asset): Promise<Asset> => {
  let assets = getFromStorage('assets', INITIAL_ASSETS);
  assets = assets.map(asset => (asset.id === updatedAsset.id ? updatedAsset : asset));
  saveToStorage('assets', assets);
  return simulate(updatedAsset);
};

export const deleteAsset = async (assetId: string): Promise<void> => {
  let assets = getFromStorage('assets', INITIAL_ASSETS);
  assets = assets.filter(asset => asset.id !== assetId);
  saveToStorage('assets', assets);
  return simulate(undefined);
};

// Customers
export const getCustomers = (): Promise<Customer[]> => {
  const customers = getFromStorage('customers', INITIAL_CUSTOMERS);
  return simulate(customers);
};

export const addCustomer = async (customerData: Omit<Customer, 'id'>): Promise<Customer> => {
    const customers = getFromStorage('customers', INITIAL_CUSTOMERS);
    const newCustomer = { ...customerData, id: `CUST-${Date.now()}` };
    saveToStorage('customers', [...customers, newCustomer]);
    return simulate(newCustomer);
};

export const updateCustomer = async (updatedCustomer: Customer): Promise<Customer> => {
    let customers = getFromStorage('customers', INITIAL_CUSTOMERS);
    customers = customers.map(c => (c.id === updatedCustomer.id ? updatedCustomer : c));
    saveToStorage('customers', customers);
    return simulate(updatedCustomer);
};

export const deleteCustomer = async (customerId: string): Promise<void> => {
    let customers = getFromStorage('customers', INITIAL_CUSTOMERS);
    customers = customers.filter(c => c.id !== customerId);
    saveToStorage('customers', customers);
    return simulate(undefined);
};

// Product Types
export const getProductTypes = (): Promise<string[]> => {
    const productTypes = getFromStorage('productTypes', INITIAL_PRODUCT_TYPES);
    return simulate(productTypes);
};

export const addProductType = async (typeName: string): Promise<string[]> => {
    let types = getFromStorage('productTypes', INITIAL_PRODUCT_TYPES);
    types = [...types, typeName];
    saveToStorage('productTypes', types);
    return simulate(types);
};

export const deleteProductType = async (typeName: string): Promise<string[]> => {
    let types = getFromStorage('productTypes', INITIAL_PRODUCT_TYPES);
    types = types.filter(pt => pt !== typeName);
    saveToStorage('productTypes', types);
    return simulate(types);
};

// Security
export const getSecuritySettings = (): Promise<{ password: string; question: string; answer: string }> => {
    const password = getFromStorage('appPassword', INITIAL_PASSWORD);
    const question = getFromStorage('securityQuestion', INITIAL_SECURITY_QUESTION);
    const answer = getFromStorage('securityAnswer', INITIAL_SECURITY_ANSWER);
    return simulate({ password, question, answer });
};

export const verifyPassword = async (submitted: string): Promise<boolean> => {
    const { password } = await getSecuritySettings();
    return simulate(submitted === password);
};

export const updateSecuritySettings = async (settings: {
    currentPassword?: string;
    newPassword?: string;
    question?: string;
    answer?: string;
}): Promise<{ success: boolean; message: string }> => {
    const { currentPassword, newPassword, question, answer } = settings;
    const currentSettings = await getSecuritySettings();

    if (newPassword) {
      if (currentPassword !== currentSettings.password) {
        return simulate({ success: false, message: 'Incorrect current password.' });
      }
      saveToStorage('appPassword', newPassword);
    }

    if (typeof question !== 'undefined' && typeof answer !== 'undefined') {
        if(question && !answer) {
            return simulate({ success: false, message: 'Security answer cannot be empty if a question is set.' });
        }
        saveToStorage('securityQuestion', question);
        saveToStorage('securityAnswer', answer);
    }
    
    return simulate({ success: true, message: 'Settings updated successfully!' });
};


// Rentals
export const rentAsset = async (rentalData: { assetId: string; customerId: string; rate: number; billingCycle: 'day' | 'month'; outDate: string; agreementCopy: string | null; }): Promise<void> => {
    let assets = getFromStorage('assets', INITIAL_ASSETS);
    assets = assets.map(asset => {
      if (asset.id === rentalData.assetId) {
        const newRental: Rental = {
          id: `RENT-${Date.now()}`,
          customerId: rentalData.customerId,
          outDate: rentalData.outDate,
          inDate: null,
          rate: rentalData.rate,
          billingCycle: rentalData.billingCycle,
          payments: [],
          agreementCopy: rentalData.agreementCopy || undefined,
        };
        return {
          ...asset,
          status: AssetStatus.Rented,
          rentalHistory: [...asset.rentalHistory, newRental]
        };
      }
      return asset;
    });
    saveToStorage('assets', assets);
    return simulate(undefined);
};

export const returnAsset = async (assetId: string): Promise<void> => {
    let assets = getFromStorage('assets', INITIAL_ASSETS);
    assets = assets.map(asset => {
        if (asset.id === assetId) {
            const updatedHistory = asset.rentalHistory.map(r => {
                if(!r.inDate) {
                    return { ...r, inDate: new Date().toISOString() };
                }
                return r;
            });
            return { ...asset, status: AssetStatus.Available, rentalHistory: updatedHistory };
        }
        return asset;
    });
    saveToStorage('assets', assets);
    return simulate(undefined);
};

export const addPayment = async (paymentData: { assetId: string, rentalId: string, amount: number, date: string, mode: PaymentMode }): Promise<void> => {
    let assets = getFromStorage('assets', INITIAL_ASSETS);
    assets = assets.map(asset => {
        if (asset.id === paymentData.assetId) {
            const updatedHistory = asset.rentalHistory.map(r => {
                if (r.id === paymentData.rentalId) {
                    const newPayment = {
                        id: `PAY-${Date.now()}`,
                        amount: paymentData.amount,
                        date: paymentData.date,
                        mode: paymentData.mode,
                    };
                    return { ...r, payments: [...(r.payments || []), newPayment] };
                }
                return r;
            });
            return { ...asset, rentalHistory: updatedHistory };
        }
        return asset;
    });
    saveToStorage('assets', assets);
    return simulate(undefined);
};

// Data Management
export const exportAllData = async (): Promise<object> => {
  const assets = getFromStorage('assets', INITIAL_ASSETS);
  const customers = getFromStorage('customers', INITIAL_CUSTOMERS);
  const productTypes = getFromStorage('productTypes', INITIAL_PRODUCT_TYPES);
  const password = getFromStorage('appPassword', INITIAL_PASSWORD);
  const question = getFromStorage('securityQuestion', INITIAL_SECURITY_QUESTION);
  const answer = getFromStorage('securityAnswer', INITIAL_SECURITY_ANSWER);

  const data = {
    assets,
    customers,
    productTypes,
    appPassword: password,
    securityQuestion: question,
    securityAnswer: answer,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };

  return simulate(data);
};

export const importAllData = async (jsonData: string): Promise<{ success: boolean; message: string }> => {
  try {
    const data = JSON.parse(jsonData);

    // Basic validation
    if (!data.assets || !data.customers || !data.productTypes || !data.appPassword) {
      return simulate({ success: false, message: 'Invalid or corrupted backup file.' });
    }

    saveToStorage('assets', data.assets);
    saveToStorage('customers', data.customers);
    saveToStorage('productTypes', data.productTypes);
    saveToStorage('appPassword', data.appPassword);
    saveToStorage('securityQuestion', data.securityQuestion || INITIAL_SECURITY_QUESTION);
    saveToStorage('securityAnswer', data.securityAnswer || INITIAL_SECURITY_ANSWER);

    return simulate({ success: true, message: 'Data imported successfully!' });
  } catch (error) {
    console.error('Import failed:', error);
    return simulate({ success: false, message: 'Failed to parse the backup file. It might be corrupted.' });
  }
};

export const saveAutoBackup = async (data: object): Promise<void> => {
    saveToStorage('autoBackupData', data);
    saveToStorage('lastAutoBackupTimestamp', Date.now());
    return simulate(undefined);
};

export const getAutoBackup = async (): Promise<{ data: object | null, timestamp: number | null }> => {
    const data = getFromStorage('autoBackupData', null);
    const timestamp = getFromStorage('lastAutoBackupTimestamp', null);
    return simulate({ data, timestamp });
};