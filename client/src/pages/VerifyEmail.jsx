import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { verifyEmail } from '../api/auth';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('missing');
      return;
    }
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [searchParams]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Helmet><title>Verify Email | Noble Estates</title></Helmet>
      <div className="text-center max-w-md">
        {status === 'verifying' && (
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Email Verified</h1>
            <p className="text-gray-500 mb-6">Your email has been verified successfully.</p>
            <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
            <p className="text-gray-500 mb-6">The verification link is invalid or has expired.</p>
            <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
          </>
        )}
        {status === 'missing' && (
          <>
            <h1 className="text-2xl font-bold mb-2">Invalid Link</h1>
            <p className="text-gray-500 mb-6">No verification token provided.</p>
            <Link to="/" className="btn-primary">Go Home</Link>
          </>
        )}
      </div>
    </div>
  );
}
