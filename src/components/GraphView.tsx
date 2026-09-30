import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Search,
  ShieldCheck,
  Play,
  Pause,
  FileText,
  Upload,
  Link2,
  Filter,
  Layers,
  ChevronRight,
  Activity,
  Zap,
  RefreshCw,
  CheckCircle2,
  ListFilter,
  Network
} from 'lucide-react';
import { GraphNode, ThemeType, ModeType } from '../types';
import { INITIAL_GRAPH_NODES, GRAPH_EDGES } from '../data/mockData';

interface GraphViewProps {
  onGenerateTestForNode: (nodeName: string) => void;
  theme: ThemeType;
  mode: ModeType;
  highlightNodeName?: string;
  nodes?: GraphNode[];
  edges?: [number, number][];
}

// Generate true 3D spherical constellation layout (Fibonacci Sphere & Concentric Shells)
const layoutCelestialSphere = (rawNodes: GraphNode[]): GraphNode[] => {
  const N = rawNodes.length;
  const R_OUTER = 2.45;
  const R_INNER = 1.35;

  return rawNodes.map((node, index) => {
    if (index === 0) {
      // Central anchor star at the core of the celestial sphere
      return { ...node, x: 0, y: 0, z: 0 };
    }

    // Distribute level 1 nodes on an inner core sphere, and other nodes on the outer spherical shell
    const isInner = node.level === 1 && index <= 5;
    const r = isInner ? R_INNER : R_OUTER;

    // Golden spiral / Fibonacci distribution on 3D sphere
    const k = index - 1;
    const total = N - 1 || 1;
    // Elevation y in [-0.92, 0.92] to avoid crowded poles
    const yNorm = 0.92 * (1 - (k / (total - 1 || 1)) * 2);
    const radiusAtY = Math.sqrt(Math.max(0.08, 1 - yNorm * yNorm));
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.399963 rad
    const theta = k * goldenAngle;

    const x = Math.cos(theta) * radiusAtY * r;
    const z = Math.sin(theta) * radiusAtY * r;
    const y = yNorm * r;

    return {
      ...node,
      x,
      y,
      z
    };
  });
};

