import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Settings, Server, Activity } from "lucide-react";

interface EnhancedSearchFormProps {
  onSearch: (query: string, type: 'infra' | 'apm') => void;
  onOpenSettings: () => void;
  isLoading: boolean;
}

export const EnhancedSearchForm = ({ onSearch, onOpenSettings, isLoading }: EnhancedSearchFormProps) => {
  const [infraQuery, setInfraQuery] = useState("");
  const [apmQuery, setApmQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'infra' | 'apm'>('infra');

  const handleSubmit = (e: React.FormEvent, type: 'infra' | 'apm') => {
    e.preventDefault();
    const query = type === 'infra' ? infraQuery : apmQuery;
    if (query.trim()) {
      onSearch(query.trim(), type);
    }
  };

  const parseMultipleQueries = (query: string) => {
    return query.split(/[,;.\s]+/).filter(q => q.trim().length > 0);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Busca de Monitoração</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </Button>
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
            <form onSubmit={(e) => handleSubmit(e, 'infra')} className="space-y-3">
              <div className="space-y-2">
                <Input
                  value={infraQuery}
                  onChange={(e) => setInfraQuery(e.target.value)}
                  placeholder="Digite hosts separados por vírgula, ponto e vírgula ou ponto (ex: server1, server2; server3.domain)"
                  className="flex-1"
                  disabled={isLoading}
                />
                 <p className="text-xs text-muted-foreground">
                   Busca por hosts em: Zabbix, Elastic e Dynatrace
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