export const catalogKeys = {
  all: ['catalog'] as const,
  units: () => [...catalogKeys.all, 'units'] as const,
};

export const systemConfigKeys = {
  all: ['systemConfig'] as const,
  config: () => [...systemConfigKeys.all, 'current'] as const,
};
