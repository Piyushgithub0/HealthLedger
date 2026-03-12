import { useEffect, useRef } from "react";

interface FloatingElement {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  type: "cross" | "plus" | "heart" | "pill";
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elementsRef = useRef<FloatingElement[]>([]);
  const pulseRef = useRef({ offset: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize floating elements
    const elementCount = 15;
    elementsRef.current = Array.from({ length: elementCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 12 + Math.random() * 20,
      opacity: 0.03 + Math.random() * 0.06,
      speed: 0.15 + Math.random() * 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.005,
      type: ["cross", "plus", "heart", "pill"][Math.floor(Math.random() * 4)] as FloatingElement["type"],
    }));

    const drawCross = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      const armWidth = size * 0.3;
      const armLength = size;
      ctx.beginPath();
      ctx.roundRect(-armWidth / 2, -armLength / 2, armWidth, armLength, 2);
      ctx.roundRect(-armLength / 2, -armWidth / 2, armLength, armWidth, 2);
      ctx.fill();
      ctx.restore();
    };

    const drawPlus = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.lineWidth = size * 0.15;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(0, size / 2);
      ctx.moveTo(-size / 2, 0);
      ctx.lineTo(size / 2, 0);
      ctx.stroke();
      ctx.restore();
    };

    const drawHeart = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.scale(size / 30, size / 30);
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.bezierCurveTo(-10, -5, -15, -12, 0, -15);
      ctx.bezierCurveTo(15, -12, 10, -5, 0, 5);
      ctx.fill();
      ctx.restore();
    };

    const drawPill = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      const width = size * 0.4;
      const height = size;
      ctx.beginPath();
      ctx.roundRect(-width / 2, -height / 2, width, height, width / 2);
      ctx.fill();
      ctx.restore();
    };

    const drawHeartbeatLine = () => {
      const y = canvas.height * 0.5;
      const amplitude = 30;
      const wavelength = 200;

      ctx.beginPath();
      ctx.strokeStyle = "rgba(46, 204, 113, 0.08)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let x = -wavelength; x < canvas.width + wavelength; x += 2) {
        const adjustedX = x + pulseRef.current.offset;
        const normalizedX = (adjustedX % wavelength) / wavelength;
        
        let yOffset = 0;
        
        // Create ECG-like pattern
        if (normalizedX < 0.1) {
          yOffset = 0;
        } else if (normalizedX < 0.15) {
          yOffset = -amplitude * 0.3 * ((normalizedX - 0.1) / 0.05);
        } else if (normalizedX < 0.2) {
          yOffset = -amplitude * 0.3 + amplitude * 1.3 * ((normalizedX - 0.15) / 0.05);
        } else if (normalizedX < 0.25) {
          yOffset = amplitude - amplitude * 1.5 * ((normalizedX - 0.2) / 0.05);
        } else if (normalizedX < 0.3) {
          yOffset = -amplitude * 0.5 + amplitude * 0.5 * ((normalizedX - 0.25) / 0.05);
        } else if (normalizedX < 0.5) {
          yOffset = 0;
        } else if (normalizedX < 0.55) {
          yOffset = amplitude * 0.15 * Math.sin((normalizedX - 0.5) / 0.05 * Math.PI);
        } else {
          yOffset = 0;
        }

        if (x === -wavelength) {
          ctx.moveTo(x, y + yOffset);
        } else {
          ctx.lineTo(x, y + yOffset);
        }
      }
      ctx.stroke();
    };

    const drawWaves = () => {
      const time = Date.now() * 0.0003;
      
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(46, 204, 113, ${0.02 + i * 0.01})`;
        ctx.lineWidth = 1;
        
        for (let x = 0; x < canvas.width; x += 5) {
          const y = canvas.height - 100 - i * 40 + 
            Math.sin(x * 0.005 + time + i) * 15 +
            Math.sin(x * 0.01 + time * 1.5 + i) * 10;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    };

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw waves at bottom
      drawWaves();

      // Draw heartbeat line
      drawHeartbeatLine();
      pulseRef.current.offset += 0.8;

      // Draw floating elements
      const healthGreen = "#2ECC71";
      elementsRef.current.forEach((el) => {
        ctx.fillStyle = healthGreen;
        ctx.strokeStyle = healthGreen;
        ctx.globalAlpha = el.opacity;

        switch (el.type) {
          case "cross":
            drawCross(el.x, el.y, el.size, el.rotation);
            break;
          case "plus":
            drawPlus(el.x, el.y, el.size, el.rotation);
            break;
          case "heart":
            drawHeart(el.x, el.y, el.size, el.rotation);
            break;
          case "pill":
            drawPill(el.x, el.y, el.size, el.rotation);
            break;
        }

        ctx.globalAlpha = 1;

        // Update position
        el.y -= el.speed;
        el.rotation += el.rotationSpeed;

        // Reset if off screen
        if (el.y < -el.size) {
          el.y = canvas.height + el.size;
          el.x = Math.random() * canvas.width;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "transparent" }}
    />
  );
}
