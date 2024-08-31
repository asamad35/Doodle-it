import { RefObject, useEffect, useRef } from "react";

const AnimatedCircles = ({
  eraserRef,
}: {
  eraserRef: RefObject<HTMLButtonElement>;
}) => {
  const coords = useRef({ x: 0, y: 0 });
  const circlesRef = useRef<NodeListOf<Element> | null>(null);
  const colors = ["#cccccc"];

  useEffect(() => {
    document.body.style.cursor = "none";
    circlesRef.current = document.querySelectorAll(".circle");

    // find position of eraser button
    if (eraserRef.current) {
      const rect = eraserRef.current.getBoundingClientRect();
      coords.current.x = rect.left + rect.width / 2;
      coords.current.y = rect.top + rect.height / 2;
    }

    if (circlesRef.current) {
      circlesRef.current.forEach((circle, index) => {
        (circle as HTMLElement).style.backgroundColor =
          colors[index % colors.length];
        (circle as any).x = coords.current.x;
        (circle as any).y = coords.current.y;
        (circle as HTMLElement).style.left = coords.current.x - 12 + "px";
        (circle as HTMLElement).style.top = coords.current.y - 12 + "px";
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      coords.current.x = e.clientX;
      coords.current.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    function animateCircles() {
      if (!circlesRef.current) return;

      let x = coords.current.x;
      let y = coords.current.y;

      circlesRef.current.forEach((circle, index) => {
        (circle as HTMLElement).style.left = x - 12 + "px";
        (circle as HTMLElement).style.top = y - 12 + "px";
        (circle as HTMLElement).style.transform = `scale(${
          (circlesRef.current!.length - index) / circlesRef.current!.length
        })`;

        (circle as any).x = x;
        (circle as any).y = y;

        const nextCircle =
          circlesRef.current![index + 1] || circlesRef.current![0];
        x += ((nextCircle as any).x - x) * 0.6;
        y += ((nextCircle as any).y - y) * 0.6;
      });

      requestAnimationFrame(animateCircles);
    }
    requestAnimationFrame(animateCircles);
    animateCircles();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.style.cursor = "crosshair";
    };
  }, []);

  return (
    <div>
      {/* Render your circles here */}
      {Array.from({ length: 22 }).map((_, index) => (
        <div
          key={index}
          className="circle"
          style={{
            position: "absolute",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
          }}
        ></div>
      ))}
    </div>
  );
};

export default AnimatedCircles;
