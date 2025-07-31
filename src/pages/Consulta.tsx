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

  const parseMultipleQueries = (query: string) => {
    return query.split(/[,;\s]+/).filter(q => q.trim().length > 0);
  };

  const handleSearch = (query: string, type: 'infra' | 'apm', tools: string[] = ['todos']) => {
    setIsLoading(true);
    const queries = parseMultipleQueries(query);
    
    // Simulação de dados de monitoramento expandidos
    const shouldIncludeTool = (tool: string) => tools.includes('todos') || tools.includes(tool);
    
    const mockData = {
      type,
      queries,
      zabbix: (type === 'infra' && shouldIncludeTool('zabbix')) ? {
        status: "success" as const,
        data: queries.map(q => ({
          host: q,
          templates: ["Template OS Linux", "Template App Apache", "Template Net Interface"],
          triggers: [
            { name: "High CPU usage", severity: "warning", status: "active" },
            { name: "Low disk space", severity: "high", status: "active" },
            { name: "High memory usage", severity: "average", status: "active" }
          ],
          agentStatus: "active" as const,
          hostGroups: ["Linux servers", "Production", "Web servers"],
          tags: [
            { tag: "Environment", value: "Production" },
            { tag: "Team", value: "DevOps" },
            { tag: "Location", value: "DataCenter-A" }
          ]
        }))
      } : undefined,
      elastic: shouldIncludeTool('elastic') ? {
        status: "success" as const,
        data: type === 'infra' ? {
          hosts: queries.map(q => ({
            hostname: q,
            status: "active",
            os: "Ubuntu 20.04",
            ip: "192.168.1." + Math.floor(Math.random() * 100)
          }))
        } : {
          applications: queries.flatMap(q => [
            { name: "webapp", domain: q, status: "healthy", responseTime: 120, errorRate: 0.5 },
            { name: "api", domain: q, status: "healthy", responseTime: 80, errorRate: 0.2 }
          ])
        }
      } : undefined,
      dynatrace: (type === 'infra' && shouldIncludeTool('dynatrace')) ? {
        status: "success" as const,
        data: {
          hosts: queries.map(q => ({
            name: q,
            monitoringType: "FULL_STACK" as const,
            hostgroup: "production",
            status: "healthy" as const,
            problems: [
              { title: "High CPU usage on " + q, severity: "WARNING", impact: "Performance" },
              { title: "Memory leak detected", severity: "HIGH", impact: "Availability" }
            ]
          }))
        }
      } : undefined
    };
    
    // Simular delay de API
    setTimeout(() => {
      setResults(mockData);
      setIsLoading(false);
    }, 1500);
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
              isLoading={isLoading}
            />
          </div>
          
          {results && (
            <EnhancedMonitoringResults data={results} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Consulta;