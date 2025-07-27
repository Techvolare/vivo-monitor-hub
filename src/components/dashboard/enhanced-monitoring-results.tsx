import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Activity, Cloud, AlertTriangle, CheckCircle, XCircle, Users, Tag, Shield } from "lucide-react";

interface ZabbixData {
  host: string;
  templates: string[];
  triggers: Array<{ name: string; severity: string; status: string }>;
  agentStatus: 'active' | 'inactive' | 'unknown';
  hostGroups: string[];
  tags: Array<{ tag: string; value: string }>;
}

interface ElasticInfraData {
  services: Array<{ name: string; domain: string; status: string; host: string }>;
}

interface ElasticApmData {
  applications: Array<{ 
    name: string; 
    domain: string; 
    status: string;
    responseTime: number;
    errorRate: number;
  }>;
}

interface DynatraceInfraData {
  hosts: Array<{ 
    name: string; 
    monitoringType: 'FULL_STACK' | 'INFRASTRUCTURE';
    hostgroup: string;
    status: 'healthy' | 'warning' | 'critical';
  }>;
}

interface DynatraceApmData {
  applications: Array<{
    name: string;
    tags: Array<{ key: string; value: string }>;
    status: 'healthy' | 'warning' | 'critical';
    responseTime: number;
  }>;
}

interface EnhancedMonitoringData {
  type: 'infra' | 'apm';
  queries: string[];
  zabbix?: {
    status: 'success' | 'error' | 'loading';
    data?: ZabbixData[];
    error?: string;
  };
  elastic?: {
    status: 'success' | 'error' | 'loading';
    data?: ElasticInfraData | ElasticApmData;
    error?: string;
  };
  dynatrace?: {
    status: 'success' | 'error' | 'loading';
    data?: DynatraceInfraData | DynatraceApmData;
    error?: string;
  };
}

interface EnhancedMonitoringResultsProps {
  data: EnhancedMonitoringData;
}

export const EnhancedMonitoringResults = ({ data }: EnhancedMonitoringResultsProps) => {
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
      case 'critical':
        return 'destructive';
      case 'average':
      case 'warning':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const renderZabbixResults = () => {
    if (!data.zabbix) return null;

    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-blue-600" />
              <span>Zabbix</span>
            </CardTitle>
            {getStatusIcon(data.zabbix.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.zabbix.status === 'loading' && (
            <p className="text-muted-foreground">Consultando Zabbix...</p>
          )}
          
          {data.zabbix.status === 'error' && (
            <p className="text-destructive text-sm">{data.zabbix.error}</p>
          )}
          
          {data.zabbix.status === 'success' && data.zabbix.data && (
            <div className="space-y-4">
              {data.zabbix.data.map((hostData, index) => (
                <div key={index} className="border border-border rounded-md p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{hostData.host}</h4>
                    <Badge variant={hostData.agentStatus === 'active' ? 'default' : 'destructive'}>
                      Agent: {hostData.agentStatus}
                    </Badge>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      Grupos
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {hostData.hostGroups.map((group, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      Tags
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {hostData.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag.tag}: {tag.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Templates</h5>
                    <div className="flex flex-wrap gap-1">
                      {hostData.templates.map((template, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {template}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Triggers Ativos
                    </h5>
                    <div className="space-y-1">
                      {hostData.triggers.slice(0, 3).map((trigger, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2 border border-border rounded">
                          <span className="truncate flex-1">{trigger.name}</span>
                          <Badge variant={getSeverityColor(trigger.severity)} className="text-xs ml-2">
                            {trigger.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderElasticResults = () => {
    if (!data.elastic) return null;

    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-yellow-600" />
              <span>Elasticsearch</span>
            </CardTitle>
            {getStatusIcon(data.elastic.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.elastic.status === 'loading' && (
            <p className="text-muted-foreground">Consultando Elasticsearch...</p>
          )}
          
          {data.elastic.status === 'error' && (
            <p className="text-destructive text-sm">{data.elastic.error}</p>
          )}
          
          {data.elastic.status === 'success' && data.elastic.data && (
            <div className="space-y-3">
              {data.type === 'infra' ? (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Serviços de Infraestrutura</h4>
                  <div className="space-y-2">
                    {(data.elastic.data as ElasticInfraData).services.map((service, index) => (
                      <div key={index} className="border border-border rounded-md p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{service.name}</span>
                          <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                            {service.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Host: {service.host} | Domain: {service.domain}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Aplicações APM</h4>
                  <div className="space-y-2">
                    {(data.elastic.data as ElasticApmData).applications.map((app, index) => (
                      <div key={index} className="border border-border rounded-md p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{app.name}</span>
                          <Badge variant={app.status === 'healthy' ? 'default' : 'secondary'}>
                            {app.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 space-y-1">
                          <p>Domain: {app.domain}</p>
                          <p>Response Time: {app.responseTime}ms | Error Rate: {app.errorRate}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderDynatraceResults = () => {
    if (!data.dynatrace) return null;

    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Cloud className="h-5 w-5 text-green-600" />
              <span>Dynatrace</span>
            </CardTitle>
            {getStatusIcon(data.dynatrace.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.dynatrace.status === 'loading' && (
            <p className="text-muted-foreground">Consultando Dynatrace...</p>
          )}
          
          {data.dynatrace.status === 'error' && (
            <p className="text-destructive text-sm">{data.dynatrace.error}</p>
          )}
          
          {data.dynatrace.status === 'success' && data.dynatrace.data && (
            <div className="space-y-3">
              {data.type === 'infra' ? (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Hosts Monitorados</h4>
                  <div className="space-y-2">
                    {(data.dynatrace.data as DynatraceInfraData).hosts.map((host, index) => (
                      <div key={index} className="border border-border rounded-md p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{host.name}</span>
                          <div className="flex space-x-1">
                            <Badge variant={host.status === 'healthy' ? 'default' : 'destructive'} className="text-xs">
                              {host.status}
                            </Badge>
                            <Badge variant={host.monitoringType === 'FULL_STACK' ? 'default' : 'secondary'} className="text-xs">
                              {host.monitoringType}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Host Group: {host.hostgroup}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Aplicações APM</h4>
                  <div className="space-y-2">
                    {(data.dynatrace.data as DynatraceApmData).applications.map((app, index) => (
                      <div key={index} className="border border-border rounded-md p-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{app.name}</span>
                          <Badge variant={app.status === 'healthy' ? 'default' : 'destructive'} className="text-xs">
                            {app.status}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {app.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag.key}: {tag.value}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Response Time: {app.responseTime}ms
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Resultados {data.type === 'infra' ? 'de Infraestrutura' : 'de APM'}
        </h2>
        <p className="text-muted-foreground mt-2">
          Consulta para: <span className="text-primary">{data.queries.join(', ')}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {data.type === 'infra' && renderZabbixResults()}
        {renderElasticResults()}
        {renderDynatraceResults()}
      </div>
    </div>
  );
};