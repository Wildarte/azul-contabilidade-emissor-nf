import Panel from '../components/Panel';
import Badge from '../components/Badge';

export default function ProfilePage({ session }) {
  return (
    <div className="space-y-6">
      <Panel title="Perfil do usuário" description="Dados básicos do usuário autenticado e vínculos de empresa.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-textSoft">Nome</p>
            <p className="mt-3 text-sm text-textMain">{session.user.name}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-textSoft">E-mail</p>
            <p className="mt-3 text-sm text-textMain">{session.user.email}</p>
          </div>
        </div>
      </Panel>

      <Panel title="Empresas vinculadas" description="Papéis e permissões operacionais por empresa.">
        <div className="space-y-3">
          {session.memberships.map((membership) => (
            <div key={membership.company_id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textMain">{membership.trade_name || membership.legal_name}</p>
                  <p className="text-xs text-textSoft">{membership.role_name}</p>
                </div>
                <div className="flex gap-2">
                  {membership.can_issue_invoice ? <Badge tone="success">Emite</Badge> : null}
                  {membership.can_cancel_invoice ? <Badge tone="warning">Cancela</Badge> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
