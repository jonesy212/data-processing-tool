// Web3Config.ts

class Web3Config {
    private timeout: number;
    private defaultAccount: string | null;
    private defaultBlock: string;

    constructor(timeout: number, defaultAccount: string | null, defaultBlock: string) {
        this.timeout = timeout;
        this.defaultAccount = defaultAccount;
        this.defaultBlock = defaultBlock;
    }

    setTimeout(timeout: number): void {
        this.timeout = timeout;
    }

    setDefaultAccount(account: string | null): void {
        this.defaultAccount = account;
    }

    setDefaultBlock(block: string): void {
        this.defaultBlock = block;
    }

    getTimeout(): number {
        return this.timeout;
    }

    getDefaultAccount(): string | null {
        return this.defaultAccount;
    }

    getDefaultBlock(): string {
        return this.defaultBlock;
    }
}
