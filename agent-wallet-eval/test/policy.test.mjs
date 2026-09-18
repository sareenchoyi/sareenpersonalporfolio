import test from "node:test";
import assert from "node:assert/strict";
import { createDefaultEngine } from "../src/policy-engine.mjs";

const payment = (id, amount, overrides = {}) => ({
  id,
  amount,
  agentId: "executor-agent",
  recipient: "compute-provider",
  ...overrides,
});

test("never approves more than the period budget", () => {
  const engine = createDefaultEngine();
  const decisions = Array.from({ length: 10 }, (_, index) => engine.evaluate(payment(`budget-${index}`, 20)));

  assert.equal(decisions.filter((decision) => decision.approved).length, 5);
  assert.equal(engine.spent, 100);
  assert.ok(engine.spent <= engine.budget);
});

test("rejects transactions over the per-transaction limit", () => {
  const engine = createDefaultEngine();
  const decision = engine.evaluate(payment("too-large", 25.01));

  assert.equal(decision.approved, false);
  assert.equal(decision.reason, "per_transaction_limit");
  assert.equal(engine.spent, 0);
});

test("does not double charge a retried request", () => {
  const engine = createDefaultEngine();
  const first = engine.evaluate(payment("same-request", 20));
  const retry = engine.evaluate(payment("same-request", 20));

  assert.equal(first.approved, true);
  assert.equal(retry.approved, false);
  assert.equal(retry.reason, "duplicate_request");
  assert.equal(engine.spent, 20);
});

test("requires both agent and recipient authorization", () => {
  const engine = createDefaultEngine();
  const decision = engine.evaluate(payment("unauthorized", 10, {
    agentId: "untrusted-agent",
    recipient: "unknown-recipient",
  }));

  assert.equal(decision.approved, false);
  assert.equal(decision.reason, "agent_not_authorized");
  assert.equal(engine.spent, 0);
});
