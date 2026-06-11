export default function Panel({ title, description, actions, children }) {
  return (
    <section className="glass-card p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="section-title">{title}</h3>
          {description ? <p className="mt-1 text-sm text-textSoft">{description}</p> : null}
        </div>
        {actions ? <div className="flex gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
