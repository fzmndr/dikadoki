import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorRef = useRef(null);

  const position = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const move = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    const handleEnter = () => setHovering(true);
    const handleLeave = () => setHovering(false);

    const elements = document.querySelectorAll("button, a");

    elements.forEach((el) => {
      el.addEventListener("mouseenter", handleEnter);
      el.addEventListener("mouseleave", handleLeave);
    });

    let animationFrameId;

    const animate = () => {
      position.current.x += (target.current.x - position.current.x) * 0.15;
      position.current.y += (target.current.y - position.current.y) * 0.15;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `
          translate(${position.current.x}px, ${position.current.y}px)
          translate(-50%, -50%)
          scale(${hovering ? 2.2 : 1})
        `;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", move);
    animate();

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(animationFrameId);

      elements.forEach((el) => {
        el.removeEventListener("mouseenter", handleEnter);
        el.removeEventListener("mouseleave", handleLeave);
      });
    };
  }, [hovering]);

  return <div ref={cursorRef} className="custom-cursor" />;
}