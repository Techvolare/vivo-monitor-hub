import { useState } from "react";
import { EnhancedSearchForm } from "@/components/dashboard/enhanced-search-form";
import { EnhancedMonitoringResults } from "@/components/dashboard/enhanced-monitoring-results";
import { EnhancedSettingsModal } from "@/components/dashboard/enhanced-settings-modal";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Consulta = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // TODO: Implementar verificação de admin real
  const [config, setConfig] = useState({
    zabbix: {
      infra: { url: '', username: '', password: '', token: '' }
    },
    elastic: {
      infra: { url: '', username: '', password: '', token: '', index: '' },
      apm: { url: '', username: '', password: '', token: '', index: '' }
    },
    dynatrace: {
      infra: { url: '', username: '', password: '', token: '' }
    }
  });

  const parseMultipleQueries = (query: string) => {
    return query.split(/[,;]+/).filter(q => q.trim().length > 0);
  };

  const handleSearch = async (query: string, type: 'infra' | 'apm', selectedTools: string[]) => {
    setIsLoading(true);
    const queries = parseMultipleQueries(query);
    
    try {
      // TODO: Implementar chamadas reais para as APIs baseadas na configuração
      // Estrutura de resposta vazia para ser preenchida com dados reais
      const resultsData = {
        type,
        queries,
        zabbix: undefined as any,
        elastic: undefined as any,
        dynatrace: undefined as any
      };

      // Aqui você deve implementar as chamadas reais para cada ferramenta selecionada
      // baseado na configuração salva e nos selectedTools
      
      setResults(resultsData);
    } catch (error) {
      console.error('Erro na consulta:', error);
    } finally {
      setIsLoading(false);
    }
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
              onOpenSettings={isAdmin ? () => setSettingsOpen(true) : undefined}
              isLoading={isLoading}
            />
          </div>
          
          {results && (
            <EnhancedMonitoringResults data={results} />
          )}
        </div>
      </div>
      
      {isAdmin && (
        <EnhancedSettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onSave={setConfig}
          initialConfig={config}
        />
      )}
    </div>
  );
};

export default Consulta;