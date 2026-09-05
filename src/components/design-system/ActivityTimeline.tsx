import React from 'react';
import { Clock, User, ShieldCheck, Cpu } from 'lucide-react';
import { AuditLog } from '../../types';

interface ActivityTimelineProps {
  logs: AuditLog[];
  quoteId?: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ logs, quoteId }) => {
  const filteredLogs = quoteId ? logs.filter((l) => l.quoteId === quoteId) : logs;

  if (filteredLogs.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-xs surface-card">
        No recorded audit events yet.
      </div>
    );
  }

  const getActorIcon = (actor: string) => {
    if (actor.includes('System') || actor.includes('Engine')) {
      return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
    }
    if (actor.includes('Manager') || actor.includes('Finance')) {
      return <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />;
    }
    return <User className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Governance & Negotiation Audit Trail
        </span>
        <span className="text-[11px] font-mono text-slate-500">
          {filteredLogs.length} Events Logged
        </span>
      </div>

      <div className="mt-4 relative pl-4 border-l border-slate-800 space-y-4">
        {filteredLogs.map((log) => {
          const time = new Date(log.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div key={log.id} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-slate-600 group-hover:border-cyan-400 transition" />

              <div className="flex items-baseline justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-slate-200">
                  {getActorIcon(log.actor)}
                  <span>{log.actor}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {time}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-300 font-semibold">{log.action}</p>

              {log.details && (
                <div className="mt-1.5 p-2 rounded bg-slate-900/60 border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-0.5">
                  {Object.entries(log.details).map(([key, val]) => (
                    <div key={key} className="flex items-baseline gap-1.5">
                      <span className="text-slate-500 capitalize">{key}:</span>
                      <span className="text-slate-300">
                        {Array.isArray(val) ? val.join(', ') : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
