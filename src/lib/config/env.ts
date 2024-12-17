import { z } from 'zod';

const envSchema = z.object({
  // Database
  POSTGRES_PRISMA_URL: z.string(),
  POSTGRES_URL_NON_POOLING: z.string(),
  
  // Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GITHUB_ID: z.string(),
  GITHUB_SECRET: z.string(),
  
  // MCP Server API Keys
  ANTHROPIC_API_KEY: z.string(),
  TAVILY_API_KEY: z.string(),
  BROWSERLESS_API_KEY: z.string(),
  GITHUB_TOKEN: z.string(),
  OPENAI_API_KEY: z.string(),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // MCP Server API Keys - Vector/DB
  QDRANT_API_KEY: z.string(),
  QDRANT_URL: z.string().url(),
  
  // MCP Server API Keys - Cloud
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  VERCEL_TOKEN: z.string(),
  
  // MCP Server API Keys - Communication
  SLACK_TOKEN: z.string(),
  LINEAR_API_KEY: z.string(),
  
  // MCP Server API Keys - Data
  PLOTLY_API_KEY: z.string(),
  
  // Search APIs
  BRAVE_API_KEY: z.string(),
  EXA_API_KEY: z.string(),

  // Databases
  NEO4J_URI: z.string().url(),
  NEO4J_USERNAME: z.string(),
  NEO4J_PASSWORD: z.string(),
  SNOWFLAKE_ACCOUNT: z.string(),
  SNOWFLAKE_USERNAME: z.string(),
  SNOWFLAKE_PASSWORD: z.string(),

  // DevOps
  KUBECONFIG: z.string(),

  // AI/ML
  HUGGINGFACE_API_KEY: z.string(),
  EVERART_API_KEY: z.string(),

  // Productivity
  TODOIST_API_KEY: z.string(),
  AIRTABLE_API_KEY: z.string(),

  // Code Analysis
  SOURCEGRAPH_TOKEN: z.string(),

  // Payment and Email
  STRIPE_SECRET_KEY: z.string(),
  SENDGRID_API_KEY: z.string(),

  // Security and Monitoring
  SNYK_TOKEN: z.string(),
  DD_API_KEY: z.string(),
  DD_APP_KEY: z.string(),
});

const env = envSchema.parse({
  // Database
  POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
  POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
  
  // Auth
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GITHUB_ID: process.env.GITHUB_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
  
  // MCP Server API Keys
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  TAVILY_API_KEY: process.env.TAVILY_API_KEY,
  BROWSERLESS_API_KEY: process.env.BROWSERLESS_API_KEY,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  
  // Environment
  NODE_ENV: process.env.NODE_ENV,
  
  // MCP Server API Keys - Vector/DB
  QDRANT_API_KEY: process.env.QDRANT_API_KEY,
  QDRANT_URL: process.env.QDRANT_URL,
  
  // MCP Server API Keys - Cloud
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  VERCEL_TOKEN: process.env.VERCEL_TOKEN,
  
  // MCP Server API Keys - Communication
  SLACK_TOKEN: process.env.SLACK_TOKEN,
  LINEAR_API_KEY: process.env.LINEAR_API_KEY,
  
  // MCP Server API Keys - Data
  PLOTLY_API_KEY: process.env.PLOTLY_API_KEY,
  
  // Search APIs
  BRAVE_API_KEY: process.env.BRAVE_API_KEY,
  EXA_API_KEY: process.env.EXA_API_KEY,

  // Databases
  NEO4J_URI: process.env.NEO4J_URI,
  NEO4J_USERNAME: process.env.NEO4J_USERNAME,
  NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
  SNOWFLAKE_ACCOUNT: process.env.SNOWFLAKE_ACCOUNT,
  SNOWFLAKE_USERNAME: process.env.SNOWFLAKE_USERNAME,
  SNOWFLAKE_PASSWORD: process.env.SNOWFLAKE_PASSWORD,

  // DevOps
  KUBECONFIG: process.env.KUBECONFIG,

  // AI/ML
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
  EVERART_API_KEY: process.env.EVERART_API_KEY,

  // Productivity
  TODOIST_API_KEY: process.env.TODOIST_API_KEY,
  AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,

  // Code Analysis
  SOURCEGRAPH_TOKEN: process.env.SOURCEGRAPH_TOKEN,

  // Payment and Email
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,

  // Security and Monitoring
  SNYK_TOKEN: process.env.SNYK_TOKEN,
  DD_API_KEY: process.env.DD_API_KEY,
  DD_APP_KEY: process.env.DD_APP_KEY,
});

export default env; 