'use client';

import { useState } from 'react';

export default function InstallGuide() {
  const [copied, setCopied] = useState(false);
  const command = "npx @skillshub/price-snapshot --symbol BTCUSDT";

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="install" className="py-24 bg-panel border-t border-gold/10">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-heading font-bold text-text-main mb-8">
          START BUILDING LOCALLY
        </h2>
        
        <div className="max-w-2xl mx-auto bg-bg border border-gold/20 p-8 rounded-lg relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
          
          <p className="text-text-sub mb-6">
            Every skill runs standalone via npx. No setup required — just pick a module and go.
          </p>
          
          <div 
            className="flex items-center justify-between bg-black/50 border border-white/10 p-4 rounded cursor-pointer hover:border-gold/50 transition-colors"
            onClick={handleCopy}
          >
            <code className="font-mono text-gold text-lg">
              $ {command}
            </code>
            <span className="text-xs font-mono text-text-sub/50 uppercase">
              {copied ? 'Copied!' : 'Click to Copy'}
            </span>
          </div>
          
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="p-4 border border-white/5 rounded">
              <div className="text-gold font-bold text-xl mb-1">01</div>
              <div className="text-xs text-text-sub">Pick Skill</div>
            </div>
            <div className="p-4 border border-white/5 rounded">
              <div className="text-gold font-bold text-xl mb-1">02</div>
              <div className="text-xs text-text-sub">Run with npx</div>
            </div>
            <div className="p-4 border border-white/5 rounded">
              <div className="text-gold font-bold text-xl mb-1">03</div>
              <div className="text-xs text-text-sub">Fork & Extend</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
