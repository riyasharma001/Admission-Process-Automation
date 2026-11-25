export default function StatusBadge({ status }) {
  const className = `status status-${String(status).toLowerCase().replace(/\s+/g, '-')}`;
  return <span className={className}>{status}</span>;
}
