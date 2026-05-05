export default function Toast({ show, title, message }) {
  if (!show) return null;

  return (
    <div className="toast">
      <span>{title}</span>
      <p>{message}</p>
    </div>
  );
}