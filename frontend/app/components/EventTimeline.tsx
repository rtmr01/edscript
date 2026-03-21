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
        return 'bg-amber-500';
      case 'defense':
        return 'bg-emerald-500';
    }
  };

  const getEventBorderColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'goal':
        return 'border-blue-500';
      case 'pressure':
        return 'border-amber-500';
      case 'defense':
        return 'border-emerald-500';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-indigo-600" />
        <h3 className="text-slate-900">Linha do Tempo de Eventos Previstos</h3>
      </div>

      <div className="relative">
        {/* Timeline bar */}
        <div className="relative h-3 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-full overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-blue-500/10" />
        </div>

        {/* Minute markers */}
        <div className="absolute top-0 left-0 right-0 flex justify-between px-1">
          {[0, 15, 30, 45, 60, 75, 90].map((min) => (
            <div key={min} className="flex flex-col items-center">
              <div className="w-px h-3 bg-slate-300" />
              <span className="text-xs text-slate-400 mt-1">{min}'</span>
            </div>
          ))}
        </div>

        {/* Event markers */}
        <div className="absolute top-0 left-0 right-0 h-3">
          {events.map((event, idx) => {
            const Icon = getEventIcon(event.type);
            const position = (event.minute / 90) * 100;
            const isSelected = selectedEvent?.minute === event.minute;

            return (
              <button
                key={idx}
                onClick={() => setSelectedEvent(isSelected ? null : event)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                  isSelected ? 'scale-125 z-10' : 'hover:scale-110'
                }`}
                style={{ left: `${position}%`, top: '50%' }}
              >
                <div
                  className={`w-8 h-8 rounded-full ${getEventColor(
                    event.type
                  )} shadow-lg flex items-center justify-center border-2 border-white`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-xs font-medium text-slate-700">{event.probability}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Event details */}
      {selectedEvent && (
        <div className={`mt-12 p-4 rounded-lg border-2 ${getEventBorderColor(selectedEvent.type)} bg-gradient-to-br from-white to-slate-50 animate-in fade-in slide-in-from-bottom-2 duration-200`}>
          <div className="flex items-start gap-3 mb-3">
            <div className={`p-2 rounded-lg ${getEventColor(selectedEvent.type)}`}>
              {(() => {
                const Icon = getEventIcon(selectedEvent.type);
                return <Icon className="w-5 h-5 text-white" />;
              })()}
            </div>
            <div>
              <h4 className="text-slate-900">Minuto {selectedEvent.minute}</h4>
              <p className="text-sm text-slate-600 mt-1">{selectedEvent.description}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Fatores Influentes</p>
            <ul className="space-y-1">
              {selectedEvent.factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!selectedEvent && (
        <p className="text-center text-sm text-slate-500 mt-8">
          Clique em um evento para ver os detalhes
        </p>
      )}
    </div>
  );
}
