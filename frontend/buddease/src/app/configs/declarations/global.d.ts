declare const require: {
    context(
      path: string,
      deep: boolean,
      regex: RegExp
    ): {
      keys(): string[];
      <T>(id: string): T;
    };
  };
  