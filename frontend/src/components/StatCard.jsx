export default function StatCard({ label, value, accent }) {
  return (
    <div className="glass-card p-5">
      <div className={`h-1 w-16 rounded-full ${accent}`} />
      <p className="mt-4 text-sm text-textSoft">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-textMain">{value}</p>
    </div>
  );
}
