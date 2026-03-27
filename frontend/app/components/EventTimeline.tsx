import { Goal, Shield, Zap } from 'lucide-react';
import { useState } from 'react';

interface TimelineEvent {
  minute: number;
  type: 'goal' | 'pressure' | 'defense';
  probability: number;
  description: string;
  factors: string[];
}

interface EventTimelineProps {
  events: TimelineEvent[];
}

export function EventTimeline({ events }: EventTimelineProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'goal':
        return Goal;
      case 'pressure':
        return Zap;
      case 'defense':
        return Shield;
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'goal':
        return 'bg-blue-500';
      case 'pressure':
        return 'bg-[#00D26A] text-[#121547]';
      case 'defense':
        return 'bg-[#1C1F5A] border border-[#00D26A]/50 text-[#00D26A]';
    }
  };

  const getEventBorderColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'goal':
        return 'border-blue-500/50';
      case 'pressure':
        return 'border-[#00D26A]/50';
      case 'defense':
        return 'border-[#1C1F5A]/50';
    }
  };

  return (
    <div className="bg-[#141745]/60 backdrop-blur-xl rounded-[1.5rem] border border-white/5 p-6 shadow-2xl relative overflow-hidden hidden md:block">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D26A]/5 rounded-full blur-[40px] pointer-events-none" />
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#00D26A]/10 p-2 rounded-lg border border-[#00D26A]/20">
          <Zap className="w-4 h-4 text-[#00D26A]" />
        </div>
        <h3 className="text-white font-black uppercase tracking-[0.15em] text-sm">Log Preditivo (90 Min)</h3>
      </div>

      <div className="relative mt-8 mb-4">
        {/* Timeline bar */}
        <div className="relative h-1.5 bg-[#0b0d30] rounded-full overflow-hidden mb-10 border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00D26A]/20 via-transparent to-[#00D26A]/20" />
        </div>

        {/* Minute markers */}
        <div className="absolute top-0 left-0 right-0 flex justify-between px-1">
          {[0, 15, 30, 45, 60, 75, 90].map((min) => (
            <div key={min} className="flex flex-col items-center">
              <div className="w-px h-3 bg-white/10" />
              <span className="text-[10px] font-bold text-white/30 mt-2">{min}'</span>
            </div>
          ))}
        </div>

        {/* Event markers */}
        <div className="absolute top-0 left-0 right-0 h-1.5">
          {events.map((event, idx) => {
            const Icon = getEventIcon(event.type);
            const position = (event.minute / 90) * 100;
            const isSelected = selectedEvent?.minute === event.minute;

            return (
              <button
                key={idx}
                onClick={() => setSelectedEvent(isSelected ? null : event)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  isSelected ? 'scale-125 z-10' : 'hover:scale-110 drop-shadow-[0_0_10px_rgba(0,210,106,0.3)]'
                }`}
                style={{ left: `${position}%`, top: '50%' }}
              >
                <div
                  className={`w-7 h-7 rounded-full ${getEventColor(
                    event.type
                  )} shadow-lg flex items-center justify-center ring-2 ring-[#121547]`}
                >
                  <Icon className="w-3.5 h-3.5 currentColor" />
                </div>
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-black text-[#00D26A]">{event.probability}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Event details */}
      {selectedEvent && (
        <div className={`mt-4 p-5 rounded-xl border ${getEventBorderColor(selectedEvent.type)} bg-[#0b0d30]/80 animate-in fade-in zoom-in-95 duration-200 shadow-inner overflow-hidden relative`}>
          <div className="absolute top-0 left-0 w-1 h-full bg-[#00D26A]/40" />
          <div className="flex items-start gap-4 mb-4">
            <div className={`p-2.5 rounded-xl ${getEventColor(selectedEvent.type)} shadow-[0_0_15px_rgba(0,210,106,0.1)]`}>
              {(() => {
                const Icon = getEventIcon(selectedEvent.type);
                return <Icon className="w-5 h-5 currentColor" />;
              })()}
            </div>
            <div>
              <h4 className="text-[#00D26A] font-black tracking-wider text-sm">Pico no Minuto {selectedEvent.minute}</h4>
              <p className="text-xs text-white/70 mt-1 font-medium leading-relaxed">{selectedEvent.description}</p>
            </div>
          </div>

          <div className="bg-[#141745] rounded-xl p-4 border border-white/5">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#00D26A]/60 mb-3">Drivers Detectados</p>
            <ul className="space-y-2">
              {selectedEvent.factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs font-medium text-white/80">
                  <span className="text-[#00D26A] mt-0.5 text-[10px]">■</span>
                  <span className="leading-snug">{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!selectedEvent && (
        <div className="mt-8 flex justify-center">
          <div className="bg-[#0b0d30] border border-white/5 px-4 py-2 rounded-lg inline-flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-[#00D26A] animate-pulse" />
             <p className="text-center text-[10px] uppercase font-bold tracking-widest text-[#00D26A]/50">
               Selecione um nó no radar para extrair metadado
             </p>
          </div>
        </div>
      )}
    </div>
  );
}
