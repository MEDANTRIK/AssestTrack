import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Asset, Customer, AssetStatus, View, PaymentMode, Rental } from './types';
import { useSessionStorage } from './hooks/useSessionStorage';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AssetManagement from './components/AssetManagement';
import CustomerManagement from './components/CustomerManagement';
import RentalManagement from './components/RentalManagement';
import CreateRental from './components/CreateRental';
import Login from './components/Login';
import AssetDetailModal from './components/AssetDetailModal';
import PaymentModal from './components/PaymentModal';
import * as api from './api';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [autoBackupInfo, setAutoBackupInfo] = useState<{ date: string | null }>({ date: null });

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useSessionStorage('isAuthenticated', false);

  // Modal States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<Asset | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [rentalForPayment, setRentalForPayment] = useState<{assetId: string, rentalId: string} | null>(null);
  const [preselectedAssetIdForRental, setPreselectedAssetIdForRental] = useState<string | null>(null);


  const handleOpenDetailModal = useCallback((asset: Asset) => {
    setSelectedAssetForDetail(asset);
    setIsDetailModalOpen(true);
  }, []);

  const loadAutoBackupInfo = useCallback(async () => {
    const info = await api.getAutoBackup();
    setAutoBackupInfo({ date: info.timestamp ? new Date(info.timestamp).toLocaleString() : null });
  }, []);

  useEffect(() => {
    const handleAutoBackup = async () => {
      const backupInfo = await api.getAutoBackup();
      const lastBackupTime = backupInfo.timestamp || 0;
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (Date.now() - lastBackupTime > twentyFourHours) {
        console.log("Performing automatic backup...");
        try {
          const dataToBackup = await api.exportAllData();
          await api.saveAutoBackup(dataToBackup);
          await loadAutoBackupInfo();
          console.log("Automatic backup successful.");
        } catch (error) {
          console.error("Automatic backup failed:", error);
        }
      }
    };

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [assetsData, customersData, productTypesData, securityData] = await Promise.all([
          api.getAssets(),
          api.getCustomers(),
          api.getProductTypes(),
          api.getSecuritySettings(),
        ]);
        setAssets(assetsData);
        setCustomers(customersData);
        setProductTypes(productTypesData);
        setPassword(securityData.password);
        setSecurityQuestion(securityData.question);
        setSecurityAnswer(securityData.answer);
        await loadAutoBackupInfo();
        // Run auto-backup check after initial data is loaded
        handleAutoBackup();
      } catch (error) {
        console.error("Failed to load initial data", error);
        alert("Could not load application data. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [loadAutoBackupInfo]);

  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeystrokeTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const targetNodeName = (e.target as HTMLElement)?.nodeName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(targetNodeName)) {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeystrokeTime > 100) {
        barcodeBuffer = '';
      }
      lastKeystrokeTime = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBuffer.length > 0) {
          const foundAsset = assets.find(a => a.id === barcodeBuffer);
          if (foundAsset) {
            handleOpenDetailModal(foundAsset);
          } else {
            alert(`Asset with ID "${barcodeBuffer}" not found.`);
          }
        }
        barcodeBuffer = '';
      } else if (e.key.length === 1) {
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [assets, handleOpenDetailModal]);


  const refreshAssets = async () => {
    const assetsData = await api.getAssets();
    setAssets(assetsData);
  };

  const dashboardStats = useMemo(() => {
    const rentedAssets = assets.filter(a => a.status === AssetStatus.Rented).length;
    return {
      totalAssets: assets.length,
      rentedAssets: rentedAssets,
      availableAssets: assets.length - rentedAssets,
      totalCustomers: customers.length
    };
  }, [assets, customers]);
  
  const recentlyRented = useMemo(() => {
    return assets.filter(a => a.status === AssetStatus.Rented);
  }, [assets]);
  
  // --- Calculation Helpers for Rentals ---
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
        return calculateDaysRented(rental.outDate, rental.inDate) * rental.rate;
    } else { // month
        return calculateMonthsRented(rental.outDate, rental.inDate) * rental.rate;
    }
  };

  const totalPaid = (rental: Rental) => (rental.payments || []).reduce((sum, p) => sum + p.amount, 0);


  const handleAddAsset = async (asset: Omit<Asset, 'id'>) => {
    await api.addAsset(asset);
    await refreshAssets();
  };

  const handleUpdateAsset = async (updatedAsset: Asset) => {
    await api.updateAsset(updatedAsset);
    await refreshAssets();
  };

  const handleDeleteAsset = async (assetId: string) => {
    await api.deleteAsset(assetId);
    await refreshAssets();
  };
  
  const handleAddCustomer = async (customer: Omit<Customer, 'id'>) => {
    const newCustomer = await api.addCustomer(customer);
    setCustomers(prev => [...prev, newCustomer]);
  };

  const handleUpdateCustomer = async (updatedCustomer: Customer) => {
    const customer = await api.updateCustomer(updatedCustomer);
    setCustomers(customers.map(c => c.id === customer.id ? customer : c));
  };

  const handleDeleteCustomer = async (customerId: string) => {
    await api.deleteCustomer(customerId);
    setCustomers(customers.filter(c => c.id !== customerId));
  };
  
  const handleRentAsset = async (rentalData: { assetId: string, customerId: string, rate: number, billingCycle: 'day' | 'month', outDate: string, agreementCopy: string | null }) => {
    await api.rentAsset(rentalData);
    await refreshAssets();
    setPreselectedAssetIdForRental(null); // Clear preselection after rental
  };
  
  const handleReturnAsset = async (assetId: string) => {
      const asset = assets.find(a => a.id === assetId);
      if (!asset) return;
      const latestRental = asset.rentalHistory.find(r => !r.inDate);
      if (!latestRental) return;

      const balance = calculateTotalBilled(latestRental) - totalPaid(latestRental);

      let proceed = true;
      if (balance > 0) {
          proceed = window.confirm(`This rental has an outstanding balance of $${balance.toFixed(2)}. Are you sure you want to mark it as returned?`);
      } else {
          proceed = window.confirm('Are you sure you want to mark this asset as returned?');
      }

      if (proceed) {
          await api.returnAsset(assetId);
          await refreshAssets();
          if (selectedAssetForDetail?.id === assetId) {
            handleCloseDetailModal();
          }
      }
  };
  
  const handleAddPayment = async (paymentData: { assetId: string, rentalId: string, amount: number, date: string, mode: PaymentMode }) => {
      await api.addPayment(paymentData);
      await refreshAssets();
  };

  const handleAddProductType = async (typeName: string) => {
    const trimmedTypeName = typeName.trim();
    if (!trimmedTypeName) {
      alert("Product type name cannot be empty.");
      return;
    }
    
    const isDuplicate = productTypes.some(pt => pt.toLowerCase() === trimmedTypeName.toLowerCase());
    if (isDuplicate) {
      alert(`Product type "${trimmedTypeName}" already exists.`);
      return;
    }

    const newTypes = await api.addProductType(trimmedTypeName);
    setProductTypes(newTypes);
  };

  const handleDeleteProductType = async (typeName: string) => {
    const isTypeInUse = assets.some(asset => asset.productType === typeName);
    if (isTypeInUse) {
      alert(`Cannot delete "${typeName}" because it is still being used by one or more assets.`);
      return;
    }
    const updatedProductTypes = await api.deleteProductType(typeName);
    setProductTypes(updatedProductTypes);
  };

  const handleLogin = async (submittedPassword: string): Promise<boolean> => {
    const isValid = await api.verifyPassword(submittedPassword);
    if (isValid) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleUpdateSecuritySettings = async (settings: {
    currentPassword?: string;
    newPassword?: string;
    question?: string;
    answer?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const result = await api.updateSecuritySettings(settings);
    if (result.success) {
        const securityData = await api.getSecuritySettings();
        setPassword(securityData.password);
        setSecurityQuestion(securityData.question);
        setSecurityAnswer(securityData.answer);
    }
    return result;
  };

  const handlePasswordRecovery = async (submittedAnswer: string): Promise<{ success: boolean; message: string }> => {
      if (!securityQuestion || !securityAnswer) {
          return { success: false, message: 'No recovery information has been set up.' };
      }

      if (submittedAnswer.trim().toLowerCase() === securityAnswer.trim().toLowerCase()) {
          return { success: true, message: `Your password is: ${password}` };
      }

      return { success: false, message: 'The answer provided is incorrect.' };
  };

  // --- Data Management Handlers ---
  const handleExportData = async () => {
    try {
      const data = await api.exportAllData();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const link = document.createElement("a");
      link.href = jsonString;
      const date = new Date().toISOString().split('T')[0];
      link.download = `assettrack_backup_${date}.json`;

      link.click();
    } catch (error) {
      console.error("Failed to export data", error);
      alert("An error occurred while exporting data.");
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const confirmed = window.confirm(
        'WARNING: Importing a backup file will overwrite all existing data in the application.\n\nThis action cannot be undone.\n\nAre you sure you want to proceed?'
      );

      if (confirmed) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const result = await api.importAllData(event.target?.result as string);
            if (result.success) {
              alert(result.message + ' The application will now reload.');
              window.location.reload();
            } else {
              alert(`Import failed: ${result.message}`);
            }
          } catch (error) {
            alert('An error occurred during the import process.');
            console.error(error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  
  const handleRestoreFromAutoBackup = async () => {
    const backupInfo = await api.getAutoBackup();
    if (!backupInfo.data) {
      alert("No automatic backup found to restore.");
      return;
    }
    
    const confirmed = window.confirm(
        `WARNING: You are about to restore data from the last automatic backup created on ${new Date(backupInfo.timestamp!).toLocaleString()}.\n\nThis will overwrite all current data.\n\nAre you sure you want to proceed?`
    );
    
    if (confirmed) {
        try {
            const result = await api.importAllData(JSON.stringify(backupInfo.data));
            if (result.success) {
                alert(result.message + ' The application will now reload.');
                window.location.reload();
            } else {
                alert(`Restore failed: ${result.message}`);
            }
        } catch (error) {
            alert('An error occurred during the restore process.');
            console.error(error);
        }
    }
  };

  // --- Modal Handlers ---

  const handleCloseDetailModal = () => {
    setSelectedAssetForDetail(null);
    setIsDetailModalOpen(false);
  };
  
  const handleOpenPaymentModal = (assetId: string, rentalId: string) => {
    setRentalForPayment({ assetId, rentalId });
    setIsPaymentModalOpen(true);
  };

  const handleAddPaymentFromDetail = (assetId: string) => {
      const asset = assets.find(a => a.id === assetId);
      const currentRental = asset?.rentalHistory.find(r => !r.inDate);
      if (asset && currentRental) {
          handleOpenPaymentModal(asset.id, currentRental.id);
          handleCloseDetailModal();
      }
  };

  const handleRentFromDetail = (assetId: string) => {
    handleCloseDetailModal();
    setPreselectedAssetIdForRental(assetId);
    setCurrentView('create-rental');
  };

  const handleCancelCreateRental = () => {
    setPreselectedAssetIdForRental(null);
    setCurrentView('rentals');
  };

  const renderView = () => {
    switch(currentView) {
      case 'dashboard':
        return <Dashboard stats={dashboardStats} recentlyRented={recentlyRented} customers={customers} onOpenPaymentModal={(assetId, rentalId) => handleOpenPaymentModal(assetId, rentalId)} onReturnAsset={handleReturnAsset} isAuthenticated={isAuthenticated} />;
      case 'assets':
        return <AssetManagement 
                    assets={assets} 
                    customers={customers} 
                    productTypes={productTypes}
                    onAddAsset={handleAddAsset} 
                    onUpdateAsset={handleUpdateAsset} 
                    onDeleteAsset={handleDeleteAsset}
                    onAddProductType={handleAddProductType}
                    onDeleteProductType={handleDeleteProductType}
                    isAuthenticated={isAuthenticated}
                    onOpenDetailModal={handleOpenDetailModal}
                />;
      case 'customers':
        return <CustomerManagement assets={assets} customers={customers} onAddCustomer={handleAddCustomer} onUpdateCustomer={handleUpdateCustomer} onDeleteCustomer={handleDeleteCustomer} isAuthenticated={isAuthenticated} />;
      case 'rentals':
          return <RentalManagement assets={assets} customers={customers} onReturnAsset={handleReturnAsset} setCurrentView={setCurrentView} onOpenPaymentModal={handleOpenPaymentModal} isAuthenticated={isAuthenticated} />;
      case 'create-rental':
          if (!isAuthenticated) {
            setCurrentView('dashboard');
            return null;
          }
          const availableAssets = assets.filter(a => a.status === AssetStatus.Available);
          return <CreateRental assets={availableAssets} customers={customers} onRentAsset={handleRentAsset} onCancel={handleCancelCreateRental} defaultAssetId={preselectedAssetIdForRental} />;
      default:
        return <Dashboard stats={dashboardStats} recentlyRented={recentlyRented} customers={customers} onOpenPaymentModal={(assetId, rentalId) => handleOpenPaymentModal(assetId, rentalId)} onReturnAsset={handleReturnAsset} isAuthenticated={isAuthenticated} />;
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg text-gray-600">Loading Application...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} securityQuestion={securityQuestion} onPasswordRecovery={handlePasswordRecovery} />;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onLogout={handleLogout}
        onUpdateSecuritySettings={handleUpdateSecuritySettings}
        securityQuestion={securityQuestion}
        securityAnswer={securityAnswer}
        onExport={handleExportData}
        onImport={handleImportData}
        autoBackupInfo={autoBackupInfo}
        onRestoreAutoBackup={handleRestoreFromAutoBackup}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderView()}
      </main>

      {selectedAssetForDetail && (
        <AssetDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          asset={selectedAssetForDetail}
          customers={customers}
          isAuthenticated={isAuthenticated}
          onRent={handleRentFromDetail}
          onReturn={handleReturnAsset}
          onAddPayment={handleAddPaymentFromDetail}
        />
      )}

      {rentalForPayment && (
        <PaymentModal 
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onAddPayment={handleAddPayment}
          assetId={rentalForPayment.assetId}
          rentalId={rentalForPayment.rentalId}
        />
      )}

    </div>
  );
}

export default App;