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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="todos"
                checked={selectedTools.includes('todos')}
                onCheckedChange={(checked) => handleToolChange('todos', checked as boolean)}
              />
              <label htmlFor="todos" className="text-sm font-medium">Todos</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="zabbix"
                checked={selectedTools.includes('zabbix')}
                onCheckedChange={(checked) => handleToolChange('zabbix', checked as boolean)}
                disabled={selectedTools.includes('todos')}
              />
              <label htmlFor="zabbix" className="text-sm">Zabbix</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="elastic"
                checked={selectedTools.includes('elastic')}
                onCheckedChange={(checked) => handleToolChange('elastic', checked as boolean)}
                disabled={selectedTools.includes('todos')}
              />
              <label htmlFor="elastic" className="text-sm">Elastic</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dynatrace"
                checked={selectedTools.includes('dynatrace')}
                onCheckedChange={(checked) => handleToolChange('dynatrace', checked as boolean)}
                disabled={selectedTools.includes('todos')}
              />
              <label htmlFor="dynatrace" className="text-sm">Dynatrace</label>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'infra' | 'apm')} className="w-full">
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
                  placeholder="Digite hosts separados por vírgula ou ponto e vírgula (ex: server1, server2; server3.domain)"
                  className="flex-1"
                  disabled={isLoading}
                />
                 <p className="text-xs text-muted-foreground">
                   Busca por hosts nas ferramentas selecionadas
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
                   Busca por aplicações em: Elastic (labels.domain) e Dynatrace (tags configuráveis)
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