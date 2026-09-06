import React, { useState } from 'react';
import { Lock, User, Mail, ShieldCheck, X } from 'lucide-react';
import axios from 'axios';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await axios.post(endpoint, formData);
      const { token, user } = res.data;
      
      localStorage.setItem('jarvis_token', token);
      localStorage.setItem('jarvis_user', JSON.stringify(user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication clearance failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="hud-panel rounded-2xl p-6 w-full max-w-md border border-stark-cyan/40 shadow-2xl relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-stark-cyan">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-6 h-6 text-stark-cyan animate-pulse" />
          <h2 className="text-lg font-mono font-bold text-stark-cyan uppercase tracking-wider">
            {isRegister ? 'OPERATOR REGISTRATION' : 'SECURITY CLEARANCE LOGIN'}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {isRegister && (
            <div>
              <label className="block text-slate-300 mb-1">OPERATOR NAME</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Tony Stark"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-stark-dark/90 border border-stark-cyan/30 rounded-xl pl-9 pr-4 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-stark-cyan"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 mb-1">SECURITY EMAIL</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="stark@starkindustries.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-stark-dark/90 border border-stark-cyan/30 rounded-xl pl-9 pr-4 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-stark-cyan"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">ENCRYPTED PASSWORD</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-stark-dark/90 border border-stark-cyan/30 rounded-xl pl-9 pr-4 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-stark-cyan"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stark-cyan text-stark-dark font-mono font-bold text-xs py-3 rounded-xl hover:bg-stark-glow transition-all disabled:opacity-50 mt-2 shadow-lg shadow-stark-cyan/20"
          >
            {loading ? 'AUTHENTICATING...' : isRegister ? 'GRANT CLEARANCE & REGISTER' : 'AUTHORIZE LOGIN'}
          </button>
        </form>

        <div className="mt-4 text-center font-mono text-[11px]">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-stark-cyan hover:underline"
          >
            {isRegister ? 'Already have clearance? Login here' : 'Need new operator clearance? Register here'}
          </button>
        </div>

      </div>
    </div>
  );
}
