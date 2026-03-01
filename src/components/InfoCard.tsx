interface InfoCardProps {
  message: string;
  command: string;
}

export default function InfoCard({ message, command }: InfoCardProps) {
  return (
    <div className="info-card">
      <p className="info-card-message">{message}</p>
      <span className="info-card-hint">In Cursor or Claude Code, run: <code className="info-card-command">{command}</code></span>
    </div>
  );
}
