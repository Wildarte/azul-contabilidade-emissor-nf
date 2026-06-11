export default function HeaderBar({
  title,
  subtitle,
  session,
  selectedCompanyId,
  onSelectCompany,
  onLogout,
}) {
  return (
    <header className="glass-card flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-textMain">{title}</h2>
        <p className="mt-1 text-sm text-textSoft">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={selectedCompanyId || ''}
          onChange={(event) => onSelectCompany(event.target.value)}
          className="field min-w-[240px]"
        >
          {session.memberships.map((membership) => (
            <option key={membership.company_id} value={membership.company_id}>
              {membership.trade_name || membership.legal_name}
            </option>
          ))}
        </select>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
          <p className="font-medium text-textMain">{session.user.name}</p>
          <p className="text-xs text-textSoft">{session.user.email}</p>
        </div>

        <button type="button" className="secondary-button" onClick={onLogout}>
          Sair
        </button>
      </div>
    </header>
  );
}
