export default function Card({ children }) {
  return (
    <div className="p-6 border border-gray-700 rounded-2xl hover:bg-white hover:text-black transition">
      {children}
    </div>
  );
}