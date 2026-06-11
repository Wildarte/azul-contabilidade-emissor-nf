import { useState } from 'react';

export default function LoginPage({ onLogin, loading, error }) {
  const [email, setEmail] = useState('superadmin@emissornfse.local');
  const [password, setPassword] = useState('Admin@123');

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin({ email, password });
  };

  return (
    <div className="min-h-screen bg-hero px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="chip border-cyan/30 bg-cyan/10 text-cyan">Ambiente de teste / mock</div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-textMain">
            Emissão de NFS-e com isolamento total por empresa e arquitetura pronta para crescer.
          </h1>
          <p className="max-w-2xl text-lg text-textSoft">
            Painel SaaS para emissão, cancelamento, auditoria e gestão fiscal multiempresa, com API REST em PHP puro e provider mock desacoplado.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Multiempresa', 'Cada empresa opera com dados isolados, usuários próprios e contexto fiscal separado.'],
              ['Provider global', 'A camada fiscal permite iniciar em mock e trocar de integrador sem reescrever o sistema.'],
              ['Back-end seguro', 'Autenticação por token, prepared statements, storage privado e auditoria de ações.'],
            ].map(([title, description]) => (
              <div key={title} className="glass-card p-5">
                <p className="text-sm font-semibold text-textMain">{title}</p>
                <p className="mt-2 text-sm text-textSoft">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.32em] text-textSoft">Acesso</p>
            <h2 className="mt-3 text-3xl font-semibold text-textMain">Entrar no Emissor NFS-e</h2>
            <p className="mt-2 text-sm text-textSoft">
              Use as credenciais semeadas para o primeiro acesso ou cadastre novos usuários pelo painel master.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="field" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="E-mail" />
            <input
              className="field"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Senha"
            />
            {error ? <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
            <button type="submit" className="primary-button w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Acessar painel'}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-textSoft">
            Login seed padrão: <strong className="text-textMain">superadmin@emissornfse.local</strong> / <strong className="text-textMain">Admin@123</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
