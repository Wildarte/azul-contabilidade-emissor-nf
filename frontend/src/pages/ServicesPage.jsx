import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import Panel from '../components/Panel';

const initialForm = {
  name: '',
  description: '',
  service_code: '1401',
  iss_rate: '5.00',
  default_amount: '1500.00',
};

export default function ServicesPage({ token, companyId }) {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState('');

  const loadServices = async () => {
    const payload = await apiRequest('/services', { token, companyId });
    setServices(payload.services || []);
  };

  useEffect(() => {
    loadServices().catch((error) => setFeedback(error.message));
  }, [companyId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await apiRequest('/services', { method: 'POST', token, companyId, body: form });
      setForm(initialForm);
      setFeedback('Serviço cadastrado com sucesso.');
      await loadServices();
    } catch (error) {
      setFeedback(error.message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Panel title="Novo serviço" description="Base de serviços tributáveis usada no fluxo de emissão.">
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <input className="field" placeholder="Nome do serviço" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <textarea className="field min-h-[120px]" placeholder="Descrição" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <div className="grid gap-3 md:grid-cols-3">
            <input className="field" placeholder="Código serviço" value={form.service_code} onChange={(event) => setForm({ ...form, service_code: event.target.value })} />
            <input className="field" placeholder="ISS %" value={form.iss_rate} onChange={(event) => setForm({ ...form, iss_rate: event.target.value })} />
            <input className="field" placeholder="Valor padrão" value={form.default_amount} onChange={(event) => setForm({ ...form, default_amount: event.target.value })} />
          </div>
          {feedback ? <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-textSoft">{feedback}</div> : null}
          <button type="submit" className="primary-button">Cadastrar serviço</button>
        </form>
      </Panel>

      <Panel title="Serviços ativos" description="Catálogo atual vinculado à empresa selecionada.">
        <div className="space-y-3">
          {services.map((service) => (
            <div key={service.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-textMain">{service.name}</p>
                <p className="text-xs text-textSoft">ISS {service.iss_rate}%</p>
              </div>
              <p className="mt-2 text-xs text-textSoft">{service.description || 'Sem descrição.'}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
