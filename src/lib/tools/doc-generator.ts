const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');
import * as typescript from 'typescript';
const { normalize } = require('path');
const { mkdirSync } = require('fs');

import type { 
  Program, 
  Node, 
  ClassDeclaration, 
  InterfaceDeclaration,
  TypeAliasDeclaration,
  FunctionDeclaration,
  SourceFile,
  CommentRange as TSCommentRange,
  Modifier,
  NodeArray,
  ImportDeclaration
} from 'typescript';

interface ModuleArea {
  name: string;
  path: string;
  submodules: string[];
}

interface ParamInfo {
  name: string;
  type: string;
  description: string;
}

interface ReturnInfo {
  type: string;
  description: string;
}

interface DocItem {
  name: string;
  description: string;
  type: 'class' | 'interface' | 'type' | 'function' | 'sql' | 'component' | 'route' | 'config' | 'hook' | 'middleware' | 'util' | 'test' | 'method' | 'property' |
        'layer' | 'integration' | 'sandbox' | 'marketplace' | 'workflow' | 'event' |
        'metric' | 'state' | 'storage' | 'sync' | 'style' | 'documentation';
  exports: boolean;
  jsdoc?: string;
  members?: DocItem[];
  validation?: string[];
  dependencies?: string[];
  examples?: string[];
  params?: ParamInfo[];
  returns?: ReturnInfo;
  layerConfig?: {
    type: 'input' | 'processing' | 'output';
    priority?: number;
    dependencies?: string[];
  };
  eventHandlers?: Array<{
    event: string;
    handler: string;
    description: string;
  }>;
  stateSchema?: {
    properties: Record<string, {
      type: string;
      description: string;
      required?: boolean;
    }>;
  };
  schemas?: {
    zod?: string;
    validation?: string;
    database?: string;
    input?: string;
    output?: string;
  };
  fileType?: 'typescript' | 'javascript' | 'sql' | 'prisma' | 'json' | 'css' | 'markdown' | 'env' | 'config';
}

class DocGenerator {
  private readonly sourceDir: string;
  private readonly docsDir: string;
  private program!: Program;

  // Summary data for compliance and progress tracking
  private complianceData: {
    totalItems: number;
    itemsWithJSDoc: number;
    itemsComplyingWithRules: number;
    itemsMissingDocs: number;
    itemsMissingConventions: number;
  } = {
    totalItems: 0,
    itemsWithJSDoc: 0,
    itemsComplyingWithRules: 0,
    itemsMissingDocs: 0,
    itemsMissingConventions: 0
  };

  private readonly moduleAreas: ModuleArea[] = [
    // Core functionality
    {
      name: 'mcp',
      path: 'src/lib/mcp',
      submodules: ['layers', 'integration', 'sandbox', 'marketplace', 'cli', 'config', 'db', 'events', 'metrics', 'middleware', 'state', 'storage', 'sync', 'types', 'utils', 'validation', 'workflow']
    },
    {
      name: 'ai',
      path: 'src/lib/ai', 
      submodules: ['models', 'tools', 'prompts']
    },
    {
      name: 'auth',
      path: 'src/lib/auth',
      submodules: ['providers', 'middleware']
    },
    // API and Routes
    {
      name: 'api',
      path: 'src/app/api',
      submodules: ['auth', 'conversations', 'layers', 'marketplace', 'messages', 'search', 'settings', 'stats', 'tools', 'user', 'ws']
    },
    // Frontend
    {
      name: 'components',
      path: 'src/components',
      submodules: ['auth', 'chat', 'layers', 'servers', 'tools', 'ui']
    },
    {
      name: 'pages',
      path: 'src/app',
      submodules: ['chat', 'servers', '(auth)']
    },
    // Utilities and Hooks
    {
      name: 'hooks',
      path: 'src/hooks',
      submodules: []
    },
    {
      name: 'utils',
      path: 'src/utils',
      submodules: []
    },
    // Database and Config
    {
      name: 'prisma',
      path: 'prisma',
      submodules: ['migrations/functions', 'migrations/triggers']
    },
    {
      name: 'config',
      path: 'src/lib/config',
      submodules: []
    },
    {
      name: 'db',
      path: 'src/lib/db',
      submodules: []
    },
    // Types and Models
    {
      name: 'types',
      path: 'src/types',
      submodules: []
    },
    {
      name: 'models',
      path: 'src/lib/models',
      submodules: []
    },
    // Tests
    {
      name: 'tests',
      path: 'src',
      submodules: ['**/__tests__', '**/*.test.ts', '**/*.spec.ts']
    }
  ];

  private dependencyInfo: Record<string, { files: string[] }> = {};

  constructor(rootDir: string) {
    this.sourceDir = normalize(rootDir);
    this.docsDir = normalize(path.join(rootDir, 'src', 'lib', 'docs'));
    mkdirSync(this.docsDir, { recursive: true });
    this.initTypeScriptProgram();
  }

