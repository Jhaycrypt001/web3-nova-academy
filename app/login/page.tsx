// app/login/page.tsx
"use client";

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(''); // Clear previous errors

    try {
      // --- 🚨 DEV BACKDOOR: REMOVE BEFORE LAUNCH 🚨 ---
      if (email === 'devadmin') {
        await new Promise(resolve => setTimeout(resolve, 800));
        localStorage.setItem('token', 'dev-bypass');
        localStorage.setItem('userRole', 'ADMIN');
        router.push('/admin');
        return;
      }
      if (email === 'devstudent') {
        await new Promise(resolve => setTimeout(resolve, 800));
        localStorage.setItem('token', 'dev-bypass');
        localStorage.setItem('userRole', 'STUDENT');
        router.push('/student');
        return;
      }
      // ------------------------------------------------

      // Hitting the live Render backend
      const response = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // Handle errors from the backend (e.g., wrong password, user not found)
      if (!response.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      // Success! Store the JWT token and role in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      
      // Redirect based on role exactly as specified in the docs
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/student');
      }
      
    } catch (error: any) {
      // If it fails to fetch completely, it might be waking up or CORS blocked
      if (error.message === 'Failed to fetch') {
        setErrorMessage("Server is waking up or unreachable. Please try again in 30 seconds.");
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-md bg-[#111111]/80 backdrop-blur-xl border border-gray-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            Web3Nova Academy
          </h1>
          <p className="text-gray-400 text-sm">Sign in to access your learning portal</p>
        </div>

        {/* Error Message Banner */}
        {errorMessage && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="student@web3nova.org"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-500 mt-2">
              First-time login? Your password is your first name, lowercase.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 mt-2"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}