"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * The hero's focal point: a procedural 3D tongkat mimbar (the khutbah staff)
 * in walnut, silver and lime, standing in front of a faint khatim star.
 *
 * three.js is imported lazily inside the effect and only on wide screens with
 * motion allowed, so phones never download the renderer. The inline SVG + icon
 * underneath is both the loading state and the permanent fallback.
 */
const ICON_SCALE = 0.0055;

// Staff silhouette from the full logo: [radius, y].
const STAFF_PROFILE: Array<[number, number]> = [
  [0, 824],
  [12, 822],
  [22, 816],
  [26, 808],
  [28, 800],
  [30, 790],
  [35, 785],
  [36, 780],
  [33, 772],
  [27, 760],
  [24, 748],
  [23, 735],
  [23, 715],
  [25, 700],
  [30, 688],
  [34, 678],
  [32, 668],
  [24, 660],
  [14, 655],
  [16, 648],
  [24, 640],
  [32, 628],
  [40, 612],
  [47, 592],
  [52, 568],
  [54, 540],
  [54, 505],
  [53, 475],
  [50, 445],
  [45, 420],
  [38, 398],
  [30, 380],
  [22, 368],
  [16, 358],
  [16, 350],
  [13, 338],
  [12, 320],
  [12, 295],
  [11, 272],
  [0, 262],
];

const CRESCENT_PATH =
  "M490 190 C490 162.386 512.386 140 540 140 C540.761 140 541.518 140.017 542.27 140.051 C529.592 147.024 521 160.508 521 176 C521 198.644 539.356 217 562 217 C571.066 217 579.444 214.058 586.232 209.076 C578.735 227.227 560.859 240 540 240 C512.386 240 490 217.614 490 190 Z";

const STAR_POINTS: Array<[number, number]> = [
  [610, 130],
  [617.053, 150.292],
  [638.532, 150.729],
  [621.413, 163.708],
  [627.634, 184.271],
  [610, 172],
  [592.366, 184.271],
  [598.587, 163.708],
  [581.468, 150.729],
  [602.947, 150.292],
];

const ICON_CX = 540;
const ICON_CY = 477;

function toMarkPoint(x: number, y: number) {
  return [(x - ICON_CX) * ICON_SCALE, (ICON_CY - y) * ICON_SCALE] as const;
}