  /**
   * Initializes the TypeScript program. This ensures we can leverage TypeScript's AST for type and symbol analysis,
   * supporting our goals of type safety and consistency.
   */
  private initTypeScriptProgram() {
    const configPath = typescript.findConfigFile(
      this.sourceDir,
      typescript.sys.fileExists,
      'tsconfig.json'
    );

    if (!configPath) {
      throw new Error('Could not find tsconfig.json');
    }

    const { config } = typescript.readConfigFile(configPath, typescript.sys.readFile);
    const { options, fileNames, errors } = typescript.parseJsonConfigFileContent(
      config,
      {
        fileExists: typescript.sys.fileExists,
        readFile: typescript.sys.readFile,
        readDirectory: typescript.sys.readDirectory,
        getCurrentDirectory: () => this.sourceDir,
        useCaseSensitiveFileNames: true
      },
      this.sourceDir
    );

    if (errors.length > 0) {
      console.warn('TypeScript config parse errors:', errors);
    }

    this.program = typescript.createProgram({
      rootNames: fileNames,
      options: {
        ...options,
        noEmit: true,
        declaration: false,
        emitDeclarationOnly: false,
        allowJs: true,
        checkJs: true,
        resolveJsonModule: true,
        esModuleInterop: true
      }
    });

    const diagnostics = typescript.getPreEmitDiagnostics(this.program);
    if (diagnostics.length > 0) {
      console.warn('TypeScript program diagnostics:', 
        typescript.formatDiagnosticsWithColorAndContext(diagnostics, {
          getCurrentDirectory: () => this.sourceDir,
          getCanonicalFileName: fileName => fileName,
          getNewLine: () => typescript.sys.newLine
        })
      );
    }
  }

  /**
   * The main entry point for doc generation.
   * Aligned with our goals:
   * - Maintain consistency: By processing all areas, ensuring docs are always up to date.
   * - Track progress: Will produce additional reports at the end.
   * - Validate implementation: Validation rules are applied.
   * - Generate tools & reports: Produce JSON and MD reports.
   * - Ensure type safety: Uses TS AST for extraction.
   */
  async generateDocs() {
    for (const area of this.moduleAreas) {
      await this.generateAreaDocs(area);
    }

    const allDocs = await this.getAllDocs();
    if (Object.keys(allDocs).length > 0 && Object.values(allDocs).some(areaDocs => Object.keys(areaDocs).length > 0)) {
      await this.generateCrossReferenceDocs(allDocs);
      await this.generateOverviewDocs();
      await this.generateDependencyGraph();
      await this.generateStackDocs(); 
    }

    // After all docs are generated, produce compliance and progress reports
    await this.generateComplianceReport();
    await this.generateProgressReport();
  }

  /**
   * Generates a compliance report (compliance.md) summarizing validation rules and how many items comply.
   * Helps validate implementation against requirements.
   */
  private async generateComplianceReport() {
    const compliancePath = path.join(this.docsDir, 'compliance.md');
    const lines: string[] = [];

    lines.push('# Compliance Report');
    lines.push('');
    lines.push(`Total items documented: ${this.complianceData.totalItems}`);
    lines.push(`Items with JSDoc: ${this.complianceData.itemsWithJSDoc}`);
    lines.push(`Items fully complying with rules: ${this.complianceData.itemsComplyingWithRules}`);
    lines.push(`Items missing documentation: ${this.complianceData.itemsMissingDocs}`);
    lines.push(`Items missing naming conventions: ${this.complianceData.itemsMissingConventions}`);

    // Potentially add more rule checks here
    await fs.writeFile(compliancePath, lines.join('\n'));
  }

  /**
   * Generates a progress report in JSON form (progress.json) that can be integrated into tooling
   * to track development progress programmatically.
   */
  private async generateProgressReport() {
    const progressPath = path.join(this.docsDir, 'progress.json');
    // This JSON can be used by CI/CD tools or dashboards to visualize progress.
    await fs.writeFile(progressPath, JSON.stringify(this.complianceData, null, 2));
  }

  private async generateStackDocs() {
    // Existing logic remains. This supports building tooling around the codebase (dependency graph, etc.)
    const stackPath = path.join(this.docsDir, 'overview', 'stack.md');
    const { dependencies, devDependencies } = await this.getPackageDependencies();

    const lines: string[] = [];
    lines.push('# Tech Stack');
    lines.push('');
    lines.push('This project uses the following dependencies:');
    lines.push('');
    lines.push('| Dependency | Version | Used In Files |');
    lines.push('|------------|---------|---------------|');

    for (const [dep, version] of Object.entries(dependencies)) {
      const usedIn = this.dependencyInfo[dep]?.files || [];
      lines.push(`| ${dep} | ${version} | ${usedIn.join(', ')} |`);
    }

    lines.push('');
    lines.push('## Dev Dependencies');
    lines.push('');
    lines.push('| Dependency | Version |');
    lines.push('|------------|---------|');

    for (const [dep, version] of Object.entries(devDependencies)) {
      lines.push(`| ${dep} | ${version} |`);
    }

    await fs.writeFile(stackPath, lines.join('\n'));
  }

  private async getPackageDependencies(): Promise<{ dependencies: Record<string, string>, devDependencies: Record<string, string> }> {
    const packageJsonPath = path.join(this.sourceDir, 'package.json');
    const content = await fs.readFile(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content);
    return {
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {}
    };
  }

  private async generateCrossReferenceDocs(allDocs: Record<string, Record<string, DocItem[]>>) {
    const crossRefPath = path.join(this.docsDir, 'cross-reference');
    await fs.mkdir(crossRefPath, { recursive: true });
    await this.writeCrossReferenceDocs(crossRefPath, allDocs);
  }

