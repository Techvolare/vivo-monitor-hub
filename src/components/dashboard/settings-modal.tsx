import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Activity, Cloud, Save, TestTube } from "lucide-react";
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

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: SettingsConfig) => void;
  initialConfig: SettingsConfig;
}

export const SettingsModal = ({ isOpen, onClose, onSave, initialConfig }: SettingsModalProps) => {
  const [config, setConfig] = useState<SettingsConfig>(initialConfig);
  const [testingTool, setTestingTool] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const updateToolConfig = (tool: keyof SettingsConfig, field: keyof ToolConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [tool]: {
        ...prev[tool],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    onSave(config);
    toast({
      title: "Configurações salvas",
      description: "As configurações das ferramentas foram atualizadas com sucesso.",
    });
    onClose();
  };

  const handleTest = async (tool: keyof SettingsConfig) => {
    setTestingTool(tool);
    
    // Simular teste de conexão
    setTimeout(() => {
      setTestingTool(null);
      toast({
        title: "Teste de conexão",
        description: `Conexão com ${tool} testada com sucesso!`,
      });
    }, 2000);
  };

  const toolConfigs = [
    {
      key: 'zabbix' as const,
      name: 'Zabbix',
      icon: Server,
      color: 'text-blue-600',
      description: 'Configurações da API do Zabbix'
    },
    {
      key: 'elastic' as const,
      name: 'Elasticsearch',
      icon: Activity,
      color: 'text-yellow-600',
      description: 'Configurações da API do Elasticsearch'
    },
    {
      key: 'dynatrace' as const,
      name: 'Dynatrace',
      icon: Cloud,
      color: 'text-green-600',
      description: 'Configurações da API do Dynatrace'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Configurações das Ferramentas</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="zabbix" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {toolConfigs.map(tool => (
              <TabsTrigger key={tool.key} value={tool.key} className="flex items-center space-x-2">
                <tool.icon className={`h-4 w-4 ${tool.color}`} />
                <span>{tool.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {toolConfigs.map(tool => (
            <TabsContent key={tool.key} value={tool.key}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <tool.icon className={`h-5 w-5 ${tool.color}`} />
                    <span>{tool.name}</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${tool.key}-url`}>URL da API</Label>
                      <Input
                        id={`${tool.key}-url`}
                        value={config[tool.key].url}
                        onChange={(e) => updateToolConfig(tool.key, 'url', e.target.value)}
                        placeholder="https://api.exemplo.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${tool.key}-username`}>Usuário</Label>
                      <Input
                        id={`${tool.key}-username`}
                        value={config[tool.key].username}
                        onChange={(e) => updateToolConfig(tool.key, 'username', e.target.value)}
                        placeholder="usuário"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${tool.key}-password`}>Senha</Label>
                      <Input
                        id={`${tool.key}-password`}
                        type="password"
                        value={config[tool.key].password}
                        onChange={(e) => updateToolConfig(tool.key, 'password', e.target.value)}
                        placeholder="senha"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${tool.key}-token`}>Token/API Key</Label>
                      <Input
                        id={`${tool.key}-token`}
                        value={config[tool.key].token}
                        onChange={(e) => updateToolConfig(tool.key, 'token', e.target.value)}
                        placeholder="token ou chave da API"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => handleTest(tool.key)}
                      disabled={testingTool === tool.key}
                      className="flex items-center space-x-2"
                    >
                      {testingTool === tool.key ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span>Testando...</span>
                        </>
                      ) : (
                        <>
                          <TestTube className="h-4 w-4" />
                          <span>Testar Conexão</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-vivo-gradient hover:opacity-90">
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};