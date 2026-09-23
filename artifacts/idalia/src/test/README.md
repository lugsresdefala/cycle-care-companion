# Calculator integration-test contracts

Run the calculator API and React integration suite with:

```sh
pnpm --filter @workspace/idalia test:calculators
```

## Covered contracts

- `calculate.ts` CPR, growth-curve, and ductus-venosus routes execute the real
  server calculator functions.
- CPR results remain numeric and include the expected reference range.
- INTERGROWTH growth responses include complete curve data and the official EFW
  P50 anchors at 32 weeks (1755 g) and 40 weeks (3338 g).
- DV responses cover the `positive`, `zero`, and `reversed` wave-A states,
  their distinct numeric/clinical results, and gestational-age references.
  The removed `waveAReversed` boolean contract is explicitly rejected.
- Invalid input, unauthenticated requests, and subscription-token rejection
  retain their HTTP status and response contracts.
- React tests exercise real router responses through the fetch-to-Supertest
  bridge, including successful rendering, HTTP 401/402 handling, network
  failure handling, subscription/login gates, and token-refetch behavior.

Patient data is not used. Shared patient-free request/response fixtures live in
`fixtures/calculatorResponses.ts`.

## Auth and database scope

The suite mocks system boundaries, not calculator behavior. Authentication is a
deterministic test middleware that accepts an `x-test-user` header, and the
subscription database is a deterministic test adapter. Therefore the tests
prove that the calculator router invokes and enforces its auth/subscription
boundaries, but they do **not** test Clerk token parsing, Clerk sessions, real
authorization configuration, database connectivity, or live subscription
records.