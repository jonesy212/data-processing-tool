ParameterConfig.ts
export interface ParameterConfig {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description?: string;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
    minLength?: number;
    maxLength?: number;
  };
}