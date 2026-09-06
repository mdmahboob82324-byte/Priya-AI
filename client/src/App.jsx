import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { ShieldCheck, UserCheck, Power, Activity, Terminal as TerminalIcon } from 'lucide-react';

import JarvisCore3D from './components/JarvisCore3D';
import CommandConsole from './components/CommandConsole';
import SystemTelemetry from './components/SystemTelemetry';
import SecurityPanel from './components/SecurityPanel';
import AuthModal from './components/AuthModal';

export default function App() {
  const [socket, setSocket] = useState(null);
  const [coreState, setCoreState] = useState('idle'); // 'idle' | 'thinking' | 'speaking'
  const [telemetry, setTelemetry] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Auth state
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Initialize socket connection & auth state on mount
  useEffect(() => {
    // Check saved token
    const token = localStorage.getItem('jarvis_token');
    const savedUser = localStorage.getItem('jarvis_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Connect WebSocket stream
    const newSocket = io('http://localhost:5002', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('[Socket.IO] Connected to Jarvis Core Server');
    });

    newSocket.on('state_change', (data) => {
      setCoreState(data.state);
      setIsProcessing(data.state === 'thinking');
    });

    newSocket.on('telemetry_update', (data) => {
      setTelemetry(data);
    });

    newSocket.on('jarvis_response', (data) => {
      setMessages((prev) => [
        ...prev,
        { sender: 'jarvis', text: data.reply, timestamp: data.timestamp }
      ]);
      if (data.telemetry) setTelemetry(data.telemetry);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    // Append user message locally
    const timestamp = new Date().toLocaleTimeString();
    setMessages((prev) => [...prev, { sender: 'user', text, timestamp }]);

    // Emit over WebSockets
    if (socket) {
      socket.emit('user_command', {
        prompt: text,
        operatorName: user ? user.name : 'Boss'
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jarvis_token');
    localStorage.removeItem('jarvis_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-stark-dark text-slate-100 flex flex-col font-sans p-4 md:p-6">
      
      {/* Top Holographic Navigation Bar */}
      <header className="hud-panel rounded-2xl px-6 py-4 mb-6 flex items-center justify-between border border-stark-cyan/40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-stark-cyan/10 border border-stark-cyan flex items-center justify-center text-stark-cyan">
              <TerminalIcon className="w-6 h-6 animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-4 ring-stark-dark animate-ping"></span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-mono font-bold tracking-widest text-stark-cyan hud-glow-text uppercase">
              J.A.R.V.I.S. PROTOCOL
            </h1>
            <p className="text-[10px] font-mono text-slate-400 tracking-wider">
              STARK INDUSTRIES OPERATIONAL FULLSTACK HUD v4.2
            </p>
          </div>
        </div>

        {/* Status Indicators & Auth Button */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-stark-dark/80 px-3 py-1.5 rounded-xl border border-stark-cyan/30 text-xs font-mono">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-slate-300">CORE STATUS:</span>
            <span className="text-emerald-400 font-bold uppercase">100% OPTIMAL</span>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-stark-cyan/10 px-3 py-1.5 rounded-xl border border-stark-cyan/40 text-xs font-mono text-stark-cyan">
                <UserCheck className="w-4 h-4 text-stark-gold" />
                <span className="font-bold">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                title="Logout Clearance"
                className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 transition-all"
              >
                <Power className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 bg-stark-cyan text-stark-dark font-mono font-bold text-xs px-4 py-2 rounded-xl hover:bg-stark-glow transition-all shadow-lg shadow-stark-cyan/20"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>CLEARANCE LOGIN</span>
            </button>
          )}
        </div>
      </header>

      {/* Main HUD Dashboard Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 3D Reactor Core & System Diagnostics */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <JarvisCore3D state={coreState} />
          <SystemTelemetry telemetry={telemetry} />
        </div>

        {/* Right Column: Command Console Terminal & Security Panel */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <CommandConsole 
            socket={socket} 
            onSendMessage={handleSendMessage} 
            messages={messages} 
            isProcessing={isProcessing}
          />
          <SecurityPanel />
        </div>

      </main>

      {/* Footer System Status Bar */}
      <footer className="mt-6 pt-3 border-t border-stark-cyan/20 flex flex-col md:flex-row items-center justify-between text-[11px] font-mono text-slate-400">
        <p>© STARK INDUSTRIES. QUANTUM NEURAL INTERFACE ONLINE.</p>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <span>PORT: 5001 (EXPRESS + SOCKET.IO)</span>
          <span>•</span>
          <span>DATABASE: PRISMA SQLITE</span>
          <span>•</span>
          <span>SECURITY: ENFORCED</span>
        </div>
      </footer>

      {/* Auth Security Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={(u) => setUser(u)}
      />

    </div>
  );
}
