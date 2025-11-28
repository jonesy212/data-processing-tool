// CategoryMapper.ts

import { CorrectionCategory } from '@/app/typings/correctionTypes';

export class CategoryMapper {
  static suggestCategory(title: string, suggestion: string, codeSnippet: string): CorrectionCategory {
    const lowerTitle = title.toLowerCase();
    const lowerSuggestion = suggestion.toLowerCase();
    const lowerCode = codeSnippet.toLowerCase();

    if (lowerTitle.includes('performance') || lowerSuggestion.includes('performance')) {
      return 'performance';
    }
    if (lowerTitle.includes('security') || lowerCode.includes('password') || lowerCode.includes('auth')) {
      return 'security';
    }
    if (lowerTitle.includes('import') || lowerCode.includes('import') || lowerCode.includes('require')) {
      return 'import';
    }
    if (lowerTitle.includes('react native') || lowerCode.includes('react-native')) {
      return 'native-modules';
    }
    if (lowerTitle.includes('ios') || lowerCode.includes('ios')) {
      return 'ios';
    }
    if (lowerTitle.includes('android') || lowerCode.includes('android')) {
      return 'mobile';
    }
    if (lowerTitle.includes('compilation') || lowerCode.includes('build') || lowerCode.includes('compile')) {
      return 'compilation';
    }
    if (lowerTitle.includes('runtime') || lowerCode.includes('runtime')) {
      return 'runtime';
    }

    return 'general';
  }
}