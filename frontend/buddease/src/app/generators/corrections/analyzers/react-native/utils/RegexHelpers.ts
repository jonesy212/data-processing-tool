import RegexHelpers from '@/app/generators/corrections/analyzers/utils/RegexHelpers'

export const patterns = {
  inlineStylesheetCreate: /StyleSheet\.create\(\s*\{[^}]*\}/g,
  inlineStyleObject: /<View.*style=\{.*\}/g,
  consoleStatement: /console\.(log|warn|error)\(/g,
  deepRelativeImport: /import.*from.*['"`]\.\.\/\.\.\/\.\./g,
  zeroTimeout: /setTimeout\(.*,\s*0\)/g,
  unsafeJsonParse: /JSON\.parse\(.*\)/g,
  scrollViewDirectView: /<ScrollView.*>\s*<View/g,
  inlineArrowFunction: /onPress=\{\(\)\s*=>\s*\{/g,
  listMapWithoutKey: /\.map\(.*\{.*=>/g,
  unsafeOptionalChaining: /(\w+)\.\?\./g,
  renderMethodComplex: /render\(\)\s*\{[^}]*\{[^}]*\{/g,
  versionConflict: /found: (.*)\n.*required: (.*)/g,
  memoryExhaustion: /JavaScript heap out of memory/g,
};