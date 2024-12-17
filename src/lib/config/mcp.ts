import env from './env';

export const mcpServers = {
  // Core functionality servers
  git: {
    name: 'git',
    command: 'mcp-server-git',
    args: ['--repository', './'],
    category: 'development'
  },
  postgres: {
    name: 'postgres',
    command: 'mcp-server-postgres',
    args: [env.POSTGRES_PRISMA_URL],
    category: 'database'
  },
  
  // Search and Knowledge servers
  tavily: {
    name: 'tavily',
    command: 'mcp-server-tavily',
    args: [],
    env: {
      TAVILY_API_KEY: env.TAVILY_API_KEY
    },
    category: 'search',
    capabilities: [{
      name: 'web-search',
      version: '1.0.0',
      features: ['real-time-search', 'news-search', 'academic-search'],
      limits: {
        requestsPerMinute: 60,
        maxResults: 100
      }
    }],
    initOptions: {
      retryAttempts: 3,
      timeout: 10000,
      healthCheckInterval: 60000,
      autoReconnect: true,
      logLevel: 'info' as const
    },
    healthCheck: {
      interval: 30000,
      timeout: 5000
    }
  },
  browserless: {
    name: 'browserless',
    command: 'mcp-server-browserless',
    args: [],
    env: {
      BROWSERLESS_API_KEY: env.BROWSERLESS_API_KEY
    },
    category: 'browser'
  },

  // File and Data servers
  filesystem: {
    name: 'filesystem',
    command: '@modelcontextprotocol/server-filesystem',
    args: ['--root', './data'],
    category: 'files'
  },
  memory: {
    name: 'memory',
    command: '@modelcontextprotocol/server-memory',
    args: [],
    category: 'memory'
  },

  // Development Tools
  github: {
    name: 'github',
    command: '@modelcontextprotocol/server-github',
    args: [],
    env: {
      GITHUB_TOKEN: env.GITHUB_TOKEN
    },
    category: 'development'
  },
  vscode: {
    name: 'vscode',
    command: '@modelcontextprotocol/server-vscode',
    args: [],
    category: 'development'
  },

  // AI and Vector Services
  openai: {
    name: 'openai',
    command: 'mcp-server-openai',
    args: [],
    env: {
      OPENAI_API_KEY: env.OPENAI_API_KEY
    },
    category: 'ai'
  },
  anthropic: {
    name: 'anthropic',
    command: 'mcp-server-anthropic',
    args: [],
    env: {
      ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY
    },
    category: 'ai'
  },
  qdrant: {
    name: 'qdrant',
    command: '@qdrant/mcp-server',
    args: [],
    env: {
      QDRANT_API_KEY: env.QDRANT_API_KEY,
      QDRANT_URL: env.QDRANT_URL
    },
    category: 'vector'
  },

  // Cloud and Infrastructure
  aws: {
    name: 'aws',
    command: '@aws/mcp-server',
    args: [],
    env: {
      AWS_ACCESS_KEY_ID: env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: env.AWS_SECRET_ACCESS_KEY
    },
    category: 'cloud'
  },
  vercel: {
    name: 'vercel',
    command: '@vercel/mcp-server',
    args: [],
    env: {
      VERCEL_TOKEN: env.VERCEL_TOKEN
    },
    category: 'cloud'
  },

  // Communication and Collaboration
  slack: {
    name: 'slack',
    command: '@modelcontextprotocol/server-slack',
    args: [],
    env: {
      SLACK_TOKEN: env.SLACK_TOKEN
    },
    category: 'communication'
  },
  linear: {
    name: 'linear',
    command: '@linear/mcp-server',
    args: [],
    env: {
      LINEAR_API_KEY: env.LINEAR_API_KEY
    },
    category: 'project-management'
  },

  // Data Analysis and Visualization
  jupyter: {
    name: 'jupyter',
    command: '@jupyter/mcp-server',
    args: [],
    category: 'analysis'
  },
  plotly: {
    name: 'plotly',
    command: '@plotly/mcp-server',
    args: [],
    env: {
      PLOTLY_API_KEY: env.PLOTLY_API_KEY
    },
    category: 'visualization'
  },

  // Search and Knowledge Enhancement
  brave: {
    name: 'brave',
    command: 'mcp-server-brave',
    args: [],
    env: {
      BRAVE_API_KEY: env.BRAVE_API_KEY
    },
    category: 'search'
  },
  exa: {
    name: 'exa',
    command: '@exa/mcp-server',
    args: [],
    env: {
      EXA_API_KEY: env.EXA_API_KEY
    },
    category: 'search'
  },

  // Database and Storage
  neo4j: {
    name: 'neo4j',
    command: '@neo4j/mcp-server',
    args: [],
    env: {
      NEO4J_URI: env.NEO4J_URI,
      NEO4J_USERNAME: env.NEO4J_USERNAME,
      NEO4J_PASSWORD: env.NEO4J_PASSWORD
    },
    category: 'database'
  },
  snowflake: {
    name: 'snowflake',
    command: 'mcp-server-snowflake',
    args: [],
    env: {
      SNOWFLAKE_ACCOUNT: env.SNOWFLAKE_ACCOUNT,
      SNOWFLAKE_USERNAME: env.SNOWFLAKE_USERNAME,
      SNOWFLAKE_PASSWORD: env.SNOWFLAKE_PASSWORD
    },
    category: 'database'
  },

  // Development and DevOps
  kubernetes: {
    name: 'kubernetes',
    command: 'mcp-server-kubernetes',
    args: [],
    env: {
      KUBECONFIG: env.KUBECONFIG
    },
    category: 'devops'
  },
  docker: {
    name: 'docker',
    command: 'mcp-server-docker',
    args: [],
    category: 'devops'
  },

  // AI and ML Tools
  huggingface: {
    name: 'huggingface',
    command: 'mcp-server-huggingface',
    args: [],
    env: {
      HUGGINGFACE_API_KEY: env.HUGGINGFACE_API_KEY
    },
    category: 'ai'
  },
  everart: {
    name: 'everart',
    command: 'mcp-server-everart',
    args: [],
    env: {
      EVERART_API_KEY: env.EVERART_API_KEY
    },
    category: 'ai'
  },

  // Productivity and Project Management
  todoist: {
    name: 'todoist',
    command: 'mcp-server-todoist',
    args: [],
    env: {
      TODOIST_API_KEY: env.TODOIST_API_KEY
    },
    category: 'productivity'
  },
  airtable: {
    name: 'airtable',
    command: 'mcp-server-airtable',
    args: [],
    env: {
      AIRTABLE_API_KEY: env.AIRTABLE_API_KEY
    },
    category: 'productivity'
  },

  // Code Analysis and Documentation
  sourcegraph: {
    name: 'sourcegraph',
    command: '@sourcegraph/mcp-server',
    args: [],
    env: {
      SOURCEGRAPH_TOKEN: env.SOURCEGRAPH_TOKEN
    },
    category: 'code-analysis'
  },
  jsdoc: {
    name: 'jsdoc',
    command: 'mcp-server-jsdoc',
    args: [],
    category: 'documentation'
  },

  // Data Processing
  pandas: {
    name: 'pandas',
    command: 'mcp-server-pandas',
    args: [],
    category: 'data-processing'
  },
  duckdb: {
    name: 'duckdb',
    command: '@duckdb/mcp-server',
    args: [],
    category: 'database'
  },

  // API Integration
  stripe: {
    name: 'stripe',
    command: '@stripe/mcp-server',
    args: [],
    env: {
      STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY
    },
    category: 'payment'
  },
  sendgrid: {
    name: 'sendgrid',
    command: '@sendgrid/mcp-server',
    args: [],
    env: {
      SENDGRID_API_KEY: env.SENDGRID_API_KEY
    },
    category: 'email'
  },

  // Security and Monitoring
  snyk: {
    name: 'snyk',
    command: '@snyk/mcp-server',
    args: [],
    env: {
      SNYK_TOKEN: env.SNYK_TOKEN
    },
    category: 'security'
  },
  datadog: {
    name: 'datadog',
    command: '@datadog/mcp-server',
    args: [],
    env: {
      DD_API_KEY: env.DD_API_KEY,
      DD_APP_KEY: env.DD_APP_KEY
    },
    category: 'monitoring'
  }
}; 