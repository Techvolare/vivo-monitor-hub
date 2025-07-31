import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/login-form";
import { Navbar } from "@/components/ui/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnhancedSettingsModal } from "@/components/dashboard/enhanced-settings-modal";
import { Settings, Database, Server, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ToolConfig {
  url: string;
  username: string;
  password: string;
  token: string;
}

interface ElasticConfig extends ToolConfig {
  indices: string;
}

interface DynatraceConfig extends ToolConfig {
  apmTag: string;
  hostGroupFilter: string;
}

interface SettingsConfig {
  zabbix: {
    infra: ToolConfig;
  };
  elastic: {
    infra: ElasticConfig;
    apm: ElasticConfig;
  };
  dynatrace: {
    infra: DynatraceConfig;
  };
}

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<SettingsConfig>({
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
  const { toast } = useToast();

  // Verificar se já está autenticado (localStorage)
  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
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
    // Em produção, implementar validação real com backend/API
    if (credentials.username === "admin" && credentials.password === "vivo123") {
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
      toast({
        title: "Login realizado",
        description: "Bem-vindo ao painel administrativo!",
      });
      return true;
    }
    
    toast({
      title: "Credenciais inválidas",
      description: "Usuário ou senha incorretos.",
      variant: "destructive"
    });
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    toast({
      title: "Logout realizado",
      description: "Até mais!",
    });
    navigate('/');
  };

  const handleSaveSettings = (newSettings: SettingsConfig) => {
    setSettings(newSettings);
    localStorage.setItem("vivoMonitorSettings", JSON.stringify(newSettings));
    toast({
      title: "Configurações salvas",
      description: "As configurações foram atualizadas com sucesso!",
    });
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogout={handleLogout} isAdmin={true} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground">
              Configuração das ferramentas de monitoramento
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5 text-primary" />
                  <span>Zabbix</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  Configurações de conexão com o Zabbix para monitoramento de infraestrutura
                </p>
                <div className="space-y-2 text-xs">
                  <div>URL: {settings.zabbix.infra.url || 'Não configurado'}</div>
                  <div>Status: {settings.zabbix.infra.url ? 'Configurado' : 'Pendente'}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-primary" />
                  <span>Elastic</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  Configurações de conexão com o Elasticsearch para logs e APM
                </p>
                <div className="space-y-2 text-xs">
                  <div>Infra URL: {settings.elastic.infra.url || 'Não configurado'}</div>
                  <div>APM URL: {settings.elastic.apm.url || 'Não configurado'}</div>
                  <div>Status: {(settings.elastic.infra.url && settings.elastic.apm.url) ? 'Configurado' : 'Pendente'}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>Dynatrace</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  Configurações de conexão com o Dynatrace para monitoramento avançado
                </p>
                <div className="space-y-2 text-xs">
                  <div>URL: {settings.dynatrace.infra.url || 'Não configurado'}</div>
                  <div>Status: {settings.dynatrace.infra.url ? 'Configurado' : 'Pendente'}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              onClick={() => setShowSettings(true)}
              className="bg-vivo-gradient hover:opacity-90 transition-opacity"
              size="lg"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar Ferramentas
            </Button>
          </div>
        </div>
      </div>

      <EnhancedSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
        initialConfig={settings}
      />
    </div>
  );
};

export default Index;