function makeWoodTexture(THREE: typeof import("three")) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#60432e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 190; i++) {
    const x = Math.random() * canvas.width;
    const amplitude = 2 + Math.random() * 10;
    const frequency = 0.006 + Math.random() * 0.018;
    const phase = Math.random() * Math.PI * 2;
    const dark = Math.random() > 0.45;

    ctx.strokeStyle = dark
      ? `rgba(43, 26, 17, ${0.05 + Math.random() * 0.13})`
      : `rgba(166, 120, 82, ${0.035 + Math.random() * 0.08})`;
    ctx.lineWidth = 0.7 + Math.random() * 2.6;
    ctx.beginPath();
    for (let y = 0; y <= canvas.height; y += 8) {
      const xx = x + Math.sin(y * frequency + phase) * amplitude;
      if (y === 0) ctx.moveTo(xx, y);
      else ctx.lineTo(xx, y);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function starPoints(cx: number, cy: number, outer: number, inner: number) {
  const points: string[] = [];
  for (let i = 0; i < 16; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / 8;
    points.push(
      `${(cx + radius * Math.cos(angle)).toFixed(2)},${(
        cy +
        radius * Math.sin(angle)
      ).toFixed(2)}`,
    );
  }
  return points.join(" ");
}

const SVG_STAR = starPoints(100, 100, 84, 38);

export default function HeroVisual() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const wide = window.matchMedia("(min-width: 1024px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!wide.matches || still.matches) return;

    let disposed = false;
    let disposeScene = () => {};

    void (async () => {
      try {
        const THREE = await import("three");
        const { RoomEnvironment } = await import(
          "three/examples/jsm/environments/RoomEnvironment.js"
        );
        const { SVGLoader } = await import(
          "three/examples/jsm/loaders/SVGLoader.js"
        );
        if (disposed || !hostRef.current) return;

        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
        if (!renderer.capabilities.isWebGL2) {
          renderer.dispose();
          return;
        }

        const hostEl = hostRef.current;
        const canvas = renderer.domElement;
        canvas.className = "hero-canvas";
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.98;
        hostEl.appendChild(canvas);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 40);
        camera.position.set(0, 0, 6.4);

        const pmrem = new THREE.PMREMGenerator(renderer);
        const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTexture;

        const group = new THREE.Group();
        group.scale.setScalar(1.02);
        group.position.set(0, -0.02, 0);
        scene.add(group);

        // Faint khatim star behind the staff.
        const khatim = new THREE.Shape();
        const radii = [1, 0.44];
        for (let i = 0; i < 16; i++) {
          const radius = radii[i % 2];
          const angle = Math.PI / 2 + (i * Math.PI) / 8;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          if (i === 0) khatim.moveTo(x, y);
          else khatim.lineTo(x, y);
        }
        khatim.closePath();

        const backdropGeometry = new THREE.ExtrudeGeometry(khatim, {
          depth: 0.32,
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.04,
          bevelSegments: 3,
          curveSegments: 2,
        });
        backdropGeometry.center();
        const backdropMaterial = new THREE.MeshBasicMaterial({
          color: 0x9fc5bd,
          transparent: true,
          opacity: 0.06,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
        backdrop.scale.setScalar(2.35);
        backdrop.position.z = -0.9;
        group.add(backdrop);

        const backdropEdges = new THREE.EdgesGeometry(backdropGeometry, 18);
        const backdropEdgeMaterial = new THREE.LineBasicMaterial({
          color: 0xd8f055,
          transparent: true,
          opacity: 0.08,
        });
        const backdropEdgeLines = new THREE.LineSegments(
          backdropEdges,
          backdropEdgeMaterial,
        );
        backdropEdgeLines.scale.setScalar(2.35);
        backdropEdgeLines.position.z = -0.9;
        group.add(backdropEdgeLines);

        // Walnut staff, turned from the icon's silhouette.
        const woodTexture = makeWoodTexture(THREE);
        const woodMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: woodTexture ?? undefined,
          roughness: 0.46,
          metalness: 0.03,
          envMapIntensity: 0.65,
        });

        const profile = STAFF_PROFILE.map(
          ([radius, y]) =>
            new THREE.Vector2(
              radius * ICON_SCALE,
              (ICON_CY - y) * ICON_SCALE,
            ),
        );
        const smoothedProfile = new THREE.SplineCurve(profile).getPoints(180);
        const staffGeometry = new THREE.LatheGeometry(smoothedProfile, 96);
        const staff = new THREE.Mesh(staffGeometry, woodMaterial);
        group.add(staff);

        const silverMaterial = new THREE.MeshStandardMaterial({
          color: 0xdfe7e8,
          metalness: 1,
          roughness: 0.22,
          envMapIntensity: 1.25,
        });
        const limeMaterial = new THREE.MeshStandardMaterial({
          color: 0xd8f055,
          metalness: 0.78,
          roughness: 0.24,
          emissive: 0x364600,
          emissiveIntensity: 0.35,
          envMapIntensity: 1.1,
        });

        // Turned silver discs: collar, waist and foot.
        const discGeometry = new THREE.SphereGeometry(1, 48, 18);
        const DISCS = [
          { y: 336, r: 39, squash: 0.28 },
          { y: 355, r: 32, squash: 0.28 },
          { y: 662, r: 28, squash: 0.29 },
          { y: 780, r: 36, squash: 0.31 },
          { y: 802, r: 28, squash: 0.36 },
        ];
        for (const disc of DISCS) {
          const mesh = new THREE.Mesh(discGeometry, silverMaterial);
          const radius = disc.r * ICON_SCALE;
          mesh.scale.set(radius, radius * disc.squash, radius);
          mesh.position.y = (ICON_CY - disc.y) * ICON_SCALE;
          group.add(mesh);
        }

        // Lime turning rings.
        const RINGS = [
          { y: 356, r: 31 },
          { y: 662, r: 28 },
          { y: 792, r: 20 },
        ];
        const ringGeometries: Array<InstanceType<typeof THREE.TorusGeometry>> =
          [];
        for (const ringDef of RINGS) {
          const turningRingGeometry = new THREE.TorusGeometry(
            ringDef.r * ICON_SCALE,
            2.4 * ICON_SCALE,
            10,
            64,
          );
          ringGeometries.push(turningRingGeometry);
          const turningRing = new THREE.Mesh(
            turningRingGeometry,
            limeMaterial,
          );
          turningRing.rotation.x = Math.PI / 2;
          turningRing.position.y = (ICON_CY - ringDef.y) * ICON_SCALE;
          group.add(turningRing);
        }

        // Crescent and star cut from the icon's exact vector paths.
        const crescentData = new SVGLoader().parse(
          `<svg xmlns="http://www.w3.org/2000/svg"><path d="${CRESCENT_PATH}"/></svg>`,
        );
        const crescentShapeRaw = SVGLoader.createShapes(
          crescentData.paths[0],
        )[0];
        const crescentPoints = crescentShapeRaw.getPoints(56);
        const crescentShape = new THREE.Shape();
        crescentPoints.forEach((point, index) => {
          const [x, y] = toMarkPoint(point.x, point.y);
          if (index === 0) crescentShape.moveTo(x, y);
          else crescentShape.lineTo(x, y);
        });
        crescentShape.closePath();
        const crescentGeometry = new THREE.ExtrudeGeometry(crescentShape, {
          depth: 0.18,
          bevelEnabled: true,
          bevelThickness: 0.025,
          bevelSize: 0.02,
          bevelSegments: 2,
          curveSegments: 8,
        });
        crescentGeometry.translate(0, 0, -0.09);
        const crescent = new THREE.Mesh(crescentGeometry, limeMaterial);
        group.add(crescent);

        const starShape = new THREE.Shape();
        STAR_POINTS.forEach(([x, y], index) => {
          const [mx, my] = toMarkPoint(x, y);
          if (index === 0) starShape.moveTo(mx, my);
          else starShape.lineTo(mx, my);
        });
        starShape.closePath();
        const starGeometry = new THREE.ExtrudeGeometry(starShape, {
          depth: 0.2,
          bevelEnabled: true,
          bevelThickness: 0.025,
          bevelSize: 0.02,
          bevelSegments: 2,
          curveSegments: 2,
        });
        starGeometry.translate(0, 0, -0.1);
        const star = new THREE.Mesh(starGeometry, limeMaterial);
        group.add(star);

        // Finial bead.
        const bead = new THREE.Mesh(
          new THREE.SphereGeometry(12 * ICON_SCALE, 32, 20),
          limeMaterial,
        );
        bead.position.y = (ICON_CY - 196) * ICON_SCALE;
        group.add(bead);

        // Orbit rings, kept from the previous hero.
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0xffdf6d,
          transparent: true,
          opacity: 0.4,
        });
        const ringGeometry = new THREE.TorusGeometry(1.62, 0.01, 8, 160);
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.set(1.28, 0.18, 0.35);
        group.add(ring);

        const haloGeometry = new THREE.TorusGeometry(1.85, 0.007, 8, 160);
        const haloMaterial = new THREE.MeshBasicMaterial({
          color: 0xa3c6c0,
          transparent: true,
          opacity: 0.28,
        });
        const halo = new THREE.Mesh(haloGeometry, haloMaterial);
        halo.rotation.set(1.85, 0.6, -0.25);
        group.add(halo);

        const dustCount = 90;
        const positions = new Float32Array(dustCount * 3);
        for (let i = 0; i < dustCount; i++) {
          const radius = 2.0 + Math.random() * 1.4;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i * 3 + 1] = radius * Math.cos(phi) * 0.9;
          positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
        }
        const dustGeometry = new THREE.BufferGeometry();
        dustGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3),
        );
        const dustMaterial = new THREE.PointsMaterial({
          color: 0xffdf6d,
          size: 0.025,
          transparent: true,
          opacity: 0.55,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const dust = new THREE.Points(dustGeometry, dustMaterial);
        group.add(dust);

        const key = new THREE.DirectionalLight(0xe9ffb0, 1.8);
        key.position.set(4, 6, 6);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xff9a70, 0.75);
        rim.position.set(-5, -2, -3);
        scene.add(rim);
        const fill = new THREE.DirectionalLight(0xd6e6e2, 0.55);
        fill.position.set(-3, 2, 5);
        scene.add(fill);

        const pointer = { x: 0, y: 0 };
        const target = { x: 0, y: 0 };
        const onPointerMove = (event: PointerEvent) => {
          const rect = hostEl.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        };
        window.addEventListener("pointermove", onPointerMove, { passive: true });

        let inView = true;
        const observer = new IntersectionObserver(
          ([entry]) => {
            inView = entry.isIntersecting;
          },
          { threshold: 0.05 },
        );
        observer.observe(hostEl);

        const resizeObserver = new ResizeObserver(() => {
          const width = hostEl.clientWidth;
          const height = hostEl.clientHeight;
          if (!width || !height) return;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        });
        resizeObserver.observe(hostEl);

        const timer = new THREE.Timer();
        timer.connect(document);
        let frame = 0;
        let firstFrame = true;

        const tick = (timestamp?: number) => {
          frame = requestAnimationFrame(tick);
          timer.update(timestamp);
          const delta = Math.min(timer.getDelta(), 0.05);
          if (document.hidden || !inView) return;

          const time = timer.getElapsed();
          pointer.x += (target.x - pointer.x) * 0.045;
          pointer.y += (target.y - pointer.y) * 0.045;

          // A gentle sway keeps the flat crescent and star readable.
          group.rotation.y = Math.sin(time * 0.32) * 0.3 + pointer.x * 0.12;
          group.rotation.x = Math.sin(time * 0.45) * 0.035 + pointer.y * 0.07;
          group.position.y = -0.02 + Math.sin(time * 0.7) * 0.055;
          backdrop.rotation.z += delta * 0.025;
          backdropEdgeLines.rotation.z = backdrop.rotation.z;
          ring.rotation.z += delta * 0.09;
          halo.rotation.y -= delta * 0.06;
          dust.rotation.y -= delta * 0.03;

          camera.position.x = pointer.x * 0.22;
          camera.position.y = -pointer.y * 0.16;
          camera.lookAt(0, 0, 0);

          renderer.render(scene, camera);

          if (firstFrame) {
            firstFrame = false;
            canvas.style.opacity = "1";
            setRendered(true);
          }
        };
        tick();

        disposeScene = () => {
          cancelAnimationFrame(frame);
          timer.disconnect();
          observer.disconnect();
          resizeObserver.disconnect();
          window.removeEventListener("pointermove", onPointerMove);
          scene.environment = null;
          envTexture.dispose();
          pmrem.dispose();
          backdropGeometry.dispose();
          backdropEdges.dispose();
          staffGeometry.dispose();
          discGeometry.dispose();
          ringGeometries.forEach((geometry) => geometry.dispose());
          crescentGeometry.dispose();
          starGeometry.dispose();
          ringGeometry.dispose();
          haloGeometry.dispose();
          dustGeometry.dispose();
          woodTexture?.dispose();
          backdropMaterial.dispose();
          backdropEdgeMaterial.dispose();
          woodMaterial.dispose();
          silverMaterial.dispose();
          limeMaterial.dispose();
          ringMaterial.dispose();
          haloMaterial.dispose();
          dustMaterial.dispose();
          renderer.dispose();
          canvas.remove();
        };
      } catch {
        // WebGL unavailable or the chunk failed to load — keep the SVG + icon.
      }
    })();

    return () => {
      disposed = true;
      disposeScene();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="relative mx-auto aspect-square w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[440px]"
      aria-hidden="true"
    >
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <svg
        viewBox="0 0 200 200"
        className={`absolute inset-0 h-full w-full ${rendered ? "hidden" : ""}`}
      >
        <defs>
          <linearGradient id="hero-star" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f4fbf4" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#d1e3e0" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#a3c6c0" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="none"
          stroke="rgba(216,240,85,0.18)"
          strokeWidth="0.7"
        />
        <circle
          cx="100"
          cy="100"
          r="78"
          fill="none"
          stroke="rgba(163,198,192,0.22)"
          strokeWidth="0.6"
        />
        <g opacity="0.24">
          <polygon
            points={SVG_STAR}
            fill="url(#hero-star)"
            stroke="rgba(216,240,85,0.55)"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </g>
      </svg>
      <Image
        src="/brand/servemon-icon-compact.png"
        alt=""
        width={300}
        height={300}
        className={`absolute left-1/2 top-1/2 h-[58%] w-auto -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_22px_rgba(216,240,85,0.18)] ${
          rendered ? "hidden" : ""
        }`}
      />
    </div>
  );
}
