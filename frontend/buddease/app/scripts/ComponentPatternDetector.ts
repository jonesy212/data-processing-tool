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
  getTempData,
  DebugInfo,
  TempData,
} from '@/app/utils/tempDataUtils';
import { ComponentsConfig } from '@/app/config/ComponentsConfig';

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
      case 'List':
        return this.listTemplate<T>(pattern);
      case 'Detail':
        return this.detailTemplate<T>(pattern);
      case 'Modal':
        return this.modalTemplate<T>(pattern);
      case 'Chart':
        return this.chartTemplate<T>(pattern);
      default:
        return this.genericTemplate<T>(pattern);
    }
  }

  /* ---------- CRUD Template ---------- */
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

  /* ---------- Form Template ---------- */
  private formTemplate<T extends BaseDataEntity>(
    pattern: ComponentPattern
  ): string {
    const { 
      usesSnapshotStore, 
      usesComponentConfig, 
      configKeys,
      usesErrorHandling,
      componentName, 
      fields 
    } = pattern;

    return `import React, { useState, useEffect${usesComponentConfig ? ', useMemo' : ''} } from 'react';
${usesSnapshotStore ? "import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';\n" + "import { storeTempData, getTempData } from '@/app/utils/tempDataUtils';\n" : ''}${usesComponentConfig ? "import { useComponentConfig } from '@/app/hooks/useComponentConfig';\n" : ''}${usesErrorHandling ? "import { useErrorHandling } from '@/app/hooks/useErrorHandling';\n" : ''}

interface ${componentName}Props<T extends BaseDataEntity> {
${usesSnapshotStore ? '  snapshotConfigs: SnapshotStoreConfig<T, T, any, any, any, any>[];\n  configId: string;' : ''}${usesComponentConfig && configKeys ? `\n  themeOverride?: Pick<ComponentsConfig, ${configKeys.map(k => `'${k}'`).join(' | ')}>;` : ''}
}

export const ${componentName} = <T extends BaseDataEntity>({
${usesSnapshotStore ? '  snapshotConfigs, configId,' : ''}${usesComponentConfig && configKeys ? '\n  themeOverride,' : ''}
}: ${componentName}Props<T>) => {
  const [form, setForm] = useState<Record<string, any>>({});
  ${usesComponentConfig && configKeys ? `
  const theme = useComponentConfig();
  const activeTheme = useMemo(() => ({ ...theme, ...themeOverride }), [theme, themeOverride]);` : ''}
  ${usesErrorHandling ? 'const { error, handleError } = useErrorHandling();' : ''}

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
    <form onSubmit={handleSubmit}${usesComponentConfig && configKeys ? ` style={{
      ...(activeTheme.input?.backgroundColor && { backgroundColor: activeTheme.input.backgroundColor }),
      ...(activeTheme.input?.textColor && { color: activeTheme.input.textColor })
    }}` : ''}>
      ${fields.map(f => `<label key="${f}"${usesComponentConfig && configKeys ? ` style={{
        color: activeTheme.input?.textColor
      }}` : ''}>
        ${f}
        <input 
          name="${f}" 
          value={form.${f} ?? ''} 
          onChange={handleChange}
          ${usesComponentConfig && configKeys ? `style={{
            color: activeTheme.input?.textColor,
            backgroundColor: activeTheme.input?.backgroundColor,
            border: activeTheme.input?.border
          }}` : ''}
        />
      </label>`).join('\n      ')}
      <button type="submit"${usesComponentConfig && configKeys ? ` style={{
        color: activeTheme.button?.textColor,
        backgroundColor: activeTheme.button?.backgroundColor,
        borderColor: activeTheme.button?.borderColor,
        borderRadius: activeTheme.button?.borderRadius
      }}` : ''}>Submit</button>
    </form>
  );
};
`;
  }

  /* ---------- Table Template ---------- */
  private tableTemplate<T extends BaseDataEntity>(
    pattern: ComponentPattern
  ): string {
    const { 
      componentName, 
      fields,
      usesComponentConfig,
      configKeys
    } = pattern;
    
    return `import React${usesComponentConfig ? ', { useMemo }' : ''} from 'react';${usesComponentConfig ? "\nimport { useComponentConfig } from '@/app/hooks/useComponentConfig';" : ''}

interface ${componentName}Props<T extends BaseDataEntity> {
  data: T[];
${usesComponentConfig && configKeys ? `  themeOverride?: Pick<ComponentsConfig, ${configKeys.map(k => `'${k}'`).join(' | ')}>;` : ''}
}

export const ${componentName} = <T extends BaseDataEntity>({
  data,${usesComponentConfig && configKeys ? '\n  themeOverride,' : ''}
}: ${componentName}Props<T>) => {
  ${usesComponentConfig && configKeys ? `
  const theme = useComponentConfig();
  const activeTheme = useMemo(() => ({ ...theme, ...themeOverride }), [theme, themeOverride]);` : ''}

  return (
    <table className="${componentName.toLowerCase()}"${usesComponentConfig && configKeys ? ` style={{
      ...(activeTheme.table?.backgroundColor && { backgroundColor: activeTheme.table.backgroundColor })
    }}` : ''}>
      <thead>
        <tr${usesComponentConfig && configKeys ? ` style={{
          backgroundColor: activeTheme.header?.backgroundColor,
          color: activeTheme.header?.textColor
        }}` : ''}>
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

  /* ---------- List Template ---------- */
  private listTemplate<T extends BaseDataEntity>(
    pattern: ComponentPattern
  ): string {
    const { 
      componentName, 
      fields,
      usesComponentConfig,
      configKeys
    } = pattern;

    return `import React${usesComponentConfig ? ', { useMemo }' : ''} from 'react';${usesComponentConfig ? "\nimport { useComponentConfig } from '@/app/hooks/useComponentConfig';" : ''}

interface ${componentName}Props<T extends BaseDataEntity> {
  items: T[];
${usesComponentConfig && configKeys ? `  themeOverride?: Pick<ComponentsConfig, ${configKeys.map(k => `'${k}'`).join(' | ')}>;` : ''}
}

export const ${componentName} = <T extends BaseDataEntity>({
  items,${usesComponentConfig && configKeys ? '\n  themeOverride,' : ''}
}: ${componentName}Props<T>) => {
  ${usesComponentConfig && configKeys ? `
  const theme = useComponentConfig();
  const activeTheme = useMemo(() => ({ ...theme, ...themeOverride }), [theme, themeOverride]);` : ''}

  return (
    <div className="${componentName.toLowerCase()}"${usesComponentConfig && configKeys ? ` style={{
      ...(activeTheme.list?.backgroundColor && { backgroundColor: activeTheme.list.backgroundColor })
    }}` : ''}>
      {items.map((item, index) => (
        <div key={index} className="list-item"${usesComponentConfig && configKeys ? ` style={{
          border: activeTheme.list?.borderColor ? \`1px solid \${activeTheme.list.borderColor}\` : undefined,
          padding: '8px',
          margin: '4px 0'
        }}` : ''}>
          ${fields.map(f => `<div key="${f}">${f.includes('.') ? `item?.${f}` : `item.${f}`}</div>`).join('')}
        </div>
      ))}
    </div>
  );
};
`;
  }

  /* ---------- Modal Template ---------- */
  private modalTemplate<T extends BaseDataEntity>(
    pattern: ComponentPattern
  ): string {
    const { 
      componentName,
      usesComponentConfig,
      configKeys
    } = pattern;

    return `import React${usesComponentConfig ? ', { useMemo }' : ''} from 'react';${usesComponentConfig ? "\nimport { useComponentConfig } from '@/app/hooks/useComponentConfig';" : ''}

interface ${componentName}Props {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
${usesComponentConfig && configKeys ? `  themeOverride?: Pick<ComponentsConfig, ${configKeys.map(k => `'${k}'`).join(' | ')}>;` : ''}
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  isOpen,
  onClose,
  children,${usesComponentConfig && configKeys ? '\n  themeOverride,' : ''}
}) => {
  ${usesComponentConfig && configKeys ? `
  const theme = useComponentConfig();
  const activeTheme = useMemo(() => ({ ...theme, ...themeOverride }), [theme, themeOverride]);` : ''}

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: activeTheme.modal?.overlayColor || 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        border: activeTheme.modal?.borderColor ? \`1px solid \${activeTheme.modal.borderColor}\` : '1px solid #ccc',
        minWidth: '300px'
      }} onClick={e => e.stopPropagation()}>
        {children}
        <button onClick={onClose} style={{
          marginTop: '10px',
          color: activeTheme.button?.textColor,
          backgroundColor: activeTheme.button?.backgroundColor
        }}>
          Close
        </button>
      </div>
    </div>
  );
};
`;
  }

  /* ---------- Detail Template ---------- */
  private detailTemplate<T extends BaseDataEntity>(
    pattern: ComponentPattern
  ): string {
    const { 
      componentName, 
      fields,
      usesComponentConfig,
      configKeys
    } = pattern;

    return `import React${usesComponentConfig ? ', { useMemo }' : ''} from 'react';${usesComponentConfig ? "\nimport { useComponentConfig } from '@/app/hooks/useComponentConfig';" : ''}

interface ${componentName}Props<T extends BaseDataEntity> {
  data: T;
${usesComponentConfig && configKeys ? `  themeOverride?: Pick<ComponentsConfig, ${configKeys.map(k => `'${k}'`).join(' | ')}>;` : ''}
}

export const ${componentName} = <T extends BaseDataEntity>({
  data,${usesComponentConfig && configKeys ? '\n  themeOverride,' : ''}
}: ${componentName}Props<T>) => {
  ${usesComponentConfig && configKeys ? `
  const theme = useComponentConfig();
  const activeTheme = useMemo(() => ({ ...theme, ...themeOverride }), [theme, themeOverride]);` : ''}

  return (
    <div className="${componentName.toLowerCase()}"${usesComponentConfig && configKeys ? ` style={{
      ...(activeTheme.detail?.backgroundColor && { backgroundColor: activeTheme.detail.backgroundColor }),
      ...(activeTheme.detail?.textColor && { color: activeTheme.detail.textColor })
    }}` : ''}>
      ${fields.map(f => `<div key="${f}" className="detail-field">
        <strong>${f}:</strong> ${f.includes('.') ? `data?.${f}` : `data.${f}`}
      </div>`).join('')}
    </div>
  );
};
`;
  }

  /* ---------- Chart Template ---------- */
  private chartTemplate<T extends BaseDataEntity>(
    pattern: ComponentPattern
  ): string {
    const { 
      componentName,
      usesComponentConfig,
      configKeys
    } = pattern;

    return `import React${usesComponentConfig ? ', { useMemo }' : ''} from 'react';${usesComponentConfig ? "\nimport { useComponentConfig } from '@/app/hooks/useComponentConfig';" : ''}

interface ${componentName}Props {
  data: any[];
  width?: number;
  height?: number;
${usesComponentConfig && configKeys ? `  themeOverride?: Pick<ComponentsConfig, ${configKeys.map(k => `'${k}'`).join(' | ')}>;` : ''}
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  data,
  width = 400,
  height = 300,${usesComponentConfig && configKeys ? '\n  themeOverride,' : ''}
}) => {
  ${usesComponentConfig && configKeys ? `
  const theme = useComponentConfig();
  const activeTheme = useMemo(() => ({ ...theme, ...themeOverride }), [theme, themeOverride]);` : ''}

  return (
    <div className="${componentName.toLowerCase()}" style={{
      width: \`\${width}px\`,
      height: \`\${height}px\`,
      border: activeTheme.chart?.borderColor ? \`1px solid \${activeTheme.chart.borderColor}\` : '1px solid #ddd',
      padding: '10px'
    }}>
      <svg width={width} height={height}>
        {/* Simple bar chart example */}
        {data.map((item, index) => (
          <rect
            key={index}
            x={index * (width / data.length)}
            y={height - (item.value / 100) * height}
            width={width / data.length - 2}
            height={(item.value / 100) * height}
            fill={activeTheme.chart?.barColor || '#007bff'}
          />
        ))}
      </svg>
    </div>
  );
};
`;
  }

  /* ---------- Generic Template ---------- */
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

  /* ---------- Helper Methods ---------- */
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
      imports.push("import type { ComponentsConfig } from '@/app/config/ComponentsConfig';");
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
      props.push(`  themeOverride?: Pick<ComponentsConfig, ${configKeys.map(k => `'${k}'`).join(' | ')}>;`);
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
        ...(activeTheme.${configKeys[0]}?.backgroundColor && { backgroundColor: activeTheme.${configKeys[0]}.backgroundColor })
      }}` : ''}>
      ${usesDebugInfo ? `{debugInfo && (
        <pre className="debug">{JSON.stringify(debugInfo, null, 2)}</pre>
      )}` : ''}
      ${usesMeta ? `{meta && (
        <meta name="${componentName}" content={JSON.stringify(meta)} />
      )}` : ''}
      <h2${usesComponentConfig && configKeys ? ` style={{
        color: activeTheme.header?.textColor,
        backgroundColor: activeTheme.header?.backgroundColor
      }}` : ''}>${componentName}</h2>
      <button onClick={() => {/* TODO create */}}${usesComponentConfig && configKeys ? ` style={{
        color: activeTheme.button?.textColor,
        backgroundColor: activeTheme.button?.backgroundColor,
        borderColor: activeTheme.button?.borderColor,
        borderRadius: activeTheme.button?.borderRadius
      }}` : ''}>Add</button>
      <table>
        <thead>
          <tr${usesComponentConfig && configKeys ? ` style={{
            backgroundColor: activeTheme.header?.backgroundColor,
            color: activeTheme.header?.textColor
          }}` : ''}>
            ${fields.map(f => `<th key="${f}">${f}</th>`).join('')}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={(row as any).id ?? JSON.stringify(row)}>
              ${fields.map(f => `<td key="${f}">{${f.includes('.') ? `row?.${f}` : `row.${f}`}}</td>`).join('')}
              <td>
                <button onClick={() => handleDelete((row as any).id)}${usesComponentConfig && configKeys ? ` style={{
                  color: activeTheme.button?.textColor,
                  backgroundColor: activeTheme.button?.backgroundColor
                }}` : ''}>
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