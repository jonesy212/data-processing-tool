// ApiProxy.ts
// ApiProxy.ts/
// Typed proxy for ergonomic endpoint access
type EndpointFunction = (...params: any[]) => string;

type ApiProxy<T extends EndpointConfigurations> = {
  [K in keyof T]: {
    [E in keyof T[K]]: EndpointFunction;
  };
};

export const api = new Proxy(endpoints, {
  get(target, category: string) {
    if (category in target) {
      return new Proxy(target[category as keyof typeof target], {
        get(innerTarget, endpointKey: string) {
          if (endpointKey in innerTarget) {
            // Return a function that calls apiConfig.getUrl with parameters
            return (...params: any[]) =>
              apiConfig.getUrl(category as keyof EndpointConfigurations, endpointKey as any, ...params);
          }
          return undefined;
        },
      });
    }
    return undefined;
  },
}) as ApiProxy<EndpointConfigurations>;
