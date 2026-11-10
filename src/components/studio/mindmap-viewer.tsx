"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Maximize2, Minus, Plus } from "lucide-react";
import { MINDMAP, type DemoMindmapNode } from "@/lib/demo-data";
import styles from "./mindmap.module.css";

const NODE_W = 228;
const NODE_H = 46;
const X_GAP = 92;
const Y_GAP = 16;

const EDGE_COLORS = ["#5fb8a8", "#a9b6dd", "#ccd3ea"];

type LaidNode = {
  id: string;
  label: string;
  depth: number;
  x: number;
  y: number;
  hasChildren: boolean;
  expanded: boolean;
};

type LaidEdge = {
  id: string;
  depth: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

function collectExpandable(node: DemoMindmapNode, set: Set<string>) {
  if (node.children?.length) {
    set.add(node.id);
    for (const child of node.children) collectExpandable(child, set);
  }
  return set;
}

function edgePath(edge: LaidEdge) {
  const dx = Math.max(30, (edge.x2 - edge.x1) * 0.5);
  return `M ${edge.x1} ${edge.y1} C ${edge.x1 + dx} ${edge.y1}, ${edge.x2 - dx} ${edge.y2}, ${edge.x2} ${edge.y2}`;
}

function MindMapCanvas({ root }: { root: DemoMindmapNode }) {
  const [expanded, setExpanded] = useState<Set<string>>(() => collectExpandable(root, new Set()));
  const [zoom, setZoom] = useState(1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  const { nodes, edges, width, height } = useMemo(() => {
    const laidNodes: LaidNode[] = [];
    let leafSlot = 0;
    let maxDepth = 0;

    const walk = (node: DemoMindmapNode, depth: number): number => {
      maxDepth = Math.max(maxDepth, depth);
      const children = expanded.has(node.id) ? node.children ?? [] : [];
      const childYs = children.map((child) => walk(child, depth + 1));
      const y = childYs.length ? (childYs[0] + childYs[childYs.length - 1]) / 2 : leafSlot++ * (NODE_H + Y_GAP);
      laidNodes.push({
        id: node.id,
        label: node.label,
        depth,
        x: depth * (NODE_W + X_GAP),
        y,
        hasChildren: Boolean(node.children?.length),
        expanded: expanded.has(node.id),
      });
      return y;
    };
    walk(root, 0);

    const byId = new Map(laidNodes.map((node) => [node.id, node]));
    const laidEdges: LaidEdge[] = [];
    const link = (node: DemoMindmapNode) => {
      if (!expanded.has(node.id)) return;
      for (const child of node.children ?? []) {
        const parent = byId.get(node.id);
        const childNode = byId.get(child.id);
        if (parent && childNode) {
          laidEdges.push({
            id: `${node.id}->${child.id}`,
            depth: parent.depth,
            x1: parent.x + NODE_W,
            y1: parent.y + NODE_H / 2,
            x2: childNode.x,
            y2: childNode.y + NODE_H / 2,
          });
        }
        link(child);
      }
    };
    link(root);

    return {
      nodes: laidNodes,
      edges: laidEdges,
      width: (maxDepth + 1) * NODE_W + maxDepth * X_GAP,
      height: Math.max(leafSlot, 1) * (NODE_H + Y_GAP) - Y_GAP,
    };
  }, [root, expanded]);

  const fit = useCallback(() => {
    const element = wrapRef.current;
    if (!element || width === 0) return;
    const scale = Math.min(1.05, Math.max(0.45, (element.clientWidth - 40) / width));
    setZoom(Math.round(scale * 100) / 100);
  }, [width]);

  useEffect(() => {
    const frame = requestAnimationFrame(fit);
    return () => cancelAnimationFrame(frame);
  }, [fit]);

  function toggle(id: string) {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function zoomBy(delta: number) {
    setZoom((value) => Math.round(Math.min(1.8, Math.max(0.4, value + delta)) * 100) / 100);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const element = wrapRef.current;
    if (!element || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button")) return;
    drag.current = { x: event.clientX, y: event.clientY, left: element.scrollLeft, top: element.scrollTop };
    element.setPointerCapture(event.pointerId);
    element.dataset.dragging = "true";
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const element = wrapRef.current;
    if (!element || !drag.current) return;
    element.scrollLeft = drag.current.left - (event.clientX - drag.current.x);
    element.scrollTop = drag.current.top - (event.clientY - drag.current.y);
  }

  function onPointerUp() {
    drag.current = null;
    if (wrapRef.current) delete wrapRef.current.dataset.dragging;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.stage}>
        <div
          ref={wrapRef}
          className={styles.canvasWrap}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className={styles.canvas} style={{ width: width * zoom, height: height * zoom }}>
            <div className={styles.canvasInner} style={{ width, height, transform: `scale(${zoom})` }}>
              <svg className={styles.edges} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
                <defs>
                  {EDGE_COLORS.map((color, index) => (
                    <marker
                      key={color}
                      id={`mm-arrow-${index}`}
                      viewBox="0 0 10 10"
                      refX="8.5"
                      refY="5"
                      markerWidth="5.5"
                      markerHeight="5.5"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 9 5 L 0 9 z" fill={color} />
                    </marker>
                  ))}
                </defs>
                {edges.map((edge) => {
                  const tone = Math.min(edge.depth, EDGE_COLORS.length - 1);
                  return (
                    <path
                      key={edge.id}
                      d={edgePath(edge)}
                      fill="none"
                      stroke={EDGE_COLORS[tone]}
                      strokeWidth={edge.depth === 0 ? 2.2 : 1.6}
                      markerEnd={`url(#mm-arrow-${tone})`}
                    />
                  );
                })}
              </svg>
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={styles.node}
                  data-depth={Math.min(node.depth, 2)}
                  style={{ left: node.x, top: node.y, width: NODE_W, height: NODE_H }}
                >
                  <span className={styles.nodeLabel}>{node.label}</span>
                  {node.hasChildren && (
                    <button
                      type="button"
                      className={`${styles.toggle} ${node.expanded ? styles.toggleOpen : ""}`}
                      aria-expanded={node.expanded}
                      aria-label={node.expanded ? `Tutup cabang ${node.label}` : `Buka cabang ${node.label}`}
                      onClick={() => toggle(node.id)}
                    >
                      <ChevronRight size={13} className={styles.toggleIcon} aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.controls}>
          <button type="button" onClick={() => zoomBy(-0.15)} aria-label="Zum keluar"><Minus size={14} aria-hidden="true" /></button>
          <button type="button" onClick={() => zoomBy(0.15)} aria-label="Zum masuk"><Plus size={14} aria-hidden="true" /></button>
          <button type="button" onClick={fit} aria-label="Muatkan peta minda"><Maximize2 size={14} aria-hidden="true" /></button>
        </div>
      </div>
      <p className={styles.hint}>Ketik anak panah untuk buka atau tutup cabang · Seret peta untuk menatal</p>
    </div>
  );
}

export function MindMapViewer({ root = MINDMAP }: { root?: DemoMindmapNode } = {}) {
  return <MindMapCanvas key={root.id} root={root} />;
}
