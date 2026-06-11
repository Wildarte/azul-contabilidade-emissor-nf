import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import Panel from '../components/Panel';

const blankForm = {
  name: '',
  email: '',
  password: '',
  company_id: '',
  role_slug: 'company_admin',
  can_issue_invoice: true,
  can_cancel_invoice: true,
};

export default function UsersPage({ token, companies = [] }) {
  const [users, setUsers] = useState([]);
  const [availableCompanies, setAvailableCompanies] = useState(companies);
  const [form, setForm] = useState(blankForm);
  const [feedback, setFeedback] = useState('');

  const loadUsers = async () => {
    const [usersPayload, companiesPayload] = await Promise.all([
      apiRequest('/admin/users', { token }),
      availableCompanies.length === 0 ? apiRequest('/admin/companies', { token }) : Promise.resolve({ companies: availableCompanies }),
    ]);

    setAvailableCompanies(companiesPayload.companies || availableCompanies);
    setUsers(usersPayload.users || []);
  };

  useEffect(() => {
    loadUsers().catch((error) => setFeedback(error.message));
  }, []);

  useEffect(() => {
    if (companies.length > 0) {
      setAvailableCompanies(companies);
    }
  }, [companies]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await apiRequest('/admin/users', {
        method: 'POST',
        token,
        body: {
          name: form.name,
          email: form.email,
          password: form.password,
          memberships: [
            {
              company_id: Number(form.company_id),
              role_slug: form.role_slug,
              can_issue_invoice: form.can_issue_invoice,
              can_cancel_invoice: form.can_cancel_invoice,
            },
          ],
        },
      });
      setForm(blankForm);
      setFeedback('Usuário criado com sucesso.');
      await loadUsers();
    } catch (error) {
      setFeedback(error.message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Panel title="Novo usuário" description="Criação manual de usuários e vínculo direto com empresa.">
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <input className="field" placeholder="Nome" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input className="field" placeholder="E-mail" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input className="field" type="password" placeholder="Senha" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <select className="field" value={form.company_id} onChange={(event) => setForm({ ...form, company_id: event.target.value })}>
            <option value="">Selecione a empresa</option>
            {availableCompanies.map((company) => (
              <option key={company.id} value={company.id}>{company.trade_name}</option>
            ))}
          </select>
          <select className="field" value={form.role_slug} onChange={(event) => setForm({ ...form, role_slug: event.target.value })}>
            <option value="company_admin">Admin da empresa</option>
            <option value="operator">Operador</option>
            <option value="viewer">Visualizador</option>
            <option value="accountant">Contador</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <label className="flex items-center gap-3 text-sm text-textSoft">
            <input type="checkbox" checked={form.can_issue_invoice} onChange={(event) => setForm({ ...form, can_issue_invoice: event.target.checked })} />
            Pode emitir notas
          </label>
          <label className="flex items-center gap-3 text-sm text-textSoft">
            <input type="checkbox" checked={form.can_cancel_invoice} onChange={(event) => setForm({ ...form, can_cancel_invoice: event.target.checked })} />
            Pode cancelar notas
          </label>
          {feedback ? <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-textSoft">{feedback}</div> : null}
          <button type="submit" className="primary-button">Cadastrar usuário</button>
        </form>
      </Panel>

      <Panel title="Usuários cadastrados" description="Visão macro dos acessos já criados pelo Super Admin.">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-textSoft">
              <tr>
                <th className="pb-3">Nome</th>
                <th className="pb-3">E-mail</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Empresas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="py-3 text-textMain">{user.name}</td>
                  <td className="py-3 text-textSoft">{user.email}</td>
                  <td className="py-3 text-textSoft">{user.status}</td>
                  <td className="py-3 text-textSoft">{user.companies_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
