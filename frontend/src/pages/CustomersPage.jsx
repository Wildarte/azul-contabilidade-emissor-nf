import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import Panel from '../components/Panel';

const initialForm = {
  type: 'person',
  name: '',
  document: '',
  email: '',
};

export default function CustomersPage({ token, companyId }) {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState('');

  const loadCustomers = async () => {
    const payload = await apiRequest('/customers', { token, companyId });
    setCustomers(payload.customers || []);
  };

  useEffect(() => {
    loadCustomers().catch((error) => setFeedback(error.message));
  }, [companyId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await apiRequest('/customers', { method: 'POST', token, companyId, body: form });
      setForm(initialForm);
      setFeedback('Tomador cadastrado com sucesso.');
      await loadCustomers();
    } catch (error) {
      setFeedback(error.message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Panel title="Novo tomador" description="Cadastro de clientes por empresa com validação no back-end.">
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <select className="field" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            <option value="person">Pessoa física</option>
            <option value="company">Pessoa jurídica</option>
          </select>
          <input className="field" placeholder="Nome" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input className="field" placeholder="CPF/CNPJ" value={form.document} onChange={(event) => setForm({ ...form, document: event.target.value })} />
          <input className="field" placeholder="E-mail" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          {feedback ? <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-textSoft">{feedback}</div> : null}
          <button type="submit" className="primary-button">Cadastrar tomador</button>
        </form>
      </Panel>

      <Panel title="Tomadores da empresa" description="Registros disponíveis para emissão de NFS-e.">
        <div className="space-y-3">
          {customers.map((customer) => (
            <div key={customer.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-sm text-textMain">{customer.name}</p>
              <p className="text-xs text-textSoft">{customer.document} {customer.email ? `• ${customer.email}` : ''}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
