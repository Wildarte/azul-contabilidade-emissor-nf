import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import Panel from '../components/Panel';

export default function SettingsPage({ token, companyId, isSuperAdmin }) {
  const [providers, setProviders] = useState([]);
  const [systemSettings, setSystemSettings] = useState({});
  const [companySettings, setCompanySettings] = useState({});
  const [feedback, setFeedback] = useState('');

  const loadSettings = async () => {
    const [companyPayload, adminPayload] = await Promise.all([
      apiRequest('/companies/current/fiscal-settings', { token, companyId }),
      isSuperAdmin ? apiRequest('/admin/fiscal-settings', { token }) : Promise.resolve({ providers: [], settings: {} }),
    ]);

    setCompanySettings(companyPayload.settings || {});
    setProviders(adminPayload.providers || []);
    setSystemSettings(adminPayload.settings || {});
  };

  useEffect(() => {
    loadSettings().catch((error) => setFeedback(error.message));
  }, [companyId, isSuperAdmin]);

  const saveSystemSettings = async () => {
    await apiRequest('/admin/fiscal-settings', {
      method: 'PUT',
      token,
      body: systemSettings,
    });
    setFeedback('Configuração fiscal global atualizada.');
  };

  const saveCompanySettings = async () => {
    await apiRequest('/companies/current/fiscal-settings', {
      method: 'PUT',
      token,
      companyId,
      body: companySettings,
    });
    setFeedback('Configuração fiscal da empresa atualizada.');
  };

  return (
    <div className="space-y-6">
      {isSuperAdmin ? (
        <Panel title="Provider fiscal global" description="Todas as empresas usam o mesmo provider ativo no MVP.">
          <div className="grid gap-3 md:grid-cols-2">
            <select
              className="field"
              value={systemSettings.active_provider_id || ''}
              onChange={(event) => setSystemSettings({ ...systemSettings, active_provider_id: Number(event.target.value) })}
            >
              <option value="">Selecione o provider</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>{provider.name}</option>
              ))}
            </select>
            <select className="field" value={systemSettings.environment || 'mock'} onChange={(event) => setSystemSettings({ ...systemSettings, environment: event.target.value })}>
              <option value="mock">mock</option>
              <option value="sandbox">sandbox</option>
              <option value="production">production</option>
            </select>
          </div>
          <div className="mt-3">
            <button type="button" className="primary-button" onClick={saveSystemSettings}>Salvar provider global</button>
          </div>
        </Panel>
      ) : null}

      <Panel title="Configuração fiscal da empresa" description="Parâmetros padrão aplicados na emissão da empresa atual.">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="field" placeholder="Regime tributário" value={companySettings.tax_regime || ''} onChange={(event) => setCompanySettings({ ...companySettings, tax_regime: event.target.value })} />
          <input className="field" placeholder="Inscrição municipal" value={companySettings.municipal_registration || ''} onChange={(event) => setCompanySettings({ ...companySettings, municipal_registration: event.target.value })} />
          <input className="field" placeholder="Código padrão do serviço" value={companySettings.default_service_code || ''} onChange={(event) => setCompanySettings({ ...companySettings, default_service_code: event.target.value })} />
          <input className="field" placeholder="ISS padrão" value={companySettings.default_iss_rate || ''} onChange={(event) => setCompanySettings({ ...companySettings, default_iss_rate: event.target.value })} />
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" className="primary-button" onClick={saveCompanySettings}>Salvar configuração da empresa</button>
          {feedback ? <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-textSoft">{feedback}</div> : null}
        </div>
      </Panel>
    </div>
  );
}
