import { startTransition, useEffect, useState } from 'react';
import { apiRequest } from './lib/api';
import Sidebar from './components/Sidebar';
import HeaderBar from './components/HeaderBar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CompaniesPage from './pages/CompaniesPage';
import UsersPage from './pages/UsersPage';
import CustomersPage from './pages/CustomersPage';
import ServicesPage from './pages/ServicesPage';
import InvoicesPage from './pages/InvoicesPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import SettingsPage from './pages/SettingsPage';
import AuditPage from './pages/AuditPage';
import ProfilePage from './pages/ProfilePage';

const SESSION_STORAGE_KEY = 'emissor_nfse_session';

function routeFromHash() {
  return window.location.hash.replace('#', '') || 'dashboard';
}

function titles(route) {
  const map = {
    dashboard: ['Dashboard', 'Indicadores do mês, últimas emissões e erros recentes.'],
    companies: ['Empresas', 'Gestão master das empresas cadastradas.'],
    users: ['Usuários', 'Controle de acessos, perfis e permissões.'],
    customers: ['Tomadores', 'Base de clientes usada na emissão da NFS-e.'],
    services: ['Serviços', 'Catálogo tributável por empresa.'],
    invoices: ['Notas', 'Emissão, consulta, download e cancelamento.'],
    settings: ['Fiscal', 'Provider global e parâmetros fiscais da empresa atual.'],
    audit: ['Auditoria', 'Rastreabilidade das ações críticas do sistema.'],
    profile: ['Perfil', 'Dados do usuário autenticado e empresas vinculadas.'],
  };

  if (route.startsWith('invoice:')) {
    return ['Detalhes da nota', 'Visualização completa da emissão, arquivos e eventos.'];
  }

  return map[route] || map.dashboard;
}

export default function App() {
  const [route, setRoute] = useState(routeFromHash());
  const [session, setSession] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [companiesCache, setCompaniesCache] = useState([]);

  useEffect(() => {
    const handleHashChange = () => {
      startTransition(() => setRoute(routeFromHash()));
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    const bootstrapSession = async () => {
      const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);

      if (!stored) {
        setAuthLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(stored);
        const payload = await apiRequest('/me', { token: parsed.token });
        const nextSession = {
          token: parsed.token,
          user: payload.user,
          memberships: payload.memberships || [],
        };

        setSession(nextSession);
        setSelectedCompanyId(String(parsed.selectedCompanyId || payload.memberships?.[0]?.company_id || ''));
      } catch {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      } finally {
        setAuthLoading(false);
      }
    };

    bootstrapSession();
  }, []);

  const persistSession = (nextSession, nextCompanyId) => {
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        token: nextSession.token,
        selectedCompanyId: nextCompanyId,
      }),
    );
  };

  const handleLogin = async ({ email, password }) => {
    setLoginLoading(true);
    setLoginError('');

    try {
      const payload = await apiRequest('/login', { method: 'POST', body: { email, password } });
      const nextSession = {
        token: payload.token,
        user: payload.user,
        memberships: payload.memberships || [],
      };
      const nextCompanyId = String(payload.memberships?.[0]?.company_id || '');

      setSession(nextSession);
      setSelectedCompanyId(nextCompanyId);
      persistSession(nextSession, nextCompanyId);
      window.location.hash = 'dashboard';
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    if (session?.token) {
      try {
        await apiRequest('/logout', { method: 'POST', token: session.token });
      } catch {
        // Ignora falha de logout remoto e limpa a sessão local.
      }
    }

    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
    setSelectedCompanyId('');
    setCompaniesCache([]);
    window.location.hash = '';
  };

  const handleNavigate = (nextRoute) => {
    window.location.hash = nextRoute;
  };

  const handleSelectCompany = (companyId) => {
    setSelectedCompanyId(companyId);

    if (session) {
      persistSession(session, companyId);
    }
  };

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-textSoft">Carregando sessão...</div>;
  }

  if (!session) {
    return <LoginPage onLogin={handleLogin} loading={loginLoading} error={loginError} />;
  }

  const isSuperAdmin = session.memberships.some((membership) => membership.role_slug === 'super_admin');
  const [title, subtitle] = titles(route);
  const invoiceId = route.startsWith('invoice:') ? route.split(':')[1] : null;

  const sharedProps = {
    token: session.token,
    companyId: selectedCompanyId,
  };

  let content = <DashboardPage {...sharedProps} isSuperAdmin={isSuperAdmin} />;

  if (route === 'companies') {
    content = <CompaniesPage token={session.token} onCompaniesChange={setCompaniesCache} />;
  } else if (route === 'users') {
    content = <UsersPage token={session.token} companies={companiesCache} />;
  } else if (route === 'customers') {
    content = <CustomersPage {...sharedProps} />;
  } else if (route === 'services') {
    content = <ServicesPage {...sharedProps} />;
  } else if (route === 'invoices') {
    content = <InvoicesPage {...sharedProps} onOpenInvoice={(id) => handleNavigate(`invoice:${id}`)} />;
  } else if (route === 'settings') {
    content = <SettingsPage {...sharedProps} isSuperAdmin={isSuperAdmin} />;
  } else if (route === 'audit') {
    content = <AuditPage token={session.token} />;
  } else if (route === 'profile') {
    content = <ProfilePage session={session} />;
  } else if (invoiceId) {
    content = <InvoiceDetailPage {...sharedProps} invoiceId={invoiceId} onBack={() => handleNavigate('invoices')} />;
  }

  return (
    <div className="min-h-screen px-4 py-4 lg:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1640px] gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar route={route} onNavigate={handleNavigate} isSuperAdmin={isSuperAdmin} />

        <main className="space-y-4">
          <HeaderBar
            title={title}
            subtitle={subtitle}
            session={session}
            selectedCompanyId={selectedCompanyId}
            onSelectCompany={handleSelectCompany}
            onLogout={handleLogout}
          />
          {content}
        </main>
      </div>
    </div>
  );
}
