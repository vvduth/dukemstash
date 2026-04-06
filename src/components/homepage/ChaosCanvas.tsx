"use client";

import { useRef, useEffect, useCallback } from "react";

interface IconDef {
  label: string;
  text: string;
  bg: string;
  fg: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  scale: number;
  scaleDir: number;
  def: IconDef;
}

const ICON_DEFS: IconDef[] = [
  { label: "Notion", text: "N", bg: "#fff", fg: "#000" },
  { label: "GitHub", text: "", bg: "#333", fg: "#fff" },
  { label: "Slack", text: "#", bg: "#4A154B", fg: "#fff" },
  { label: "VS Code", text: "{}", bg: "#007ACC", fg: "#fff" },
  { label: "Browser", text: "", bg: "#4285F4", fg: "#fff" },
  { label: "Terminal", text: ">_", bg: "#22c55e", fg: "#000" },
  { label: ".txt", text: "T", bg: "#94a3b8", fg: "#000" },
  { label: "Bookmark", text: "", bg: "#f59e0b", fg: "#000" },
  { label: "ChatGPT", text: "AI", bg: "#10a37f", fg: "#fff" },
  { label: "Discord", text: "D", bg: "#5865F2", fg: "#fff" },
  { label: "Jira", text: "J", bg: "#0052CC", fg: "#fff" },
  { label: "Sticky", text: "", bg: "#fde047", fg: "#000" },
  { label: "SO", text: "SO", bg: "#F48024", fg: "#fff" },
  { label: "Docs", text: "", bg: "#3b82f6", fg: "#fff" },
];

const REPULSE_RADIUS = 90;
const REPULSE_FORCE = 3;
const PARTICLE_SIZE = 36;

function createParticles(width: number, height: number): Particle[] {
  const count = Math.min(
    ICON_DEFS.length,
    Math.floor((width * height) / 6000)
  );
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const def = ICON_DEFS[i % ICON_DEFS.length];
    particles.push({
      x: Math.random() * (width - PARTICLE_SIZE) + PARTICLE_SIZE / 2,
      y: Math.random() * (height - PARTICLE_SIZE) + PARTICLE_SIZE / 2,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      size: PARTICLE_SIZE,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      scale: 0.9 + Math.random() * 0.2,
      scaleDir: Math.random() > 0.5 ? 1 : -1,
      def,
    });
  }
  return particles;
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.scale(p.scale, p.scale);

  const half = p.size / 2;
  const r = 8;

  ctx.beginPath();
  ctx.moveTo(-half + r, -half);
  ctx.lineTo(half - r, -half);
  ctx.quadraticCurveTo(half, -half, half, -half + r);
  ctx.lineTo(half, half - r);
  ctx.quadraticCurveTo(half, half, half - r, half);
  ctx.lineTo(-half + r, half);
  ctx.quadraticCurveTo(-half, half, -half, half - r);
  ctx.lineTo(-half, -half + r);
  ctx.quadraticCurveTo(-half, -half, -half + r, -half);
  ctx.closePath();

  ctx.fillStyle = p.def.bg;
  ctx.globalAlpha = 0.85;
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.fillStyle = p.def.fg;
  ctx.font = `bold ${p.size * 0.38}px var(--font-jetbrains-mono), monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(p.def.text, 0, 1);

  ctx.restore();
}

function updateParticle(
  p: Particle,
  canvasWidth: number,
  canvasHeight: number,
  mouseX: number,
  mouseY: number
) {
  const half = p.size / 2;
  if (p.x - half < 0 || p.x + half > canvasWidth) p.vx *= -1;
  if (p.y - half < 0 || p.y + half > canvasHeight) p.vy *= -1;

  const dx = p.x - mouseX;
  const dy = p.y - mouseY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < REPULSE_RADIUS && dist > 0) {
    const force =
      ((REPULSE_RADIUS - dist) / REPULSE_RADIUS) * REPULSE_FORCE;
    p.vx += (dx / dist) * force;
    p.vy += (dy / dist) * force;
  }

  p.vx *= 0.98;
  p.vy *= 0.98;

  const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
  if (speed < 0.3) {
    p.vx += (Math.random() - 0.5) * 0.3;
    p.vy += (Math.random() - 0.5) * 0.3;
  }

  p.x += p.vx;
  p.y += p.vy;

  p.x = Math.max(half, Math.min(canvasWidth - half, p.x));
  p.y = Math.max(half, Math.min(canvasHeight - half, p.y));

  p.rotation += p.rotSpeed;

  p.scale += p.scaleDir * 0.001;
  if (p.scale > 1.1 || p.scale < 0.85) p.scaleDir *= -1;
}

export default function ChaosCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animFrameRef = useRef<number>(0);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    particlesRef.current = createParticles(canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    resizeCanvas();

    function animate() {
      const c = canvasRef.current;
      if (!c || !ctx) return;
      ctx.clearRect(0, 0, c.width, c.height);
      for (const p of particlesRef.current) {
        updateParticle(p, c.width, c.height, mouseRef.current.x, mouseRef.current.y);
        drawParticle(ctx, p);
      }
      animFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    let resizeTimer: ReturnType<typeof setTimeout>;
    function handleResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 200);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [resizeCanvas]);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }}
      onMouseLeave={() => {
        mouseRef.current = { x: -1000, y: -1000 };
      }}
    />
  );
}
