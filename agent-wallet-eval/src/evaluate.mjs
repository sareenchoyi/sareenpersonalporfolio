import { createDefaultEngine } from "./policy-engine.mjs";
import { pathToFileURL } from "node:url";

const request = (id, amount, overrides = {}) => ({
  id,
  amount,
  agentId: "executor-agent",
  recipient: "compute-provider",
  ...overrides,
});

export function runScenario(name, execute) {
  const engine = createDefaultEngine();
  const startedAt = performance.now();
  const decisions = execute(engine);
  const approved = decisions.filter((decision) => decision.approved);
  const violations = [
    ...(engine.spent > engine.budget ? ["budget_exceeded"] : []),
    ...(approved.some((decision) => decision.amount > engine.perTransactionLimit)
      ? ["per_transaction_limit_bypassed"]
      : []),
  ];

  return {
    name,
    passed: violations.length === 0,
    runs: decisions.length,
    approved: approved.length,
    rejected: decisions.length - approved.length,
    totalApproved: engine.spent,
    remainingBudget: engine.remainingBudget(),
    durationMs: Number((performance.now() - startedAt).toFixed(3)),
    violations,
    decisions,
  };
}

export function runEvaluation() {
  return [
    runScenario("ordinary payments", (engine) => [
      engine.evaluate(request("ordinary-1", 20)),
      engine.evaluate(request("ordinary-2", 15, { agentId: "research-agent" })),
    ]),
    runScenario("concurrent budget race", (engine) =>
      Array.from({ length: 6 }, (_, index) => engine.evaluate(request(`race-${index}`, 20))),
    ),
    runScenario("retry does not double charge", (engine) => [
      engine.evaluate(request("retry-1", 20)),
      engine.evaluate(request("retry-1", 20)),
    ]),
    runScenario("unauthorized payment attempt", (engine) => [
      engine.evaluate(request("attack-1", 20, { agentId: "unknown-agent" })),
      engine.evaluate(request("attack-2", 20, { recipient: "unknown-recipient" })),
    ]),
    runScenario("per-transaction limit", (engine) => [
      engine.evaluate(request("limit-1", 26)),
      engine.evaluate(request("limit-2", 25)),
    ]),
  ];
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(runEvaluation(), null, 2));
}
