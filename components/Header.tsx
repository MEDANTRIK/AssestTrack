import React, { useState } from 'react';
import { HomeIcon, CubeIcon, UsersIcon, DocumentTextIcon, LogoutIcon, KeyIcon, BarcodeIcon, CircleStackIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ClockIcon, HistoryIcon } from './icons';
import type { View } from '../types';
import ChangePasswordModal from './ChangePasswordModal';


interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
  autoBackupInfo: { date: string | null };
  onRestoreAutoBackup: () => void;
}

const DataManagementModal: React.FC<DataManagementModalProps> = ({ isOpen, onClose, onExport, onImport, autoBackupInfo, onRestoreAutoBackup }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Data Management</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-2xl font-semibold">&times;</button>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Manage your application's data by creating manual backups or restoring from manual or automatic backups.
        </p>

        <div className="space-y-6">
          <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2 text-blue-800">Automatic Backup</h3>
            <p className="text-sm text-blue-700 mb-4">
              The application automatically saves a backup every 24 hours.
            </p>
             <div className="text-sm text-gray-600 bg-blue-100 p-3 rounded-md mb-4">
              <strong>Last auto-backup:</strong> {autoBackupInfo.date || 'Not yet created.'}
            </div>
            <button
              onClick={onRestoreAutoBackup}
              disabled={!autoBackupInfo.date}
              className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HistoryIcon className="w-5 h-5" />
              <span>Restore From Auto-Backup</span>
            </button>
          </div>
        
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Manual Export</h3>
            <p className="text-sm text-gray-500 mb-4">Download a JSON file containing all your data. Keep this file in a safe place.</p>
            <button
              onClick={onExport}
              className="w-full flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Download Backup File</span>
            </button>
          </div>

          <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2 text-red-800">Manual Import</h3>
            <p className="text-sm text-red-700 mb-4">
              <span className="font-bold">Warning:</span> Restoring from a backup file will permanently delete and replace all current data.
            </p>
            <button
              onClick={onImport}
              className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              <ArrowUpTrayIcon className="w-5 h-5" />
              <span>Upload Backup File</span>
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Close</button>
        </div>
      </div>
    </div>
  );
};

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onLogout: () => void;
  onUpdateSecuritySettings: (settings: {
    currentPassword?: string;
    newPassword?: string;
    question?: string;
    answer?: string;
  }) => Promise<{ success: boolean; message: string }>;
  securityQuestion: string;
  securityAnswer: string;
  onExport: () => void;
  onImport: () => void;
  autoBackupInfo: { date: string | null };
  onRestoreAutoBackup: () => void;
}

const NavItem: React.FC<{
  viewName: View;
  currentView: View;
  setCurrentView: (view: View) => void;
  icon: React.ReactNode;
  text: string;
}> = ({ viewName, currentView, setCurrentView, icon, text }) => (
  <li>
    <button
      onClick={() => setCurrentView(viewName)}
      className={`flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 ${
        currentView === viewName
          ? 'bg-primary-600 text-white'
          : 'text-gray-200 hover:bg-primary-600 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{text}</span>
    </button>
  </li>
);

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, onLogout, onUpdateSecuritySettings, securityQuestion, securityAnswer, onExport, onImport, autoBackupInfo, onRestoreAutoBackup }) => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  return (
    <>
      <header className="bg-primary text-white shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">AssetTrack</h1>
            </div>
            <div className="hidden md:block">
              <ul className="flex items-center space-x-4">
                <NavItem viewName="dashboard" currentView={currentView} setCurrentView={setCurrentView} icon={<HomeIcon />} text="Dashboard" />
                <NavItem viewName="assets" currentView={currentView} setCurrentView={setCurrentView} icon={<CubeIcon />} text="Assets" />
                <NavItem viewName="customers" currentView={currentView} setCurrentView={setCurrentView} icon={<UsersIcon />} text="Customers" />
                <NavItem viewName="rentals" currentView={currentView} setCurrentView={setCurrentView} icon={<DocumentTextIcon />} text="Rentals" />
                <li className="flex items-center space-x-2 text-gray-300 pl-4">
                    <BarcodeIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Scanner Ready</span>
                </li>
                 <li className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsDataModalOpen(true)}
                    className="flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 text-gray-200 hover:bg-primary-600 hover:text-white"
                    title="Data Management"
                  >
                    <CircleStackIcon />
                  </button>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 text-gray-200 hover:bg-primary-600 hover:text-white"
                    title="Security Settings"
                  >
                    <KeyIcon />
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 text-gray-200 hover:bg-primary-600 hover:text-white"
                    title="Logout"
                  >
                    <LogoutIcon />
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
         {/* Mobile Nav */}
        <div className="md:hidden">
          <ul className="flex justify-around p-2 bg-primary-700 items-center">
             <NavItem viewName="dashboard" currentView={currentView} setCurrentView={setCurrentView} icon={<HomeIcon />} text="" />
             <NavItem viewName="assets" currentView={currentView} setCurrentView={setCurrentView} icon={<CubeIcon />} text="" />
             <NavItem viewName="customers" currentView={currentView} setCurrentView={setCurrentView} icon={<UsersIcon />} text="" />
             <NavItem viewName="rentals" currentView={currentView} setCurrentView={setCurrentView} icon={<DocumentTextIcon />} text="" />
              <li className="flex items-center space-x-1 text-gray-300">
                  <BarcodeIcon className="w-5 h-5" />
              </li>
              <li className="flex items-center space-x-2">
                <button
                    onClick={() => setIsDataModalOpen(true)}
                    className="flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 text-gray-200 hover:bg-primary-600 hover:text-white"
                    title="Data Management"
                  >
                    <CircleStackIcon />
                </button>
                <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 text-gray-200 hover:bg-primary-600 hover:text-white"
                    title="Security Settings"
                  >
                    <KeyIcon />
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 text-gray-200 hover:bg-primary-600 hover:text-white"
                  title="Logout"
                >
                  <LogoutIcon />
                </button>
              </li>
          </ul>
        </div>
      </header>
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onUpdateSecuritySettings={onUpdateSecuritySettings}
        currentQuestion={securityQuestion}
        currentAnswer={securityAnswer}
      />
      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        onExport={onExport}
        onImport={onImport}
        autoBackupInfo={autoBackupInfo}
        onRestoreAutoBackup={onRestoreAutoBackup}
      />
    </>
  );
};

export default Header;