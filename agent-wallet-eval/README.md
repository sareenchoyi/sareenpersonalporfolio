# SpendOS

SpendOS is an original policy engine and evaluation lab for non-custodial AI-agent wallets. It models authorization, per-transaction limits, period budgets, and idempotent retries, then runs adversarial scenarios against those invariants.

This repository is an independent implementation. It does not copy the Agent Wallet SDK or claim an integration with it.

## Run

```powershell
cd agent-wallet-eval
npm test
npm run evaluate
```

The first milestone is intentionally deterministic and local. It does not hold funds, connect to a blockchain, or represent a production security audit. A future adapter can target a testnet contract after the policy model and threat model are reviewed.

## Current invariants

- approved spending never exceeds the configured period budget
- an approved payment never exceeds the per-transaction limit
- duplicate request IDs cannot charge twice
- both agent and recipient must be authorized

## Roadmap

- add property-based scenario generation
- add trace persistence and benchmark exports
- add a testnet-only smart-wallet adapter
- compare single-agent and multi-agent payment behavior
- add a review gate for high-risk recipients and policy changes
