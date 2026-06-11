const items = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'companies', label: 'Empresas', superAdminOnly: true },
  { id: 'users', label: 'Usuários', superAdminOnly: true },
  { id: 'customers', label: 'Tomadores' },
  { id: 'services', label: 'Serviços' },
  { id: 'invoices', label: 'Notas' },
  { id: 'settings', label: 'Fiscal' },
  { id: 'audit', label: 'Auditoria', superAdminOnly: true },
  { id: 'profile', label: 'Perfil' },
];

export default function Sidebar({ route, onNavigate, isSuperAdmin }) {
  return (
    <aside className="glass-card flex h-full flex-col gap-6 p-6">
      <div className="space-y-3">
        <div className="chip border-cyan/30 bg-cyan/10 text-cyan">Ambiente de teste / mock</div>
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-textSoft">Emissor NFS-e</p>
          <h1 className="mt-2 text-2xl font-semibold text-textMain">SaaS multiempresa</h1>
        </div>
      </div>

      <nav className="grid gap-2">
        {items
          .filter((item) => !item.superAdminOnly || isSuperAdmin)
          .map((item) => {
            const active = route === item.id || route.startsWith(`${item.id}:`);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`rounded-2xl px-4 py-3 text-left text-sm transition ${
                  active
                    ? 'bg-gradient-to-r from-primary/80 to-cyan/40 text-white shadow-lg shadow-cyan/10'
                    : 'text-textSoft hover:bg-white/5 hover:text-textMain'
                }`}
              >
                {item.label}
              </button>
            );
          })}
      </nav>

      <div className="mt-auto rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm text-textMain">Provider global</p>
        <p className="mt-1 text-xs text-textSoft">Arquitetura pronta para troca futura entre provedores fiscais.</p>
      </div>
    </aside>
  );
}
