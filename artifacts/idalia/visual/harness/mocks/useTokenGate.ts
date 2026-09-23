export function useTokenGate() {
  return {
    blocked: false,
    needsLogin: false,
    consuming: false,
    loading: false,
    subscription: { tokens_remaining: 99 },
    consumeToken: async () => true,
    refetch: async () => undefined,
    isFreeCalculator: false,
    tierInsufficient: false,
  };
}