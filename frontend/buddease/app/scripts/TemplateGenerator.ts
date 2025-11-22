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
} from '@/app/utils/tempDataUtils'; // adjust path

export class TemplateGenerator {
  /* ---------- public entry ---------- */
  generate<T extends BaseDataEntity = BaseDataRoot>(
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

  /* ---------- CRUD (with full snapshot life-cycle) ---------- */
  private crudTemplate<T extends BaseDataEntity>(
    p: ComponentPattern
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
    } = p;

    return `import React, { useEffect, useState${
      usesComponentConfig ? ', useMemo' : ''
    } } from 'react';
${usesComponentConfig ? "import { useComponentConfig } from '@/app/hooks/useComponentConfig';\n" : ''}${
  usesErrorHandling
    ? "import { useErrorHandling } from '@/app/hooks/useErrorHandling';\n"
    : ''
}${usesNotificationService ? "import { useNotificationManagerService } from '@/app/services/NotificationService';\n" : ''}import {
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

interface ${p.componentName}Props<T extends BaseDataEntity = BaseDataRoot> {${
  requiresAuth ? '\n  accessToken?: string;\n' : ''
}${
  usesSnapshotStore
    ? '\n  snapshotConfigs: SnapshotStoreConfig<T, T, DefaultMeta<T, T>, Attachment, DefaultExcludedFields<T>, keyof T>[];\n  configId: string;\n'
    : ''
}${
  usesDebugInfo
    ? '\n  debugInfo?: DebugInfo;\n  onDebug?: (info: DebugInfo) => void;\n'
    : ''
}${
  usesMeta
    ? '\n  meta?: DefaultMeta<T, T>;\n'
    : ''
}${
  usesComponentConfig && configKeys
    ? `\n  themeOverride?: Pick<ComponentConfig, ${configKeys
        .map(k => `'${k}'`)
        .join(' | ')}>;`
    : ''
}
  data: T[];
  onChange?: (rows: T[]) => void;
}

export const ${p.componentName} = <T extends BaseDataEntity = BaseDataRoot>({
${requiresAuth ? '  accessToken,\n' : ''}${
  usesSnapshotStore ? '  snapshotConfigs,\n  configId,\n' : ''
}${
  usesDebugInfo ? '  debugInfo,\n  onDebug,\n' : ''
}${
  usesMeta ? '  meta,\n' : ''
}${
  usesComponentConfig && configKeys
    ? `  themeOverride,\n`
    : ''
}  data,
  onChange,
}: ${p.componentName}Props<T>) => {
  const [rows, setRows] = useState<T[]>(data);
  const [loading, setLoading] = useState(false);
${
  usesErrorHandling
    ? '  const { error, handleError } = useErrorHandling();'
    : ''
}${
  usesNotificationService
    ? '  const notification = useNotificationManagerService();'
    : ''
}${
  usesComponentConfig && configKeys
    ? `  const theme = useComponentConfig();
  const activeTheme = useMemo(() => ({ ...theme, ...themeOverride }), [theme, themeOverride]);`
    : ''
}

  /* ------- debug helper ------- */
  const log = (op: string, msg?: any) => {
    const info: DebugInfo = {
      message: \`\${op}: \${msg ?? 'ok'}\`,
      timestamp: new Date().toISOString(),
      operation: op,
      additionalData: msg,
    };
    if (onDebug) onDebug(info);
    console.log(\`[${p.componentName}] \${info.message}`);
  };

  /* ------- snapshot life-cycle (mount) ------- */
  useEffect(() => {
    if (!usesSnapshotStore) return;
    log('mount', 'store temp snapshot');
    storeTempData(snapshotConfigs, configId, rows);
    // hydrate on mount
    const cached = getTempData(snapshotConfigs, configId);
    if (cached && cached.length) {
      log('hydrate', \`loaded \${cached.length} rows\`);
      setRows(cached);
    }
  }, []);

  /* ------- auto-persist on change ------- */
  useEffect(() => {
    if (!usesSnapshotStore) return;
    log('persist', \`save \${rows.length} rows\`);
    storeTempData(snapshotConfigs, configId, rows);
    if (onChange) onChange(rows);
  }, [rows]);

  /* ------- handlers ------- */
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      log('delete', id);
      setRows(prev => prev.filter(r => (r as any).id !== id));
      ${
        usesNotificationService
          ? 'notification.sendPushNotification(`Row ${id} deleted`, "CRUD");'
          : ''
      }
    } catch (err: any) {
      ${
        usesErrorHandling
          ? 'handleError(err.message);'
          : 'console.error(err);'
      }
    } finally {
      setLoading(false);
    }
  };

  /* ------- render ------- */
  return (
    <div className="${p.componentName.toLowerCase()}-wrapper"${
      usesComponentConfig && configKeys
        ? ` style={{
            ...(activeTheme.${configKeys[0]} && activeTheme.${configKeys[0]})
          }}`
        : ''
    }>
      {usesDebugInfo && debugInfo && (
        <pre className="debug">{JSON.stringify(debugInfo, null, 2)}</pre>
      )}
      {usesMeta && meta && (
        <meta name="${p.componentName}" content={JSON.stringify(meta)} />
      )}
      <h2>${p.componentName}</h2>
      <button onClick={() => {/* TODO create */}}>Add</button>
      <table>
        <thead>
          <tr>
            ${p.fields.map(f => `<th key="${f}">${f}</th>`).join('')}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={(row as any).id ?? JSON.stringify(row)}>
              ${p.fields
                .map(
                  f => `<td key="${f}">{${
                    f.includes('.') ? `row?.${f}` : `row.${f}`
                  }}</td>`
                )
                .join('')}
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
  );
};
`;
  }

  /* ---------- Form template (with temp validation cache) ---------- */
  private formTemplate<T extends BaseDataEntity>(
    p: ComponentPattern
  ): string {
    const usesSnapshotStore = p.usesSnapshotStore;
    return `import React, { useState, useEffect } from 'react';
${
  usesSnapshotStore
    ? "import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';\n" +
      "import { storeTempData, getTempData } from '@/app/utils/tempDataUtils';\n"
    : ''
}

interface ${p.componentName}Props<T extends BaseDataEntity> {${
  usesSnapshotStore
    ? '\n  snapshotConfigs: SnapshotStoreConfig<T, T, any, any, any, any>[];\n  configId: string;\n'
    : ''
}}
export const ${p.componentName} = <T extends BaseDataEntity>({${
  usesSnapshotStore ? 'snapshotConfigs, configId' : ''
}: ${p.componentName}Props<T>) => {
  const [form, setForm] = useState<Record<string, any>>({});

  /* ------- cache last valid form state ------- */
  useEffect(() => {
    if (!usesSnapshotStore) return;
    const cached = getTempData(snapshotConfigs, configId);
    if (cached?.length) setForm(cached[0]); // first row = last valid
  }, []);

  useEffect(() => {
    if (!usesSnapshotStore) return;
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
      ${p.fields
        .map(
          f => `<label key="${f}">
        ${f}
        <input name="${f}" value={form.${f} ?? ''} onChange={handleChange} />
      </label>`
        )
        .join('\n      ')}
      <button type="submit">Submit</button>
    </form>
  );
};
`;
  }

  /* ---------- Generic fallback ---------- */
  private genericTemplate<T extends BaseDataEntity>(
    p: ComponentPattern
  ): string {
    return `import React from 'react';

export const ${p.componentName} = () => (
  <div className="${p.componentName.toLowerCase()}">
    {/* Auto-generated component – add your markup */}
  </div>
);
`;
  }
}