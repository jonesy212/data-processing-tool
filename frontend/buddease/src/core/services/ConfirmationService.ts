// ConfirmationService.ts
export interface ConfirmationService {
  confirm(message: string): Promise<boolean>;
  confirmMultiple(changes: Array<{file: string; changes: string[]}>): Promise<boolean>;
}