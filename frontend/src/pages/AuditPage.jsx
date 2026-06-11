import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import Panel from '../components/Panel';

export default function AuditPage({ token }) {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/admin/audit-logs', { token })
      .then((payload) => {
        setLogs(payload.logs || []);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  if (error) {
    return <div className="glass-card p-5 text-sm text-rose-200">{error}</div>;
  }

  return (
    <Panel title="Auditoria do sistema" description="Últimos eventos relevantes gravados pelo back-end.">
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-textMain">{log.action}</p>
              <p className="text-xs text-textSoft">{log.created_at}</p>
            </div>
            <p className="mt-2 text-xs text-textSoft">
              {log.user_name || 'Sistema'} • {log.trade_name || log.legal_name || 'Global'}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
