import React from 'react';
import { cn } from "@/lib/utils";

export function GlobalGridBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full">
      {/* Global grid background - fixed to viewport */}
      <div
        className={cn(
          "fixed inset-0 pointer-events-none z-0",
          "[background-size:80px_80px]",
          "[background-image:linear-gradient(to_right,rgba(0,0,0,0.02)_0.5px,transparent_0.5px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_0.5px,transparent_0.5px)]",
        )}
      />
      
      {/* Subtle fade overlay to make content more readable */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 70%, rgba(255,255,255,0.02) 100%)'
        }}
      />
      
      {/* Content layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}