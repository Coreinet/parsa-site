'use client';

import { useEffect, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer
} from 'three';

const COUNT = 1800;
const ACCENT_SHARE = 0.06;

// Same deformed Fibonacci sphere as the static poster (scripts/placeholders.mjs), so the swap is seamless.
function buildGeometry(): BufferGeometry {
  const positions = new Float32Array(COUNT * 3);
  const accents = new Float32Array(COUNT);
  const seeds = new Float32Array(COUNT);
  let s = 7;
  const rand = (): number => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = Math.PI * (3 - Math.sqrt(5)) * i;
    const k = 1 + 0.18 * Math.sin(3 * th) * Math.cos(4 * y);
    positions.set([Math.cos(th) * r * k, y * k, Math.sin(th) * r * k], i * 3);
    accents[i] = rand() < ACCENT_SHARE ? 1 : 0;
    seeds[i] = rand();
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(positions, 3));
  g.setAttribute('aAccent', new BufferAttribute(accents, 1));
  g.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  return g;
}

const vertex = /* glsl */ `
  attribute float aAccent;
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uAssemble;
  varying float vAccent;
  varying float vDepth;
  void main() {
    vec3 p = position;
    // Assemble from scattered points on load.
    vec3 scattered = p * (2.4 + aSeed * 1.6) + vec3(sin(aSeed * 40.0), cos(aSeed * 33.0), sin(aSeed * 21.0)) * 0.6;
    p = mix(scattered, p, uAssemble);
    // A slow breathing wobble.
    p += normalize(position) * sin(uTime * 0.6 + aSeed * 6.2831) * 0.012;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vDepth = clamp((-mv.z - 3.2) / 2.4, 0.0, 1.0);
    vAccent = aAccent;
    gl_PointSize = (aAccent > 0.5 ? 4.2 : 3.0) * uPixelRatio * (1.25 - vDepth * 0.6);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uSignal;
  varying float vAccent;
  varying float vDepth;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;
    vec3 col = mix(uInk, uSignal, vAccent);
    float alpha = vAccent > 0.5 ? 0.95 : mix(0.75, 0.18, vDepth);
    gl_FragColor = vec4(col, alpha);
  }
`;

const readVar = (name: string): Color => new Color(getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#121416');

export default function LatticeCanvas({ onReady }: { onReady?: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.style.display = 'block';

    const scene = new Scene();
    const camera = new PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(0, 0, 4.6);

    const material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uAssemble: { value: 0 },
        uInk: { value: readVar('--ink') },
        uSignal: { value: readVar('--signal') }
      }
    });
    const isDark = (): boolean => document.documentElement.dataset.theme === 'dark';
    material.blending = isDark() ? AdditiveBlending : NormalBlending;

    const points = new Points(buildGeometry(), material);
    points.rotation.set(-0.35, 0.5, 0);
    scene.add(points);

    const resize = (): void => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // Pointer lean, damped. One full turn roughly every 90s.
    const pointer = { x: 0, y: 0 };
    const lean = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent): void => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    // Theme changes: re-read colours.
    const mo = new MutationObserver(() => {
      material.uniforms.uInk.value = readVar('--ink');
      material.uniforms.uSignal.value = readVar('--signal');
      material.blending = isDark() ? AdditiveBlending : NormalBlending;
      material.needsUpdate = true;
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    let raf = 0;
    let visible = true;
    let last = performance.now();
    let spin = 0;
    const start = performance.now();
    let ready = false;

    const frame = (now: number): void => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - start) / 1000;
      const assemble = Math.min(1, t / 0.9);
      material.uniforms.uAssemble.value = 1 - Math.pow(1 - assemble, 3);
      material.uniforms.uTime.value = t;
      spin += dt * ((Math.PI * 2) / 90);
      lean.x += (pointer.x * 0.21 - lean.x) * (1 - Math.exp(-dt / 0.4));
      lean.y += (pointer.y * 0.21 - lean.y) * (1 - Math.exp(-dt / 0.4));
      points.rotation.y = 0.5 + spin + lean.x;
      points.rotation.x = -0.35 + lean.y;
      renderer.render(scene, camera);
      if (!ready) {
        ready = true;
        onReady?.();
      }
      raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
    };
    const kick = (): void => {
      if (!raf && visible && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      kick();
    });
    io.observe(host);
    document.addEventListener('visibilitychange', kick);
    kick();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', kick);
      points.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onReady]);

  return <div ref={hostRef} className="absolute inset-0" />;
}
