import { useState } from "react";
import { SimpleSearchForm } from "@/components/dashboard/simple-search-form";
import { MonitoringResults } from "@/components/dashboard/monitoring-results";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Consulta = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [currentQuery, setCurrentQuery] = useState("");

  const handleSearch = (query: string) => {
    setCurrentQuery(query);
    
    // Simulação de dados de monitoramento
    const mockData = {
      zabbix: {
        status: "success",
        data: {
          host: query,
          templates: ["Template OS Linux", "Template App Apache"],
          triggers: [
            { name: "High CPU usage", severity: "warning" },
            { name: "Low disk space", severity: "high" }
          ]
        }
      },
      elastic: {
        status: "success",
        data: {
          services: [
            { name: "nginx", status: "running" },
            { name: "database", status: "running" }
          ]
        }
      },
      dynatrace: {
        status: "success",
        data: {
          hosts: [
            { name: query, type: "FULL_STACK", hostgroup: "production" }
          ]
        }
      }
    };
    
    setResults(mockData);
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
            <SimpleSearchForm onSearch={handleSearch} />
          </div>
          
          {results && currentQuery && (
            <MonitoringResults data={results} query={currentQuery} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Consulta;