import { useEffect, useRef } from "react";
import { Process } from "./ProcessInput";
import { Card } from "@/components/ui/card";

interface ResourceGraphProps {
  processes: Process[];
  cycles: string[][];
}

export const ResourceGraph = ({ processes, cycles }: ResourceGraphProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (processes.length === 0) {
      ctx.fillStyle = "hsl(var(--muted-foreground))";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        "Add processes to visualize the resource allocation graph",
        canvas.width / 2,
        canvas.height / 2
      );
      return;
    }

    // Collect all unique resources
    const resources = new Set<string>();
    processes.forEach((p) => {
      p.holding.forEach((r) => resources.add(r));
      p.requesting.forEach((r) => resources.add(r));
    });

    // Calculate positions
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;

    const processPositions: Map<string, { x: number; y: number }> = new Map();
    const resourcePositions: Map<string, { x: number; y: number }> = new Map();

    // Position processes in a circle
    processes.forEach((process, index) => {
      const angle = (index / processes.length) * 2 * Math.PI - Math.PI / 2;
      processPositions.set(process.id, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    });

    // Position resources in an inner circle
    const resourceArray = Array.from(resources);
    resourceArray.forEach((resource, index) => {
      const angle = (index / resourceArray.length) * 2 * Math.PI - Math.PI / 2;
      const innerRadius = radius * 0.5;
      resourcePositions.set(resource, {
        x: centerX + innerRadius * Math.cos(angle),
        y: centerY + innerRadius * Math.sin(angle),
      });
    });

    // Check if a node is in any cycle
    const nodesInCycles = new Set<string>();
    cycles.forEach((cycle) => cycle.forEach((node) => nodesInCycles.add(node)));

    // Draw edges
    ctx.lineWidth = 2;
    processes.forEach((process) => {
      const procPos = processPositions.get(process.id);
      if (!procPos) return;

      // Draw edges from process to requested resources
      process.requesting.forEach((resource) => {
        const resPos = resourcePositions.get(resource);
        if (!resPos) return;

        const isInCycle =
          nodesInCycles.has(process.id) && nodesInCycles.has(resource);

        ctx.strokeStyle = isInCycle
          ? "hsl(var(--destructive))"
          : "hsl(var(--primary))";
        ctx.beginPath();
        ctx.moveTo(procPos.x, procPos.y);
        ctx.lineTo(resPos.x, resPos.y);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(resPos.y - procPos.y, resPos.x - procPos.x);
        const arrowSize = 10;
        ctx.beginPath();
        ctx.moveTo(resPos.x, resPos.y);
        ctx.lineTo(
          resPos.x - arrowSize * Math.cos(angle - Math.PI / 6),
          resPos.y - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          resPos.x - arrowSize * Math.cos(angle + Math.PI / 6),
          resPos.y - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
      });

      // Draw edges from held resources to process
      process.holding.forEach((resource) => {
        const resPos = resourcePositions.get(resource);
        if (!resPos) return;

        const isInCycle =
          nodesInCycles.has(process.id) && nodesInCycles.has(resource);

        ctx.strokeStyle = isInCycle
          ? "hsl(var(--destructive))"
          : "hsl(var(--success))";
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(resPos.x, resPos.y);
        ctx.lineTo(procPos.x, procPos.y);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    });

    // Draw process nodes
    processes.forEach((process) => {
      const pos = processPositions.get(process.id);
      if (!pos) return;

      const isInCycle = nodesInCycles.has(process.id);

      // Draw circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 30, 0, 2 * Math.PI);
      ctx.fillStyle = isInCycle
        ? "hsl(var(--destructive) / 0.2)"
        : "hsl(var(--primary) / 0.1)";
      ctx.fill();
      ctx.strokeStyle = isInCycle
        ? "hsl(var(--destructive))"
        : "hsl(var(--primary))";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.fillStyle = isInCycle
        ? "hsl(var(--destructive))"
        : "hsl(var(--foreground))";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(process.id, pos.x, pos.y);
    });

    // Draw resource nodes
    resourceArray.forEach((resource) => {
      const pos = resourcePositions.get(resource);
      if (!pos) return;

      const isInCycle = nodesInCycles.has(resource);

      // Draw square
      const size = 24;
      ctx.fillStyle = isInCycle
        ? "hsl(var(--destructive) / 0.2)"
        : "hsl(var(--accent))";
      ctx.fillRect(pos.x - size / 2, pos.y - size / 2, size, size);
      ctx.strokeStyle = isInCycle
        ? "hsl(var(--destructive))"
        : "hsl(var(--border))";
      ctx.lineWidth = 2;
      ctx.strokeRect(pos.x - size / 2, pos.y - size / 2, size, size);

      // Draw text
      ctx.fillStyle = isInCycle
        ? "hsl(var(--destructive))"
        : "hsl(var(--foreground))";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(resource, pos.x, pos.y);
    });

    // Draw legend
    const legendY = canvas.height - 80;
    const legendX = 20;

    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "hsl(var(--foreground))";
    ctx.fillText("Legend:", legendX, legendY);

    // Process circle
    ctx.beginPath();
    ctx.arc(legendX + 10, legendY + 20, 8, 0, 2 * Math.PI);
    ctx.fillStyle = "hsl(var(--primary) / 0.1)";
    ctx.fill();
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.stroke();
    ctx.fillStyle = "hsl(var(--foreground))";
    ctx.fillText("Process", legendX + 25, legendY + 23);

    // Resource square
    ctx.fillStyle = "hsl(var(--accent))";
    ctx.fillRect(legendX + 6, legendY + 32, 12, 12);
    ctx.strokeStyle = "hsl(var(--border))";
    ctx.strokeRect(legendX + 6, legendY + 32, 12, 12);
    ctx.fillStyle = "hsl(var(--foreground))";
    ctx.fillText("Resource", legendX + 25, legendY + 41);

    // Arrows
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.beginPath();
    ctx.moveTo(legendX + 120, legendY + 23);
    ctx.lineTo(legendX + 160, legendY + 23);
    ctx.stroke();
    ctx.fillStyle = "hsl(var(--foreground))";
    ctx.fillText("Request", legendX + 170, legendY + 23);

    ctx.strokeStyle = "hsl(var(--success))";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(legendX + 120, legendY + 38);
    ctx.lineTo(legendX + 160, legendY + 38);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "hsl(var(--foreground))";
    ctx.fillText("Allocation", legendX + 170, legendY + 41);
  }, [processes, cycles]);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Resource Allocation Graph</h2>
      <canvas
        ref={canvasRef}
        className="w-full h-[500px] border rounded-lg bg-background"
      />
    </Card>
  );
};
