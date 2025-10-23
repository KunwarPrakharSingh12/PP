import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, Minus } from "lucide-react";

interface ResourceConfigurationProps {
  resourceCount: number;
  onResourceCountChange: (count: number) => void;
}

export const ResourceConfiguration = ({
  resourceCount,
  onResourceCountChange,
}: ResourceConfigurationProps) => {
  const handleIncrement = () => {
    if (resourceCount < 26) {
      onResourceCountChange(resourceCount + 1);
    }
  };

  const handleDecrement = () => {
    if (resourceCount > 1) {
      onResourceCountChange(resourceCount - 1);
    }
  };

  const handleInputChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 1 && num <= 26) {
      onResourceCountChange(num);
    }
  };

  const getResourceNames = () => {
    const resources = [];
    for (let i = 0; i < resourceCount; i++) {
      resources.push(`R${i + 1}`);
    }
    return resources;
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Resource Configuration</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="resource-count">Total Resources Available</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={resourceCount <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="resource-count"
                type="number"
                min="1"
                max="26"
                value={resourceCount}
                onChange={(e) => handleInputChange(e.target.value)}
                className="text-center font-mono font-semibold"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                disabled={resourceCount >= 26}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Available Resources:</Label>
          <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
            {getResourceNames().map((resource) => (
              <Badge key={resource} variant="secondary" className="font-mono">
                {resource}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Use these resource names when configuring processes below
          </p>
        </div>
      </div>
    </Card>
  );
};
