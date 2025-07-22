import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Activity, Cloud, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface MonitoringData {
  zabbix?: {
    status: 'success' | 'error' | 'loading';
    data?: {
      host: string;
      templates: string[];
      items: Array<{ name: string; status: string }>;
      triggers: Array<{ name: string; severity: string; status: string }>;
    };
    error?: string;
  };
  elastic?: {
    status: 'success' | 'error' | 'loading';
    data?: {
      services: Array<{ name: string; domain: string; status: string }>;
    };
    error?: string;
  };
  dynatrace?: {
    status: 'success' | 'error' | 'loading';
    data?: {
      hosts: Array<{ 
        name: string; 
        monitoringType: 'FULL_STACK' | 'INFRASTRUCTURE';
        hostgroup: string;
      }>;
    };
    error?: string;
  };
}

interface MonitoringResultsProps {
  data: MonitoringData;
  query: string;
}

export const MonitoringResults = ({ data, query }: MonitoringResultsProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'disaster':
        return 'destructive';
      case 'average':
        return 'secondary';
      case 'warning':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Resultados para: <span className="text-primary">{query}</span>
        </h2>
        <p className="text-muted-foreground mt-2">
          Informações das ferramentas de monitoração
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zabbix Results */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-5 w-5 text-blue-600" />
                <span>Zabbix</span>
              </CardTitle>
              {getStatusIcon(data.zabbix?.status || 'loading')}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.zabbix?.status === 'loading' && (
              <p className="text-muted-foreground">Consultando Zabbix...</p>
            )}
            
            {data.zabbix?.status === 'error' && (
              <p className="text-destructive text-sm">{data.zabbix.error}</p>
            )}
            
            {data.zabbix?.status === 'success' && data.zabbix.data && (
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Host</h4>
                  <p className="text-sm">{data.zabbix.data.host}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Templates</h4>
                  <div className="flex flex-wrap gap-1">
                    {data.zabbix.data.templates.map((template, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {template}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Triggers Ativos</h4>
                  <div className="space-y-1">
                    {data.zabbix.data.triggers.slice(0, 3).map((trigger, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="truncate">{trigger.name}</span>
                        <Badge variant={getSeverityColor(trigger.severity)} className="text-xs">
                          {trigger.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Elastic Results */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-yellow-600" />
                <span>Elastic</span>
              </CardTitle>
              {getStatusIcon(data.elastic?.status || 'loading')}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.elastic?.status === 'loading' && (
              <p className="text-muted-foreground">Consultando Elasticsearch...</p>
            )}
            
            {data.elastic?.status === 'error' && (
              <p className="text-destructive text-sm">{data.elastic.error}</p>
            )}
            
            {data.elastic?.status === 'success' && data.elastic.data && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Serviços Encontrados</h4>
                <div className="space-y-2">
                  {data.elastic.data.services.slice(0, 5).map((service, index) => (
                    <div key={index} className="border border-border rounded-md p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{service.name}</span>
                        <Badge 
                          variant={service.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {service.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{service.domain}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dynatrace Results */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Cloud className="h-5 w-5 text-green-600" />
                <span>Dynatrace</span>
              </CardTitle>
              {getStatusIcon(data.dynatrace?.status || 'loading')}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.dynatrace?.status === 'loading' && (
              <p className="text-muted-foreground">Consultando Dynatrace...</p>
            )}
            
            {data.dynatrace?.status === 'error' && (
              <p className="text-destructive text-sm">{data.dynatrace.error}</p>
            )}
            
            {data.dynatrace?.status === 'success' && data.dynatrace.data && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Hosts Monitorados</h4>
                <div className="space-y-2">
                  {data.dynatrace.data.hosts.slice(0, 4).map((host, index) => (
                    <div key={index} className="border border-border rounded-md p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{host.name}</span>
                        <Badge 
                          variant={host.monitoringType === 'FULL_STACK' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {host.monitoringType}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Grupo: {host.hostgroup}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};