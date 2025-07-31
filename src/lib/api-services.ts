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

interface Configuration {
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

export class ZabbixService {
  private config: ToolConfig;

  constructor(config: ToolConfig) {
    this.config = config;
  }

  async searchHosts(queries: string[]) {
    if (!this.config.url || !this.config.token) {
      throw new Error('Configuração do Zabbix incompleta');
    }

    try {
      const response = await fetch(`${this.config.url}/api_jsonrpc.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'host.get',
          params: {
            output: ['hostid', 'host', 'name', 'status'],
            selectGroups: ['name'],
            selectTags: ['tag', 'value'],
            selectTriggers: ['description', 'priority', 'status'],
            selectTemplates: ['name'],
            filter: {
              host: queries
            }
          },
          auth: this.config.token,
          id: 1
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API Zabbix: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Erro Zabbix: ${data.error.message}`);
      }

      return data.result.map((host: any) => ({
        host: host.host,
        templates: host.templates?.map((t: any) => t.name) || [],
        triggers: host.triggers?.filter((t: any) => t.status === '0').map((t: any) => ({
          name: t.description,
          severity: this.getSeverityName(t.priority),
          status: 'active'
        })) || [],
        agentStatus: host.status === '0' ? 'active' : 'inactive',
        hostGroups: host.groups?.map((g: any) => g.name) || [],
        tags: host.tags || []
      }));
    } catch (error) {
      console.error('Erro ao consultar Zabbix:', error);
      throw error;
    }
  }

  private getSeverityName(priority: string): string {
    const severityMap: { [key: string]: string } = {
      '0': 'information',
      '1': 'warning',
      '2': 'average',
      '3': 'high',
      '4': 'disaster'
    };
    return severityMap[priority] || 'unknown';
  }
}

export class ElasticService {
  private config: ElasticConfig;

  constructor(config: ElasticConfig) {
    this.config = config;
  }

  async searchInfrastructure(queries: string[]) {
    if (!this.config.url) {
      throw new Error('Configuração do Elasticsearch incompleta');
    }

    try {
      const auth = this.config.username && this.config.password 
        ? btoa(`${this.config.username}:${this.config.password}`)
        : null;

      const searchBody = {
        query: {
          bool: {
            should: queries.flatMap(query => [
              { match: { "host.name": query } },
              { match: { "host.hostname": query } }
            ]),
            minimum_should_match: 1
          }
        },
        _source: ["host.name", "host.hostname", "host.ip", "host.os.name"],
        size: 100
      };

      const response = await fetch(`${this.config.url}/${this.config.indices || '_all'}/_search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(auth && { 'Authorization': `Basic ${auth}` }),
          ...(this.config.token && { 'Authorization': `Bearer ${this.config.token}` })
        },
        body: JSON.stringify(searchBody)
      });

      if (!response.ok) {
        throw new Error(`Erro na API Elasticsearch: ${response.status}`);
      }

      const data = await response.json();

      return {
        hosts: data.hits.hits.map((hit: any) => ({
          hostname: hit._source.host?.name || hit._source.host?.hostname || 'N/A',
          status: 'active',
          os: hit._source.host?.os?.name || 'N/A',
          ip: hit._source.host?.ip || 'N/A'
        }))
      };
    } catch (error) {
      console.error('Erro ao consultar Elasticsearch (Infra):', error);
      throw error;
    }
  }

  async searchAPM(queries: string[]) {
    if (!this.config.url) {
      throw new Error('Configuração do Elasticsearch incompleta');
    }

    try {
      const auth = this.config.username && this.config.password 
        ? btoa(`${this.config.username}:${this.config.password}`)
        : null;

      const searchBody = {
        query: {
          bool: {
            should: queries.map(query => ({
              match: { "labels.domain": query }
            })),
            minimum_should_match: 1
          }
        },
        _source: ["service.name", "labels.domain", "@timestamp"],
        size: 100,
        aggs: {
          services: {
            terms: {
              field: "service.name.keyword",
              size: 10
            },
            aggs: {
              avg_response_time: {
                avg: {
                  field: "transaction.duration.us"
                }
              }
            }
          }
        }
      };

      const response = await fetch(`${this.config.url}/${this.config.indices || 'apm-*'}/_search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(auth && { 'Authorization': `Basic ${auth}` }),
          ...(this.config.token && { 'Authorization': `Bearer ${this.config.token}` })
        },
        body: JSON.stringify(searchBody)
      });

