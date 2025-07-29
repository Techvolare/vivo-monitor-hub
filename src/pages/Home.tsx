import { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Shield, Activity, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import vivoLogo from "@/assets/vivo-logo.png";

const Home = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onLogout={isAuthenticated ? handleLogout : undefined}
        isAdmin={isAuthenticated}
      />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <img 
                src={vivoLogo} 
                alt="Vivo" 
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Monitor Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Plataforma unificada de monitoramento para consulta de infraestrutura e aplicações
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/consulta')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-primary" />
                  <span>Consulta</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Consulte informações de hosts, IPs e domínios nas ferramentas de monitoramento
                </p>
                <Button variant="outline" className="w-full">
                  Acessar Consulta
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/login')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Administração</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Área administrativa para configuração das ferramentas de monitoramento
                </p>
                <Button variant="outline" className="w-full">
                  {isAuthenticated ? 'Dashboard Admin' : 'Fazer Login'}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>Monitoramento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Integração com Zabbix, Elastic e Dynatrace para monitoramento completo
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Zabbix</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Elastic</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Dynatrace</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Status da Plataforma</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Zabbix</p>
                  <p className="text-xs text-muted-foreground">Operacional</p>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Elastic</p>
                  <p className="text-xs text-muted-foreground">Operacional</p>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Dynatrace</p>
                  <p className="text-xs text-muted-foreground">Operacional</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;