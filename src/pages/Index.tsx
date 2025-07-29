import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/login-form";
import { Navbar } from "@/components/ui/navbar";
import { SearchForm } from "@/components/dashboard/search-form";
import { MonitoringResults } from "@/components/dashboard/monitoring-results";
import { SettingsModal } from "@/components/dashboard/settings-modal";
import { useToast } from "@/hooks/use-toast";

interface ToolConfig {
  url: string;
  username: string;
  password: string;
  token: string;
}

interface SettingsConfig {
  zabbix: ToolConfig;
  elastic: ToolConfig;
  dynatrace: ToolConfig;
}

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<SettingsConfig>({
    zabbix: { url: "", username: "", password: "", token: "" },
    elastic: { url: "", username: "", password: "", token: "" },
    dynatrace: { url: "", username: "", password: "", token: "" }
  });
  const { toast } = useToast();

  // Verificar se já está autenticado (localStorage)
  useEffect(() => {
    const auth = localStorage.getItem("vivoMonitorAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }

    // Carregar configurações salvas
    const savedSettings = localStorage.getItem("vivoMonitorSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleLogin = (credentials: { username: string; password: string }) => {
    // Credenciais simples para demo (em produção, usar backend)
    if (credentials.username === "admin" && credentials.password === "vivo123") {
      setIsAuthenticated(true);
      localStorage.setItem("vivoMonitorAuth", "true");
      localStorage.setItem("isAuthenticated", "true");
      toast({
        title: "Login realizado",
        description: "Bem-vindo ao Monitor Hub!",
      });
      navigate('/');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("vivoMonitorAuth");
    setSearchResults(null);
    toast({
      title: "Logout realizado",
      description: "Até mais!",
    });
  };

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setSearchResults({
      zabbix: { status: 'loading' },
      elastic: { status: 'loading' },
      dynatrace: { status: 'loading' }
    });

    // Simular consultas às APIs (em produção, fazer chamadas reais)
    setTimeout(() => {
      setSearchResults({
        zabbix: {
          status: 'success',
          data: {
            host: query,
            templates: ['Template OS Linux', 'Template App HTTP Service', 'Template Net ICMP Ping'],
            items: [
              { name: 'CPU utilization', status: 'OK' },
              { name: 'Memory utilization', status: 'OK' },
              { name: 'Disk space usage', status: 'WARNING' }
            ],
            triggers: [
              { name: 'High CPU usage', severity: 'High', status: 'PROBLEM' },
              { name: 'Low disk space', severity: 'Average', status: 'OK' }
            ]
          }
        },
        elastic: {
          status: 'success',
          data: {
            services: [
              { name: 'web-service', domain: query, status: 'active' },
              { name: 'api-gateway', domain: query, status: 'active' },
              { name: 'database-service', domain: query, status: 'inactive' }
            ]
          }
        },
        dynatrace: {
          status: 'success',
          data: {
            hosts: [
              { name: query, monitoringType: 'FULL_STACK', hostgroup: 'Production' },
              { name: `${query}-backup`, monitoringType: 'INFRASTRUCTURE', hostgroup: 'Backup' }
            ]
          }
        }
      });
      setIsSearching(false);
    }, 2000);
  };

  const handleSaveSettings = (newSettings: SettingsConfig) => {
    setSettings(newSettings);
    localStorage.setItem("vivoMonitorSettings", JSON.stringify(newSettings));
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogout={handleLogout} isAdmin={true} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <SearchForm 
            onSearch={handleSearch}
            onOpenSettings={() => setShowSettings(true)}
            isLoading={isSearching}
          />
          
          {searchResults && (
            <MonitoringResults 
              data={searchResults}
              query={searchResults.query || "Host pesquisado"}
            />
          )}
        </div>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
        initialConfig={settings}
      />
    </div>
  );
};

export default Index;
