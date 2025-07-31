import { useState, useEffect } from "react";
import { EnhancedSearchForm } from "@/components/dashboard/enhanced-search-form";
import { EnhancedMonitoringResults } from "@/components/dashboard/enhanced-monitoring-results";
import { EnhancedSettingsModal } from "@/components/dashboard/enhanced-settings-modal";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MonitoringAPIService } from "@/lib/api-services";
import { useToast } from "@/hooks/use-toast";

const Consulta = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [config, setConfig] = useState({
    zabbix: {
      infra: { url: '', username: '', password: '', token: '' }
    },
    elastic: {
      infra: { url: '', username: '', password: '', token: '', indices: '' },
      apm: { url: '', username: '', password: '', token: '', indices: '' }
    },
    dynatrace: {
      infra: { url: '', username: '', password: '', token: '', apmTag: '', hostGroupFilter: '' }
    }
  });

  // Carregar configurações salvas do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("vivoMonitorSettings");
    if (savedSettings) {
      try {
        setConfig(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  }, []);

  const parseMultipleQueries = (query: string) => {
    return query.split(/[,;\s]+/).filter(q => q.trim().length > 0);
  };

  const handleSearch = async (query: string, type: 'infra' | 'apm', tools: string[] = ['todos']) => {
    setIsLoading(true);
    setResults(null);
    
    const queries = parseMultipleQueries(query);
    
    try {
      // Verificar se há configurações necessárias
      const hasRequiredConfig = tools.some(tool => {
        if (tool === 'todos') return true;
        if (tool === 'zabbix' && type === 'infra') {
          return config.zabbix.infra.url && config.zabbix.infra.token;
        }
        if (tool === 'elastic') {
          const elasticConfig = type === 'infra' ? config.elastic.infra : config.elastic.apm;
          return elasticConfig.url;
        }
        if (tool === 'dynatrace' && type === 'infra') {
          return config.dynatrace.infra.url && config.dynatrace.infra.token;
        }
        return false;
      });

      if (!hasRequiredConfig && !tools.includes('todos')) {
        toast({
          title: "Configuração necessária",
          description: "Configure as ferramentas selecionadas antes de realizar a consulta.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const apiService = new MonitoringAPIService(config);
      const results = await apiService.searchMonitoringData(queries, type, tools);
      
      setResults(results);
    } catch (error) {
      console.error('Erro na consulta:', error);
      toast({
        title: "Erro na consulta",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = (newConfig: any) => {
    setConfig(newConfig);
    localStorage.setItem("vivoMonitorSettings", JSON.stringify(newConfig));
    toast({
      title: "Configurações salvas",
      description: "As configurações foram atualizadas com sucesso!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Consulta de Monitoramento
                </h1>
                <p className="text-muted-foreground">
                  Consulte informações de host, IP ou domínio nas ferramentas de monitoramento
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="border-primary/20 text-primary hover:bg-primary/10"
              >
                <Shield className="h-4 w-4 mr-2" />
                Área Administrativa
              </Button>
            </div>
          </div>
          
          <div className="mb-8">
            <EnhancedSearchForm 
              onSearch={handleSearch} 
              onOpenSettings={() => setSettingsOpen(true)}
              isLoading={isLoading}
            />
          </div>
          
          {results && (
            <EnhancedMonitoringResults data={results} />
          )}
        </div>
      </div>

      <EnhancedSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialConfig={config}
      />
    </div>
  );
};

export default Consulta;