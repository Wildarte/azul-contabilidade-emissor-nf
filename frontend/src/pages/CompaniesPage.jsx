import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import Panel from '../components/Panel';
import Badge from '../components/Badge';

const initialForm = {
  legal_name: '',
  trade_name: '',
  cnpj: '',
  city: '',
  state: 'SP',
  status: 'active',
};

export default function CompaniesPage({ token, onCompaniesChange }) {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState('');

  const loadCompanies = async () => {
    const payload = await apiRequest('/admin/companies', { token });
    setCompanies(payload.companies || []);
    onCompaniesChange?.(payload.companies || []);
  };

  useEffect(() => {
    loadCompanies().catch((error) => setFeedback(error.message));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await apiRequest('/admin/companies', { method: 'POST', token, body: form });
      setForm(initialForm);
      setFeedback('Empresa criada com sucesso.');
      await loadCompanies();
    } catch (error) {
      setFeedback(error.message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Panel title="Nova empresa" description="Cadastro manual de empresas pelo painel master.">
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <input className="field" placeholder="Razão social" value={form.legal_name} onChange={(event) => setForm({ ...form, legal_name: event.target.value })} />
          <input className="field" placeholder="Nome fantasia" value={form.trade_name} onChange={(event) => setForm({ ...form, trade_name: event.target.value })} />
          <input className="field" placeholder="CNPJ" value={form.cnpj} onChange={(event) => setForm({ ...form, cnpj: event.target.value })} />
          <div className="grid gap-3 md:grid-cols-2">
            <input className="field" placeholder="Cidade" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
            <input className="field" placeholder="UF" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} />
          </div>
          <select className="field" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            <option value="active">Ativa</option>
            <option value="blocked">Bloqueada</option>
            <option value="suspended">Suspensa</option>
          </select>
          {feedback ? <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-textSoft">{feedback}</div> : null}
          <button type="submit" className="primary-button">Cadastrar empresa</button>
        </form>
      </Panel>

      <Panel title="Empresas cadastradas" description="Visão consolidada do sistema multiempresa.">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-textSoft">
              <tr>
                <th className="pb-3">Empresa</th>
                <th className="pb-3">CNPJ</th>
                <th className="pb-3">Tenant</th>
                <th className="pb-3">Usuários</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {companies.map((company) => (
                <tr key={company.id}>
                  <td className="py-3">
                    <p className="text-textMain">{company.trade_name}</p>
                    <p className="text-xs text-textSoft">{company.legal_name}</p>
                  </td>
                  <td className="py-3 text-textSoft">{company.cnpj}</td>
                  <td className="py-3 text-textSoft">{company.tenant_name}</td>
                  <td className="py-3 text-textSoft">{company.users_count}</td>
                  <td className="py-3">
                    <Badge tone={company.status === 'active' ? 'success' : company.status === 'blocked' ? 'danger' : 'warning'}>
                      {company.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
