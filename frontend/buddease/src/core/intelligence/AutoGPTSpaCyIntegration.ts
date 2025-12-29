// AutoGPTSpaCyIntegration.ts

import { generatePrompt } from "@/core/prompts/promptGenerator";

export const processTextWithSpaCy = async (text: string, appTree: any[]): Promise<any> => {
    try {
        const response = await fetch('http://localhost:5000/process-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, appTree }),
        });

        if (response.ok) {
            return await response.json();
        } else {
            console.error('Error processing text with spaCy');
            return { entities: [], keywords: [], sentences: [] };
        }
    } catch (error) {
        console.error('spaCy service unavailable:', error);
        return { entities: [], keywords: [], sentences: [] };
    }
};

export const processAutoGPTOutputWithSpaCy = async (userIdea: string, appTree: any[] = [], userContext: any = {}): Promise<string | null> => {
    const prompt = generatePrompt(userIdea);
    if (!prompt) return null;

    try {
        const spaCyOutput = await processTextWithSpaCy(prompt, appTree);
        return enhancePromptWithEntities(prompt, spaCyOutput, appTree, userContext);
    } catch (error) {
        console.error('Error processing AutoGPT output:', error);
        return prompt; // Return original prompt as fallback
    }
};

// REAL LOGIC for prompt enhancement
const enhancePromptWithEntities = (prompt: string, spaCyOutput: any, appTree: any[], userContext: any): string => {
    const { entities = [], keywords = [], sentences = [] } = spaCyOutput;
    
    let enhancedPrompt = prompt;

    // 1. Entity-based enhancement
    if (entities.length > 0) {
        const entityMap = createEntityMap(entities);
        enhancedPrompt = replaceEntityPlaceholders(enhancedPrompt, entityMap);
    }

    // 2. Context-based enhancement
    enhancedPrompt = enhanceWithUserContext(enhancedPrompt, userContext);

    // 3. AppTree-based enhancement
    enhancedPrompt = enhanceWithAppTree(enhancedPrompt, appTree);

    // 4. Keyword-based enhancement
    if (keywords.length > 0) {
        enhancedPrompt = addKeywordContext(enhancedPrompt, keywords);
    }

    // 5. Sentence structure enhancement
    if (sentences.length > 0) {
        enhancedPrompt = improveSentenceFlow(enhancedPrompt, sentences);
    }

    return enhancedPrompt;
};

// REAL IMPLEMENTATIONS:

const createEntityMap = (entities: any[]): Map<string, string[]> => {
    const entityMap = new Map<string, string[]>();
    
    entities.forEach(entity => {
        const { label, text } = entity;
        if (!entityMap.has(label)) {
            entityMap.set(label, []);
        }
        entityMap.get(label)!.push(text);
    });
    
    return entityMap;
};

const replaceEntityPlaceholders = (prompt: string, entityMap: Map<string, string[]>): string => {
    let result = prompt;
    
    // Replace common entity types
    const entityReplacements = {
        'PERSON': entityMap.get('PERSON')?.[0] || 'the user',
        'ORG': entityMap.get('ORG')?.[0] || 'the organization',
        'GPE': entityMap.get('GPE')?.[0] || 'the location',
        'PRODUCT': entityMap.get('PRODUCT')?.[0] || 'the product',
        'TECHNOLOGY': entityMap.get('TECHNOLOGY')?.[0] || 'the technology',
        'DATE': entityMap.get('DATE')?.[0] || 'the specified time',
        'MONEY': entityMap.get('MONEY')?.[0] || 'the budget',
    };

    Object.entries(entityReplacements).forEach(([entityType, replacement]) => {
        result = result.replace(new RegExp(`{${entityType}}`, 'gi'), replacement);
    });

    // Replace numbered entities
    entityMap.forEach((values, label) => {
        values.forEach((value, index) => {
            const placeholder = `{${label}${index > 0 ? index + 1 : ''}}`;
            result = result.replace(new RegExp(placeholder, 'gi'), value);
        });
    });

    return result;
};

const enhanceWithUserContext = (prompt: string, userContext: any): string => {
    let result = prompt;

    if (userContext.activeDashboard) {
        result = result.replace(/{activeDashboard}/g, userContext.activeDashboard);
    }

    if (userContext.userRole) {
        result = result.replace(/{userRole}/g, userContext.userRole);
    }

    if (userContext.permissions) {
        const permissionContext = `with ${userContext.permissions.join(', ')} permissions`;
        result = result.replace(/{permissions}/g, permissionContext);
    }

    // Add context preamble if user context is available
    if (Object.keys(userContext).length > 0) {
        const contextPreamble = `Considering your role as ${userContext.userRole || 'user'} working in ${userContext.activeDashboard || 'the system'}, `;
        if (!result.startsWith(contextPreamble)) {
            result = contextPreamble + result;
        }
    }

    return result;
};

const enhanceWithAppTree = (prompt: string, appTree: any[]): string => {
    if (!appTree || appTree.length === 0) return prompt;

    // Extract relevant app tree information
    const features = appTree.map(item => item.name).filter(Boolean);
    const modules = appTree.filter(item => item.type === 'module').map(item => item.name);
    
    if (features.length > 0) {
        const featureContext = `available features: ${features.join(', ')}`;
        prompt = prompt.replace(/{features}/g, featureContext);
    }

    if (modules.length > 0) {
        const moduleContext = `system modules: ${modules.join(', ')}`;
        prompt = prompt.replace(/{modules}/g, moduleContext);
    }

    return prompt;
};

const addKeywordContext = (prompt: string, keywords: string[]): string => {
    if (keywords.length === 0) return prompt;

    const relevantKeywords = keywords.slice(0, 3); // Use top 3 keywords
    const keywordContext = `Key concepts: ${relevantKeywords.join(', ')}. `;
    
    // Add keyword context at the beginning if not already present
    if (!prompt.includes(keywordContext)) {
        return keywordContext + prompt;
    }

    return prompt;
};

const improveSentenceFlow = (prompt: string, sentences: any[]): string => {
    // Analyze sentence structure and improve flow
    if (sentences.length <= 1) return prompt;

    // Ensure proper capitalization and punctuation
    prompt = prompt.trim();
    if (!prompt.endsWith('.') && !prompt.endsWith('?') && !prompt.endsWith('!')) {
        prompt += '.';
    }

    // Add transition words for better flow
    const transitionWords = ['Additionally', 'Furthermore', 'Moreover', 'Specifically'];
    const sentencesInPrompt = prompt.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentencesInPrompt.length > 1) {
        // Add transitions between sentences
        let improvedPrompt = sentencesInPrompt[0].trim() + '.';
        for (let i = 1; i < sentencesInPrompt.length; i++) {
            const transition = transitionWords[i % transitionWords.length];
            improvedPrompt += ` ${transition}, ${sentencesInPrompt[i].trim()}.`;
        }
        return improvedPrompt;
    }

    return prompt;
};
  