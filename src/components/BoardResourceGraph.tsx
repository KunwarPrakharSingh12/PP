import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Network, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AISuggestionsDialog } from "@/components/AISuggestionsDialog";

interface ResourceLock {
  id: string;
  user_id: string;
  component_id: string;
  requested_at: string;
  acquired_at: string | null;
  released_at: string | null;
}

interface Component {
  id: string;
  title: string;
}

interface BoardResourceGraphProps {
  locks: ResourceLock[];
  components: Component[];
  cycles: string[][];
  maxUsers?: number;
  maxResources?: number;
}

export const BoardResourceGraph = ({ 
  locks, 
  components, 
  cycles, 
  maxUsers = 10, 
  maxResources = 20 
}: BoardResourceGraphProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'hsl(220 70% 98%)');
    gradient.addColorStop(1, 'hsl(210 40% 96%)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (locks.length === 0) {
      ctx.fillStyle = "hsl(var(--muted-foreground))";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        "No active locks - add components and lock them to visualize",
        canvas.width / 2,
        canvas.height / 2
      );
      return;
    }

    // Build wait-for graph
    const users = new Set<string>();
    const resources = new Set<string>();
    
    locks.forEach((lock) => {
      users.add(lock.user_id);
      resources.add(lock.component_id);
    });

    // Calculate positions with zoom
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35 * zoom;

    const userPositions: Map<string, { x: number; y: number }> = new Map();
    const resourcePositions: Map<string, { x: number; y: number }> = new Map();

    // Position users in outer circle
    const userArray = Array.from(users);
    userArray.forEach((user, index) => {
      const angle = (index / userArray.length) * 2 * Math.PI - Math.PI / 2;
      userPositions.set(user, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    });

    // Position resources in inner circle
    const componentArray = Array.from(resources);
    componentArray.forEach((compId, index) => {
      const angle = (index / componentArray.length) * 2 * Math.PI - Math.PI / 2;
      const innerRadius = radius * 0.5;
      resourcePositions.set(compId, {
        x: centerX + innerRadius * Math.cos(angle),
        y: centerY + innerRadius * Math.sin(angle),
      });
    });

    // Check if a node is in any cycle
    const nodesInCycles = new Set<string>();
    cycles.forEach((cycle) => cycle.forEach((node) => nodesInCycles.add(node)));

    // Draw edges with shadow for depth
    ctx.lineWidth = 3;
    ctx.shadowBlur = 8;
    locks.forEach((lock) => {
      const userPos = userPositions.get(lock.user_id);
      const resPos = resourcePositions.get(lock.component_id);
      if (!userPos || !resPos) return;

      const isInCycle =
        nodesInCycles.has(lock.user_id) && nodesInCycles.has(lock.component_id);

      if (lock.acquired_at) {
        // Allocation edge: resource → user (dashed with glow)
        ctx.strokeStyle = isInCycle
          ? "hsl(0 70% 55%)"
          : "hsl(142 60% 45%)";
        ctx.shadowColor = ctx.strokeStyle;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(resPos.x, resPos.y);
        ctx.lineTo(userPos.x, userPos.y);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Request edge: user → resource (solid with arrow and glow)
        ctx.strokeStyle = isInCycle
          ? "hsl(0 70% 55%)"
          : "hsl(220 70% 50%)";
        ctx.shadowColor = ctx.strokeStyle;
        ctx.beginPath();
        ctx.moveTo(userPos.x, userPos.y);
        ctx.lineTo(resPos.x, resPos.y);
        ctx.stroke();

        // Draw enhanced arrowhead
        const angle = Math.atan2(resPos.y - userPos.y, resPos.x - userPos.x);
        const arrowSize = 12;
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
      }
    });

    // Reset shadow for nodes
    ctx.shadowBlur = 10;
    
    // Draw user nodes (circles with enhanced styling)
    userArray.forEach((userId) => {
      const pos = userPositions.get(userId);
      if (!pos) return;

      const isInCycle = nodesInCycles.has(userId);
      const isHovered = hoveredNode === userId;

      // Draw outer glow circle
      if (isHovered) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 36, 0, 2 * Math.PI);
        ctx.fillStyle = isInCycle
          ? "hsl(0 70% 55% / 0.1)"
          : "hsl(220 70% 50% / 0.1)";
        ctx.fill();
      }

      // Draw main circle with gradient
      const nodeGradient = ctx.createRadialGradient(pos.x - 8, pos.y - 8, 0, pos.x, pos.y, 30);
      if (isInCycle) {
        nodeGradient.addColorStop(0, "hsl(0 70% 55% / 0.3)");
        nodeGradient.addColorStop(1, "hsl(0 70% 55% / 0.1)");
      } else {
        nodeGradient.addColorStop(0, "hsl(220 70% 50% / 0.3)");
        nodeGradient.addColorStop(1, "hsl(220 70% 50% / 0.05)");
      }
      
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 30, 0, 2 * Math.PI);
      ctx.fillStyle = nodeGradient;
      ctx.fill();
      
      ctx.strokeStyle = isInCycle
        ? "hsl(0 70% 55%)"
        : "hsl(220 70% 50%)";
      ctx.shadowColor = ctx.strokeStyle;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw text (short user ID)
      ctx.shadowBlur = 0;
      ctx.fillStyle = isInCycle
        ? "hsl(0 70% 55%)"
        : "hsl(220 70% 50%)";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`U${userArray.indexOf(userId) + 1}`, pos.x, pos.y);
    });

    // Draw resource nodes (rounded squares with enhanced styling)
    ctx.shadowBlur = 8;
    componentArray.forEach((compId) => {
      const pos = resourcePositions.get(compId);
      if (!pos) return;

      const component = components.find((c) => c.id === compId);
      const isInCycle = nodesInCycles.has(compId);
      const isHovered = hoveredNode === compId;

      const size = 32;
      const cornerRadius = 6;

      // Draw outer glow if hovered
      if (isHovered) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = isInCycle ? "hsl(0 70% 55%)" : "hsl(195 60% 45%)";
      }

      // Draw rounded square with gradient
      const rectGradient = ctx.createLinearGradient(
        pos.x - size / 2, pos.y - size / 2,
        pos.x + size / 2, pos.y + size / 2
      );
      if (isInCycle) {
        rectGradient.addColorStop(0, "hsl(0 70% 55% / 0.3)");
        rectGradient.addColorStop(1, "hsl(0 70% 55% / 0.1)");
      } else {
        rectGradient.addColorStop(0, "hsl(195 60% 45% / 0.4)");
        rectGradient.addColorStop(1, "hsl(195 60% 45% / 0.15)");
      }

      ctx.fillStyle = rectGradient;
      ctx.beginPath();
      ctx.moveTo(pos.x - size / 2 + cornerRadius, pos.y - size / 2);
      ctx.lineTo(pos.x + size / 2 - cornerRadius, pos.y - size / 2);
      ctx.quadraticCurveTo(pos.x + size / 2, pos.y - size / 2, pos.x + size / 2, pos.y - size / 2 + cornerRadius);
      ctx.lineTo(pos.x + size / 2, pos.y + size / 2 - cornerRadius);
      ctx.quadraticCurveTo(pos.x + size / 2, pos.y + size / 2, pos.x + size / 2 - cornerRadius, pos.y + size / 2);
      ctx.lineTo(pos.x - size / 2 + cornerRadius, pos.y + size / 2);
      ctx.quadraticCurveTo(pos.x - size / 2, pos.y + size / 2, pos.x - size / 2, pos.y + size / 2 - cornerRadius);
      ctx.lineTo(pos.x - size / 2, pos.y - size / 2 + cornerRadius);
      ctx.quadraticCurveTo(pos.x - size / 2, pos.y - size / 2, pos.x - size / 2 + cornerRadius, pos.y - size / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = isInCycle
        ? "hsl(0 70% 55%)"
        : "hsl(195 60% 45%)";
      ctx.shadowColor = ctx.strokeStyle;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw text
      ctx.shadowBlur = 0;
      ctx.fillStyle = isInCycle
        ? "hsl(0 70% 55%)"
        : "hsl(195 60% 45%)";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label = component?.title.substring(0, 3).toUpperCase() || `C${componentArray.indexOf(compId) + 1}`;
      ctx.fillText(label, pos.x, pos.y);
    });
    
    ctx.shadowBlur = 0;

    // Draw legend
    const legendY = canvas.height - 80;
    const legendX = 20;

    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "hsl(var(--foreground))";
    ctx.fillText("Legend:", legendX, legendY);

    // User circle
    ctx.beginPath();
    ctx.arc(legendX + 10, legendY + 20, 8, 0, 2 * Math.PI);
    ctx.fillStyle = "hsl(var(--primary) / 0.1)";
    ctx.fill();
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.stroke();
    ctx.fillStyle = "hsl(var(--foreground))";
    ctx.fillText("User", legendX + 25, legendY + 23);

    // Resource square
    ctx.fillStyle = "hsl(var(--accent))";
    ctx.fillRect(legendX + 6, legendY + 32, 12, 12);
    ctx.strokeStyle = "hsl(var(--border))";
    ctx.strokeRect(legendX + 6, legendY + 32, 12, 12);
    ctx.fillStyle = "hsl(var(--foreground))";
    ctx.fillText("Component", legendX + 25, legendY + 41);

    // Arrows
    ctx.strokeStyle = "hsl(var(--primary))";
    ctx.beginPath();
    ctx.moveTo(legendX + 120, legendY + 23);
    ctx.lineTo(legendX + 160, legendY + 23);
    ctx.stroke();
    ctx.fillStyle = "hsl(var(--foreground))";
    ctx.fillText("Waiting", legendX + 170, legendY + 23);

    ctx.strokeStyle = "hsl(var(--success))";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(legendX + 120, legendY + 38);
    ctx.lineTo(legendX + 160, legendY + 38);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "hsl(var(--foreground))";
    ctx.fillText("Allocated", legendX + 170, legendY + 41);

    // Handle mouse move for tooltips
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let foundNode = false;

      // Check users
      userArray.forEach((userId) => {
        const pos = userPositions.get(userId);
        if (!pos) return;
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (distance < 30) {
          const userLocks = locks.filter(l => l.user_id === userId);
          const acquired = userLocks.filter(l => l.acquired_at).length;
          const waiting = userLocks.filter(l => !l.acquired_at).length;
          setTooltip({
            x: e.clientX,
            y: e.clientY,
            text: `User ${userArray.indexOf(userId) + 1}\nAcquired: ${acquired}\nWaiting: ${waiting}`
          });
          setHoveredNode(userId);
          foundNode = true;
        }
      });

      // Check components
      if (!foundNode) {
        componentArray.forEach((compId) => {
          const pos = resourcePositions.get(compId);
          if (!pos) return;
          const component = components.find((c) => c.id === compId);
          if (Math.abs(x - pos.x) < 12 && Math.abs(y - pos.y) < 12) {
            const componentLocks = locks.filter(l => l.component_id === compId);
            const holder = componentLocks.find(l => l.acquired_at);
            setTooltip({
              x: e.clientX,
              y: e.clientY,
              text: `${component?.title || 'Component'}\n${holder ? 'Locked' : 'Available'}`
            });
            setHoveredNode(compId);
            foundNode = true;
          }
        });
      }

      if (!foundNode) {
        setTooltip(null);
        setHoveredNode(null);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, [locks, components, cycles, zoom]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleReset = () => setZoom(1);

  const activeUsers = new Set(locks.map(l => l.user_id)).size;
  const lockedComponents = new Set(locks.filter(l => l.acquired_at).map(l => l.component_id)).size;
  const waitingRequests = locks.filter(l => !l.acquired_at).length;

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-2 shadow-xl">
      <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Network className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Wait-For Graph Visualization</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {activeUsers} Active Users
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {lockedComponents} Locked Components
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {waitingRequests} Waiting Requests
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <AISuggestionsDialog
            context="deadlock"
            currentUsers={activeUsers}
            maxUsers={maxUsers}
            currentResources={components.length}
            maxResources={maxResources}
            hasDeadlock={cycles.length > 0}
            triggerButton={
              <Button variant="outline" size="sm" className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI Advice
              </Button>
            }
          />
          <Button variant="outline" size="sm" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} title="Reset View">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-[600px] border-2 border-border rounded-lg shadow-inner cursor-crosshair transition-all hover:shadow-lg"
        />
        {tooltip && (
          <div
            className="fixed z-50 px-3 py-2 text-sm bg-popover text-popover-foreground border border-border rounded-md shadow-md pointer-events-none whitespace-pre-line"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y + 10,
            }}
          >
            {tooltip.text}
          </div>
        )}
      </div>
    </Card>
  );
};
