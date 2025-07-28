import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Settings, Server, Activity, Cloud } from "lucide-react";

interface EnhancedSearchFormProps {
  onSearch: (query: string, type: 'infra' | 'apm', selectedTools: string[]) => void;
  onOpenSettings?: () => void;
  isLoading: boolean;
}

export const EnhancedSearchForm = ({ onSearch, onOpenSettings, isLoading }: EnhancedSearchFormProps) => {
  const [infraQuery, setInfraQuery] = useState("");
  const [apmQuery, setApmQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'infra' | 'apm'>('infra');
  const [selectedInfraTools, setSelectedInfraTools] = useState<string[]>(['zabbix', 'elastic', 'dynatrace']);
  const [selectedApmTools, setSelectedApmTools] = useState<string[]>(['elastic']);

  const infraToolOptions = [
    { id: 'zabbix', name: 'Zabbix', icon: Server },
    { id: 'elastic', name: 'Elastic', icon: Activity },
    { id: 'dynatrace', name: 'Dynatrace', icon: Cloud }
  ];
  
  const apmToolOptions = [
    { id: 'elastic', name: 'Elastic', icon: Activity }
  ];

  const handleSubmit = (e: React.FormEvent, type: 'infra' | 'apm') => {
    e.preventDefault();
    const query = type === 'infra' ? infraQuery : apmQuery;
    const tools = type === 'infra' ? selectedInfraTools : selectedApmTools;
    if (query.trim() && tools.length > 0) {
      onSearch(query.trim(), type, tools);
    }
  };

  const parseMultipleQueries = (query: string) => {
    return query.split(/[,;]+/).filter(q => q.trim().length > 0);
  };

  const handleToolToggle = (toolId: string, type: 'infra' | 'apm') => {
    if (type === 'infra') {
      setSelectedInfraTools(prev => 
        prev.includes(toolId) 
          ? prev.filter(t => t !== toolId)
          : [...prev, toolId]
      );
    } else {
      setSelectedApmTools(prev => 
        prev.includes(toolId) 
          ? prev.filter(t => t !== toolId)
          : [...prev, toolId]
      );
    }
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
            <form onSubmit={(e) => handleSubmit(e, 'infra')} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ferramentas para consulta:</label>
                  <div className="flex flex-wrap gap-4">
                    {infraToolOptions.map((tool) => (
                      <div key={tool.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`infra-${tool.id}`}
                          checked={selectedInfraTools.includes(tool.id)}
                          onCheckedChange={() => handleToolToggle(tool.id, 'infra')}
                        />
                        <label htmlFor={`infra-${tool.id}`} className="flex items-center space-x-1 text-sm">
                          <tool.icon className="h-4 w-4" />
                          <span>{tool.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Input
                    value={infraQuery}
                    onChange={(e) => setInfraQuery(e.target.value)}
                    placeholder="Digite hosts separados por vírgula ou ponto e vírgula (ex: server1, server2; server3)"
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Busca por hosts nas ferramentas selecionadas
                  </p>
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={!infraQuery.trim() || selectedInfraTools.length === 0 || isLoading}
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
                  Consultará: {parseMultipleQueries(infraQuery).join(', ')} em {selectedInfraTools.join(', ')}
                </div>
              )}
            </form>
          </TabsContent>

          <TabsContent value="apm" className="mt-4">
            <form onSubmit={(e) => handleSubmit(e, 'apm')} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ferramentas para consulta:</label>
                  <div className="flex flex-wrap gap-4">
                    {apmToolOptions.map((tool) => (
                      <div key={tool.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`apm-${tool.id}`}
                          checked={selectedApmTools.includes(tool.id)}
                          onCheckedChange={() => handleToolToggle(tool.id, 'apm')}
                        />
                        <label htmlFor={`apm-${tool.id}`} className="flex items-center space-x-1 text-sm">
                          <tool.icon className="h-4 w-4" />
                          <span>{tool.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Input
                    value={apmQuery}
                    onChange={(e) => setApmQuery(e.target.value)}
                    placeholder="Digite domínios separados por vírgula ou ponto e vírgula (ex: app1.com, app2.com; app3.com)"
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Busca por aplicações no Elastic (labels.domain)
                  </p>
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={!apmQuery.trim() || selectedApmTools.length === 0 || isLoading}
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
                  Consultará: {parseMultipleQueries(apmQuery).join(', ')} em {selectedApmTools.join(', ')}
                </div>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};