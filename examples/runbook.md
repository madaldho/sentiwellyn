# Runbook: analytics.customer_orders — missing owner

Status: local demo draft  
Citation: `CIT-demo-001`  
Entity: `urn:li:dataset:(example,analytics.customer_orders,PROD)`

## Condition detected

`analytics.customer_orders` has no assigned owner.

## Why this is risky

The lineage evidence shows three downstream dashboards. Without an owner, incident routing and metadata review have no accountable responder.

## Evidence

- Three downstream assets depend on this entity.
- Evidence source: lineage.
- Evidence confidence: 84%.

## Recommended action

Review the lineage context and assign an owner only after a human confirms the target identity.

## Approval

No approval has been issued. No metadata has been written.

## Verification

After an approved write, read the entity again and compare the owner field with the approved value. Mark the proposal `verified` only when they match.

## Revert guidance

If the assigned owner is incorrect, remove that owner through an approved mutation and run the same read-back check.
