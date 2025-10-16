import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Process } from "./ProcessInput";

interface ExampleScenariosProps {
  onLoadExample: (processes: Process[]) => void;
}

export const ExampleScenarios = ({ onLoadExample }: ExampleScenariosProps) => {
  const examples = [
    {
      name: "Classic Deadlock",
      description: "Two processes competing for two resources",
      processes: [
        {
          id: "P1",
          name: "Process 1",
          holding: ["R1"],
          requesting: ["R2"],
        },
        {
          id: "P2",
          name: "Process 2",
          holding: ["R2"],
          requesting: ["R1"],
        },
      ],
    },
    {
      name: "Three-Way Deadlock",
      description: "Three processes in a circular wait",
      processes: [
        {
          id: "P1",
          name: "Database Writer",
          holding: ["R1"],
          requesting: ["R2"],
        },
        {
          id: "P2",
          name: "File Manager",
          holding: ["R2"],
          requesting: ["R3"],
        },
        {
          id: "P3",
          name: "Network Handler",
          holding: ["R3"],
          requesting: ["R1"],
        },
      ],
    },
    {
      name: "Safe State",
      description: "No circular dependencies",
      processes: [
        {
          id: "P1",
          name: "Process 1",
          holding: ["R1"],
          requesting: ["R2"],
        },
        {
          id: "P2",
          name: "Process 2",
          holding: ["R3"],
          requesting: ["R4"],
        },
        {
          id: "P3",
          name: "Process 3",
          holding: ["R2"],
          requesting: [],
        },
      ],
    },
    {
      name: "Complex Scenario",
      description: "Multiple processes with mixed dependencies",
      processes: [
        {
          id: "P1",
          name: "Web Server",
          holding: ["R1", "R2"],
          requesting: ["R3"],
        },
        {
          id: "P2",
          name: "Database",
          holding: ["R3"],
          requesting: ["R4"],
        },
        {
          id: "P3",
          name: "Cache Manager",
          holding: ["R4"],
          requesting: ["R1"],
        },
        {
          id: "P4",
          name: "Logger",
          holding: ["R5"],
          requesting: [],
        },
      ],
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Example Scenarios</h2>
      <div className="grid gap-3">
        {examples.map((example) => (
          <div
            key={example.name}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex-1">
              <h3 className="font-semibold">{example.name}</h3>
              <p className="text-sm text-muted-foreground">
                {example.description}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLoadExample(example.processes)}
            >
              Load
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
