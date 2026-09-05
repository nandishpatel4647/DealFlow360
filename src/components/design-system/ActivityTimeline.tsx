import React from 'react';    
import { Clock, User, ShieldCheck, Cpu } from 'lucide-react';
import type { AuditLog } from '../../types';

interface ActivityTimelineProps {
  logs: AuditLog[];
  quoteId?: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ logs, quoteId }) => {
  const filteredLogs = quoteId ? logs.filter((l) => l.quoteId === quoteId) : logs;

  if (filteredLogs.length === 0) {
    return (
      <div className="surface-card p-6 text-center text-[var(--text-tertiary)] text-xs">
        No recorded audit events yet.
      </div>
    );
  }

  const getActorIcon = (actor: string) => {
    if (actor.includes('System') || actor.includes('Engine')) {
      return <Cpu className="w-3.5 h-3.5 text-[var(--accent-primary)]" />;
    }
    if (actor.includes('Manager') || actor.includes('Finance')) {
      return <ShieldCheck className="w-3.5 h-3.5 text-[var(--info)]" />;
    }
    return <User className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />;
  };

  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border-default)' }}>
        <span className="section-heading">Audit Trail</span>
        <span className="text-[11px] font-mono text-[var(--text-muted)]">
          {filteredLogs.length} events
        </span>
      </div>

      <div className="mt-4 relative pl-5 space-y-5" style={{ borderLeft: '2px solid var(--border-default)' }}>
        {filteredLogs.map((log, idx) => {
          const time = new Date(log.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={log.id}
              className="relative group animate-slide-up"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Timeline dot */}
              <div
                className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full border-2 transition-colors"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-strong)',
                }}
              />

              <div className="flex items-baseline justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                  {getActorIcon(log.actor)}
                  <span>{log.actor}</span>
                </div>
                <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {time}
                </span>
              </div>

              <p className="mt-0.5 text-xs font-medium text-[var(--text-secondary)]">
                {log.action}
              </p>

              {log.details && (
                <div
                  className="mt-1.5 p-2.5 rounded-md text-[11px] font-mono space-y-0.5"
                  style={{
                    backgroundColor: 'var(--bg-muted)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  {Object.entries(log.details).map(([key, val]) => (
                    <div key={key} className="flex items-baseline gap-1.5">
                      <span className="capitalize" style={{ color: 'var(--text-muted)' }}>{key}:</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
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
