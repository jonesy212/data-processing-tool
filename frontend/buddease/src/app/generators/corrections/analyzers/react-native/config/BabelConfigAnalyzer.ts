// BabelConfigAnalyzer.ts

import { ConfigFileAnalyzer } from '@/app/generators/corrections/analyzers/react-native/config/ConfigFileAnalyzer'
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import fs from 'fs';

export class BabelConfigAnalyzer extends ConfigFileAnalyzer {
  protected getConfigPaths(): string[] {
    return ['.babelrc', '.babelrc.json', 'babel.config.js', 'babel.config.ts'];
  }

  protected async analyzeConfigFile(configPath: string, configFile: string): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const content = await fs.promises.readFile(configPath, 'utf8');

    // ---- JSON-safe parse (handles .babelrc & babel.config.js) ----
    let cfg: any;
    try {
      cfg = configPath.endsWith('.js') || configPath.endsWith('.ts')
        ? require(configPath)           // CommonJS / TS babel.config.*
        : JSON.parse(content);          // .babelrc / .babelrc.json
    } catch {
      corrections.push(this.createCorrection(
        'babel-parse-error',
        'error',
        'high',
        `Failed to parse Babel config: ${configFile}`,
        configFile,
        'Parse error',
        'Fix JSON / JS syntax in the file',
        'compilation'
      ));
      return corrections;
    }

    // ---- React-Native preset check ----
    const presets: (string | any[])[] = Array.isArray(cfg?.presets) ? cfg.presets : [];
    const hasRnPreset = presets.some(p =>
      (typeof p === 'string' && p.includes('metro-react-native-babel-preset')) ||
      (Array.isArray(p) && p[0]?.includes('metro-react-native-babel-preset'))
    );

    if (!hasRnPreset) {
      corrections.push(this.createCorrection(
        'babel-missing-rn-preset',
        'warning',
        'medium',
        'Babel config missing React Native preset',
        configFile,
        JSON.stringify(presets, null, 2),
        'Add "module:metro-react-native-babel-preset" to presets array',
        'configuration'
      ));
    }

    return corrections;
  }
}