import React, { useState, useEffect } from 'react';
import { ShieldAlert, Lock, CheckCircle2, FileText, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function SecurityPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/assistant/logs');
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="hud-panel rounded-2xl p-5 border border-stark-cyan/30 flex flex-col gap-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stark-cyan/20">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-stark-gold" />
          <h2 className="text-sm font-mono tracking-wider text-stark-gold uppercase font-bold">
            SECURITY MATRIX & AUDIT LOGS
          </h2>
        </div>
        <button 
          onClick={fetchAuditLogs}
          className="text-xs font-mono text-stark-cyan hover:text-stark-glow flex items-center gap-1 bg-stark-cyan/10 px-2 py-1 rounded border border-stark-cyan/30"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          REFRESH
        </button>
      </div>

      {/* Security Features List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        <div className="bg-stark-dark/80 p-3 rounded-xl border border-emerald-500/30 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-400">JWT BEARER AUTH</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Password hashing with Bcrypt (12 salt rounds) & token expiration.</p>
          </div>
        </div>

        <div className="bg-stark-dark/80 p-3 rounded-xl border border-emerald-500/30 flex items-start gap-2">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-400">HELMET & CORS GUARD</p>
            <p className="text-[10px] text-slate-400 mt-0.5">XSS header encapsulation, frameguard & origin lockdown.</p>
          </div>
        </div>

        <div className="bg-stark-dark/80 p-3 rounded-xl border border-emerald-500/30 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-400">RATE LIMIT & ZOD</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Express rate-limiting buffers & strict payload schema sanitization.</p>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-stark-dark/90 rounded-xl p-3 border border-stark-cyan/20 max-h-48 overflow-y-auto font-mono text-xs">
        <div className="flex items-center gap-2 mb-2 text-stark-cyan text-[11px] uppercase font-bold">
          <FileText className="w-3.5 h-3.5" />
          <span>RECENT SYSTEM AUDIT LOGS (SQLITE)</span>
        </div>

        {logs.length === 0 ? (
          <p className="text-slate-500 text-center py-4 text-[11px]">No audit log events registered yet.</p>
        ) : (
          <div className="space-y-1.5">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-[11px] p-2 bg-slate-900/60 rounded border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-stark-gold font-bold">[{log.action}]</span>
                  <span className="text-slate-200">{log.details}</span>
                </div>
                <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