      if (!response.ok) {
        throw new Error(`Erro na API Elasticsearch: ${response.status}`);
      }

      const data = await response.json();

      return {
        applications: data.aggregations?.services?.buckets?.map((bucket: any) => ({
          name: bucket.key,
          domain: queries[0], // Simplified for demo
          status: 'healthy',
          responseTime: Math.round((bucket.avg_response_time?.value || 0) / 1000), // Convert to ms
          errorRate: 0 // Would need additional query for error rate
        })) || []
      };
    } catch (error) {
      console.error('Erro ao consultar Elasticsearch (APM):', error);
      throw error;
    }
  }
}

export class DynatraceService {
  private config: DynatraceConfig;

  constructor(config: DynatraceConfig) {
    this.config = config;
  }

  async searchInfrastructure(queries: string[]) {
    if (!this.config.url || !this.config.token) {
      throw new Error('Configuração do Dynatrace incompleta');
    }

    try {
      const hostSelector = queries.map(q => `entityName("${q}")`).join(',');
      
      const response = await fetch(`${this.config.url}/api/v2/entities?entitySelector=type("HOST"),${hostSelector}`, {
        headers: {
          'Authorization': `Api-Token ${this.config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API Dynatrace: ${response.status}`);
      }

      const data = await response.json();

      // Get problems for each host
      const hostsWithProblems = await Promise.all(
        data.entities.map(async (host: any) => {
          const problemsResponse = await fetch(
            `${this.config.url}/api/v2/problems?entitySelector=entityId("${host.entityId}")`, 
            {
              headers: {
                'Authorization': `Api-Token ${this.config.token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const problemsData = problemsResponse.ok ? await problemsResponse.json() : { problems: [] };

          return {
            name: host.displayName,
            monitoringType: host.properties?.monitoringMode || 'INFRASTRUCTURE',
            hostgroup: this.config.hostGroupFilter || 'default',
            status: problemsData.problems?.length > 0 ? 'warning' : 'healthy',
            problems: problemsData.problems?.slice(0, 5).map((p: any) => ({
              title: p.title,
              severity: p.severityLevel,
              impact: p.impactLevel
            })) || []
          };
        })
      );

      return { hosts: hostsWithProblems };
    } catch (error) {
      console.error('Erro ao consultar Dynatrace:', error);
      throw error;
    }
  }
}

export class MonitoringAPIService {
  private config: Configuration;

  constructor(config: Configuration) {
    this.config = config;
  }

  async searchMonitoringData(queries: string[], type: 'infra' | 'apm', tools: string[]) {
    const shouldIncludeTool = (tool: string) => tools.includes('todos') || tools.includes(tool);
    const results: any = { type, queries };

    const promises: Promise<void>[] = [];

    // Zabbix (apenas infraestrutura)
    if (type === 'infra' && shouldIncludeTool('zabbix')) {
      promises.push(
        (async () => {
          try {
            results.zabbix = { status: 'loading' };
            const zabbixService = new ZabbixService(this.config.zabbix.infra);
            const data = await zabbixService.searchHosts(queries);
            results.zabbix = { status: 'success', data };
          } catch (error) {
            results.zabbix = { 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Erro desconhecido no Zabbix'
            };
          }
        })()
      );
    }

    // Elasticsearch
    if (shouldIncludeTool('elastic')) {
      promises.push(
        (async () => {
          try {
            results.elastic = { status: 'loading' };
            const elasticService = new ElasticService(
              type === 'infra' ? this.config.elastic.infra : this.config.elastic.apm
            );
            const data = type === 'infra' 
              ? await elasticService.searchInfrastructure(queries)
              : await elasticService.searchAPM(queries);
            results.elastic = { status: 'success', data };
          } catch (error) {
            results.elastic = { 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Erro desconhecido no Elasticsearch'
            };
          }
        })()
      );
    }

    // Dynatrace (apenas infraestrutura)
    if (type === 'infra' && shouldIncludeTool('dynatrace')) {
      promises.push(
        (async () => {
          try {
            results.dynatrace = { status: 'loading' };
            const dynatraceService = new DynatraceService(this.config.dynatrace.infra);
            const data = await dynatraceService.searchInfrastructure(queries);
            results.dynatrace = { status: 'success', data };
          } catch (error) {
            results.dynatrace = { 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Erro desconhecido no Dynatrace'
            };
          }
        })()
      );
    }

    // Aguardar todas as consultas paralelas
    await Promise.all(promises);

    return results;
  }
}