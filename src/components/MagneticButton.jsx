import { useRef } from "react";

export default function MagneticButton({ children }) {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = ref.current.getBoundingClientRect();

    const x = e.clientX - (left + width / 2);
    const y = e.clientY - (top + height / 2);

    ref.current.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  };

  const handleMouseLeave = () => {
    ref.current.style.transform = `translate(0px, 0px)`;
  };

  return (
    <button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="px-6 py-3 border border-white rounded-full transition duration-200"
    >
      {children}
    </button>
  );
}