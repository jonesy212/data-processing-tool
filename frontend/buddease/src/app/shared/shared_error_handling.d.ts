// shared_error_handling.d.ts

export class NamingConventionsError extends Error {
    constructor(errorType: string, details: string);
}
