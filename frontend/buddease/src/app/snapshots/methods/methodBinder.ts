// methodBinder.ts
export function bindMethods<
  T extends object,
  U extends object
>(target: T, source: U, methodNames: (keyof U)[]): void {
  methodNames.forEach(methodName => {
    if (typeof source[methodName] === 'function') {
      (target as any)[methodName] = (source[methodName] as Function).bind(target);
    }
  });
}



// utils/methodBinder.ts
export function bindAllMethods<Target extends object, Source extends object>(
  target: Target,
  source: Source,
  methodNames: (keyof Source)[]
): void {
  methodNames.forEach(methodName => {
    const method = source[methodName];
    if (typeof method === 'function') {
      (target as any)[methodName] = method.bind(target);
    }
  });
}

export const MethodBinder = {
  bindMethods,
  bindAllMethods
};