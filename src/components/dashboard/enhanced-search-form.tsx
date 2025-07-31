import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Settings, Server, Activity } from "lucide-react";

interface EnhancedSearchFormProps {
  onSearch: (query: string, type: 'infra' | 'apm', tools: string[]) => void;
  onOpenSettings?: () => void;
  isLoading: boolean;
}

export const EnhancedSearchForm = ({ onSearch, onOpenSettings, isLoading }: EnhancedSearchFormProps) => {
  const [infraQuery, setInfraQuery] = useState("");
  const [apmQuery, setApmQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'infra' | 'apm'>('infra');
  const [selectedTools, setSelectedTools] = useState<string[]>(['todos']);

  // Ferramentas disponíveis por tipo
  const getAvailableTools = (type: 'infra' | 'apm') => {
    if (type === 'infra') {
      return ['todos', 'zabbix', 'elastic', 'dynatrace'];
    } else {
      return ['todos', 'elastic']; // Apenas Elastic para APM
    }
  };

  const handleSubmit = (e: React.FormEvent, type: 'infra' | 'apm') => {
    e.preventDefault();
    const query = type === 'infra' ? infraQuery : apmQuery;
    if (query.trim()) {
      onSearch(query.trim(), type, selectedTools);
    }
  };

  const handleToolChange = (tool: string, checked: boolean) => {
    if (tool === 'todos') {
      if (checked) {
        setSelectedTools(['todos']);
      } else {
        setSelectedTools([]);
      }
    } else {
      if (checked) {
        const newTools = selectedTools.filter(t => t !== 'todos');
        setSelectedTools([...newTools, tool]);
      } else {
        setSelectedTools(selectedTools.filter(t => t !== tool));
      }
    }
  };

  // Resetar ferramentas selecionadas quando mudar de aba
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'infra' | 'apm');
    setSelectedTools(['todos']); // Reset para 'todos' ao mudar de aba
  };

  const parseMultipleQueries = (query: string) => {
    return query.split(/[,;\s]+/).filter(q => q.trim().length > 0);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Busca de Monitoração</CardTitle>
          {onOpenSettings && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSettings}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Seleção de Ferramentas */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Ferramentas para Consulta:</h3>
          <div className="flex flex-wrap gap-4">
            {getAvailableTools(activeTab).map((tool) => (
              <div key={tool} className="flex items-center space-x-2">
                <Checkbox
                  id={tool}
                  checked={selectedTools.includes(tool)}
                  onCheckedChange={(checked) => handleToolChange(tool, checked as boolean)}
                  disabled={tool !== 'todos' && selectedTools.includes('todos')}
                />
                <label htmlFor={tool} className={`text-sm ${tool === 'todos' ? 'font-medium' : ''}`}>
                  {tool === 'todos' ? 'Todos' : 
                   tool === 'zabbix' ? 'Zabbix' :
                   tool === 'elastic' ? 'Elastic' :
                   tool === 'dynatrace' ? 'Dynatrace' : tool}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="infra" className="flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <span>Infraestrutura</span>
            </TabsTrigger>
            <TabsTrigger value="apm" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>APM</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="infra" className="mt-4">
            <form onSubmit={(e) => handleSubmit(e, 'infra')} className="space-y-3">
              <div className="space-y-2">
                <Input
                  value={infraQuery}
                  onChange={(e) => setInfraQuery(e.target.value)}
                  placeholder="Digite hosts separados por vírgula ou ponto e vírgula (ex: server1, server2; server3domain)"
                  className="flex-1"
                  disabled={isLoading}
                />
                 <p className="text-xs text-muted-foreground">
                    Busca por hosts usando campos host.name ou host.hostname no Elastic
                  </p>
              </div>
              <Button 
                type="submit" 
                disabled={!infraQuery.trim() || isLoading}
                className="w-full bg-vivo-gradient hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center space-x-2">
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span>Buscar Infraestrutura</span>
                </div>
              </Button>
              {infraQuery && (
                <div className="text-xs text-muted-foreground">
                  Consultará: {parseMultipleQueries(infraQuery).join(', ')}
                </div>
              )}
            </form>
          </TabsContent>

          <TabsContent value="apm" className="mt-4">
            <form onSubmit={(e) => handleSubmit(e, 'apm')} className="space-y-3">
              <div className="space-y-2">
                <Input
                  value={apmQuery}
                  onChange={(e) => setApmQuery(e.target.value)}
                  placeholder="Digite domínios ou tags separados por vírgula (ex: app1.com, app2.com; tag:value)"
                  className="flex-1"
                  disabled={isLoading}
                />
                 <p className="text-xs text-muted-foreground">
                    Busca por aplicações no Elastic (labels.domain)
                  </p>
              </div>
              <Button 
                type="submit" 
                disabled={!apmQuery.trim() || isLoading}
                className="w-full bg-vivo-gradient hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center space-x-2">
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span>Buscar APM</span>
                </div>
              </Button>
              {apmQuery && (
                <div className="text-xs text-muted-foreground">
                  Consultará: {parseMultipleQueries(apmQuery).join(', ')}
                </div>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};