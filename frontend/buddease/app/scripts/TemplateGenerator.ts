import { ComponentPattern } from './ComponentPatternDetector';
import {
  BaseDataEntity,
  BaseDataRoot,
  DefaultMeta,
  DefaultExcludedFields,
} from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import {
  storeTempData,
  getTempData
} from '@/utils/tempDataUtils';

import {
  DebugInfo,
  TempData,
} from '@/app/models/data/TempData'

export class TemplateGenerator {
  /* ---------- Properties ---------- */
  private readonly defaultIndentation = 2;
  private readonly maxLineLength = 100;

  /* ---------- Public methods ---------- */
  public generate<T extends BaseDataEntity = BaseDataRoot>(
    pattern: ComponentPattern
  ): string {
    switch (pattern.pattern) {
      case 'CRUD':
        return this.crudTemplate<T>(pattern);
      case 'Form':
        return this.formTemplate<T>(pattern);
      case 'Table':
        return this.tableTemplate<T>(pattern);
      default:
        return this.genericTemplate<T>(pattern);
    }
  }

  /* ---------- Private template methods ---------- */
  private crudTemplate<T extends BaseDataEntity>(
    pattern: ComponentPattern
  ): string {
    const {
      usesSnapshotStore,
      usesDebugInfo,
      usesMeta,
      usesComponentConfig,
      configKeys,
      usesErrorHandling,
      usesNotificationService,
      requiresAuth,
      componentName,
      fields,
    } = pattern;

    const imports = this.buildImports(pattern);
    const propsInterface = this.buildPropsInterface(pattern);
    const hooks = this.buildHooks(pattern);
    const debugHelper = this.buildDebugHelper(pattern);
    const snapshotEffects = this.buildSnapshotEffects(pattern);
    const handlers = this.buildHandlers(pattern);
    const render = this.buildCrudRender(pattern);

    return `import React, { useEffect, useState${usesComponentConfig ? ', useMemo' : ''} } from 'react';
${imports}

${propsInterface}

export const ${componentName} = <T extends BaseDataEntity = BaseDataRoot>({
${requiresAuth ? '  accessToken,\n' : ''}${usesSnapshotStore ? '  snapshotConfigs,\n  configId,\n' : ''}${usesDebugInfo ? '  debugInfo,\n  onDebug,\n' : ''}${usesMeta ? '  meta,\n' : ''}${usesComponentConfig && configKeys ? '  themeOverride,\n' : ''}  data,
  onChange,
}: ${componentName}Props<T>) => {
  const [rows, setRows] = useState<T[]>(data);
  const [loading, setLoading] = useState(false);
${hooks}

${debugHelper}

${snapshotEffects}

${handlers}

${render}
};
`;
  }

  private formTemplate<T extends BaseDataEntity>(
    pattern: ComponentPattern
  ): string {
    const { usesSnapshotStore, componentName, fields } = pattern;

    return `import React, { useState, useEffect } from 'react';
${usesSnapshotStore ? "import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';\n" + "import { storeTempData, getTempData } from '@/app/utils/tempDataUtils';\n" : ''}

interface ${componentName}Props<T extends BaseDataEntity> {
${usesSnapshotStore ? '  snapshotConfigs: SnapshotStoreConfig<T, T, any, any, any, any>[];\n  configId: string;' : ''}
}

export const ${componentName} = <T extends BaseDataEntity>({
${usesSnapshotStore ? '  snapshotConfigs, configId' : ''}
}: ${componentName}Props<T>) => {
  const [form, setForm] = useState<Record<string, any>>({});

  /* ------- Cache last valid form state ------- */
  useEffect(() => {
    if (!${usesSnapshotStore}) return;
    const cached = getTempData(snapshotConfigs, configId);
    if (cached?.length) setForm(cached[0]);
  }, []);

  useEffect(() => {
    if (!${usesSnapshotStore}) return;
    storeTempData(snapshotConfigs, configId, [form]);
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted', form);
  };

  return (
    <form onSubmit={handleSubmit}>
      ${fields.map(f => `<label key="${f}">
        ${f}
        <input name="${f}" value={form.${f} ?? ''} onChange={handleChange} />
      </label>`).join('\n      ')}
      <button type="submit">Submit</button>
    </form>
  );
};
`;
  }

