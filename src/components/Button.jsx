export default function Button({ children }) {
  return (
    <button className="px-6 py-3 bg-white text-black rounded-full hover:scale-105 transition">
      {children}
    </button>
  );
}