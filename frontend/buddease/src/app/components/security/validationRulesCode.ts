// validationRulesCode.ts

export function generateValidationRulesCode(validationRules: string[]): string {
  // Generate validation rules code
  const validationRulesCode = validationRules
    .map((rule) => `    ${rule}: string;`)
    .join("\n");

  return validationRulesCode;
}
