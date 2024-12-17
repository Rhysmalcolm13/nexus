import { Command } from 'commander';
import { LayerManager } from '../layers/manager';
import { LayerMarketplace } from '../layers/marketplace';
import { LayerError } from '../errors';

interface ListOptions {
  category?: string;
}

export function setupCLI(): Command {
  const program = new Command();
  const manager = new LayerManager();
  const marketplace = LayerMarketplace.getInstance();

  program
    .name('mcpl')
    .description('MCP Layer Management CLI')
    .version('1.0.0');

  program
    .command('add <layer-name>')
    .description('Install a layer from the marketplace')
    .action(async (layerName: string) => {
      try {
        await marketplace.installLayer(layerName);
        console.log(`Successfully installed layer: ${layerName}`);
      } catch (error) {
        if (error instanceof LayerError) {
          console.error(`Failed to install layer: ${error.message}`);
        } else {
          console.error('An unexpected error occurred during installation');
        }
        process.exit(1);
      }
    });

  program
    .command('list')
    .description('List available layers')
    .option('-c, --category <category>', 'Filter by category')
    .action(async (options: ListOptions) => {
      try {
        const layers = await marketplace.searchLayers(options.category || '');
        console.table(
          layers.map(layer => ({
            name: layer.registry.manifest.name,
            version: layer.registry.manifest.version,
            description: layer.registry.manifest.description || 'No description',
            downloads: layer.downloads,
            rating: layer.rating
          }))
        );
      } catch (error) {
        if (error instanceof LayerError) {
          console.error(`Failed to list layers: ${error.message}`);
        } else {
          console.error('An unexpected error occurred while listing layers');
        }
        process.exit(1);
      }
    });

  return program;
} 