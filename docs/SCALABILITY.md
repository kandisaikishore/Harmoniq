# Scalability baseline

Scale this application using measured production-like workloads. Do not add infrastructure until profiling identifies the limit.

## Priorities
- Profile the critical user journeys and optimize measured hot paths first.
- Bound request size, concurrency, retries, queue depth, connection pools, and provider timeouts.
- Paginate large datasets and optimize database queries/indexes using query plans.
- Use caching only with explicit freshness/invalidation semantics.
- Keep service instances stateless where practical and externalize shared state before scaling horizontally.
- Add health/readiness checks, structured logs, request IDs, metrics, graceful shutdown, and tested rollback procedures.
- Protect secrets and personal/customer data from source control and logs.
- Add automated build, unit, integration, dependency/security, and deployment smoke checks for the stack.

## Load validation
Test normal, peak, burst, and dependency-failure scenarios. Record throughput, p95/p99 latency, error rate, CPU/memory, database wait, queue lag, and cost where relevant.

## Release gates
- [ ] Authorization and data consistency are tested.
- [ ] Retryable mutations are bounded and idempotent where needed.
- [ ] Migrations, backup/restore, and rollback have been validated.
- [ ] Capacity assumptions and real load-test results are documented.

This is a plan, not evidence of completed load testing or production scaling.