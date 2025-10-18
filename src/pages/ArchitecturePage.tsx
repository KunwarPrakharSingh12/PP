import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowRight, Database, Zap, GitBranch, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const ArchitecturePage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">CollabLock</span>
          </Link>
          <Button asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline">System Architecture</Badge>
          <h1 className="text-4xl font-bold mb-4">
            Microservice-Based Deadlock Detection
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A sophisticated four-module architecture for real-time conflict detection and resolution
          </p>
        </div>

        {/* Architecture Diagram */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">System Flow</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Database className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Module 1</h3>
              <p className="text-sm text-muted-foreground">Real-Time State Manager</p>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="text-center">
              <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <GitBranch className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Module 2</h3>
              <p className="text-sm text-muted-foreground">URIG Constructor</p>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-4 mt-6">
            <div className="text-center">
              <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Module 3</h3>
              <p className="text-sm text-muted-foreground">Conflict Detection Engine</p>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="text-center">
              <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Module 4</h3>
              <p className="text-sm text-muted-foreground">Resolution Advisor</p>
            </div>

            <div />
          </div>
        </Card>

        {/* Detailed Specifications */}
        <div className="space-y-8">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <Database className="h-8 w-8 text-primary flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">Module 1: Real-Time State Manager</h3>
                <p className="text-muted-foreground mb-4">
                  Maintains a precise, real-time snapshot of the collaborative session state using WebSocket connections.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <Badge variant="secondary">WebSocket Protocol</Badge>
                    <Badge variant="secondary">In-Memory Storage</Badge>
                    <Badge variant="secondary">High Concurrency</Badge>
                  </div>
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="font-mono text-xs mb-2"><strong>Output Data Structures:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li><code>Lock Map (L)</code>: component_id → user_id mappings</li>
                      <li><code>Wait Queue Map (W)</code>: component_id → [user_ids] ordered lists</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <GitBranch className="h-8 w-8 text-primary flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">Module 2: URIG Constructor</h3>
                <p className="text-muted-foreground mb-4">
                  Dynamically builds the User-Resource Interaction Graph from state manager data.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <Badge variant="secondary">Adjacency List</Badge>
                    <Badge variant="secondary">Graph Theory</Badge>
                    <Badge variant="secondary">Dynamic Updates</Badge>
                  </div>
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="font-mono text-xs mb-2"><strong>Graph Components:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li><strong>User Nodes (U)</strong>: Active users identified by User ID</li>
                      <li><strong>Component Nodes (C)</strong>: Lockable resources by Component ID</li>
                      <li><strong>Lock Edge (C→U)</strong>: Component locked by user</li>
                      <li><strong>Wait Edge (U→C)</strong>: User waiting for component</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <Zap className="h-8 w-8 text-primary flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">Module 3: Conflict Detection Engine</h3>
                <p className="text-muted-foreground mb-4">
                  Executes DFS traversal on the URIG to detect circular wait conditions (cycles).
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <Badge variant="secondary">DFS Algorithm</Badge>
                    <Badge variant="secondary">Cycle Detection</Badge>
                    <Badge variant="secondary">O(V+E) Complexity</Badge>
                  </div>
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg font-mono text-xs">
                    <p className="mb-2"><strong>Pseudocode:</strong></p>
                    <pre className="text-xs overflow-x-auto">{`function DFS(node, visited, recStack, path):
  visited.add(node)
  recStack.add(node)
  path.append(node)
  
  for neighbor in graph[node]:
    if neighbor not in visited:
      if DFS(neighbor, visited, recStack, path):
        return true
    elif neighbor in recStack:
      // Cycle detected
      cycleStart = path.indexOf(neighbor)
      cycle = path[cycleStart:] + [neighbor]
      return true
  
  path.pop()
  recStack.remove(node)
  return false`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <Shield className="h-8 w-8 text-primary flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">Module 4: Heuristic-Based Resolution Advisor</h3>
                <p className="text-muted-foreground mb-4">
                  Analyzes detected deadlocks and generates ranked resolution strategies.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <Badge variant="secondary">Heuristic Scoring</Badge>
                    <Badge variant="secondary">Strategy Ranking</Badge>
                    <Badge variant="secondary">JSON Reports</Badge>
                  </div>
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="font-mono text-xs mb-2"><strong>Resolution Strategies:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li><strong>Strategy A: Force Lock Release</strong>
                        <ul className="ml-6 mt-1 list-disc list-inside">
                          <li>User role/permissions weight</li>
                          <li>Idle time analysis</li>
                          <li>Session duration consideration</li>
                          <li>Active locks count</li>
                        </ul>
                      </li>
                      <li><strong>Strategy B: Guided User Yielding</strong>
                        <ul className="ml-6 mt-1 list-disc list-inside">
                          <li>User Disruption Score calculation</li>
                          <li>Interactive notification system</li>
                          <li>Draft saving mechanism</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg font-mono text-xs">
                    <p className="mb-2"><strong>Sample JSON Output:</strong></p>
                    <pre className="text-xs overflow-x-auto">{`{
  "timestamp": "2025-10-16T12:45:30Z",
  "conflicting_users": [
    {"user_id": "U1", "email": "alice@example.com"},
    {"user_id": "U2", "email": "bob@example.com"}
  ],
  "conflicting_components": [
    {"component_id": "C1", "title": "Task Card 1"},
    {"component_id": "C2", "title": "Task Card 2"}
  ],
  "recommended_actions": [
    {
      "strategy": "force_release",
      "target_user": "U2",
      "justification": "Lowest disruption score",
      "disruption_score": 12.5
    }
  ]
}`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Execution Configuration */}
        <Card className="p-8 mt-8">
          <h2 className="text-2xl font-bold mb-4">Operational Configuration</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Execution Modes</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-1">Periodic</Badge>
                  <span>Background job at fixed intervals (e.g., every 5 seconds)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-1">Event-Driven</Badge>
                  <span>Triggered on lock request denial (Preferred - more efficient)</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Data Structures</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• In-memory graph using adjacency lists</li>
                <li>• Three-color node tracking for DFS</li>
                <li>• Realtime database for session state</li>
                <li>• JSONB for conflict reports</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button asChild size="lg">
            <Link to="/auth">Experience the Platform</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-12 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with graph theory, microservices, and real-time WebSocket technology</p>
        </div>
      </footer>
    </div>
  );
};

export default ArchitecturePage;