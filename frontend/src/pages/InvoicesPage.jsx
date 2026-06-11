import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import Panel from '../components/Panel';
import Badge from '../components/Badge';

const initialForm = {
  customer_id: '',
  service_id: '',
  amount: '1500.00',
  competence_date: new Date().toISOString().slice(0, 10),
  service_description: '',
  issue_now: true,
};

export default function InvoicesPage({ token, companyId, onOpenInvoice }) {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState('');

  const loadDependencies = async () => {
    const [invoicePayload, customerPayload, servicePayload] = await Promise.all([
      apiRequest('/invoices', { token, companyId }),
      apiRequest('/customers', { token, companyId }),
      apiRequest('/services', { token, companyId }),
    ]);

    setInvoices(invoicePayload.invoices || []);
    setCustomers(customerPayload.customers || []);
    setServices(servicePayload.services || []);
  };

  useEffect(() => {
    loadDependencies().catch((error) => setFeedback(error.message));
  }, [companyId]);

  const issueInvoice = async (invoiceId) => {
    await apiRequest(`/invoices/${invoiceId}/issue`, { method: 'POST', token, companyId });
    await loadDependencies();
  };

  const cancelInvoice = async (invoiceId) => {
    const reason = window.prompt('Informe a justificativa do cancelamento:');

    if (!reason) {
      return;
    }

    await apiRequest(`/invoices/${invoiceId}/cancel`, {
      method: 'POST',
      token,
      companyId,
      body: { reason },
    });
    await loadDependencies();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const payload = await apiRequest('/invoices', {
        method: 'POST',
        token,
        companyId,
        body: {
          ...form,
          customer_id: Number(form.customer_id),
          service_id: Number(form.service_id),
        },
      });

      setFeedback(`Nota ${payload.invoice.status === 'issued' ? 'emitida' : 'criada'} com sucesso.`);
      setForm(initialForm);
      await loadDependencies();
    } catch (error) {
      setFeedback(error.message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Panel title="Emitir NFS-e" description="Fluxo simplificado para o MVP com emissão mock integrada.">
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <select className="field" value={form.customer_id} onChange={(event) => setForm({ ...form, customer_id: event.target.value })}>
            <option value="">Selecione o tomador</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
          <select className="field" value={form.service_id} onChange={(event) => {
            const selectedService = services.find((service) => String(service.id) === event.target.value);
            setForm({
              ...form,
              service_id: event.target.value,
              amount: selectedService?.default_amount || form.amount,
              service_description: selectedService?.description || form.service_description,
            });
          }}>
            <option value="">Selecione o serviço</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
          <textarea className="field min-h-[120px]" placeholder="Descrição do serviço" value={form.service_description} onChange={(event) => setForm({ ...form, service_description: event.target.value })} />
          <div className="grid gap-3 md:grid-cols-2">
            <input className="field" placeholder="Valor" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
            <input className="field" type="date" value={form.competence_date} onChange={(event) => setForm({ ...form, competence_date: event.target.value })} />
          </div>
          <label className="flex items-center gap-3 text-sm text-textSoft">
            <input type="checkbox" checked={form.issue_now} onChange={(event) => setForm({ ...form, issue_now: event.target.checked })} />
            Emitir imediatamente após criar
          </label>
          {feedback ? <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-textSoft">{feedback}</div> : null}
          <button type="submit" className="primary-button">Criar / emitir nota</button>
        </form>
      </Panel>

      <Panel title="Notas emitidas" description="Histórico recente da empresa com ações principais do MVP.">
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm text-textMain">Nota #{invoice.number || invoice.id}</p>
                  <p className="text-xs text-textSoft">
                    {invoice.customer_name} • {Number(invoice.total_amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={invoice.status === 'issued' ? 'success' : invoice.status === 'canceled' ? 'warning' : invoice.status === 'draft' ? 'info' : 'danger'}>
                    {invoice.status}
                  </Badge>
                  <button type="button" className="secondary-button" onClick={() => onOpenInvoice(invoice.id)}>Detalhes</button>
                  {invoice.status === 'draft' ? <button type="button" className="secondary-button" onClick={() => issueInvoice(invoice.id)}>Emitir</button> : null}
                  {invoice.status === 'issued' ? <button type="button" className="secondary-button" onClick={() => cancelInvoice(invoice.id)}>Cancelar</button> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