export const GraphView: React.FC<GraphViewProps> = ({
  onGenerateTestForNode,
  theme,
  mode,
  highlightNodeName,
  nodes: propNodes,
  edges: propEdges = GRAPH_EDGES
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const rawList = propNodes && propNodes.length > 0 ? propNodes : INITIAL_GRAPH_NODES;
  const [nodes, setNodes] = useState<GraphNode[]>(() => layoutCelestialSphere(rawList));

  useEffect(() => {
    if (propNodes && propNodes.length > 0) {
      setNodes(layoutCelestialSphere(propNodes));
      setSelectedIndex(0);
    }
  }, [propNodes]);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [graphSearch, setGraphSearch] = useState<string>('');
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);

  // Right side panel state
  const [rightTab, setRightTab] = useState<'features' | 'inspector'>('features');
  const [featureSearch, setFeatureSearch] = useState<string>('');

  // References for list container and feature cards for auto-scroll synchronization
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const featureCardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Camera focus helper to smoothly orient the 3D celestial sphere to highlight selected node
  const focusCameraOnNode = useCallback((nodeIdx: number) => {
    setSelectedIndex(nodeIdx);
    const targetNode = nodes[nodeIdx];
    if (targetNode && cameraRef.current) {
      const r = Math.hypot(targetNode.x, targetNode.y, targetNode.z) || 1;
      const targetRy = -Math.atan2(targetNode.x, targetNode.z);
      const targetRx = Math.asin(Math.max(-0.95, Math.min(0.95, targetNode.y / r)));

      cameraRef.current.ry = targetRy;
      cameraRef.current.rx = targetRx;
      cameraRef.current.zoom = 1.25;
    }
  }, [nodes]);

  // Auto-scroll the corresponding card into view in the right panel when selectedIndex changes
  useEffect(() => {
    if (selectedIndex !== -1 && featureCardRefs.current[selectedIndex]) {
      const el = featureCardRefs.current[selectedIndex];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Compute connected nodes for a given node index
  const getConnectedNodesForIndex = useCallback((idx: number) => {
    const connectedIndices: number[] = [];
    propEdges.forEach(([a, b]) => {
      if (a === idx && !connectedIndices.includes(b)) connectedIndices.push(b);
      if (b === idx && !connectedIndices.includes(a)) connectedIndices.push(a);
    });
    return connectedIndices
      .map((i) => ({ index: i, node: nodes[i] }))
      .filter((item): item is { index: number; node: GraphNode } => Boolean(item.node));
  }, [nodes, propEdges]);

  // Compute node degrees (number of connected edges)
  const nodeDegrees = useMemo(() => {
    const deg = new Array(nodes.length).fill(0);
    propEdges.forEach(([a, b]) => {
      if (a < deg.length) deg[a]++;
      if (b < deg.length) deg[b]++;
    });
    return deg;
  }, [nodes.length, propEdges]);

  const maxDegree = useMemo(() => Math.max(...nodeDegrees, 1), [nodeDegrees]);

  // Filtered feature list for the right panel statistical list
  const filteredFeatureList = useMemo(() => {
    let list = nodes.map((node, index) => ({
      index,
      node,
      degree: nodeDegrees[index] || 1,
      connected: getConnectedNodesForIndex(index)
    }));

    if (featureSearch.trim()) {
      const q = featureSearch.toLowerCase();
      list = list.filter(
        (item) =>
          item.node.name.toLowerCase().includes(q) ||
          item.node.description.toLowerCase().includes(q) ||
          item.node.category.toLowerCase().includes(q) ||
          item.connected.some((c) => c.node.name.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => b.degree - a.degree);

    return list;
  }, [nodes, nodeDegrees, getConnectedNodesForIndex, featureSearch]);

  // Pre-generate rich celestial starlight point cluster distributed across the 3D Fibonacci sphere shell and volume
  const sphereParticles = useMemo(() => {
    const pts: {
      x: number;
      y: number;
      z: number;
      size: number;
      alpha: number;
      speed: number;
      phase: number;
      isSurface: boolean;
      color: string;
    }[] = [];

    const R_SPHERE = 2.45;
    const total = 320;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.399963 rad

    for (let i = 0; i < total; i++) {
      // 80% on the outer Fibonacci spherical surface, 20% on inner concentric core shell
      const isShell = i < total * 0.8;
      const r = isShell
        ? R_SPHERE * (0.97 + (Math.sin(i * 11.7) * 0.04))
        : 0.6 + Math.random() * (R_SPHERE * 0.7);

      // Fibonacci sphere distribution ensures perfectly uniform coverage across the sphere
      const yNorm = 1 - (i / (total - 1)) * 2; // -1 to +1
      const radiusAtY = Math.sqrt(Math.max(0.02, 1 - yNorm * yNorm));
      const theta = i * goldenAngle;

      const x = Math.cos(theta) * radiusAtY * r;
      const z = Math.sin(theta) * radiusAtY * r;
      const y = yNorm * r;

      // Color variation: cosmic cyan, starlight white, pale indigo
      const colorTypes = ['#38bdf8', '#818cf8', '#e0f2fe', '#c7d2fe', '#a5f3fc'];
      const color = colorTypes[i % colorTypes.length];

      pts.push({
        x,
        y,
        z,
        size: isShell ? 2.0 + (i % 4) * 0.8 : 1.4 + Math.random() * 1.0,
        alpha: 0.35 + (i % 6) * 0.1,
        speed: 0.6 + Math.random() * 1.4,
        phase: (i * 1.9) % (Math.PI * 2),
        isSurface: isShell,
        color
      });
    }
    return pts;
  }, []);

  // 3D camera state
  const cameraRef = useRef({
    rx: -0.28,
    ry: 0.35,
    zoom: 1.0,
    dragging: false,
    moved: false,
    px: 0,
    py: 0,
    hoverIndex: -1
  });

  const selectedNode = nodes[selectedIndex] || nodes[0];

  useEffect(() => {
    if (highlightNodeName) {
      const idx = nodes.findIndex((n) => n.name.includes(highlightNodeName) || highlightNodeName.includes(n.name));
      if (idx >= 0) setSelectedIndex(idx);
    }
  }, [highlightNodeName, nodes]);

  // Projected nodes cache for hit testing
  const projectedRef = useRef<{ x: number; y: number; z: number; scale: number; index: number }[]>([]);

  // Animation frame loop for continuous celestial star rendering, gentle rotation, and starlight twinkling
  useEffect(() => {
    let animId: number;

    const render = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Handle DPI scaling
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(bounds.width);
      const h = Math.round(bounds.height);
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Auto rotation update
      const cam = cameraRef.current;
      if (isAutoRotating && !cam.dragging) {
        cam.ry += 0.0018;
      }

      ctx.clearRect(0, 0, w, h);

      // Deep space starry cosmos background - always keep deep space dark cosmos
      // as requested: "切换白天模式的时候这里的颜色不用换，不然白色背景看起来丑"
      const isDark = true;
      const cxCenter = w * 0.5;
      const cyCenter = h * 0.5;

      const bgGrad = ctx.createRadialGradient(
        cxCenter,
        cyCenter,
        20,
        cxCenter,
        cyCenter,
        Math.max(w, h) * 0.75
      );

      bgGrad.addColorStop(0, '#0a1026'); // Deep cosmic indigo center
      bgGrad.addColorStop(0.45, '#040714'); // Mid cosmos void
      bgGrad.addColorStop(1, '#020308'); // Deep space edge

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Dynamic theme colors
      const accentColor =
        theme === 'spruce' ? '#10b981' : theme === 'amber' ? '#f59e0b' : '#6366f1';
      const cyanGlow = '#06b6d4';

      // Camera rotation matrix
      const { rx, ry, zoom } = cam;
      const cosY = Math.cos(ry),
        sinY = Math.sin(ry);
      const cosX = Math.cos(rx),
        sinX = Math.sin(rx);

      const baseScale = Math.min(w, h) * 0.175 * zoom;

      // Projection helper: transforms 3D point (x, y, z) into 2D canvas coordinates and depth perspective
      const project3D = (x: number, y: number, z: number) => {
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const perspective = 5.2 / (5.2 - z2);
        return {
          x: cxCenter + x1 * baseScale * perspective,
          y: cyCenter - y2 * baseScale * perspective,
          z: z2,
          scale: perspective
        };
      };

      // 1. Draw subtle celestial sphere background atmosphere halo
      const sphereRadius2D = baseScale * 2.45;
      const globeGrad = ctx.createRadialGradient(cxCenter, cyCenter, 0, cxCenter, cyCenter, sphereRadius2D);
      if (isDark) {
        globeGrad.addColorStop(0, 'rgba(30, 58, 138, 0.12)');
        globeGrad.addColorStop(0.7, 'rgba(67, 56, 202, 0.04)');
        globeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        globeGrad.addColorStop(0, 'rgba(99, 102, 241, 0.06)');
        globeGrad.addColorStop(0.75, 'rgba(99, 102, 241, 0.02)');
        globeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      ctx.fillStyle = globeGrad;
      ctx.beginPath();
      ctx.arc(cxCenter, cyCenter, sphereRadius2D, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Rotating 3D Starlight Cloud (Dense Fibonacci star glints shaping the sphere)
      sphereParticles.forEach((star) => {
        const p = project3D(star.x, star.y, star.z);
        const twinkle = Math.sin(time * 0.003 * star.speed + star.phase);
        const depthNorm = Math.max(0, Math.min(1, (p.z + 2.5) / 5.0)); // 0 (back) to 1 (front)
        const curAlpha = Math.max(0.12, Math.min(0.9, (star.alpha + twinkle * 0.25) * (0.3 + depthNorm * 0.7)));

        // Draw stardust star as a delicate 4-point diamond star glint
        const starLen = Math.max(1.2, star.size * p.scale * (0.7 + depthNorm * 0.6));
        const innerWidth = Math.max(0.4, starLen * 0.22);

        ctx.fillStyle = star.color;
        ctx.globalAlpha = curAlpha;

        // Diamond starburst glint path
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - starLen);
        ctx.quadraticCurveTo(p.x, p.y - innerWidth, p.x + innerWidth, p.y);
        ctx.quadraticCurveTo(p.x, p.y + innerWidth, p.x, p.y + starLen);
        ctx.quadraticCurveTo(p.x, p.y + innerWidth, p.x - innerWidth, p.y);
        ctx.quadraticCurveTo(p.x, p.y - innerWidth, p.x, p.y - starLen);
        ctx.closePath();
        ctx.fill();

        // Delicate center pinpoint
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.4, innerWidth * 0.7), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 4. Project Graph Nodes
      const projected = nodes.map((node, index) => {
        const p = project3D(node.x, node.y, node.z);
        return {
          x: p.x,
          y: p.y,
          z: p.z,
          scale: p.scale,
          index
        };
      });
      projectedRef.current = projected;

      // 5. Draw Constellation Connecting Edges with 3D Depth Attenuation
      propEdges.forEach(([a, b], edgeIdx) => {
        if (a >= projected.length || b >= projected.length) return;
        const p1 = projected[a];
        const p2 = projected[b];

        const isConnectedToSelected = a === selectedIndex || b === selectedIndex;
        const degA = nodeDegrees[a] || 1;
        const degB = nodeDegrees[b] || 1;
        const combinedBrightness = ((degA + degB) / (2 * maxDegree));
        const avgZ = (p1.z + p2.z) * 0.5;
        const depthNorm = Math.max(0.1, Math.min(1.0, (avgZ + 2.5) / 5.0));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        if (isConnectedToSelected) {
          // Prominent active energy beam
          const edgeGrad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          edgeGrad.addColorStop(0, cyanGlow);
          edgeGrad.addColorStop(1, accentColor);
          ctx.strokeStyle = edgeGrad;
          ctx.lineWidth = 1.8 + depthNorm * 1.2;
          ctx.globalAlpha = 0.5 + depthNorm * 0.5;
        } else {
          // Spherical constellation filament
          ctx.strokeStyle = avgZ >= 0 ? (isDark ? '#6366f1' : '#4f46e5') : (isDark ? '#334155' : '#94a3b8');
          ctx.lineWidth = (0.7 + combinedBrightness * 0.9) * (0.6 + depthNorm * 0.7);
          ctx.globalAlpha = isDark
            ? (0.12 + combinedBrightness * 0.3) * (0.4 + depthNorm * 0.7)
            : (0.18 + combinedBrightness * 0.3) * (0.4 + depthNorm * 0.7);
        }
        ctx.stroke();

        // Animated traveling starlight photon on connected edges
        const t = (time * 0.0008 + edgeIdx * 0.22) % 1.0;
        const photonX = p1.x + (p2.x - p1.x) * t;
        const photonY = p1.y + (p2.y - p1.y) * t;
        const photonAlpha = isConnectedToSelected ? 0.95 : (0.35 + combinedBrightness * 0.45) * depthNorm;

        ctx.fillStyle = isConnectedToSelected ? '#ffffff' : (avgZ >= 0 ? '#38bdf8' : '#818cf8');
        ctx.globalAlpha = photonAlpha;
        ctx.beginPath();
        ctx.arc(photonX, photonY, (isConnectedToSelected ? 2.2 : 1.3) * (0.7 + depthNorm * 0.6), 0, Math.PI * 2);
        ctx.fill();
      });

      // 6. Draw Glowing Sparkling Celestial Stars ("真实闪闪的星星样式，节点尺寸放大，连接越多越璀璨")
      const sorted = [...projected].sort((a, b) => a.z - b.z);

      sorted.forEach((p) => {
        const node = nodes[p.index];
        const isSelected = p.index === selectedIndex;
        const isHovered = p.index === cam.hoverIndex;
        const deg = nodeDegrees[p.index] || 1;
        const depthNorm = Math.max(0.1, Math.min(1.0, (p.z + 2.5) / 5.0));

        // Dynamic twinkling sparkle modulation
        const starTwinkle = 0.82 + Math.sin(time * 0.0032 + p.index * 1.7) * 0.28;

        // Brightness factor based on connection degree and 3D depth
        const degreeBrightness = 0.4 + (deg / maxDegree) * 0.6;
        const finalBrightness = degreeBrightness * (0.55 + depthNorm * 0.55) * starTwinkle;

        const isMatchSearch =
          !graphSearch || node.name.toLowerCase().includes(graphSearch.toLowerCase());

        // Base radius for star core
        const coreBaseRadius = 3.8 + (deg / maxDegree) * 6.2;
        const radius = coreBaseRadius * p.scale * (isSelected ? 1.35 : isHovered ? 1.2 : 1.0);

        ctx.globalAlpha = isMatchSearch ? Math.min(1.0, 0.45 + depthNorm * 0.55) : 0.15;

        // Halo color mapping
        let starThemeRgb = '99, 102, 241'; // Default indigo
        let starAccentHex = '#818cf8';
        if (node.category === 'risk') { starThemeRgb = '239, 68, 68'; starAccentHex = '#f87171'; }
        else if (node.category === 'protocol') { starThemeRgb = '6, 182, 212'; starAccentHex = '#38bdf8'; }
        else if (node.category === 'defect') { starThemeRgb = '245, 158, 11'; starAccentHex = '#fbbf24'; }
        else if (node.category === 'test') { starThemeRgb = '16, 185, 129'; starAccentHex = '#34d399'; }

        // Compact Starlight Corona Halo
        const haloMultiplier = (isSelected ? 3.0 : 1.8 + (deg / maxDegree) * 2.2) * (0.6 + depthNorm * 0.4);
        const haloRadius = radius * haloMultiplier;

        const glowGrad = ctx.createRadialGradient(p.x, p.y, radius * 0.15, p.x, p.y, haloRadius);
        glowGrad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * starTwinkle})`);
        glowGrad.addColorStop(0.3, `rgba(${starThemeRgb}, ${0.55 * finalBrightness})`);
        glowGrad.addColorStop(0.7, `rgba(${starThemeRgb}, ${0.12 * finalBrightness})`);
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, haloRadius, 0, Math.PI * 2);
        ctx.fill();

        // --- REALISTIC SPARKLING STAR GRAPHICS ---
        // 1. Horizontal Anamorphic Lens Flare Line (精细超薄亮刺)
        const streakLen = radius * (2.2 + (deg / maxDegree) * 2.8) * (isSelected ? 1.3 : 1.0) * starTwinkle;
        const streakGrad = ctx.createLinearGradient(p.x - streakLen, p.y, p.x + streakLen, p.y);
        streakGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        streakGrad.addColorStop(0.4, `rgba(${starThemeRgb}, ${0.75 * finalBrightness})`);
        streakGrad.addColorStop(0.5, '#ffffff');
        streakGrad.addColorStop(0.6, `rgba(${starThemeRgb}, ${0.75 * finalBrightness})`);
        streakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.strokeStyle = streakGrad;
        ctx.lineWidth = Math.max(0.8, radius * 0.16);
        ctx.beginPath();
        ctx.moveTo(p.x - streakLen, p.y);
        ctx.lineTo(p.x + streakLen, p.y);
        ctx.stroke();

        // Vertical Anamorphic Lens Flare Line
        const vStreakLen = streakLen * 0.5;
        const vStreakGrad = ctx.createLinearGradient(p.x, p.y - vStreakLen, p.x, p.y + vStreakLen);
        vStreakGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        vStreakGrad.addColorStop(0.5, '#ffffff');
        vStreakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.strokeStyle = vStreakGrad;
        ctx.lineWidth = Math.max(0.7, radius * 0.14);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - vStreakLen);
        ctx.lineTo(p.x, p.y + vStreakLen);
        ctx.stroke();

        // 2. Diamond Starburst Flare (精致小巧芒星)
        const spikeLen = radius * (1.8 + (deg / maxDegree) * 2.2) * (isSelected ? 1.35 : 1.0) * starTwinkle;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(time * 0.0003 + p.index * 0.5);

        const drawStarPoints = (len: number, width: number, opacity: number, fillColor: string) => {
          ctx.fillStyle = fillColor;
          ctx.beginPath();
          ctx.moveTo(0, -len);
          ctx.quadraticCurveTo(0, -width, width, 0);
          ctx.quadraticCurveTo(0, width, 0, len);
          ctx.quadraticCurveTo(0, width, -width, 0);
          ctx.quadraticCurveTo(0, -width, 0, -len);
          ctx.closePath();
          ctx.fill();
        };

        // Primary Cross Starburst
        drawStarPoints(spikeLen, Math.max(0.8, radius * 0.28), Math.min(1.0, 0.9 * finalBrightness), '#ffffff');

        // Secondary Diagonal Starburst
        if (deg >= 2 || isSelected) {
          ctx.rotate(Math.PI / 4);
          drawStarPoints(spikeLen * 0.55, Math.max(0.6, radius * 0.2), Math.min(1.0, 0.65 * finalBrightness), `rgb(${starThemeRgb})`);
        }
        ctx.restore();

        // 3. Pinpoint Starlight Nucleus (极亮微光核)
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.min(2.2, Math.max(0.8, radius * 0.18)), 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Selected Target Radar Ring
        if (isSelected) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 2.2, 0, Math.PI * 2);
          ctx.strokeStyle = cyanGlow;
          ctx.lineWidth = 1.8;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.restore();
        }

        // Star Labels: High contrast typography with depth awareness
        const shouldShowLabel = isSelected || isHovered || deg >= 2 || p.z >= -0.2;
        if (shouldShowLabel) {
          ctx.font = `${isSelected ? 'bold 13px' : '11px'} system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';

          // Text halo for high contrast against cosmos background
          ctx.strokeStyle = isDark ? '#02040a' : '#ffffff';
          ctx.lineWidth = 3;
          ctx.strokeText(node.name, p.x, p.y + radius + 10);

          ctx.fillStyle = isSelected
            ? (isDark ? '#38bdf8' : '#0284c7')
            : isDark
            ? (p.z >= 0 ? '#f1f5f9' : '#94a3b8')
            : (p.z >= 0 ? '#0f172a' : '#475569');
          ctx.fillText(node.name, p.x, p.y + radius + 10);

          // Star connection badge (e.g. ✦ 5 条关联)
          if (isSelected || deg >= 3) {
            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = isDark ? starAccentHex : '#475569';
            ctx.fillText(`✦ ${deg} 条关联`, p.x, p.y + radius + 25);
          }
        }
      });

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [nodes, selectedIndex, graphSearch, mode, theme, propEdges, nodeDegrees, maxDegree, isAutoRotating, sphereParticles]);

  // Pointer interactions: drag to rotate, wheel to zoom, click to select
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cam = cameraRef.current;
    cam.dragging = true;
    cam.moved = false;
    cam.px = e.clientX;
    cam.py = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cam = cameraRef.current;
    if (cam.dragging) {
      const dx = e.clientX - cam.px;
      const dy = e.clientY - cam.py;
      if (Math.abs(dx) + Math.abs(dy) > 3) cam.moved = true;

      cam.ry += dx * 0.007;
      cam.rx += dy * 0.007;
      cam.rx = Math.max(-1.35, Math.min(1.35, cam.rx));
      cam.px = e.clientX;
      cam.py = e.clientY;
    } else {
      // Hover detection
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let hovered = -1;
      projectedRef.current.forEach((p) => {
        const dist = Math.hypot(p.x - mx, p.y - my);
        if (dist < 20) hovered = p.index;
      });
      cam.hoverIndex = hovered;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cam = cameraRef.current;
    cam.dragging = false;

    if (!cam.moved) {
      // Hit testing to select star
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      let nearest: { index: number; dist: number } | null = null;
      projectedRef.current.forEach((p) => {
        const dist = Math.hypot(p.x - clickX, p.y - clickY);
        if (dist < 26 && (!nearest || dist < nearest.dist)) {
          nearest = { index: p.index, dist };
        }
      });

      if (nearest) {
        focusCameraOnNode(nearest.index);
        setRightTab('features');
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const cam = cameraRef.current;
    const delta = e.deltaY > 0 ? 0.92 : 1.08;
    cam.zoom = Math.max(0.55, Math.min(2.4, cam.zoom * delta));
  };

  return (
    <div id="qflow-graph-view" className="h-full w-full max-w-[1920px] mx-auto min-h-0 flex flex-col lg:flex-row gap-3 lg:gap-5">
      {/* 3D Celestial Graph Canvas Container */}
      <div
        ref={containerRef}
        className={`flex-1 min-h-0 min-w-0 flex flex-col rounded-2xl border overflow-hidden relative shadow-xl bg-[#020308] ${
          mode === 'dark' ? 'border-slate-800' : 'border-slate-300'
        }`}
      >
        {/* Canvas Toolbar overlay */}
        <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          {/* Search inside Celestial Graph */}
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md border border-slate-700/80 bg-slate-900/80 text-white text-xs shadow-lg">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={graphSearch}
              onChange={(e) => setGraphSearch(e.target.value)}
              placeholder="搜索星图节点..."
              className="bg-transparent border-0 outline-none text-xs w-28 sm:w-40 text-white placeholder-slate-400 font-semibold"
            />
          </div>

          {/* Quick Legend Pills removed */}
        </div>

        {/* 3D Celestial Canvas */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          className="w-full h-full cursor-grab active:cursor-grabbing block select-none bg-[#020308]"
        />
      </div>

      {/* Right AI Document Analysis & Feature-Node Correlation Linkage Panel */}
      <div
        className={`w-full lg:w-80 xl:w-[420px] shrink-0 min-h-0 p-4 sm:p-5 rounded-2xl border flex flex-col overflow-hidden ${
          mode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
        } shadow-xl relative`}
      >
        {/* Document Parsing Status Header */}
        <div className="shrink-0 pb-3 border-b border-inherit space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7.5 h-7.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-1.5">
                  <span>项目全量文档关联知识图谱</span>
                </h3>
                <p className="text-[11px] text-slate-700 dark:text-slate-400 font-medium">基于全量文档 AI 智能解析 · 3D 星图穿透联动</p>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className={`grid grid-cols-2 gap-1 p-1 rounded-xl border ${
            mode === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-300'
          }`}>
            <button
              onClick={() => setRightTab('features')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                rightTab === 'features'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>全域关联 ({nodes.length})</span>
            </button>
            <button
              onClick={() => setRightTab('inspector')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                rightTab === 'inspector'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>光点分析</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Functional Points & Associated Linkage Statistical List */}
        {rightTab === 'features' && (
          <div className="flex-1 min-h-0 flex flex-col pt-3 space-y-3">
            {/* Search Bar */}
            <div className="shrink-0">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
                mode === 'dark' ? 'bg-slate-950/60 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-950'
              }`}>
                <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={featureSearch}
                  onChange={(e) => setFeatureSearch(e.target.value)}
                  placeholder="搜索项目全域功能点或关联依赖..."
                  className="bg-transparent border-0 outline-none w-full text-xs placeholder-slate-500 font-semibold"
                />
                {featureSearch && (
                  <button onClick={() => setFeatureSearch('')} className="text-xs text-slate-400 hover:text-white">✕</button>
                )}
              </div>
            </div>

            {/* Feature Statistical List Container with Ref */}
            <div ref={listContainerRef} className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2.5">
              {filteredFeatureList.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-medium">
                  未查找到匹配的功能节点
                </div>
              ) : (
                filteredFeatureList.map(({ index: nodeIdx, node, degree, connected }) => {
                  const isSelected = selectedIndex === nodeIdx;

                  let categoryColor = mode === 'dark'
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                    : 'bg-indigo-100 border-indigo-300 text-indigo-950 font-bold';
                  if (node.category === 'protocol') {
                    categoryColor = mode === 'dark'
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                      : 'bg-sky-100 border-sky-300 text-sky-950 font-bold';
                  }
                  if (node.category === 'risk') {
                    categoryColor = mode === 'dark'
                      ? 'bg-red-500/20 border-red-500/40 text-red-300'
                      : 'bg-rose-100 border-rose-300 text-rose-950 font-bold';
                  }
                  if (node.category === 'test') {
                    categoryColor = mode === 'dark'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold';
                  }

                  const docProvenance =
                    node.category === 'core' ? '《项目系统架构设计规约》§4.1' :
                    node.category === 'protocol' ? '《gRPC 通信协议与服务接口规范》' :
                    node.category === 'risk' ? '《风控合规与三要素校验要求》' :
                    '《自动化测试与用例资产库》';

                  return (
                    <div
                      key={nodeIdx}
                      ref={(el) => {
                        featureCardRefs.current[nodeIdx] = el;
                      }}
                      onClick={() => focusCameraOnNode(nodeIdx)}
                      className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer relative group ${
                        isSelected
                          ? mode === 'dark'
                            ? 'border-indigo-500 bg-indigo-950/40 shadow-lg ring-2 ring-indigo-500/40 scale-[1.01]'
                            : 'border-indigo-500 bg-indigo-50/90 shadow-md ring-2 ring-indigo-500/30 scale-[1.01]'
                          : mode === 'dark'
                          ? 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                      }`}
                    >
                      {/* Top Header: Name + Badge + Degree */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${categoryColor}`}>
                              {node.category === 'core' ? '核心业务' : node.category === 'protocol' ? '协议通信' : node.category === 'risk' ? '风险控制' : '测试资产'}
                            </span>
                            <h4 className="text-xs font-bold text-slate-950 dark:text-white truncate">
                              {node.name}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                            {node.description}
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            focusCameraOnNode(nodeIdx);
                          }}
                          title="在 3D 星芒球图精准旋转聚焦此节点"
                          className={`p-1.5 rounded-lg border text-[10px] font-bold shrink-0 transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : mode === 'dark'
                              ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600 hover:text-white'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 font-bold'
                          }`}
                        >
                          <Zap className="w-3 h-3" />
                          <span>{isSelected ? '星芒已选中' : '星光跳转'}</span>
                        </button>
                      </div>

                      {/* Document Provenance Label */}
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                        <FileText className="w-3 h-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
                        <span className="truncate">文档溯源：{docProvenance}</span>
                      </div>

                      {/* Associated Related Features Section (关联的相关功能) */}
                      <div className={`mt-2.5 pt-2 border-t text-[11px] ${mode === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-1 text-[11px] font-bold text-slate-800 dark:text-slate-300">
                          <span className="flex items-center gap-1">
                            <Link2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            跨模块关联依赖 ({connected.length})
                          </span>
                          <span className="font-mono text-indigo-700 dark:text-indigo-400 font-semibold">{node.testCount} 条覆盖用例</span>
                        </div>

                        {/* Interactive Chips for Linked Features */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {connected.length === 0 ? (
                            <span className="text-[11px] text-slate-500 italic">全域独立节点（无交叉链路）</span>
                          ) : (
                            connected.map(({ index: connIdx, node: connNode }) => (
                              <button
                                key={connIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  focusCameraOnNode(connIdx);
                                }}
                                title={`点击联动跳转到关联星芒：${connNode.name}`}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all flex items-center gap-1.5 ${
                                  selectedIndex === connIdx
                                    ? mode === 'dark'
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold shadow-xs'
                                      : 'bg-amber-100 text-amber-950 border-amber-400 font-bold shadow-2xs ring-1 ring-amber-400/50'
                                    : mode === 'dark'
                                    ? 'bg-slate-900 text-slate-200 border-slate-700 hover:border-indigo-400 hover:text-indigo-300'
                                    : 'bg-white text-slate-900 border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/80 shadow-2xs hover:text-indigo-900'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  selectedIndex === connIdx ? 'bg-amber-500' : 'bg-indigo-600 dark:bg-indigo-400'
                                }`}></span>
                                <span className="truncate max-w-[120px]">{connNode.name}</span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Node Entity Inspector */}
        {rightTab === 'inspector' && (
          <div className="flex-1 min-h-0 overflow-y-auto pt-3 space-y-4">
            <div className="border-b pb-3 border-inherit">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  当前聚焦星图节点
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <span>{selectedNode.name}</span>
              </h2>
              <p className="text-xs text-slate-950 dark:text-slate-400 mt-1 leading-relaxed font-medium">
                {selectedNode.description}
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-3 rounded-xl border ${mode === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'}`}>
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold block">直接星系连结</span>
                <b className="text-sm text-indigo-700 dark:text-indigo-400 mt-0.5 block font-mono font-bold">
                  {nodeDegrees[selectedIndex] || 1} 条星链
                </b>
              </div>
              <div className={`p-3 rounded-xl border ${mode === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'}`}>
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold block">关联用例覆盖</span>
                <b className="text-sm text-emerald-700 dark:text-emerald-400 mt-0.5 block font-mono font-bold">{selectedNode.testCount} 条</b>
              </div>
            </div>

            {/* Connected Features List */}
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block mb-2">相连的业务节点（点击星图转动联动）：</span>
              <div className="space-y-1.5">
                {getConnectedNodesForIndex(selectedIndex).map(({ index: targetIdx, node: targetNode }) => (
                  <button
                    key={targetIdx}
                    onClick={() => focusCameraOnNode(targetIdx)}
                    className={`w-full p-2.5 rounded-lg border text-xs flex items-center justify-between text-left transition-all ${
                      mode === 'dark'
                        ? 'bg-slate-950/40 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 text-slate-200'
                        : 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/60 text-slate-900 shadow-2xs'
                    }`}
                  >
                    <span className="font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                      {targetNode.name}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-indigo-700 dark:text-indigo-400">
                      {targetNode.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

