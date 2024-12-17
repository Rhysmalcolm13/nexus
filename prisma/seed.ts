import { PrismaClient, LayerStatus, LayerVisibility } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@nexus.dev',
        name: 'Admin User',
        settings: {
          create: {
            defaultModel: 'claude-3-opus-20240229',
            defaultMaxTokens: 1024,
            defaultTemperature: 0.7,
            enabledTools: [],
            enabledResources: [],
            enabledLayers: []
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'developer@nexus.dev',
        name: 'Developer User',
        settings: {
          create: {
            defaultModel: 'claude-3-opus-20240229',
            defaultMaxTokens: 2048,
            defaultTemperature: 0.8,
            enabledTools: ['code', 'shell'],
            enabledResources: [],
            enabledLayers: []
          }
        }
      }
    })
  ]);

  // Create subscription plans
  const plans = await Promise.all([
    prisma.plan.create({
      data: {
        name: 'Free',
        description: 'Basic features for getting started',
        price: 0,
        currency: 'USD',
        interval: 'monthly',
        features: ['basic_layers', 'community_support'],
        limits: {
          api_calls: 1000,
          storage_gb: 10,
          compute_hours: 5
        },
        isActive: true
      }
    }),
    prisma.plan.create({
      data: {
        name: 'Pro',
        description: 'Professional features for power users',
        price: 29.99,
        currency: 'USD',
        interval: 'monthly',
        features: ['unlimited_layers', 'priority_support', 'advanced_analytics'],
        limits: {
          api_calls: 10000,
          storage_gb: 100,
          compute_hours: 50
        },
        isActive: true
      }
    }),
    prisma.plan.create({
      data: {
        name: 'Enterprise',
        description: 'Custom solutions for organizations',
        price: 299.99,
        currency: 'USD',
        interval: 'monthly',
        features: ['unlimited_everything', 'dedicated_support', 'custom_features'],
        limits: {
          api_calls: -1, // unlimited
          storage_gb: -1,
          compute_hours: -1
        },
        isActive: true
      }
    })
  ]);

  // Create marketplace layers
  const marketplaceLayers = await Promise.all([
    prisma.layer.create({
      data: {
        name: 'Code Assistant',
        version: '1.0.0',
        description: 'AI-powered coding assistant with multiple language support',
        author: 'Nexus Team',
        code: '',
        parameters: {},
        category: 'development',
        tags: ['coding', 'development', 'ai'],
        status: LayerStatus.active,
        runtime: 'node',
        entry: 'https://api.nexus.dev/layers/code-assistant',
        dependencies: [],
        tools: [{
          name: 'code_complete',
          description: 'Complete code snippets',
          parameters: { language: 'string', code: 'string' }
        }],
        resources: [],
        prompts: [],
        config: {},
        metadata: {
          id: 'code-assistant',
          name: 'Code Assistant',
          version: '1.0.0',
          description: 'AI-powered coding assistant',
          author: 'Nexus Team',
          category: 'development',
          tags: ['coding', 'development', 'ai'],
          tools: ['code_complete'],
          dependencies: []
        },
        capabilities: {
          code_completion: true,
          syntax_highlighting: true,
          multiple_languages: true
        },
        visibility: LayerVisibility.public,
        userId: users[0].id,
        price: {
          amount: 9.99,
          currency: 'USD',
          interval: 'monthly'
        }
      }
    }),
    prisma.layer.create({
      data: {
        name: 'Data Analysis',
        version: '1.0.0',
        description: 'Advanced data analysis and visualization tools',
        author: 'Data Science Team',
        code: '',
        parameters: {},
        category: 'analytics',
        tags: ['data', 'analytics', 'visualization'],
        status: LayerStatus.active,
        runtime: 'docker',
        entry: 'https://api.nexus.dev/layers/data-analysis',
        dependencies: [],
        tools: [{
          name: 'analyze_data',
          description: 'Analyze dataset and generate insights',
          parameters: { data: 'array', type: 'string' }
        }],
        resources: [],
        prompts: [],
        config: {},
        metadata: {
          id: 'data-analysis',
          name: 'Data Analysis',
          version: '1.0.0',
          description: 'Data analysis tools',
          author: 'Data Science Team',
          category: 'analytics',
          tags: ['data', 'analytics'],
          tools: ['analyze_data'],
          dependencies: []
        },
        capabilities: {
          data_analysis: true,
          visualization: true,
          export_formats: ['csv', 'json', 'xlsx']
        },
        visibility: LayerVisibility.public,
        userId: users[1].id,
        price: {
          amount: 19.99,
          currency: 'USD',
          interval: 'monthly'
        }
      }
    })
  ]);

  // Create sample reviews
  await Promise.all([
    prisma.layerReview.create({
      data: {
        layerId: marketplaceLayers[0].id,
        userId: users[1].id,
        rating: 5,
        comment: 'Excellent coding assistant, saves me hours every day!'
      }
    }),
    prisma.layerReview.create({
      data: {
        layerId: marketplaceLayers[1].id,
        userId: users[0].id,
        rating: 4,
        comment: 'Great data analysis tools, visualization could be better'
      }
    })
  ]);

  // Create sample usage data
  await Promise.all([
    prisma.usage.create({
      data: {
        userId: users[0].id,
        layerId: marketplaceLayers[0].id,
        type: 'api_call',
        quantity: 100,
        metadata: {
          tool: 'code_complete',
          success_rate: 0.95,
          avg_latency: 150
        }
      }
    }),
    prisma.usage.create({
      data: {
        userId: users[1].id,
        layerId: marketplaceLayers[1].id,
        type: 'compute',
        quantity: 2.5,
        metadata: {
          tool: 'analyze_data',
          dataset_size: '1GB',
          compute_time: 2.5 * 3600
        }
      }
    })
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 