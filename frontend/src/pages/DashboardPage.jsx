import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import Panel from '../components/Panel';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';

function currency(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function DashboardPage({ token, companyId, isSuperAdmin }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    apiRequest(isSuperAdmin ? '/admin/dashboard' : '/dashboard', { token, companyId })
      .then((payload) => {
        if (active) {
          setData(payload);
          setError('');
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
        }
      });

    return () => {
      active = false;
    };
  }, [token, companyId, isSuperAdmin]);

  if (error) {
    return <div className="glass-card p-5 text-sm text-rose-200">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Notas no mês" value={data?.invoices_this_month ?? '0'} accent="bg-cyan" />
        <StatCard label="Valor emitido" value={currency(data?.total_amount_this_month)} accent="bg-emerald-400" />
        <StatCard label="Autorizadas" value={data?.issued_count ?? '0'} accent="bg-bright" />
        <StatCard label="Canceladas / rejeitadas" value={`${data?.canceled_count ?? 0} / ${data?.rejected_count ?? 0}`} accent="bg-amber-400" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Últimas emissões" description="Acompanhe a atividade mais recente do tenant ou da empresa atual.">
          <div className="space-y-3">
            {(data?.latest_invoices || []).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div>
                  <p className="text-sm text-textMain">Nota #{invoice.number || invoice.id}</p>
                  <p className="text-xs text-textSoft">{invoice.created_at}</p>
                </div>
                <div className="text-right">
                  <Badge tone={invoice.status === 'issued' ? 'success' : 'warning'}>{invoice.status}</Badge>
                  <p className="mt-2 text-sm text-textMain">{currency(invoice.total_amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Últimos erros" description="Falhas recentes de emissão e cancelamento.">
          <div className="space-y-3">
            {(data?.latest_errors || []).map((invoice) => (
              <div key={invoice.id} className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-textMain">Nota #{invoice.id}</p>
                  <Badge tone="danger">{invoice.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-rose-100">{invoice.error_message || 'Erro não informado.'}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
