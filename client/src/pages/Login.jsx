import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { Helmet } from 'react-helmet-async';
import { login, register } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const data = await login(form.email, form.password);
        loginUser(data.user, data.token);
        toast.success('Welcome back!');
      } else {
        const data = await register(form);
        loginUser(data.user, data.token);
        toast.success('Account created successfully!');
      }
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Something went wrong';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Helmet>
        <title>{isLogin ? 'Sign In' : 'Create Account'} | Noble Estates</title>
      </Helmet>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <h1 className="text-2xl font-bold text-center mb-6">{isLogin ? 'Sign In' : 'Create Account'}</h1>
          {error && <p className="text-red-600 text-sm mb-4 text-center bg-red-50 p-3 rounded-lg">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                className="input-field"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              className="input-field"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min 6 characters)"
                value={form.password}
                onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                className="input-field pr-11"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
              </button>
            </div>
            {!isLogin && (
              <select
                value={form.role}
                onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))}
                className="input-field"
              >
                <option value="user">Home Buyer / Renter</option>
                <option value="agent">Real Estate Agent</option>
              </select>
            )}
            {isLogin && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">Forgot password?</Link>
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={toggle} className="text-indigo-600 hover:underline font-medium">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
          
        </div>
      </div>
    </div>
  );
}
