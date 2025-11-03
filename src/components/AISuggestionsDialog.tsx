import { useState } from "react";
import { Lightbulb, Send, Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AISuggestionsDialogProps {
  context: "deadlock" | "users" | "general";
  currentUsers?: number;
  maxUsers?: number;
  currentResources?: number;
  maxResources?: number;
  hasDeadlock?: boolean;
  triggerButton?: React.ReactNode;
}

export const AISuggestionsDialog = ({
  context,
  currentUsers = 0,
  maxUsers = 10,
  currentResources = 0,
  maxResources = 20,
  hasDeadlock = false,
  triggerButton,
}: AISuggestionsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generatePrompt = () => {
    switch (context) {
      case "deadlock":
        return `I'm managing a collaborative project board with resource locking. Currently:
- ${currentUsers} users are active (max: ${maxUsers})
- ${currentResources} components exist (max: ${maxResources})
${hasDeadlock ? "- A deadlock has been detected!" : ""}

Please provide:
1. Best practices to avoid deadlocks in collaborative systems
2. Specific strategies for resolving the current situation
3. How to optimize resource allocation
4. Prevention tips for the future

Keep it concise and actionable.`;

      case "users":
        return `I need to scale my collaborative project board. Currently:
- ${currentUsers} users are active (max: ${maxUsers})
- ${currentResources} components are in use (max: ${maxResources})

Please provide:
1. How to safely increase the maximum number of users
2. Best practices for managing concurrent users
3. Resource planning considerations when scaling
4. Performance optimization tips

Keep it practical and specific.`;

      default:
        return `I'm managing a collaborative project board with:
- ${currentUsers}/${maxUsers} users active
- ${currentResources}/${maxResources} components created

Please provide general advice on:
1. Optimizing board configuration
2. Best practices for collaboration
3. Resource management tips
4. Scaling considerations`;
    }
  };

  const getSuggestions = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setSuggestions("");

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { message: generatePrompt() },
      });

      if (error) throw error;

      if (data.error) {
        setSuggestions(`⚠️ ${data.userMessage || data.error}`);
        toast({
          title: "Rate Limit",
          description: data.userMessage || data.error,
          variant: "destructive",
        });
        return;
      }

      setSuggestions(data.reply);
    } catch (error) {
      console.error("Error getting suggestions:", error);
      setSuggestions(
        "⚠️ Unable to get suggestions right now. Please try again in a moment."
      );
      toast({
        title: "Error",
        description: "Failed to get AI suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !suggestions) {
      getSuggestions();
    }
  };

  const getTitle = () => {
    switch (context) {
      case "deadlock":
        return "Deadlock Avoidance Strategies";
      case "users":
        return "User Scaling Recommendations";
      default:
        return "AI-Powered Suggestions";
    }
  };

  const getDescription = () => {
    switch (context) {
      case "deadlock":
        return "Get AI-powered advice on preventing and resolving deadlocks";
      case "users":
        return "Learn how to safely increase users and scale your board";
      default:
        return "Get personalized recommendations for your board";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Suggestions
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Context Information */}
          <Card className="p-4 bg-muted/50">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="secondary">
                {currentUsers}/{maxUsers} Users
              </Badge>
              <Badge variant="secondary">
                {currentResources}/{maxResources} Components
              </Badge>
              {hasDeadlock && (
                <Badge variant="destructive">Deadlock Detected</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              AI analysis based on your current board state
            </p>
          </Card>

          {/* Suggestions Display */}
          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Analyzing your board and generating recommendations...
                </p>
              </div>
            ) : suggestions ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {suggestions}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click below to get AI-powered suggestions</p>
              </div>
            )}
          </ScrollArea>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Close
            </Button>
            <Button
              onClick={getSuggestions}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Get New Suggestions
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
