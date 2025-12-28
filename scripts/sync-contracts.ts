#!/usr/bin/env tsx
/**
 * A'Space OS V2 - Contract Sync Script
 * 
 * Mission: Replay JSON contracts from files into the database
 * 
 * This script:
 * 1. Discovers valid JSON contracts in /contracts/examples
 * 2. Validates each contract via ContractGuard
 * 3. Writes to Contract ledger + projection tables
 * 4. Produces an audit log of results
 */

import * as fs from 'fs';
import * as path from 'path';
import ContractGuard, { ContractInput } from '../src/lib/contract-guard';

interface SyncResult {
  total: number;
  accepted: number;
  rejected: number;
  errors: number;
  details: {
    file: string;
    contractId: string;
    contractType: string;
    status: 'ACCEPTED' | 'REJECTED' | 'ERROR';
    error?: string;
  }[];
}

async function syncContracts(): Promise<SyncResult> {
  console.log('🌿 [A\'Space OS] Contract Sync - Replay JSON contracts to database');
  console.log('=' .repeat(70));

  const guard = new ContractGuard();
  const contractsDir = path.join(process.cwd(), 'contracts', 'examples');
  
  if (!fs.existsSync(contractsDir)) {
    console.error(`❌ Contracts directory not found: ${contractsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(contractsDir).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) {
    console.log('⚠️  No contract files found');
    return {
      total: 0,
      accepted: 0,
      rejected: 0,
      errors: 0,
      details: []
    };
  }

  console.log(`\n📋 Found ${files.length} contract file(s)\n`);

  const result: SyncResult = {
    total: files.length,
    accepted: 0,
    rejected: 0,
    errors: 0,
    details: []
  };

  // Process each contract file
  for (const file of files) {
    const filePath = path.join(contractsDir, file);
    console.log(`\n📄 Processing: ${file}`);
    
    try {
      const rawData = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(rawData);

      // Infer contract type from filename
      const contractType = inferContractType(file);
      if (!contractType) {
        console.error(`   ❌ Cannot infer contract type from filename: ${file}`);
        result.errors++;
        result.details.push({
          file,
          contractId: data.id || 'unknown',
          contractType: 'unknown',
          status: 'ERROR',
          error: 'Cannot infer contract type from filename'
        });
        continue;
      }

      const contractId = data.id;
      if (!contractId) {
        console.error(`   ❌ Contract ID missing in file: ${file}`);
        result.errors++;
        result.details.push({
          file,
          contractId: 'unknown',
          contractType,
          status: 'ERROR',
          error: 'Contract ID missing'
        });
        continue;
      }

      // Check if contract already exists
      const existing = await guard.getContractStatus(contractId);
      if (existing) {
        console.log(`   ⏭️  Contract already exists: ${contractId} (${existing.status})`);
        result.details.push({
          file,
          contractId,
          contractType,
          status: existing.status as 'ACCEPTED' | 'REJECTED',
          error: existing.validationLog
        });
        
        if (existing.status === 'ACCEPTED') {
          result.accepted++;
        } else {
          result.rejected++;
        }
        continue;
      }

      const contract: ContractInput = {
        contractId,
        contractType: contractType as any,
        data
      };

      // Write contract via ContractGuard
      const writeResult = await guard.writeContract(contract);

      if (writeResult.success) {
        result.accepted++;
        result.details.push({
          file,
          contractId,
          contractType,
          status: 'ACCEPTED'
        });
        console.log(`   ✅ ACCEPTED: ${contractId}`);
      } else {
        result.rejected++;
        result.details.push({
          file,
          contractId,
          contractType,
          status: 'REJECTED',
          error: writeResult.error
        });
        console.log(`   ❌ REJECTED: ${contractId}`);
        if (writeResult.error) {
          console.log(`      ${writeResult.error.split('\n')[0]}`);
        }
      }
    } catch (error) {
      console.error(`   🚨 ERROR processing file: ${error instanceof Error ? error.message : String(error)}`);
      result.errors++;
      result.details.push({
        file,
        contractId: 'unknown',
        contractType: 'unknown',
        status: 'ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 SYNC SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total files processed:  ${result.total}`);
  console.log(`✅ Accepted:           ${result.accepted}`);
  console.log(`❌ Rejected:           ${result.rejected}`);
  console.log(`🚨 Errors:             ${result.errors}`);
  console.log('='.repeat(70));

  // Write audit log
  const auditLog = {
    timestamp: new Date().toISOString(),
    result
  };

  const auditLogPath = path.join(process.cwd(), 'logs', `sync-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(auditLogPath), { recursive: true });
  fs.writeFileSync(auditLogPath, JSON.stringify(auditLog, null, 2));
  console.log(`\n📝 Audit log written: ${auditLogPath}`);

  return result;
}

/**
 * Infer contract type from filename
 * Examples: order.example.json -> Order, pulse.example.json -> Pulse
 */
function inferContractType(filename: string): string | null {
  const typeMap: Record<string, string> = {
    'order': 'Order',
    'pulse': 'Pulse',
    'decision': 'Decision',
    'intent': 'Intent',
    'uplink': 'Uplink'
  };

  for (const [key, value] of Object.entries(typeMap)) {
    if (filename.toLowerCase().startsWith(key)) {
      return value;
    }
  }

  return null;
}

// Run the sync
syncContracts()
  .then((result) => {
    if (result.errors > 0 || result.rejected > 0) {
      console.log('\n⚠️  Some contracts were rejected or had errors');
      process.exit(0); // Exit with 0 as rejections are expected behavior
    } else {
      console.log('\n✨ All contracts synced successfully');
      process.exit(0);
    }
  })
  .catch((error) => {
    console.error('\n🚨 FATAL ERROR:', error);
    process.exit(1);
  });
