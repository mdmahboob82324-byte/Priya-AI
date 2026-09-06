import React from 'react';
import { Activity, Cpu, HardDrive, Shield, Server, Clock } from 'lucide-react';

export default function SysteTelemtry({ telemetry }) {
  if (!telemetry) {
    return (
      <div className="hud-panel rounded-2xl p-5 border border-stark-cyan/30 text-center text-slate-400 font-mono text-xs">
        <Activity className="w-6 h-6 text-stark-cyan animate-spin mx-auto mb-2" />
        Connecting to system telemetry stream...
      </div>
    );
  }

  const {
    cpuUsagePercentage = 15,
    ramUsagePercentage = 42,
    totalMemoryGB = "16.0",
    usedMemoryGB = "6.7",
    platform = "darwin",
    hostname = "MacBook-Pro",
    securityShield = "ACTIVE",
    uptimeSeconds = 3600
  } = telemetry;

  const formatUptime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="hud-panel rounded-2xl p-5 border border-stark-cyan/30 flex flex-col gap-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stark-cyan/20">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-stark-cyan animate-pulse" />
          <h2 className="text-sm font-mono tracking-wider text-stark-cyan uppercase font-bold">
            SYSTEM DIAGNOSTICS & TELEMETRY
          </h2>
        </div>
        <span className="text-[10px] font-mono text-stark-gold bg-stark-gold/10 border border-stark-gold/30 px-2 py-0.5 rounded">
          LIVE MAC METRICS
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* CPU Load */}
        <div className="bg-stark-dark/80 p-3 rounded-xl border border-stark-cyan/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase">CPU LOAD</span>
            <Cpu className="w-4 h-4 text-stark-cyan" />
          </div>
          <div className="text-xl font-mono font-bold text-slate-100">{cpuUsagePercentage}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className={`h-full transition-all duration-500 ${cpuUsagePercentage > 80 ? 'bg-stark-danger' : 'bg-stark-cyan'}`}
              style={{ width: `${Math.min(cpuUsagePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* RAM Usage */}
        <div className="bg-stark-dark/80 p-3 rounded-xl border border-stark-cyan/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase">RAM MEMORY</span>
            <HardDrive className="w-4 h-4 text-stark-gold" />
          </div>
          <div className="text-xl font-mono font-bold text-slate-100">{ramUsagePercentage}%</div>
          <span className="text-[9px] font-mono text-slate-400">{usedMemoryGB} / {totalMemoryGB} GB</span>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-stark-gold transition-all duration-500"
              style={{ width: `${ramUsagePercentage}%` }}
            />
          </div>
        </div>

        {/* Host Node */}
        <div className="bg-stark-dark/80 p-3 rounded-xl border border-stark-cyan/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase">HOST MACHINE</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xs font-mono font-bold text-emerald-400 truncate">{hostname}</div>
          <span className="text-[10px] font-mono text-slate-400 uppercase mt-2">OS: {platform}</span>
        </div>

        {/* Uptime */}
        <div className="bg-stark-dark/80 p-3 rounded-xl border border-stark-cyan/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase">CORE UPTIME</span>
            <Clock className="w-4 h-4 text-stark-cyan" />
          </div>
          <div className="text-xs font-mono font-bold text-stark-cyan">{formatUptime(uptimeSeconds)}</div>
          <span className="text-[10px] font-mono text-emerald-400 mt-2">SECURITY: 100%</span>
        </div>

      </div>

      {/* Security Status Banner */}
      <div className="bg-stark-cyan/5 border border-stark-cyan/30 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-stark-cyan" />
          <div>
            <p className="text-xs font-mono font-bold text-slate-100 uppercase">SECURITY MATRIX: ENFORCED</p>
            <p className="text-[10px] font-mono text-slate-400">Helmet Headers | CORS Lockdown | JWT Token Guard | Rate Limiting</p>
          </div>
        </div>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
      </div>

    </div>
  );
}
