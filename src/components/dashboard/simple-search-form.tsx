import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface SimpleSearchFormProps {
  onSearch: (query: string) => void;
}

export const SimpleSearchForm = ({ onSearch }: SimpleSearchFormProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Busca de Monitoração</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o host, IP ou domínio..."
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!query.trim()}
            className="bg-vivo-gradient hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Buscar</span>
            </div>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};