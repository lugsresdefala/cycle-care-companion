export const db = {
  async execute(statement: unknown) {
    const serialized = JSON.stringify(statement);
    const containsNoTokenUser = serialized.includes("doctor-without-clinical-plan");
    return containsNoTokenUser ? { rows: [] } : { rows: [{ tokens_remaining: 9 }] };
  },
};