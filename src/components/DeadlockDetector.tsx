import { Process } from "./ProcessInput";

export interface DetectionResult {
  hasDeadlock: boolean;
  cycles: string[][];
  message: string;
}

export const detectDeadlock = (processes: Process[]): DetectionResult => {
  if (processes.length === 0) {
    return {
      hasDeadlock: false,
      cycles: [],
      message: "No processes to analyze",
    };
  }

  // Build resource allocation graph
  const graph: Map<string, Set<string>> = new Map();

  // Add all processes and resources as nodes
  processes.forEach((process) => {
    if (!graph.has(process.id)) {
      graph.set(process.id, new Set());
    }

    // Process holds resources -> edge from resource to process
    process.holding.forEach((resource) => {
      if (!graph.has(resource)) {
        graph.set(resource, new Set());
      }
      graph.get(resource)!.add(process.id);
    });

    // Process requests resources -> edge from process to resource
    process.requesting.forEach((resource) => {
      if (!graph.has(resource)) {
        graph.set(resource, new Set());
      }
      graph.get(process.id)!.add(resource);
    });
  });

  // Detect cycles using DFS
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const path: string[] = [];

  const dfs = (node: string): boolean => {
    visited.add(node);
    recStack.add(node);
    path.push(node);

    const neighbors = graph.get(node) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) {
          return true;
        }
      } else if (recStack.has(neighbor)) {
        // Found a cycle
        const cycleStartIndex = path.indexOf(neighbor);
        const cycle = path.slice(cycleStartIndex);
        cycles.push([...cycle, neighbor]);
        return true;
      }
    }

    path.pop();
    recStack.delete(node);
    return false;
  };

  // Check for cycles starting from each node
  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }

  if (cycles.length > 0) {
    return {
      hasDeadlock: true,
      cycles,
      message: `Deadlock detected! Found ${cycles.length} circular wait condition(s).`,
    };
  }

  return {
    hasDeadlock: false,
    cycles: [],
    message: "No deadlock detected. System is in a safe state.",
  };
};

export const getResolutionStrategies = (cycles: string[][]): string[] => {
  if (cycles.length === 0) return [];

  const strategies = [
    "**Prevention:** Eliminate one of the four Coffman conditions:",
    "  • Mutual Exclusion: Make resources sharable when possible",
    "  • Hold and Wait: Require processes to request all resources at once",
    "  • No Preemption: Allow resource preemption from processes",
    "  • Circular Wait: Impose ordering on resource requests",
    "",
    "**Avoidance:** Use Banker's Algorithm to ensure safe state before allocation",
    "",
    "**Detection & Recovery:**",
    "  • Terminate one or more processes in the cycle",
    "  • Preempt resources from processes and give to others",
    "  • Rollback processes to a safe state",
    "",
    "**Specific to this deadlock:**",
  ];

  cycles.forEach((cycle, index) => {
    const processesInCycle = cycle.filter((node) => node.startsWith("P"));
    strategies.push(
      `  Cycle ${index + 1}: Consider terminating ${processesInCycle[0]} or preempting resources`
    );
  });

  return strategies;
};
