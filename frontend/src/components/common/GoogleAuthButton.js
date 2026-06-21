import { useGoogleLogin } from '@react-oauth/google';
import { authAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function GoogleAuthButton({ label = 'Continue with Google' }) {
  const { loadUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = useGoogleLogin({
    flow: 'implicit',
    redirect_uri: `${window.location.origin}/auth/callback`,
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const { data } = await authAPI.googleLogin(tokenResponse.access_token);
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        await loadUser();
        toast.success(`Welcome, ${data.user?.full_name?.split(' ')[0] || 'back'}!`);
        navigate(data.user?.user_type === 'admin' ? '/admin' : '/dashboard');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Google sign-in failed. Try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.error('Google OAuth error:', err);
      toast.error('Google sign-in was cancelled');
    },
  });

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => handleGoogleLogin()}
      className="w-full flex items-center justify-center gap-3 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
        </svg>
      )}
      {loading ? 'Signing in...' : label}
    </button>
  );
}