  private async generateOverviewDocs() {
    const overviewPath = path.join(this.docsDir, 'overview');
    await fs.mkdir(overviewPath, { recursive: true });
    await this.writeArchitectureOverview(overviewPath);
    await this.writeGettingStartedGuide(overviewPath);
    await this.writeContributingGuide(overviewPath);
  }

  private async generateDependencyGraph() {
    const graphPath = path.join(this.docsDir, 'dependencies');
    await fs.mkdir(graphPath, { recursive: true });
    const dependencies = await this.extractDependencies();
    if (Object.keys(dependencies).length > 0) {
      await this.writeDependencyGraph(graphPath, dependencies);
    }
  }

  /**
   * Gathers all documentation items from all areas, serving as a single source of truth.
   * This supports consistency, as changes in code are directly reflected here.
   */
  private async getAllDocs(): Promise<Record<string, Record<string, DocItem[]>>> {
    const allDocs: Record<string, Record<string, DocItem[]>> = {};
    
    for (const area of this.moduleAreas) {
      const files = await this.getAllFiles(area);
      const docs: Record<string, DocItem[]> = {};

      for (const file of files) {
        const items = await this.parseFile(file);
        if ((file.endsWith('.ts') || file.endsWith('.tsx')) && this.program.getSourceFile(file)) {
          const tsItems = this.extractDocsFromFile(this.program.getSourceFile(file)!);
          tsItems.forEach(item => {
            item.validation = this.generateValidationRules(file, item);
          });
          items.push(...tsItems);
        }

        if (items.length > 0) {
          const relativePath = path.relative(this.sourceDir, file);
          docs[relativePath] = items;
        }
      }

      if (Object.keys(docs).length > 0) {
        allDocs[area.name] = docs;
      }
    }

    return allDocs;
  }

  private getDisplayNameForFile(file: string): string {
    return file;
  }

  private async writeCrossReferenceDocs(crossRefPath: string, allDocs: Record<string, Record<string, DocItem[]>>) {
    const crossRefs: Record<string, Array<{ area: string; file: string; item: DocItem }>> = {};

    Object.entries(allDocs).forEach(([area, docs]) => {
      Object.entries(docs).forEach(([file, items]) => {
        items.forEach(item => {
          if (!crossRefs[item.type]) {
            crossRefs[item.type] = [];
          }
          crossRefs[item.type].push({ area, file, item });
        });
      });
    });

    await Promise.all(
      Object.entries(crossRefs).map(async ([type, refs]) => {
        if (refs.length > 0) {
          await fs.writeFile(
            path.join(crossRefPath, `${type}.md`),
            this.formatCrossReferenceDocs(type, refs)
          );
        }
      })
    );
  }

  private formatCrossReferenceDocs(
    type: string,
    refs: Array<{ area: string; file: string; item: DocItem }>
  ): string {
    const groupedByArea = refs.reduce((acc, { area, file, item }) => {
      if (!acc[area]) {
        acc[area] = [];
      }
      acc[area].push({ file, item });
      return acc;
    }, {} as Record<string, Array<{ file: string; item: DocItem }>>);

    return `# ${type.charAt(0).toUpperCase() + type.slice(1)}s\n\n${
      Object.entries(groupedByArea).map(([area, items]) => `
## ${area.toUpperCase()}

${items.map(({ file, item }) => {
  const displayName = this.getDisplayNameForFile(file);
  const description = item.description ? item.description.split('\n')[0] : '';
  
  return `### \`${item.name}\` (${displayName})
${description}${item.params ? `\n\n**Signature:** \`${this.formatSignature(item)}\`` : ''}`;
}).join('\n\n')}`
      ).join('\n\n')}`;
  }

  private formatSignature(item: DocItem): string {
    if (!item.params) return item.name;
    const params = item.params.map(p => `${p.name}: ${p.type}`).join(', ');
    const returns = item.returns ? `: ${item.returns.type}` : '';
    return `${item.name}(${params})${returns}`;
  }

  private async writeArchitectureOverview(overviewPath: string) {
    const overview = `# Architecture Overview

## System Components

${this.moduleAreas.map(area => `
### ${area.name}
- Path: \`${area.path}\`
${area.submodules.length > 0 ? `- Submodules:\n${area.submodules.map(sub => `  - ${sub}`).join('\n')}` : ''}
`).join('\n')}

## Key Concepts

1. MCP (Multi-Component Platform)
2. Layer Management
3. Authentication & Authorization
4. API Structure
5. Database Schema
6. Frontend Architecture

## Technology Stack

- Next.js
- TypeScript
- Prisma
- PostgreSQL
- WebSocket
- TailwindCSS
`;

    await fs.writeFile(path.join(overviewPath, 'architecture.md'), overview);
  }

  private async writeGettingStartedGuide(overviewPath: string) {
    const guide = `# Getting Started

## Prerequisites

- Node.js 16+
- PostgreSQL
- pnpm/npm/yarn

## Installation

1. Clone the repository
2. Install dependencies: \`pnpm install\`
3. Set up environment variables
4. Initialize database: \`pnpm prisma migrate dev\`
5. Start development server: \`pnpm dev\`

## Development Workflow

1. Branch naming convention
2. Commit message format
3. Testing requirements
4. Documentation requirements
5. Code review process
`;

    await fs.writeFile(path.join(overviewPath, 'getting-started.md'), guide);
  }

