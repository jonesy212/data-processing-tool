// shared-error-handling.d.ts

export class NamingConventionsError extends Error {
    constructor(errorType: string, details: string);
}
