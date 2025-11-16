import React, { useState } from 'react';

interface LoginProps {
  onLogin: (password: string) => Promise<boolean>;
  securityQuestion: string;
  onPasswordRecovery: (answer: string) => Promise<{ success: boolean; message: string }>;
}

const Login: React.FC<LoginProps> = ({ onLogin, securityQuestion, onPasswordRecovery }) => {
  const [view, setView] = useState<'login' | 'recover'>('login');
  const [password, setPassword] = useState('');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    const loginSuccess = await onLogin(password);
    if (!loginSuccess) {
      setError('Incorrect password. Please try again.');
      setPassword('');
    } else {
      setError('');
    }
    setIsSubmitting(false);
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      setIsSubmitting(true);
      const result = await onPasswordRecovery(recoveryAnswer);
      if (result.success) {
          setSuccess(result.message);
      } else {
          setError(result.message);
      }
      setRecoveryAnswer('');
      setIsSubmitting(false);
  };
  
  const renderLoginView = () => (
    <>
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">AssetTrack</h1>
      <p className="text-center text-gray-500 mb-6">Please log in to manage assets</p>
      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
            required
            autoFocus
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors flex justify-center items-center disabled:opacity-50"
        >
          {isSubmitting ? (
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
          ) : 'Login'}
        </button>
      </form>
      <div className="text-center mt-4">
        <button onClick={() => setView('recover')} className="text-sm text-primary hover:underline">
            Forgot Password?
        </button>
      </div>
    </>
  );

  const renderRecoveryView = () => (
    <>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Password Recovery</h1>
        {!securityQuestion ? (
            <p className="text-center text-gray-600">No recovery question has been set up. Please contact an administrator.</p>
        ) : (
            <form onSubmit={handleRecoverySubmit} className="space-y-4">
                <div>
                    <label htmlFor="recovery-question" className="block text-sm font-medium text-gray-700">Security Question</label>
                    <p id="recovery-question" className="mt-1 text-gray-900 bg-gray-100 p-2 rounded-md">{securityQuestion}</p>
                </div>
                <div>
                    <label htmlFor="recovery-answer" className="block text-sm font-medium text-gray-700">Your Answer</label>
                    <input
                        type="text"
                        id="recovery-answer"
                        value={recoveryAnswer}
                        onChange={(e) => setRecoveryAnswer(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        required
                        autoFocus
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors flex justify-center items-center disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : 'Retrieve Password'}
                </button>
            </form>
        )}
         <div className="text-center mt-4">
            <button onClick={() => { setView('login'); setError(''); setSuccess(''); }} className="text-sm text-primary hover:underline">
                Back to Login
            </button>
        </div>
    </>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        {view === 'login' ? renderLoginView() : renderRecoveryView()}
        {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
        {success && <p className="mt-4 text-sm text-green-600 text-center font-semibold break-words">{success}</p>}
      </div>
    </div>
  );
};

export default Login;
