#!/usr/bin/env tsx
/**
 * End-to-end demo of ContractGuard validation
 * Shows both ACCEPTED and REJECTED contract flows
 */

import ContractGuard from '../src/lib/contract-guard';
import * as fs from 'fs';

async function demo() {
  console.log('🔬 ContractGuard End-to-End Demo');
  console.log('='.repeat(70));
  console.log();

  const guard = new ContractGuard();

  // Demo 1: Try to write an invalid contract (should be REJECTED)
  console.log('📝 Demo 1: Attempting to write INVALID contract');
  console.log('   Contract ID: ORD-INVALID-999');
  console.log('   Issue: week=99 (exceeds maximum of 12)');
  console.log();

  const invalidContract = JSON.parse(fs.readFileSync('/tmp/test-invalid-contract.json', 'utf-8'));
  
  const result1 = await guard.writeContract({
    contractId: 'ORD-INVALID-999',
    contractType: 'Order',
    data: invalidContract
  });

  if (!result1.success) {
    console.log('   ✅ Contract correctly REJECTED');
    console.log('   📋 Validation errors:');
    console.log(`      ${result1.error?.split('\n')[0]}`);
  } else {
    console.log('   ❌ ERROR: Contract should have been rejected!');
  }

  console.log();

  // Demo 2: Check the contract ledger
  console.log('📊 Demo 2: Check Contract Ledger status');
  const status = await guard.getContractStatus('ORD-INVALID-999');
  if (status) {
    console.log(`   Status: ${status.status}`);
    console.log(`   Validation Log: ${status.validationLog?.substring(0, 50)}...`);
  }

  console.log();

  // Demo 3: Try to write a valid contract (should be ACCEPTED)
  console.log('📝 Demo 3: Write a VALID contract');
  const validContract = {
    "schema_version": "1.0",
    "id": "ORD-20251228-999",
    "created_at": "2025-12-28T00:00:00Z",
    "created_by": "DemoUser",
    "project_id": "DEMO-PROJECT",
    "cycle": {
      "type": "12WY",
      "week": 1
    },
    "rock": {
      "title": "Demo Rock",
      "definition_of_done": ["Criterion 1"]
    },
    "tactics": [{
      "id": "T-01",
      "domain": "IT",
      "action": "Demo action",
      "owner": "Owner",
      "dependencies": [],
      "acceptance_tests": ["Test 1"]
    }],
    "constraints": ["Constraint 1"],
    "escalation_rules": ["Rule 1"]
  };

  const result2 = await guard.writeContract({
    contractId: 'ORD-20251228-999',
    contractType: 'Order',
    data: validContract
  });

  if (result2.success) {
    console.log('   ✅ Contract ACCEPTED and written to database');
    console.log('   📊 Contract ledger updated');
    console.log('   📋 Projection table (Order) updated');
  } else {
    console.log(`   ❌ ERROR: Contract should have been accepted: ${result2.error}`);
  }

  console.log();

  // Demo 4: List all contracts
  console.log('📋 Demo 4: List all contracts in ledger');
  const allContracts = await guard.listContracts({ limit: 10 });
  console.log(`   Total contracts: ${allContracts.length}`);
  
  const acceptedCount = allContracts.filter(c => c.status === 'ACCEPTED').length;
  const rejectedCount = allContracts.filter(c => c.status === 'REJECTED').length;
  
  console.log(`   ✅ ACCEPTED: ${acceptedCount}`);
  console.log(`   ❌ REJECTED: ${rejectedCount}`);

  console.log();
  console.log('='.repeat(70));
  console.log('✨ Demo complete! ContractGuard is enforcing the Law.');
  console.log('   - Invalid contracts are REJECTED with explicit errors');
  console.log('   - Valid contracts are ACCEPTED and written to projections');
  console.log('   - All attempts are recorded in the Contract ledger');
}

demo().catch(console.error);
