import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Activity, Cloud, Save, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConnectionTester } from "@/lib/connection-test";

interface ToolConfig {
  url: string;
  username: string;
  password: string;
  token: string;
}

interface DynatraceConfig extends ToolConfig {
  apmTag: string;
  hostGroupFilter: string;
}

interface ElasticConfig extends ToolConfig {
  indices: string;
}

interface EnhancedSettingsConfig {
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

interface EnhancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: EnhancedSettingsConfig) => void;
  initialConfig: EnhancedSettingsConfig;
}

export const EnhancedSettingsModal = ({ isOpen, onClose, onSave, initialConfig }: EnhancedSettingsModalProps) => {
  const [config, setConfig] = useState<EnhancedSettingsConfig>(initialConfig);
  const [testingTool, setTestingTool] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const updateToolConfig = (
    tool: keyof EnhancedSettingsConfig,
    type: 'infra' | 'apm',
    field: string,
    value: string
  ) => {
    setConfig(prev => {
      const toolConfig = prev[tool];
      if (!toolConfig || !(type in toolConfig)) return prev;
      
      return {
        ...prev,
        [tool]: {
          ...toolConfig,
          [type]: {
            ...(toolConfig as any)[type],
            [field]: value
          }
        }
      };
    });
  };

  const handleSave = () => {
    onSave(config);
    toast({
      title: "Configurações salvas",
      description: "As configurações das ferramentas foram atualizadas com sucesso.",
    });
    onClose();
  };

  const handleTest = async (tool: string, type: string) => {
    const testKey = `${tool}-${type}`;
    setTestingTool(testKey);
    
    try {
      let result;
      const toolConfig = (config as any)[tool]?.[type];
      
      if (!toolConfig) {
        throw new Error('Configuração não encontrada');
      }

      switch (tool) {
        case 'zabbix':
          result = await ConnectionTester.testZabbix(toolConfig);
          break;
        case 'elastic':
          result = await ConnectionTester.testElasticsearch(toolConfig);
          break;
        case 'dynatrace':
          result = await ConnectionTester.testDynatrace(toolConfig);
          break;
        default:
          throw new Error('Ferramenta não suportada');
      }

      if (result.success) {
        toast({
          title: "✅ Conexão bem-sucedida",
          description: `${tool} (${type}) conectado com sucesso!`,
        });
      } else {
        toast({
          title: "❌ Falha na conexão",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Erro no teste",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setTestingTool(null);
    }
  };

  const toolConfigs = [
    {
      key: 'zabbix' as const,
      name: 'Zabbix',
      icon: Server,
      color: 'text-blue-600',
      types: ['infra']
    },
    {
      key: 'elastic' as const,
      name: 'Elastic',
      icon: Activity,
      color: 'text-yellow-600',
      types: ['infra', 'apm']
    },
    {
      key: 'dynatrace' as const,
      name: 'Dynatrace',
      icon: Cloud,
      color: 'text-green-600',
      types: ['infra']
    }
  ];

  const renderConfigFields = (tool: keyof EnhancedSettingsConfig, type: 'infra' | 'apm') => {
    const toolData = config[tool];
    if (!toolData || !(type in toolData)) return null;
    const toolConfig = (toolData as any)[type];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${tool}-${type}-url`}>URL da API</Label>
          <Input
            id={`${tool}-${type}-url`}
            value={toolConfig?.url || ''}
            onChange={(e) => updateToolConfig(tool, type, 'url', e.target.value)}
            placeholder="https://api.exemplo.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`${tool}-${type}-username`}>Usuário</Label>
          <Input
            id={`${tool}-${type}-username`}
            value={toolConfig?.username || ''}
            onChange={(e) => updateToolConfig(tool, type, 'username', e.target.value)}
            placeholder="usuário"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`${tool}-${type}-password`}>Senha</Label>
          <Input
            id={`${tool}-${type}-password`}
            type="password"
            value={toolConfig?.password || ''}
            onChange={(e) => updateToolConfig(tool, type, 'password', e.target.value)}
            placeholder="senha"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`${tool}-${type}-token`}>Token/API Key</Label>
          <Input
            id={`${tool}-${type}-token`}
            value={toolConfig?.token || ''}
            onChange={(e) => updateToolConfig(tool, type, 'token', e.target.value)}
            placeholder="token ou chave da API"
          />
        </div>

        {tool === 'elastic' && (
          <div className="space-y-2">
            <Label htmlFor={`${tool}-${type}-indices`}>Índices</Label>
            <Input
              id={`${tool}-${type}-indices`}
              value={toolConfig?.indices || ''}
              onChange={(e) => updateToolConfig(tool, type, 'indices', e.target.value)}
              placeholder="ex: logs-*, metrics-*, apm-*"
            />
          </div>
        )}

        {tool === 'dynatrace' && (
          <div className="space-y-2">
            <Label htmlFor={`${tool}-${type}-hostGroupFilter`}>Filtro Host Group</Label>
            <Input
              id={`${tool}-${type}-hostGroupFilter`}
              value={toolConfig?.hostGroupFilter || ''}
              onChange={(e) => updateToolConfig(tool, type, 'hostGroupFilter', e.target.value)}
              placeholder="ex: production, staging"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Configurações das Ferramentas</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="zabbix-infra" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            {toolConfigs.map(tool => 
              tool.types.map(type => (
                <TabsTrigger 
                  key={`${tool.key}-${type}`} 
                  value={`${tool.key}-${type}`} 
                  className="flex flex-col items-center space-y-1 p-3"
                >
                  <tool.icon className={`h-4 w-4 ${tool.color}`} />
                  <div className="text-xs">
                    <div>{tool.name}</div>
                    <div className="text-muted-foreground">{type.toUpperCase()}</div>
                  </div>
                </TabsTrigger>
              ))
            )}
          </TabsList>

          {toolConfigs.map(tool => 
            tool.types.map(type => (
              <TabsContent key={`${tool.key}-${type}`} value={`${tool.key}-${type}`}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <tool.icon className={`h-5 w-5 ${tool.color}`} />
                      <span>{tool.name} - {type === 'infra' ? 'Infraestrutura' : 'APM'}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Configurações para {type === 'infra' ? 'monitoramento de infraestrutura' : 'monitoramento de aplicações'}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderConfigFields(tool.key, type as 'infra' | 'apm')}
                    
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => handleTest(tool.key, type as 'infra' | 'apm')}
                        disabled={testingTool === `${tool.key}-${type}`}
                        className="flex items-center space-x-2"
                      >
                        {testingTool === `${tool.key}-${type}` ? (
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
            ))
          )}
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