  private async writeContributingGuide(overviewPath: string) {
    const guide = `# Contributing Guide

## Code Style

- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Component structure
- File naming conventions

## Testing

- Unit tests
- Integration tests
- E2E tests
- Test coverage requirements

## Documentation

- JSDoc comments
- README files
- API documentation
- Component documentation

## Review Process

1. Create feature branch
2. Write tests
3. Update documentation
4. Create pull request
5. Code review
6. Merge to main
`;

    await fs.writeFile(path.join(overviewPath, 'contributing.md'), guide);
  }

  private async extractDependencies(): Promise<Record<string, string[]>> {
    const dependencies: Record<string, string[]> = {};
    return dependencies;
  }

  private async writeDependencyGraph(graphPath: string, dependencies: Record<string, string[]>) {
    const mermaidGraph = this.generateMermaidGraph(dependencies);
    if (mermaidGraph.trim().length > 0) {
      await fs.writeFile(path.join(graphPath, 'dependency-graph.md'), mermaidGraph);
    }
  }

  private generateMermaidGraph(dependencies: Record<string, string[]>): string {
    const edges = Object.entries(dependencies)
      .map(([file, deps]) => deps.map(dep => `    ${this.sanitizeId(file)} --> ${this.sanitizeId(dep)}`).join('\n'))
      .filter(line => line.trim().length > 0)
      .join('\n');
    if (!edges) return '';
    return `# Dependency Graph

\`\`\`mermaid
graph TD
${edges}
\`\`\`
`;
  }

  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9]/g, '_');
  }

  private extractJSDocComment(node: Node): string {
    try {
      const sourceFile = node.getSourceFile();
      if (!sourceFile || !sourceFile.text) {
        return '';
      }

      const text = sourceFile.text;
      const commentRanges = typescript.getLeadingCommentRanges(text, node.pos) || [];
      
      return commentRanges
        .map((range: TSCommentRange) => text.slice(range.pos, range.end))
        .join('\n')
        .replace(/\/\*|\*\/|\*/g, '')
        .trim();
    } catch (error) {
      console.warn('Error extracting JSDoc comment:', error);
      return '';
    }
  }

  async generateAreaDocs(area: ModuleArea) {
    console.log(`Generating docs for ${area.name}`);
    const areaPath = normalize(path.join(this.docsDir, area.name));
    await fs.mkdir(areaPath, { recursive: true });

    const files = await this.getAllFiles(area);
    const docs: Record<string, DocItem[]> = {};

    for (const file of files) {
      console.log(`Processing file: ${file}`);
      const items = await this.parseFile(file);
      if ((file.endsWith('.ts') || file.endsWith('.tsx')) && this.program.getSourceFile(file)) {
        const tsItems = this.extractDocsFromFile(this.program.getSourceFile(file)!);
        tsItems.forEach(item => {
          item.validation = this.generateValidationRules(file, item);
        });
        items.push(...tsItems);
      }

      if (items.length > 0) {
        const relativePath = path.relative(this.sourceDir, file);
        docs[relativePath] = items;
      }
    }

    if (Object.keys(docs).length > 0) {
      await this.writeApiDocs(areaPath, docs);
      await this.writeTypeDefinitions(areaPath, docs);
      await this.writeIntegrationPoints(areaPath, docs);
      await this.writeValidationDocs(areaPath, docs);
    } else {
      console.log(`No documentation items found for ${area.name}. Skipping doc file generation.`);
    }
  }

  private generateValidationRules(filePath: string, item: DocItem): string[] {
    const rules: string[] = [];
    rules.push('Must have JSDoc documentation');
    rules.push('Must follow naming conventions');

    if (filePath.includes('api/')) {
      rules.push('Must implement error handling');
      rules.push('Must validate input parameters');
      rules.push('Must include rate limiting');
    }

    if (filePath.includes('components/')) {
      rules.push('Must be responsive');
      rules.push('Must handle loading states');
      rules.push('Must implement proper prop types');
    }

    if (filePath.includes('prisma/')) {
      rules.push('Must include database indexes');
      rules.push('Must handle data validation');
      rules.push('Must implement proper error handling');
    }

    if (filePath.includes('mcp/')) {
      rules.push(...this.generateMCPValidationRules(filePath, item));
    }

    // Post-process: update compliance data
    this.complianceData.totalItems += 1;

    // Check JSDoc presence
    if (item.jsdoc && item.jsdoc.trim().length > 0) {
      this.complianceData.itemsWithJSDoc += 1;
    } else {
      this.complianceData.itemsMissingDocs += 1;
    }

    // Check naming convention: simplistic check - name should be camelCase or PascalCase
    const isNamedProperly = /^[A-Z][A-Za-z0-9]*$|^[a-z][A-Za-z0-9]*$/.test(item.name);
    if (!isNamedProperly) {
      this.complianceData.itemsMissingConventions += 1;
    }

    // If JSDoc and naming are correct, increment compliance
    if (item.jsdoc && isNamedProperly) {
      this.complianceData.itemsComplyingWithRules += 1;
    }

    return rules;
  }

  private generateMCPValidationRules(filePath: string, item: DocItem): string[] {
    const rules: string[] = [];

    if (filePath.includes('mcp/layers/')) {
      rules.push('Must implement Layer interface');
      rules.push('Must define input/output schema');
      rules.push('Must handle layer lifecycle events');
      rules.push('Must implement error boundaries');
    }

    if (filePath.includes('mcp/integration/')) {
      rules.push('Must implement Integration interface');
      rules.push('Must handle connection lifecycle');
      rules.push('Must implement retry logic');
      rules.push('Must validate integration config');
    }

    if (filePath.includes('mcp/events/')) {
      rules.push('Must use typed event definitions');
      rules.push('Must implement event validation');
      rules.push('Must handle event errors');
    }

    if (filePath.includes('mcp/state/')) {
      rules.push('Must define state schema');
      rules.push('Must implement state validation');
      rules.push('Must handle state conflicts');
    }

    return rules;
  }

  private async getAllFiles(area: ModuleArea): Promise<string[]> {
    const files: string[] = [];

    const listFilesRecursively = async (dir: string) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await listFilesRecursively(fullPath);
          } else if (entry.isFile()) {
            files.push(fullPath);
          }
        }
      } catch {}
    };

    const areaPath = path.join(this.sourceDir, area.path);
    await listFilesRecursively(areaPath);

    for (const submodule of area.submodules) {
      const submodulePath = path.join(this.sourceDir, area.path, submodule);
      await listFilesRecursively(submodulePath);
    }

    return files;
  }

  private extractDocsFromFile(sourceFile: SourceFile): DocItem[] {
    if (!sourceFile || !sourceFile.text) return [];
    const items: DocItem[] = [];
    
    const processMembers = (declaration: ClassDeclaration | InterfaceDeclaration) => {
      const members: DocItem[] = [];
      if (declaration.members) {
        declaration.members.forEach(member => {
          try {
            if (typescript.isMethodDeclaration(member) || 
                typescript.isPropertyDeclaration(member) ||
                typescript.isConstructorDeclaration(member)) {
              const name = member.name ? member.name.getText() : 'constructor';
              const jsdoc = this.extractJSDocComment(member);
              const type = typescript.isMethodDeclaration(member) ? 'method' : 'property';
              const params = (typescript.isMethodDeclaration(member) || typescript.isConstructorDeclaration(member))
                ? member.parameters.map(param => ({
                    name: param.name.getText(),
                    type: param.type ? param.type.getText() : 'any',
                    description: ''
                  }))
                : undefined;

              const returns = (typescript.isMethodDeclaration(member) && member.type)
                ? { type: member.type.getText(), description: '' }
                : undefined;

              members.push({
                name,
                description: jsdoc,
                type: type as DocItem['type'],
                exports: this.hasExportModifier(declaration),
                jsdoc,
                params,
                returns
              });
            }
          } catch {}
        });
      }
      return members;
    };

    try {
      typescript.forEachChild(sourceFile, (node: Node) => {
        if (
          typescript.isClassDeclaration(node) || 
          typescript.isInterfaceDeclaration(node) ||
          typescript.isTypeAliasDeclaration(node) ||
          typescript.isFunctionDeclaration(node)
        ) {
          const declaration = node as ClassDeclaration | InterfaceDeclaration | TypeAliasDeclaration | FunctionDeclaration;
          const name = declaration.name?.text || 'Anonymous';
          const jsdoc = this.extractJSDocComment(node);
          const type = this.determineDocType(node, sourceFile.fileName);
          const dependencies = this.extractDependenciesForNode(node, sourceFile);
          const examples = this.extractExamples(jsdoc);

          const docItem: DocItem = {
            name,
            description: jsdoc,
            type,
            exports: this.hasExportModifier(declaration),
            jsdoc,
            dependencies,
            examples
          };

          if (typescript.isClassDeclaration(node) || typescript.isInterfaceDeclaration(node)) {
            docItem.members = processMembers(node);
          }

          if (typescript.isFunctionDeclaration(node)) {
            docItem.params = node.parameters.map(param => ({
              name: param.name.getText(),
              type: param.type ? param.type.getText() : 'any',
              description: ''
            }));

            if (node.type) {
              docItem.returns = {
                type: node.type.getText(),
                description: ''
              };
            }
          }

          const schemas = this.extractSchemas(node, sourceFile);
          if (schemas) {
            docItem.schemas = schemas;
          }

          items.push(docItem);
        }
      });
    } catch {}

    return items;
  }

  private extractDependenciesForNode(node: Node, sourceFile: SourceFile): string[] {
    return [];
  }

  private extractExamples(jsdoc: string): string[] {
    const examples: string[] = [];
    const exampleRegex = /@example\s+([\s\S]*?)(?=@|$)/g;
    let match;
    while ((match = exampleRegex.exec(jsdoc)) !== null) {
      examples.push(match[1].trim());
    }
    return examples;
  }

  private determineDocType(node: Node, fileName: string): DocItem['type'] {
    if (fileName.includes('/api/')) return 'route';
    if (fileName.includes('/components/')) return 'component';
    if (fileName.includes('/config/')) return 'config';
    if (fileName.includes('/hooks/')) return 'hook';
    if (fileName.includes('/middleware/')) return 'middleware';
    if (fileName.includes('/utils/')) return 'util';
    if (fileName.includes('.test.') || fileName.includes('.spec.')) return 'test';
    if (typescript.isClassDeclaration(node)) return 'class';
    if (typescript.isInterfaceDeclaration(node)) return 'interface';
    if (typescript.isTypeAliasDeclaration(node)) return 'type';
    if (typescript.isMethodDeclaration(node)) return 'method';
    if (typescript.isPropertyDeclaration(node)) return 'property';
    if (fileName.includes('/mcp/')) {
      if (fileName.includes('/layers/')) return 'layer';
      if (fileName.includes('/integration/')) return 'integration';
      if (fileName.includes('/sandbox/')) return 'sandbox';
      if (fileName.includes('/marketplace/')) return 'marketplace';
      if (fileName.includes('/workflow/')) return 'workflow';
      if (fileName.includes('/events/')) return 'event';
      if (fileName.includes('/metrics/')) return 'metric';
      if (fileName.includes('/state/')) return 'state';
      if (fileName.includes('/storage/')) return 'storage';
      if (fileName.includes('/sync/')) return 'sync';
    }
    return 'function';
  }

  private hasExportModifier(node: ClassDeclaration | InterfaceDeclaration | TypeAliasDeclaration | FunctionDeclaration): boolean {
    if (!node.modifiers) return false;
    return node.modifiers.some(mod => mod.kind === typescript.SyntaxKind.ExportKeyword);
  }

  private async writeApiDocs(areaPath: string, docs: Record<string, DocItem[]>) {
    const apiDocs = Object.entries(docs)
      .filter(([_, items]) => items.some(item => item.exports))
      .map(([file, items]) => ({ file, exports: items.filter(item => item.exports) }));

    if (apiDocs.length === 0) return;

    await fs.writeFile(
      path.join(areaPath, 'api.md'),
      this.formatApiDocs(apiDocs)
    );
  }

  private formatApiDocs(apiDocs: Array<{file: string, exports: DocItem[]}>): string {
    return `# API Documentation\n\n${
      apiDocs.map(({file, exports}) => {
        const displayName = this.getDisplayNameForFile(file);
        return `## ${displayName}\n\n${
          exports.map(item => {
            const signature = item.params ? `\`${this.formatSignature(item)}\`` : '';
            const description = item.description ? item.description.split('\n')[0] : '';
            let doc = `### ${item.name}\n\n${description}\n\n**Type:** ${item.type}`;
            if (signature) doc += `\n\n**Signature:** ${signature}`;
            if (item.members?.length) {
              const methods = item.members.filter(m => m.type === 'method');
              if (methods.length) {
                doc += `\n\n**Members:**\n${
                  methods
                    .map(m => `- \`${this.formatSignature(m)}\`${m.description ? ` - ${m.description.split('\n')[0]}` : ''}`)
                    .join('\n')
                }`;
              }
            }
            if (item.examples?.length) {
              doc += `\n\n**Example:**\n\`\`\`typescript\n${item.examples[0]}\n\`\`\``;
            }
            return doc;
          }).join('\n\n')
        }`;
      }).join('\n\n')}`;
  }

  private async writeTypeDefinitions(areaPath: string, docs: Record<string, DocItem[]>) {
    const types = Object.values(docs)
      .flat()
      .filter(item => ['interface', 'type', 'sql'].includes(item.type));

    if (types.length === 0) return;

    await fs.writeFile(
      path.join(areaPath, 'types.md'),
      this.formatTypeDefinitions(types)
    );
  }

  private formatSchemas(schemas: NonNullable<DocItem['schemas']>): string {
    let content = '';
    if (schemas.zod) {
      content += '\n\n**Zod Schema:**\n```typescript\n' + schemas.zod + '\n```';
    }
    if (schemas.validation) {
      content += '\n\n**Validation Schema:**\n```typescript\n' + schemas.validation + '\n```';
    }
    if (schemas.database) {
      content += '\n\n**Database Schema:**\n```prisma\n' + schemas.database + '\n```';
    }
    if (schemas.input) {
      content += '\n\n**Input Schema:**\n```typescript\n' + schemas.input + '\n```';
    }
    if (schemas.output) {
      content += '\n\n**Output Schema:**\n```typescript\n' + schemas.output + '\n```';
    }
    return content;
  }

  private formatMembers(members: DocItem[]): string {
    const methodMembers = members.filter(m => m.type === 'method');
    const propertyMembers = members.filter(m => m.type === 'property');
    let content = '';
    
    if (propertyMembers.length) {
      content += '\n\n**Properties:**\n';
      content += propertyMembers
        .map(m => `- \`${m.name}\`${m.description ? `: ${m.description.split('\n')[0]}` : ''}`)
        .join('\n');
    }
    
    if (methodMembers.length) {
      content += '\n\n**Methods:**\n';
      content += methodMembers
        .map(m => `- \`${this.formatSignature(m)}\`${m.description ? `: ${m.description.split('\n')[0]}` : ''}`)
        .join('\n');
    }
    
    return content;
  }

  private formatExamples(examples: string[]): string {
    return `\n\n**Example:**\n\`\`\`typescript\n${examples[0]}\n\`\`\``;
  }

  private formatTypeDefinitions(types: DocItem[]): string {
    const categories = types.reduce((acc, type) => {
      if (!acc[type.type]) {
        acc[type.type] = [];
      }
      acc[type.type].push(type);
      return acc;
    }, {} as Record<string, DocItem[]>);

    return `# Type Definitions\n\n${Object.entries(categories)
      .map(([category, items]) => `
## ${category.toUpperCase()}

${items.map(type => {
  const description = type.description ? type.description.split('\n')[0] : '';
  let docContent = `### \`${type.name}\`\n\n${description}`;
  
  if (type.schemas) {
    docContent += this.formatSchemas(type.schemas);
  }
  
  if (type.members?.length) {
    docContent += this.formatMembers(type.members);
  }
  
  if (type.examples?.length) {
    docContent += this.formatExamples(type.examples);
  }
  
  return docContent;
}).join('\n\n')}`).join('\n\n')}`;
  }

  private async writeValidationDocs(areaPath: string, docs: Record<string, DocItem[]>) {
    const validations = Object.entries(docs)
      .map(([file, items]) => ({
        file,
        items: items.filter(item => item.validation && item.validation.length > 0)
      }))
      .filter(({items}) => items.length > 0);

    if (validations.length === 0) return;

    await fs.writeFile(
      path.join(areaPath, 'validation.md'),
      this.formatValidationDocs(validations)
    );
  }

  private formatValidationDocs(validations: Array<{file: string, items: DocItem[]}>): string {
    return `# Validation Rules\n\n${
      validations.map(({file, items}) => `
## ${this.getDisplayNameForFile(file)}

${items.map(item => `
### ${item.name}

**Type:** ${item.type}

**Validation Rules:**
${item.validation!.map(rule => `- ${rule}`).join('\n')}`).join('\n')}
`).join('\n')}`;
  }

  private async writeIntegrationPoints(areaPath: string, docs: Record<string, DocItem[]>) {
    const integrations = Object.entries(docs)
      .filter(([file]) => 
        file.includes('integration') || 
        file.includes('api') || 
        file.includes('route')
      )
      .map(([file, items]) => ({
        file,
        items: items.filter(item => 
          ['class', 'function', 'route'].includes(item.type) && 
          item.exports
        )
      }))
      .filter(({items}) => items.length > 0);

    if (integrations.length === 0) return;

    await fs.writeFile(
      path.join(areaPath, 'integration.md'),
      this.formatIntegrationPoints(integrations)
    );
  }

  private formatIntegrationPoints(integrations: Array<{file: string, items: DocItem[]}>): string {
    const groupedIntegrations = integrations.reduce((acc, { file, items }) => {
      const type = file.includes('api') ? 'API Routes' :
                   file.includes('route') ? 'Routes' :
                   'Integration Points';
      
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push({ file, items });
      return acc;
    }, {} as Record<string, typeof integrations>);

    return `# Integration Points\n\n${
      Object.entries(groupedIntegrations).map(([type, files]) => `
## ${type}

${files.map(({ file, items }) => {
  const displayName = this.getDisplayNameForFile(file);
  
  return `### ${displayName}\n\n${
    items.map(item => {
      const signature = item.params ? `\`${this.formatSignature(item)}\`` : '';
      const description = item.description ? item.description.split('\n')[0] : '';
      let doc = `#### \`${item.name}\`\n\n${description}`;
      if (signature) doc += `\n\n**Signature:** ${signature}`;
      
      if (item.members?.length) {
        const methods = item.members.filter(m => m.type === 'method');
        if (methods.length) {
          doc += `\n\n**Methods:**\n${
            methods
              .map(m => `- \`${this.formatSignature(m)}\`${m.description ? ` - ${m.description.split('\n')[0]}` : ''}`)
              .join('\n')
          }`;
        }
      }
      
      return doc;
    }).join('\n\n')
  }`;
}).join('\n\n')}`
      ).join('\n\n')}`;
  }

  private extractSchemas(node: Node, sourceFile: SourceFile): DocItem['schemas'] | undefined {
    const schemas: DocItem['schemas'] = {};
    // Placeholder for schema extraction for type safety validations or database schema matching.
    return Object.keys(schemas).length > 0 ? schemas : undefined;
  }

  private async parseFile(filePath: string): Promise<DocItem[]> {
    const extension = path.extname(filePath).toLowerCase();
    const content = await fs.readFile(filePath, 'utf-8');

    // Extract imports for dependency tracking
    if (extension === '.ts' || extension === '.tsx') {
      const sf = this.program.getSourceFile(filePath);
      if (sf) {
        const imports = this.extractImports(sf);
        imports.forEach(imp => {
          if (!this.dependencyInfo[imp]) {
            this.dependencyInfo[imp] = { files: [] };
          }
          this.dependencyInfo[imp].files.push(path.relative(this.sourceDir, filePath));
        });
      }
    }

    switch (extension) {
      case '.ts':
      case '.tsx':
        return [];
      case '.js':
      case '.jsx':
        return this.parseJavaScriptFile(filePath, content);
      case '.sql':
        return this.parseSQLFile(filePath, content);
      case '.prisma':
        return this.parsePrismaFile(filePath, content);
      case '.json':
        return this.parseJSONFile(filePath, content);
      case '.css':
        return this.parseCSSFile(filePath, content);
      case '.md':
        return this.parseMarkdownFile(filePath, content);
      default:
        if (filePath.includes('config')) {
          return this.parseConfigFile(filePath, content);
        }
        return [];
    }
  }

  private parseJavaScriptFile(filePath: string, content: string): DocItem[] {
    return [{
      name: path.basename(filePath),
      description: 'JavaScript file',
      type: 'util',
      exports: true
    }];
  }

  private parseSQLFile(filePath: string, content: string): DocItem[] {
    // Existing logic remains
    const sqlComments = content.match(/\/\*[\s\S]*?\*\/|--.*$/gm) || [];
    const functions = content.match(/CREATE\s+FUNCTION\s+([^\s(]+)/gi) || [];
    const triggers = content.match(/CREATE\s+TRIGGER\s+([^\s]+)/gi) || [];
    const indexes = content.match(/CREATE\s+INDEX\s+([^\s]+)/gi) || [];

    const items: DocItem[] = [];

    const commentDesc = sqlComments.join('\n');

    functions.forEach(func => {
      const fname = func.split(/\s+/)[2];
      items.push({
        name: fname,
        description: commentDesc,
        type: 'sql',
        fileType: 'sql',
        exports: true
      });
    });

    triggers.forEach(trigger => {
      const tname = trigger.split(/\s+/)[2];
      items.push({
        name: tname,
        description: commentDesc,
        type: 'sql',
        fileType: 'sql',
        exports: true
      });
    });

    indexes.forEach(index => {
      const iname = index.split(/\s+/)[2];
      items.push({
        name: iname,
        description: commentDesc,
        type: 'sql',
        fileType: 'sql',
        exports: true
      });
    });

    if (items.length === 0 && sqlComments.length > 0) {
      items.push({
        name: path.basename(filePath),
        description: commentDesc,
        type: 'sql',
        fileType: 'sql',
        exports: true
      });
    }

    return items;
  }

  private parsePrismaFile(filePath: string, content: string): DocItem[] {
    // Existing logic remains
    const models = content.match(/model\s+(\w+)\s*{[\s\S]*?}/g) || [];
    return models.map(model => {
      const name = model.match(/model\s+(\w+)/)?.[1] || 'Unknown';
      const fields = model.match(/^\s+\w+\s+\w+.*$/gm) || [];
      return {
        name,
        description: `Prisma model for ${name}`,
        type: 'type',
        fileType: 'prisma',
        exports: true,
        members: fields.map(field => {
          const parts = field.trim().split(/\s+/);
          const fieldName = parts[0];
          const fieldType = parts[1];
          return {
            name: fieldName,
            description: fieldType,
            type: 'property',
            exports: false
          };
        })
      };
    });
  }

  private parseJSONFile(filePath: string, content: string): DocItem[] {
    try {
      const json = JSON.parse(content);
      return [{
        name: path.basename(filePath, '.json'),
        description: 'Configuration file',
        type: 'config',
        fileType: 'json',
        exports: true,
        members: Object.entries(json).map(([key, value]) => ({
          name: key,
          description: JSON.stringify(value),
          type: 'property',
          exports: false
        }))
      }];
    } catch {
      return [];
    }
  }

  private parseCSSFile(filePath: string, content: string): DocItem[] {
    const classes = content.match(/\.[a-zA-Z][a-zA-Z0-9-_]*\s*\{/g) || [];
    return [{
      name: path.basename(filePath, '.css'),
      description: 'Stylesheet',
      type: 'style',
      fileType: 'css',
      exports: true,
      members: classes.map(className => ({
        name: className.slice(1, -1).trim(),
        description: 'CSS class',
        type: 'property',
        exports: false
      }))
    }];
  }

  private parseMarkdownFile(filePath: string, content: string): DocItem[] {
    const headers = content.match(/^#+\s+.+$/gm) || [];
    return [{
      name: path.basename(filePath, '.md'),
      description: headers[0]?.replace(/^#+\s+/, '') || 'Documentation',
      type: 'documentation',
      fileType: 'markdown',
      exports: true,
      members: headers.slice(1).map(header => ({
        name: header.replace(/^#+\s+/, ''),
        description: 'Section header',
        type: 'property',
        exports: false
      }))
    }];
  }

  private parseConfigFile(filePath: string, content: string): DocItem[] {
    if (filePath.endsWith('.json')) {
      return this.parseJSONFile(filePath, content);
    }
    if (filePath.endsWith('.ts')) {
      return [];
    }
    return [{
      name: path.basename(filePath),
      description: 'Configuration file',
      type: 'config',
      fileType: 'config',
      exports: true
    }];
  }

  private extractImports(sourceFile: SourceFile): string[] {
    const imports: string[] = [];
    sourceFile.statements.forEach(statement => {
      if (typescript.isImportDeclaration(statement)) {
        const moduleSpecifier = statement.moduleSpecifier.getText().replace(/['"]/g, '');
        imports.push(moduleSpecifier);
      }
    });
    return imports;
  }

}

if (require.main === module) {
  const generator = new DocGenerator(process.cwd());
  generator.generateDocs().catch(console.error);
}

module.exports = DocGenerator;
