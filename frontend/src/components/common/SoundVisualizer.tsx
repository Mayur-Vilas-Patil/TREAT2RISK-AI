import React, { useEffect, useRef, useState } from 'react';
import { soundService } from '../../services/sound';
import { Activity, Radio, Volume2, Waves } from 'lucide-react';

interface SoundVisualizerProps {
  mode?: 'compact' | 'full' | 'oscilloscope';
  className?: string;
  showDetails?: boolean;
}

export const SoundVisualizer: React.FC<SoundVisualizerProps> = ({
  mode = 'compact',
  className = '',
  showDetails = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMuted, setIsMuted] = useState(soundService.getIsMuted());
  const [isAmbient, setIsAmbient] = useState(soundService.getIsAmbientPlaying());
  const [currentDb, setCurrentDb] = useState<number>(0);

  useEffect(() => {
    const unsub = soundService.subscribe(() => {
      setIsMuted(soundService.getIsMuted());
      setIsAmbient(soundService.getIsAmbientPlaying());
    });
    return unsub;
  }, []);

  useEffect(() => {
    let animId: number;
    let idlePhase = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const data = soundService.getAnalyserData();
      let hasSignal = false;
      let totalEnergy = 0;

      if (data && !isMuted) {
        for (let i = 0; i < data.length; i++) {
          totalEnergy += data[i];
          if (data[i] > 10) hasSignal = true;
        }
      }

      const avgEnergy = data ? totalEnergy / data.length : 0;
      setCurrentDb(Math.round((avgEnergy / 255) * 100));

      if (mode === 'compact') {
        // Render 7 vertical equalizer bars
        const barCount = 7;
        const barWidth = 3;
        const gap = 2;
        const totalW = barCount * barWidth + (barCount - 1) * gap;
        const startX = (width - totalW) / 2;

        for (let i = 0; i < barCount; i++) {
          let barHeight = 3;
          if (hasSignal && data) {
            const dataIdx = Math.floor((i / barCount) * (data.length / 2));
            const val = data[dataIdx] || 0;
            barHeight = Math.max(3, (val / 255) * height);
          } else if (isAmbient) {
            // Ambient wave
            const wave = Math.sin(idlePhase * 4 + i * 0.8) * 0.5 + 0.5;
            barHeight = 4 + wave * (height * 0.45);
          } else {
            // Idle gentle breathe
            const breathe = Math.sin(idlePhase * 2 + i * 0.5) * 0.5 + 0.5;
            barHeight = 2 + breathe * 4;
          }

          const x = startX + i * (barWidth + gap);
          const y = height - barHeight;

          // Gradient color: Cyan to Violet
          const grad = ctx.createLinearGradient(0, height, 0, 0);
          grad.addColorStop(0, '#00D5FF');
          grad.addColorStop(1, i > 4 ? '#A855F7' : '#00e5ff');

          ctx.fillStyle = isMuted ? '#475569' : grad;
          ctx.shadowColor = isMuted ? 'transparent' : 'rgba(0, 213, 255, 0.4)';
          ctx.shadowBlur = isMuted ? 0 : 4;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(x, y, barWidth, barHeight, 1) : ctx.rect(x, y, barWidth, barHeight);
          ctx.fill();
        }
      } else if (mode === 'oscilloscope') {
        // High-tech circular or horizontal radar line
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = isMuted ? '#334155' : '#00D5FF';
        ctx.shadowColor = isMuted ? 'transparent' : 'rgba(0, 213, 255, 0.6)';
        ctx.shadowBlur = 6;

        const sliceWidth = width / (data ? data.length : 32);
        let x = 0;

        for (let i = 0; i < (data ? data.length : 32); i++) {
          let v = 128;
          if (data && hasSignal) {
            v = data[i];
          } else {
            v = 128 + Math.sin(idlePhase * 3 + (i * 0.3)) * (isAmbient ? 18 : 6);
          }

          const y = (v / 255) * height;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
      } else {
        // Full frequency spectrum visualizer
        const barCount = 24;
        const barWidth = Math.max(2, Math.floor(width / barCount) - 2);

        for (let i = 0; i < barCount; i++) {
          let barHeight = 4;
          if (hasSignal && data) {
            const val = data[i] || 0;
            barHeight = Math.max(3, (val / 255) * (height - 6));
          } else if (isAmbient) {
            const wave = Math.sin(idlePhase * 3 + i * 0.4) * 0.5 + 0.5;
            barHeight = 4 + wave * (height * 0.55);
          } else {
            const idle = Math.sin(idlePhase * 2 + i * 0.3) * 0.5 + 0.5;
            barHeight = 2 + idle * 8;
          }

          const x = i * (barWidth + 2) + 2;
          const y = height - barHeight;

          const grad = ctx.createLinearGradient(0, height, 0, 0);
          grad.addColorStop(0, '#00D5FF');
          grad.addColorStop(0.6, '#38BDF8');
          grad.addColorStop(1, i > 18 ? '#EF4444' : i > 12 ? '#F59E0B' : '#A855F7');

          ctx.fillStyle = isMuted ? '#334155' : grad;
          ctx.shadowColor = isMuted ? 'transparent' : 'rgba(0, 213, 255, 0.4)';
          ctx.shadowBlur = 4;
          ctx.fillRect(x, y, barWidth, barHeight);
        }
      }

      idlePhase += 0.05;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [mode, isMuted, isAmbient]);

  if (mode === 'compact') {
    return (
      <div 
        onClick={() => {
          soundService.toggleMute();
          if (soundService.getIsMuted()) {
            soundService.stopAmbient();
          } else {
            soundService.playClick();
          }
        }}
        title={isMuted ? "Acoustic Stream: MUTED (Click to activate)" : "Acoustic Stream: LIVE (Click to mute)"}
        className={`flex items-center space-x-1.5 px-2 py-1 rounded bg-[#0c1322] border border-[#1A2A42] hover:border-[#00D5FF]/50 cursor-pointer transition-colors ${className}`}
      >
        <canvas ref={canvasRef} width={34} height={14} className="block" />
        <span className={`text-[10px] font-mono font-bold ${!isMuted ? 'text-[#00D5FF]' : 'text-slate-500'}`}>
          {!isMuted ? (isAmbient ? 'HUM' : 'AUDIO') : 'MUTED'}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-xl bg-[#0c1322] border border-[#1A2A42] flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between text-xs font-mono mb-2">
        <div className="flex items-center space-x-1.5 text-[#00D5FF]">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span className="font-bold text-[11px] tracking-wider uppercase">Acoustic Telemetry Stream</span>
        </div>
        <div className="flex items-center space-x-2 text-[10px]">
          <span className="text-slate-400">SIGNAL:</span>
          <span className={`font-bold ${currentDb > 0 && !isMuted ? 'text-emerald-400' : 'text-slate-500'}`}>
            {!isMuted ? `${currentDb}% PEAK` : 'MUTED'}
          </span>
        </div>
      </div>

      <div className="w-full h-10 flex items-center justify-center bg-[#080D18] rounded-lg border border-[#1A2A42]/60 px-2">
        <canvas ref={canvasRef} width={mode === 'oscilloscope' ? 240 : 260} height={36} className="w-full h-full block" />
      </div>

      {showDetails && (
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-[#1A2A42]/50 mt-2">
          <span>SAMPLING: 44.1 kHz</span>
          <span className="text-[#00D5FF]">WEB AUDIO SYNTH</span>
          <span>LATENCY: &lt;1.2ms</span>
        </div>
      )}
    </div>
  );
};
