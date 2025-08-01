interface ConnectionTestResult {
  success: boolean;
  error?: string;
  details?: any;
}

export class ConnectionTester {
  
  static async testZabbix(config: { url: string; token: string }): Promise<ConnectionTestResult> {
    if (!config.url || !config.token) {
      return {
        success: false,
        error: "URL e Token são obrigatórios para Zabbix"
      };
    }

    try {
      const response = await fetch(`${config.url}/api_jsonrpc.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'apiinfo.version',
          auth: config.token,
          id: 1
        })
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Erro HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      
      if (data.error) {
        return {
          success: false,
          error: `Erro Zabbix: ${data.error.message}`,
          details: data.error
        };
      }

      return {
        success: true,
        details: { version: data.result }
      };
    } catch (error) {
      return this.handleConnectionError(error, 'Zabbix');
    }
  }

  static async testElasticsearch(config: { url: string; username?: string; password?: string; token?: string }): Promise<ConnectionTestResult> {
    if (!config.url) {
      return {
        success: false,
        error: "URL é obrigatória para Elasticsearch"
      };
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (config.username && config.password) {
        headers['Authorization'] = `Basic ${btoa(`${config.username}:${config.password}`)}`;
      } else if (config.token) {
        headers['Authorization'] = `Bearer ${config.token}`;
      }

      const response = await fetch(`${config.url}/_cluster/health`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          return {
            success: false,
            error: "Credenciais inválidas. Verifique usuário/senha ou token."
          };
        }
        return {
          success: false,
          error: `Erro HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        details: { 
          cluster: data.cluster_name,
          status: data.status,
          nodes: data.number_of_nodes
        }
      };
    } catch (error) {
      return this.handleConnectionError(error, 'Elasticsearch');
    }
  }

  static async testDynatrace(config: { url: string; token: string }): Promise<ConnectionTestResult> {
    if (!config.url || !config.token) {
      return {
        success: false,
        error: "URL e Token são obrigatórios para Dynatrace"
      };
    }

    try {
      const response = await fetch(`${config.url}/api/v2/activeGates`, {
        method: 'GET',
        headers: {
          'Authorization': `Api-Token ${config.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          return {
            success: false,
            error: "Token inválido. Verifique as permissões do token."
          };
        }
        return {
          success: false,
          error: `Erro HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        details: { 
          activeGatesCount: data.activeGates?.length || 0
        }
      };
    } catch (error) {
      return this.handleConnectionError(error, 'Dynatrace');
    }
  }

  private static handleConnectionError(error: any, toolName: string): ConnectionTestResult {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      return {
        success: false,
        error: `Erro de conectividade: Verifique se o ${toolName} está acessível e configure CORS se necessário.`,
        details: {
          type: 'CORS_OR_CONNECTIVITY',
          message: error.message,
          suggestions: [
            `Verifique se a URL do ${toolName} está correta`,
            'Configure CORS no servidor se necessário',
            'Verifique se não há firewall bloqueando a conexão',
            'Use um proxy se o CORS não puder ser configurado'
          ]
        }
      };
    }

    return {
      success: false,
      error: `Erro inesperado: ${error.message}`,
      details: { type: 'UNKNOWN', message: error.message }
    };
  }
}