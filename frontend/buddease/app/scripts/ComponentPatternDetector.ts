// ComponentPatternDetector.ts
import { PatternAnalysis } from './PatternAnalyzer'; // adjust import path

import { PatternAnalysis } from './PatternAnalyzer';
import { ComponentConfig } from '@/app/typings/ComponentConfig'; // your shape

/* ------------------------------------------------------------- */
/*  Enhanced pattern descriptor – includes real-world concerns   */
/* ------------------------------------------------------------- */
export interface ComponentPattern {
  componentName: string;
  pattern: 'CRUD'|'Form'|'List'|'Detail'|'Modal'|'Chart'|'Table'|'Generic';

  /* core flags */
  fields: string[];
  hasApi: boolean;
  hasState: boolean;
  hasRouting: boolean;

  /* notification / channel integration */
  usesNotificationContext: boolean;
  usesNotificationService: boolean;
  usesNotificationChannels: boolean; // NotificationChannelHelper
  channels?: ('email'|'push'|'sms'|'inApp')[];

  /* state management */
  usesRedux: boolean;
  usesContext: boolean;
  actions?: string[]; // e.g. ["ComponentActions.updateComponent"]

  /* error handling */
  usesErrorHandling: boolean; // useErrorHandling hook

  /* real-time */
  usesWebSocket: boolean;
  socketEvents?: string[]; // ["join","message",...]

  /* domain data */
  usesProjectService: boolean;
  usesEntityService?: boolean; // generic flag for any entity service

  /* styling / theming */
  usesComponentConfig: boolean; // useComponentConfig
  configKeys?: (keyof ComponentConfig)[]; // ["button","input"]

  /* security */
  requiresAuth: boolean; // checks for accessToken prop / header

  /* status / meta */
  usesStatusType: boolean; // references StatusType
  hasStructuredMetadata: boolean; // StructuredMetadata usage
}

export class ComponentPatternDetector {
  detect(analysis: PatternAnalysis): ComponentPattern[] {
    return analysis.modules.flatMap(mod =>
      mod.components.map(comp => this.buildPattern(comp))
    );
  }

  private buildPattern(comp: { name: string; source: string }): ComponentPattern {
    const src = comp.source;

    /* ---- basic signal extraction ---- */
    const fields = this.extractFields(src);
    const hasApi = /useEffect.*fetch|axios|fetch\(/.test(src);
    const hasState = /useState|useReducer/.test(src);
    const hasRouting = /useRouter|useSearchParams|Link/.test(src);

    /* ---- notification ---- */
    const usesNotificationContext = /useNotification\s*\(\)/.test(src);
    const usesNotificationService = /useNotificationManagerService|sendAnnouncement|sendPushNotification/.test(src);
    const usesNotificationChannels = /NotificationChannelHelper/.test(src);
    const channels = usesNotificationChannels
      ? (src.match(/NotificationChannelHelper\.isAdvancedEnabled\([^,]+,\s*['"`](\w+)['"`]/g) || [])
          .map(m => m.replace(/^.+['"`](\w+)['"`].*$/, '$1') as 'email'|'push'|'sms'|'inApp')
      : undefined;

    /* ---- state ---- */
    const usesRedux = /useDispatch|useSelector/.test(src);
    const usesContext = /useContext|createContext/.test(src);
    const actions = usesRedux
      ? (src.match(/ComponentActions\.\w+/g) || []).map(a => a.replace('ComponentActions.', ''))
      : undefined;

    /* ---- error ---- */
    const usesErrorHandling = /useErrorHandling/.test(src);

    /* ---- real-time ---- */
    const usesWebSocket = /io\(|socket\.|socket\.on/.test(src);
    const socketEvents = usesWebSocket
      ? (src.match(/socket\.on\(["'`](\w+)["'`]/g) || []).map(m => m.replace(/^.+["'`](\w+)["'`].*$/, '$1'))
      : undefined;

    /* ---- services ---- */
    const usesProjectService = /ProjectService|fetchProject/.test(src);
    const usesEntityService = /\w+Service\.\w+/.test(src) && !usesProjectService;

    /* ---- styling ---- */
    const usesComponentConfig = /useComponentConfig/.test(src);
    const configKeys = usesComponentConfig
      ? (src.match(/componentConfig\.(\w+)/g) || []).map(m => m.replace('componentConfig.', '') as keyof ComponentConfig)
      : undefined;

    /* ---- security ---- */
    const requiresAuth = /accessToken|authToken|Bearer/.test(src);

    /* ---- status / meta ---- */
    const usesStatusType = /StatusType/.test(src);
    const hasStructuredMetadata = /StructuredMetadata/.test(src);

    /* ---- pattern classification (unchanged) ---- */
    const pattern = this.classify(fields, hasApi, hasState, hasRouting);

    return {
      componentName: comp.name,
      pattern,
      fields,
      hasApi,
      hasState,
      hasRouting,

      usesNotificationContext,
      usesNotificationService,
      usesNotificationChannels,
      channels,

      usesRedux,
      usesContext,
      actions,

      usesErrorHandling,

      usesWebSocket,
      socketEvents,

      usesProjectService,
      usesEntityService,

      usesComponentConfig,
      configKeys,

      requiresAuth,

      usesStatusType,
      hasStructuredMetadata,
    };
  }

  /* ---------- helpers (same as before) ---------- */
  private extractFields(src: string): string[] {
    const m = src.match(/interface\s+\w*Props\s*{([^}]+)}/s);
    if (!m) return [];
    return m[1]
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('//'))
      .map(l => l.split(/[?:]/)[0].trim());
  }

  private classify(f: string[], api: boolean, state: boolean, routing: boolean) {
    if (f.includes('id') && f.includes('name') && api && state) return 'CRUD';
    if (f.some(v => /email|password|submit/i.test(v))) return 'Form';
    if (f.includes('items') && f.includes('columns')) return 'Table';
    if (f.includes('data') && f.includes('chart')) return 'Chart';
    if (f.includes('show') || f.includes('open')) return 'Modal';
    if (f.includes('list') && f.includes('item')) return 'List';
    if (f.includes('id') && !api) return 'Detail';
    return 'Generic';
  }
}