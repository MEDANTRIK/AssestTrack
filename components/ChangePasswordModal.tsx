import React, { useState, useEffect } from 'react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateSecuritySettings: (settings: {
    currentPassword?: string;
    newPassword?: string;
    question?: string;
    answer?: string;
  }) => Promise<{ success: boolean; message: string }>;
  currentQuestion: string;
  currentAnswer: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onUpdateSecuritySettings, currentQuestion, currentAnswer }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setQuestion(currentQuestion || '');
      setAnswer(currentAnswer || '');
      setError('');
      setSuccessMessage('');
      setIsChangingPassword(false);
      setIsSubmitting(false);
    }
  }, [isOpen, currentQuestion, currentAnswer]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    const settingsToUpdate: any = { question, answer };

    if (isChangingPassword) {
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match.');
        return;
      }
      if (newPassword && newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      settingsToUpdate.currentPassword = currentPassword;
      settingsToUpdate.newPassword = newPassword;
    }

    setIsSubmitting(true);
    const result = await onUpdateSecuritySettings(settingsToUpdate);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Security Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Password</h3>
            {!isChangingPassword ? (
                <button type="button" onClick={() => setIsChangingPassword(true)} className="text-sm text-primary hover:underline">
                    Change Password
                </button>
            ) : (
                <div className="space-y-4">
                    <div>
                        {/* FIX: Corrected typo from cla-ssName to className */}
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input
                        type="password"
                        id="current-password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        required
                        autoFocus
                        />
                    </div>
                    <div>
                        {/* FIX: Corrected typo from cla-ssName to className */}
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                        type="password"
                        id="new-password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        required
                        />
                    </div>
                    <div>
                        {/* FIX: Corrected typo from cla-ssName to className */}
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        required
                        />
                    </div>
                </div>
            )}
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Password Recovery</h3>
            <p className="text-xs text-gray-500 mb-3">Set a security question to recover your password if you forget it.</p>
            <div>
                <label htmlFor="security-question" className="block text-sm font-medium text-gray-700">Security Question</label>
                <input
                type="text"
                id="security-question"
                placeholder="e.g., What is your mother's maiden name?"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                />
            </div>
            <div className="mt-4">
                <label htmlFor="security-answer" className="block text-sm font-medium text-gray-700">Security Answer</label>
                <input
                type="text"
                id="security-answer"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                />
            </div>
          </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}
          {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

          <div className="flex justify-end space-x-4 pt-2">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-600 flex justify-center items-center disabled:opacity-50" disabled={isSubmitting}>
               {isSubmitting ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;