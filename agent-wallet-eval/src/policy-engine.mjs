export class SpendPolicyEngine {
  constructor({ budget, perTransactionLimit, approvedAgents = [], approvedRecipients = [] }) {
    this.budget = budget;
    this.perTransactionLimit = perTransactionLimit;
    this.approvedAgents = new Set(approvedAgents);
    this.approvedRecipients = new Set(approvedRecipients);
    this.spent = 0;
    this.processedRequests = new Map();
    this.events = [];
  }

  evaluate(request) {
    const startedAt = performance.now();

    if (this.processedRequests.has(request.id)) {
      return this.#decision(request, false, "duplicate_request", startedAt);
    }

    const rejection = this.#validate(request);
    if (rejection) {
      this.processedRequests.set(request.id, "rejected");
      return this.#decision(request, false, rejection, startedAt);
    }

    this.spent += request.amount;
    this.processedRequests.set(request.id, "approved");
    return this.#decision(request, true, "approved", startedAt);
  }

  remainingBudget() {
    return this.budget - this.spent;
  }

  snapshot() {
    return {
      budget: this.budget,
      spent: this.spent,
      remaining: this.remainingBudget(),
      processedRequests: this.processedRequests.size,
    };
  }

  #validate(request) {
    if (!Number.isFinite(request.amount) || request.amount <= 0) return "invalid_amount";
    if (!this.approvedAgents.has(request.agentId)) return "agent_not_authorized";
    if (!this.approvedRecipients.has(request.recipient)) return "recipient_not_authorized";
    if (request.amount > this.perTransactionLimit) return "per_transaction_limit";
    if (request.amount > this.remainingBudget()) return "period_budget_exhausted";
    return null;
  }

  #decision(request, approved, reason, startedAt) {
    const decision = {
      requestId: request.id,
      agentId: request.agentId,
      recipient: request.recipient,
      amount: request.amount,
      approved,
      reason,
      remainingBudget: this.remainingBudget(),
      latencyMs: Number((performance.now() - startedAt).toFixed(3)),
      timestamp: new Date().toISOString(),
    };
    this.events.push(decision);
    return decision;
  }
}

export function createDefaultEngine() {
  return new SpendPolicyEngine({
    budget: 100,
    perTransactionLimit: 25,
    approvedAgents: ["research-agent", "executor-agent"],
    approvedRecipients: ["data-provider", "compute-provider"],
  });
}
