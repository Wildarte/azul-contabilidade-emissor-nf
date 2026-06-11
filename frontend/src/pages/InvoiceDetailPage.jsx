import { useEffect, useState } from 'react';
import { apiRequest, downloadBase64File } from '../lib/api';
import Panel from '../components/Panel';
import Badge from '../components/Badge';

export default function InvoiceDetailPage({ token, companyId, invoiceId, onBack }) {
  const [invoice, setInvoice] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([
      apiRequest(`/invoices/${invoiceId}`, { token, companyId }),
      apiRequest(`/invoices/${invoiceId}/events`, { token, companyId }),
    ])
      .then(([invoicePayload, eventPayload]) => {
        if (active) {
          setInvoice(invoicePayload.invoice);
          setEvents(eventPayload.events || []);
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
  }, [invoiceId, companyId, token]);

  const downloadFile = async (kind) => {
    try {
      const payload = await apiRequest(`/invoices/${invoiceId}/${kind}`, { token, companyId });
      setDownloadError('');
      downloadBase64File(payload.file);
    } catch (requestError) {
      setDownloadError(requestError.message);
    }
  };

  if (error) {
    return <div className="glass-card p-5 text-sm text-rose-200">{error}</div>;
  }

  if (!invoice) {
    return <div className="glass-card p-5 text-sm text-textSoft">Carregando detalhes da nota...</div>;
  }

  return (
    <div className="space-y-6">
      <Panel
        title={`Detalhes da NFS-e #${invoice.number || invoice.id}`}
        description="Resumo consolidado da emissão, arquivos e histórico de eventos."
        actions={
          <>
            <button type="button" className="secondary-button" onClick={onBack}>Voltar</button>
            <button type="button" className="secondary-button" onClick={() => downloadFile('xml')}>Baixar XML</button>
            <button type="button" className="primary-button" onClick={() => downloadFile('pdf')}>Baixar PDF</button>
          </>
        }
      >
        {downloadError ? (
          <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {downloadError}
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-textSoft">Status</p>
            <div className="mt-3"><Badge tone={invoice.status === 'issued' ? 'success' : invoice.status === 'canceled' ? 'warning' : 'info'}>{invoice.status}</Badge></div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-textSoft">Tomador</p>
            <p className="mt-3 text-sm text-textMain">{invoice.customer_name}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-textSoft">Serviço</p>
            <p className="mt-3 text-sm text-textMain">{invoice.service_name}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-textSoft">Valor</p>
            <p className="mt-3 text-sm text-textMain">{Number(invoice.total_amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
        </div>
      </Panel>

      <Panel title="Histórico de eventos" description="Trilha de auditoria específica da nota fiscal.">
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-textMain">{event.event_type}</p>
                <p className="text-xs text-textSoft">{event.created_at}</p>
              </div>
              <p className="mt-2 text-sm text-textSoft">{event.message || 'Sem mensagem complementar.'}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
