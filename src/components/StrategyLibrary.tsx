import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Copy, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

// Define the type for a strategy based on our backend model
interface Strategy {
  id: number;
  name: string;
  description: string;
  category: string;
}

// API function to fetch strategies
const fetchStrategies = async (): Promise<Strategy[]> => {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/strategies", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

// API function to create a strategy
const createStrategy = async (newStrategy: { name: string; description: string; category: string }): Promise<Strategy> => {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/strategies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(newStrategy),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to create strategy");
  }
  return response.json();
};


function CreateStrategyForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createStrategy,
    onSuccess: (data) => {
      toast.success(`Strategy "${data.name}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      onSuccess(); // Hide the form
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !category) {
        toast.warning("Please fill out all fields.");
        return;
    }
    mutation.mutate({ name, description, category });
  };

  return (
    <Card className="bg-card/70 border-border/50 mb-4">
      <CardHeader>
        <CardTitle>Create a New Strategy</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Strategy Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Mean Reversion" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the strategy's logic" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Momentum, Arbitrage" />
          </div>
          <div className="flex justify-end gap-2">
             <Button variant="ghost" type="button" onClick={onSuccess}>Cancel</Button>
             <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save Strategy"}
             </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


export function StrategyLibrary() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data: strategies, isLoading, isError, error } = useQuery<Strategy[], Error>({ 
      queryKey: ['strategies'], 
      queryFn: fetchStrategies 
  });

  const handleUseStrategy = (strategyName: string) => {
    toast.success(`Loading ${strategyName} into builder`);
  };

  const handleViewDetails = (strategyName:string) => {
      toast.info(`Opening details for ${strategyName}`);
  }

  if (isLoading) {
      return <div>Loading strategies...</div>;
  }

  if (isError) {
      return <div>Error: {error.message}</div>;
  }

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Strategy Library</CardTitle>
            <CardDescription>Your saved strategies</CardDescription>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Strategy
        </Button>
      </CardHeader>
      <CardContent>
        {showCreateForm && <CreateStrategyForm onSuccess={() => setShowCreateForm(false)} />}
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {strategies && strategies.map((strategy) => (
              <Card key={strategy.id} className="bg-card/50 border-border/50 hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">{strategy.name}</h3>
                        <p className="text-sm text-muted-foreground">{strategy.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{strategy.category}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="glass"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewDetails(strategy.name)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="profit"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleUseStrategy(strategy.name)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Use
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
             {strategies && strategies.length === 0 && !showCreateForm && (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">You haven't created any strategies yet.</p>
                    <Button variant="link" onClick={() => setShowCreateForm(true)}>Create your first one</Button>
                </div>
             )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
