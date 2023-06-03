export type ServiceImpl = (...args: any[]) => Promise<any>;

const serviceIdSymbol = Symbol("serviceId");
const serviceImplSymbol = Symbol("serviceImpl");

export function getServiceImpl(service: ServiceImpl) {
  const serviceId = (service as any)[serviceIdSymbol];
  const serviceImpl = (service as any)[serviceImplSymbol];
  return {
    serviceId,
    serviceImpl,
  };
}

export type ServiceContext = {
  tabId?: number;
};

type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R
  ? (...args: P) => R
  : never;

export function registrationService<T extends ServiceImpl>(
  impl: T,
  serviceId: string
): OmitFirstArg<T> {
  const res: any = async (...args: unknown[]) => {
    const res = await chrome.runtime.sendMessage({ serviceId, args });
    if (res.success) {
      return res.data;
    } else {
      const err = new Error(res.errorMessage);
      err.stack = res.errorStack;
      throw err;
    }
  };
  res[serviceIdSymbol] = serviceId;
  res[serviceImplSymbol] = impl;
  return res as any as OmitFirstArg<T>;
}
