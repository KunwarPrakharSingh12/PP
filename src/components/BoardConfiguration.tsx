import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Users, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BoardConfigurationProps {
  maxUsers: number;
  onMaxUsersChange: (count: number) => void;
  maxResources: number;
  onMaxResourcesChange: (count: number) => void;
  currentUsers: number;
  currentResources: number;
}

export const BoardConfiguration = ({
  maxUsers,
  onMaxUsersChange,
  maxResources,
  onMaxResourcesChange,
  currentUsers,
  currentResources,
}: BoardConfigurationProps) => {
  const handleUsersIncrement = () => {
    if (maxUsers < 50) {
      onMaxUsersChange(maxUsers + 1);
    }
  };

  const handleUsersDecrement = () => {
    if (maxUsers > 1) {
      onMaxUsersChange(maxUsers - 1);
    }
  };

  const handleUsersInputChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 1 && num <= 50) {
      onMaxUsersChange(num);
    }
  };

  const handleResourcesIncrement = () => {
    if (maxResources < 100) {
      onMaxResourcesChange(maxResources + 1);
    }
  };

  const handleResourcesDecrement = () => {
    if (maxResources > 1) {
      onMaxResourcesChange(maxResources - 1);
    }
  };

  const handleResourcesInputChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 1 && num <= 100) {
      onMaxResourcesChange(num);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-2">
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Board Configuration</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Multi-User Configuration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="max-users" className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Maximum Concurrent Users
            </Label>
            <Badge variant="secondary" className="text-xs">
              {currentUsers} / {maxUsers} active
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleUsersDecrement}
              disabled={maxUsers <= 1}
              className="shrink-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="max-users"
              type="number"
              min="1"
              max="50"
              value={maxUsers}
              onChange={(e) => handleUsersInputChange(e.target.value)}
              className="text-center font-mono font-semibold"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleUsersIncrement}
              disabled={maxUsers >= 50}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Set the maximum number of users who can collaborate simultaneously on this board.
          </p>
        </div>

        {/* Resource Configuration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="max-resources" className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-accent" />
              Maximum Components
            </Label>
            <Badge variant="secondary" className="text-xs">
              {currentResources} / {maxResources} created
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleResourcesDecrement}
              disabled={maxResources <= 1}
              className="shrink-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="max-resources"
              type="number"
              min="1"
              max="100"
              value={maxResources}
              onChange={(e) => handleResourcesInputChange(e.target.value)}
              className="text-center font-mono font-semibold"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleResourcesIncrement}
              disabled={maxResources >= 100}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Define the maximum number of components that can be created on this board.
          </p>
        </div>
      </div>
    </Card>
  );
};
