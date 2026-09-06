import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, Cpu, ShieldCheck, Database, Zap, RefreshCw, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
export default function CommandConsole({ onSendMessage, messages = [], isProcessing = false }) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  // Initialize Web Speech API Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          onSendMessage(transcript);
          setInput('');
        }
        setIsListening(false);
      };
      recognition.onerror = (err) => {
        console.error('[SpeechRecognition Error]:', err);
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    }
  }, [onSendMessage]);
  // Handle Text-to-Speech for incoming Jarvis responses
  useEffect(() => {
    if (!voiceEnabled || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.sender === 'jarvis' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();const utterance = new SpeechSynthesisUtterance(lastMsg.text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.name.includes('Google') || v.name.includes('Daniel') || v.name.includes('Alex') || v.lang.startsWith('en')
      );
      if (preferredVoice) utterance.voice = preferredVoice;
      window.speechSynthesis.speak(utterance);
    }
  }, [messages, voiceEnabled]);
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome or Brave.');  return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };
  const handleQuickCommand = (cmd) => {
    onSendMessage(cmd);
  };
  return (
    <div className="hud-panel rounded-2xl p-5 border border-stark-cyan/30 flex flex-col h-[500px]">
      
      {/* Header */}
      {/* Header with Socket & Voice Controls */} <div className="flex items-center justify-between pb-3 border-b border-stark-cyan/20">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-stark-cyan animate-pulse" />
          <h2 className="text-sm font-mono tracking-wider text-stark-cyan uppercase font-bold">
            COMMAND CONSOLE & TERMINAL STREAM
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
            SOCKET: REAL-TIME ONLINE
          </span>
          {/* Jarvis Voice Response Toggle Button */}
          <button
            onClick={() => {
              if (voiceEnabled) window.speechSynthesis?.cancel();
              setVoiceEnabled(!voiceEnabled);
            }}title={voiceEnabled ? "Mute Jarvis Audio" : "Enable Jarvis Audio"}
            className={`flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded border transition-all ${
              voiceEnabled
                ? 'bg-stark-cyan/20 border-stark-cyan text-stark-cyan shadow-sm shadow-stark-cyan/30'
                : 'bg-slate-800 border-slate-600 text-slate-400'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-stark-cyan animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{voiceEnabled ? 'AUDIO: ON' : 'AUDIO: OFF'}</span>
          </button>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/30">
            SOCKET: ONLINE
          </span>
        </div>
      </div> {/* Terminal Output Log Area */}
      <div className="flex-1 overflow-y-auto my-3 space-y-3 font-mono text-xs pr-2">
        {messages.length === 0 ? (
          <div className="text-slate-500 text-center py-16 flex flex-col items-center gap-2">
            <Zap className="w-8 h-8 text-stark-cyan/40 animate-bounce" />
            <p>J.A.R.V.I.S. Command Matrix initialized.</p>
            <p className="text-[11px] text-slate-600">Type a command or select a quick diagnostic directive below.</p>
            <p className="text-[11px] text-slate-600">Type a command, use voice input, or pick a directive below.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`p-3 rounded-lg border transition-all ${
                msg.sender === 'user' 
                  ? 'bg-stark-cyan/10 border-stark-cyan/30 ml-8 text-slate-200' 
                  : 'bg-stark-dark/90 border-stark-blue/40 mr-8 text-stark-cyan shadow-lg'   }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className="uppercase font-bold tracking-widest text-stark-gold">
                  [{msg.sender === 'user' ? 'OPERATOR' : 'J.A.R.V.I.S.'}]
                </span>
                <span>{msg.timestamp || new Date().toLocaleTimeString()}</span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          ))
        )}
        {isProcessing && (
          <div className="p-3 rounded-lg bg-stark-gold/10 border border-stark-gold/40 text-stark-gold flex items-center gap-2 mr-8">
            <RefreshCw className="w-4 h-4 animate-spin text-stark-gold" />
            <span>Processing quantum payload across neural sub-routines...</span>
          </div>
        )}  <div ref={messagesEndRef} />
      </div>
      {/* Preset Quick Directives */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button 
          onClick={() => handleQuickCommand('Run full system diagnostics')}
          className="flex items-center gap-1 text-[10px] font-mono bg-stark-cyan/10 hover:bg-stark-cyan/20 text-stark-cyan border border-stark-cyan/40 px-2.5 py-1 rounded-md transition-all"
        >
          <Cpu className="w-3 h-3" /> System Diagnostics
        </button>
        <button 
          onClick={() => handleQuickCommand('Check security shield and firewall')}
          className="flex items-center gap-1 text-[10px] font-mono bg-emerald-950/40 hover:bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-md transition-all"
        ><ShieldCheck className="w-3 h-3" /> Security Shield
        </button>
        <button 
          onClick={() => handleQuickCommand('Check SQLite database and Prisma tables')}
          className="flex items-center gap-1 text-[10px] font-mono bg-amber-950/40 hover:bg-amber-950/70 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-md transition-all"
        >
          <Database className="w-3 h-3" /> SQLite DB Status
        </button>
      </div>
      {/* Input Box */}
      {/* Input Box with Microphone & Voice Controls */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <button
          type="button"
          onClick={toggleListening}title={isListening ? "Listening... Click to stop" : "Click to activate Voice Command"}
          className={`px-3 py-2.5 rounded-xl border transition-all flex items-center justify-center ${
            isListening
              ? 'bg-red-900/80 border-red-500 text-red-100 animate-pulse shadow-lg shadow-red-500/40'
              : 'bg-stark-dark border-stark-cyan/40 text-stark-cyan hover:bg-stark-cyan/20'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4 text-red-400 animate-bounce" /> : <Mic className="w-4 h-4" />}
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening to your voice command..." : "Enter command or speak using mic..."}
          className={`flex-1 bg-stark-dark/90 border rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
            isListening
              ? 'border-red-500/80 ring-red-500/50 bg-red-950/20'
              : 'border-stark-cyan/40 focus:border-stark-cyan focus:ring-stark-cyan'
          }`}
        />
        <button
          type="submit"
          disabled={!input.trim() || isProcessing}
          className="bg-stark-cyan text-stark-dark font-mono font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-stark-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-lg shadow-stark-cyan/20"
      >
          <span>SEND</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}