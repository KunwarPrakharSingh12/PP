import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Shield, Lightbulb, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

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

interface DeadlockCycle {
  components: string[];
  users: string[];
}

interface DeadlockMonitorProps {
  locks: ResourceLock[];
  components: Component[];
  currentUserId: string;
  onResolve: (lockId: string) => void;
  onCyclesDetected?: (cycles: string[][]) => void;
}

export const DeadlockMonitor = ({ locks, components, currentUserId, onResolve, onCyclesDetected }: DeadlockMonitorProps) => {
  const [deadlockStatus, setDeadlockStatus] = useState<{
    detected: boolean;
    cycles: DeadlockCycle[];
    message: string;
    resolutionStrategies: string[];
  }>({
    detected: false,
    cycles: [],
    message: "System healthy",
    resolutionStrategies: [],
  });

  useEffect(() => {
    detectDeadlock();
  }, [locks]);

  const detectDeadlock = () => {
    // Build wait-for graph
    const waitingFor: Map<string, Set<string>> = new Map();
    const componentOwners: Map<string, string> = new Map();

    // Track who owns which components
    locks.forEach((lock) => {
      if (lock.acquired_at && !lock.released_at) {
        componentOwners.set(lock.component_id, lock.user_id);
      }
    });

    // Build wait-for relationships
    locks.forEach((lock) => {
      if (!lock.acquired_at && !lock.released_at) {
        // This user is waiting for this component
        const owner = componentOwners.get(lock.component_id);
        if (owner && owner !== lock.user_id) {
          if (!waitingFor.has(lock.user_id)) {
            waitingFor.set(lock.user_id, new Set());
          }
          waitingFor.get(lock.user_id)!.add(owner);
        }
      }
    });

    // Detect cycles using DFS
    const cycles: DeadlockCycle[] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const path: string[] = [];

    const dfs = (userId: string): boolean => {
      visited.add(userId);
      recStack.add(userId);
      path.push(userId);

      const neighbors = waitingFor.get(userId) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) {
            return true;
          }
        } else if (recStack.has(neighbor)) {
          // Found a cycle
          const cycleStartIndex = path.indexOf(neighbor);
          const cycleUsers = path.slice(cycleStartIndex);
          
          // Get components involved
          const involvedComponents: string[] = [];
          locks.forEach((lock) => {
            if (cycleUsers.includes(lock.user_id) && (lock.acquired_at || !lock.released_at)) {
              if (!involvedComponents.includes(lock.component_id)) {
                involvedComponents.push(lock.component_id);
              }
            }
          });

          cycles.push({
            users: cycleUsers,
            components: involvedComponents,
          });
          return true;
        }
      }

      path.pop();
      recStack.delete(userId);
      return false;
    };

    // Check for cycles starting from each user
    for (const userId of waitingFor.keys()) {
      if (!visited.has(userId)) {
        dfs(userId);
      }
    }

    const getResolutionStrategies = (cycles: DeadlockCycle[]): string[] => {
      if (cycles.length === 0) return [];

      const strategies: string[] = [];
      
      strategies.push("**Immediate Actions:**");
      cycles.forEach((cycle, index) => {
        strategies.push(`• Cycle ${index + 1}: Release lock on ${cycle.components.map(c => getComponentTitle(c)).join(" or ")}`);
      });
      strategies.push("");
      
      strategies.push("**Coffman Conditions - Break One to Prevent Deadlock:**");
      strategies.push("1. Mutual Exclusion: Allow shared access when possible");
      strategies.push("2. Hold and Wait: Request all resources at once");
      strategies.push("3. No Preemption: Allow lock preemption/timeout");
      strategies.push("4. Circular Wait: Use consistent resource ordering");
      strategies.push("");
      
      strategies.push("**Best Practices:**");
      strategies.push("• Implement lock timeout mechanisms");
      strategies.push("• Use try-lock patterns with backoff");
      strategies.push("• Follow a global lock ordering convention");
      strategies.push("• Monitor and log lock acquisition patterns");
      
      return strategies;
    };

    if (cycles.length > 0) {
      const cyclePaths = cycles.map(c => c.users.concat(c.components));
      if (onCyclesDetected) {
        onCyclesDetected(cyclePaths);
      }
      
      setDeadlockStatus({
        detected: true,
        cycles,
        message: `⚠️ Deadlock detected! ${cycles.length} circular wait condition(s) found.`,
        resolutionStrategies: getResolutionStrategies(cycles),
      });
    } else {
      if (onCyclesDetected) {
        onCyclesDetected([]);
      }
      
      setDeadlockStatus({
        detected: false,
        cycles: [],
        message: "✓ System is safe - no deadlocks detected",
        resolutionStrategies: [],
      });
    }
  };

  const getComponentTitle = (componentId: string) => {
    const component = components.find((c) => c.id === componentId);
    return component?.title || "Unknown Component";
  };

  const getUserLocksInCycle = (cycle: DeadlockCycle) => {
    return locks.filter((lock) => 
      cycle.users.includes(lock.user_id) && 
      cycle.components.includes(lock.component_id) &&
      lock.user_id === currentUserId
    );
  };

  return (
    <Card className="p-6 border-2 transition-all">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${deadlockStatus.detected ? 'bg-destructive/10' : 'bg-primary/10'}`}>
          {deadlockStatus.detected ? (
            <AlertTriangle className="h-6 w-6 text-destructive" />
          ) : (
            <Shield className="h-6 w-6 text-primary" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">Deadlock Monitor</h3>
            <Badge variant={deadlockStatus.detected ? "destructive" : "default"}>
              {deadlockStatus.detected ? "Active" : "Clear"}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            {deadlockStatus.message}
          </p>

          {deadlockStatus.detected && deadlockStatus.cycles.length > 0 && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Circular Wait Conditions Detected</AlertTitle>
                <AlertDescription>
                  <div className="mt-3 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Detected Cycles:
                      </h4>
                      <div className="space-y-2">
                        {deadlockStatus.cycles.map((cycle, index) => (
                          <div key={index} className="bg-background/50 p-3 rounded border border-destructive/30">
                            <div className="font-semibold mb-1 text-sm">Cycle {index + 1}:</div>
                            <div className="text-sm space-y-1">
                              <div><strong>Users:</strong> {cycle.users.length} users waiting</div>
                              <div><strong>Components:</strong> {cycle.components.map(c => getComponentTitle(c)).join(", ")}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-destructive/20" />

                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Resolution Strategies:
                      </h4>
                      <div className="space-y-1 text-sm bg-background/30 p-3 rounded border border-destructive/20">
                        {deadlockStatus.resolutionStrategies.map((strategy, index) => (
                          <div key={index} className={strategy.startsWith("**") ? "font-semibold mt-2 first:mt-0" : "ml-2"}>
                            {strategy.replace(/\*\*/g, "")}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-destructive/20" />

                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Quick Actions:
                      </h4>
                      <div className="space-y-3">
                        {deadlockStatus.cycles.map((cycle, index) => {
                          const userLocks = getUserLocksInCycle(cycle);
                          if (userLocks.length === 0) return null;
                          
                          return (
                            <div key={index}>
                              <p className="text-xs mb-2">Release your locks in Cycle {index + 1}:</p>
                              <div className="flex flex-wrap gap-2">
                                {userLocks.map((lock) => (
                                  <Button
                                    key={lock.id}
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => onResolve(lock.id)}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Release "{getComponentTitle(lock.component_id)}"
                                  </Button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {!deadlockStatus.detected && locks.length > 0 && (
            <div className="text-sm text-muted-foreground">
              <p>Currently monitoring {locks.filter(l => !l.released_at).length} active locks</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