  private tableTemplate<T extends BaseDataEntity>(
    pattern: ComponentPattern
  ): string {
    const { componentName, fields } = pattern;
    
    return `import React from 'react';

interface ${componentName}Props<T extends BaseDataEntity> {
  data: T[];
}

export const ${componentName} = <T extends BaseDataEntity>({
  data,
}: ${componentName}Props<T>) => {
  return (
    <table className="${componentName.toLowerCase()}">
      <thead>
        <tr>
          ${fields.map(f => `<th key="${f}">${f}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            ${fields.map(f => `<td key="${f}">${f.includes('.') ? `row?.${f}` : `row.${f}`}</td>`).join('')}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
`;
  }

  private genericTemplate<T extends BaseDataEntity>(
    pattern: ComponentPattern
  ): string {
    const { componentName } = pattern;

    return `import React from 'react';

interface ${componentName}Props {
  // Add your props here
}

export const ${componentName}: React.FC<${componentName}Props> = () => (
  <div className="${componentName.toLowerCase()}">
    {/* Auto-generated component – add your markup */}
  </div>
);
`;
  }

  /* ---------- Helper methods ---------- */
  private buildImports(pattern: ComponentPattern): string {
    const {
      usesComponentConfig,
      usesErrorHandling,
      usesNotificationService,
    } = pattern;

    const imports = [
      "import { BaseDataEntity, BaseDataRoot, DefaultMeta, DefaultExcludedFields } from '@/app/config/BaseConfig';",
      "import { Attachment } from '@/app/documents/attachment/Attachment';",
      "import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';",
      "import { storeTempData, getTempData, DebugInfo, TempData } from '@/app/utils/tempDataUtils';",
    ];

    if (usesComponentConfig) {
      imports.push("import { useComponentConfig } from '@/app/hooks/useComponentConfig';");
    }
    if (usesErrorHandling) {
      imports.push("import { useErrorHandling } from '@/app/hooks/useErrorHandling';");
    }
    if (usesNotificationService) {
      imports.push("import { useNotificationManagerService } from '@/app/services/NotificationService';");
    }

    return imports.join('\n');
  }

  private buildPropsInterface(pattern: ComponentPattern): string {
    const {
      componentName,
      requiresAuth,
      usesSnapshotStore,
      usesDebugInfo,
      usesMeta,
      usesComponentConfig,
      configKeys,
    } = pattern;

    const props: string[] = [];

    if (requiresAuth) {
      props.push('  accessToken?: string;');
    }
    if (usesSnapshotStore) {
      props.push('  snapshotConfigs: SnapshotStoreConfig<T, T, DefaultMeta<T, T>, Attachment, DefaultExcludedFields<T>, keyof T>[];');
      props.push('  configId: string;');
    }
    if (usesDebugInfo) {
      props.push('  debugInfo?: DebugInfo;');
      props.push('  onDebug?: (info: DebugInfo) => void;');
    }
    if (usesMeta) {
      props.push('  meta?: DefaultMeta<T, T>;');
    }
    if (usesComponentConfig && configKeys) {
      props.push(`  themeOverride?: Pick<ComponentConfig, ${configKeys.map(k => `'${k}'`).join(' | ')}>;`);
    }
    props.push('  data: T[];');
    props.push('  onChange?: (rows: T[]) => void;');

    return `interface ${componentName}Props<T extends BaseDataEntity = BaseDataRoot> {
${props.join('\n')}
}`;
  }

  private buildHooks(pattern: ComponentPattern): string {
    const {
      usesErrorHandling,
      usesNotificationService,
      usesComponentConfig,
      configKeys,
    } = pattern;

    const hooks: string[] = [];

    if (usesErrorHandling) {
      hooks.push('  const { error, handleError } = useErrorHandling();');
    }
    if (usesNotificationService) {
      hooks.push('  const notification = useNotificationManagerService();');
    }
    if (usesComponentConfig && configKeys) {
      hooks.push('  const theme = useComponentConfig();');
      hooks.push('  const activeTheme = useMemo(() => ({ ...theme, ...themeOverride }), [theme, themeOverride]);');
    }

    return hooks.join('\n');
  }

  private buildDebugHelper(pattern: ComponentPattern): string {
    const { componentName, usesDebugInfo } = pattern;

    if (!usesDebugInfo) return '';

    return `  /* ------- Debug helper ------- */
  const log = (op: string, msg?: any) => {
    const info: DebugInfo = {
      message: \`\${op}: \${msg ?? 'ok'}\`,
      timestamp: new Date().toISOString(),
      operation: op,
      additionalData: msg,
    };
    if (onDebug) onDebug(info);
    console.log(\`[${componentName}] \${info.message}\`);
  };`;
  }

  private buildSnapshotEffects(pattern: ComponentPattern): string {
    const { usesSnapshotStore, componentName } = pattern;

    if (!usesSnapshotStore) return '';

    return `  /* ------- Snapshot life-cycle (mount) ------- */
  useEffect(() => {
    if (!${usesSnapshotStore}) return;
    log('mount', 'store temp snapshot');
    storeTempData(snapshotConfigs, configId, rows);
    
    const cached = getTempData(snapshotConfigs, configId);
    if (cached && cached.length) {
      log('hydrate', \`loaded \${cached.length} rows\`);
      setRows(cached);
    }
  }, []);

  /* ------- Auto-persist on change ------- */
  useEffect(() => {
    if (!${usesSnapshotStore}) return;
    log('persist', \`save \${rows.length} rows\`);
    storeTempData(snapshotConfigs, configId, rows);
    if (onChange) onChange(rows);
  }, [rows]);`;
  }

  private buildHandlers(pattern: ComponentPattern): string {
    const { usesNotificationService, usesErrorHandling } = pattern;

    return `  /* ------- Handlers ------- */
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      log('delete', id);
      setRows(prev => prev.filter(r => (r as any).id !== id));
      ${usesNotificationService ? 'notification.sendPushNotification(`Row ${id} deleted`, "CRUD");' : ''}
    } catch (err: any) {
      ${usesErrorHandling ? 'handleError(err.message);' : 'console.error(err);'}
    } finally {
      setLoading(false);
    }
  };`;
  }

  private buildCrudRender(pattern: ComponentPattern): string {
    const {
      componentName,
      usesDebugInfo,
      usesMeta,
      usesComponentConfig,
      configKeys,
      fields,
    } = pattern;

    return `  /* ------- Render ------- */
  return (
    <div className="${componentName.toLowerCase()}-wrapper"${usesComponentConfig && configKeys ? ` style={{
        ...(activeTheme.${configKeys[0]} && activeTheme.${configKeys[0]})
      }}` : ''}>
      ${usesDebugInfo ? `{debugInfo && (
        <pre className="debug">{JSON.stringify(debugInfo, null, 2)}</pre>
      )}` : ''}
      ${usesMeta ? `{meta && (
        <meta name="${componentName}" content={JSON.stringify(meta)} />
      )}` : ''}
      <h2>${componentName}</h2>
      <button onClick={() => {/* TODO create */}}>Add</button>
      <table>
        <thead>
          <tr>
            ${fields.map(f => `<th key="${f}">${f}</th>`).join('')}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={(row as any).id ?? JSON.stringify(row)}>
              ${fields.map(f => `<td key="${f}">{${f.includes('.') ? `row?.${f}` : `row.${f}`}}</td>`).join('')}
              <td>
                <button onClick={() => handleDelete((row as any).id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );`;
  }
}