export default function Badge({ children, tone = 'info' }) {
  const tones = {
    info: 'border-cyan/30 bg-cyan/10 text-cyan',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    danger: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  };

  return (
    <span className={`chip ${tones[tone] || tones.info}`}>
      {children}
    </span>
  );
}
