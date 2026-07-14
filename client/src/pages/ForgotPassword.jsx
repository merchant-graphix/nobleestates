import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HiOutlineLockClosed, HiCheckCircle } from 'react-icons/hi';
import { forgotPassword, resetPassword } from '../api/auth';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineLockClosed className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">
            {token ? 'Reset Password' : 'Forgot Password'}
          </h1>
          <p className="text-gray-500 text-center text-sm mb-6">
            {token
              ? 'Enter your new password below.'
              : 'Enter your email and we\'ll send you a reset link.'}
          </p>

          {error && <p className="text-red-600 text-sm mb-4 text-center bg-red-50 p-3 rounded-lg">{error}</p>}

          {success && !token ? (
            <div className="text-center py-4">
              <HiCheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">If an account exists with that email, a reset link has been sent.</p>
              <Link to="/login" className="text-indigo-600 hover:underline font-medium">Back to Sign In</Link>
            </div>
          ) : success && token ? (
            <div className="text-center py-4">
              <HiCheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">Password reset successful!</p>
              <button onClick={() => navigate('/login')} className="btn-primary">Go to Sign In</button>
            </div>
          ) : token ? (
            <form onSubmit={handleReset} className="space-y-4">
              <input
                type="password"
                placeholder="New password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                required
                minLength={6}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                required
                minLength={6}
              />
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {!success && (
            <p className="text-center text-sm text-gray-500 mt-6">
              <Link to="/login" className="text-indigo-600 hover:underline font-medium">Back to Sign In</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
