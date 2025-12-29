#!/usr/bin/env tsx
/**
 * A'Space OS V2 - Simple HTTP Server
 * 
 * Mission: Keep the container alive and respond to healthchecks
 * 
 * This server:
 * 1. Runs contract sync on startup
 * 2. Provides a /health endpoint for Coolify healthchecks
 * 3. Provides a /sync endpoint to manually trigger contract sync
 * 4. Keeps the container running
 */

import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import ContractGuard, { ContractInput } from '../src/lib/contract-guard';

const PORT = process.env.PORT || 3000;
let isSyncing = false;
let lastSyncResult: SyncResult | null = null;
let lastSyncTime: Date | null = null;

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
  console.log('='.repeat(70));

  const guard = new ContractGuard();
  const contractsDir = path.join(process.cwd(), 'contracts', 'examples');
  
  if (!fs.existsSync(contractsDir)) {
    console.error(`❌ Contracts directory not found: ${contractsDir}`);
    return {
      total: 0,
      accepted: 0,
      rejected: 0,
      errors: 1,
      details: [{
        file: 'N/A',
        contractId: 'N/A',
        contractType: 'N/A',
        status: 'ERROR',
        error: `Contracts directory not found: ${contractsDir}`
      }]
    };
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
        contractType: contractType as 'Order' | 'Pulse' | 'Decision' | 'Intent' | 'Uplink',
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

  const auditLogPath = path.join(process.cwd(), 'logs', `sync-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.mkdirSync(path.dirname(auditLogPath), { recursive: true });
  fs.writeFileSync(auditLogPath, JSON.stringify(auditLog, null, 2));
  console.log(`\n📝 Audit log written: ${auditLogPath}`);

  return result;
}

/**
 * Infer contract type from filename
 * Examples: order.example.json -> Order, pulse.example.json -> Pulse
 * 
 * NOTE: This function is duplicated from sync-contracts.ts to keep the server
 * self-contained. In a future refactor, this could be extracted to a shared utility.
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

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const url = req.url || '/';

  // Health check endpoint
  if (url === '/health' || url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      uptime: process.uptime(),
      lastSync: lastSyncTime ? lastSyncTime.toISOString() : null,
      syncing: isSyncing
    }));
    return;
  }

  // Sync endpoint
  if (url === '/sync') {
    if (isSyncing) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Sync already in progress'
      }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Sync started'
    }));

    // Start sync in background
    isSyncing = true;
    syncContracts()
      .then((result) => {
        lastSyncResult = result;
        lastSyncTime = new Date();
        isSyncing = false;
      })
      .catch((error) => {
        console.error('Sync error:', error);
        isSyncing = false;
      });

    return;
  }

  // Status endpoint
  if (url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      lastSync: lastSyncTime ? lastSyncTime.toISOString() : null,
      lastSyncResult,
      syncing: isSyncing
    }));
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Not found',
    endpoints: ['/', '/health', '/sync', '/status']
  }));
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 A'Space Cockpit Server running on port ${PORT}`);
  console.log(`📊 Endpoints:`);
  console.log(`   GET  /health  - Health check`);
  console.log(`   GET  /sync    - Trigger contract sync`);
  console.log(`   GET  /status  - Sync status`);
  console.log('');

  // Run initial sync
  console.log('🔄 Running initial contract sync...\n');
  isSyncing = true;
  syncContracts()
    .then((result) => {
      lastSyncResult = result;
      lastSyncTime = new Date();
      isSyncing = false;
      
      if (result.errors > 0) {
        console.log('\n⚠️  Initial sync completed with errors, but server is running');
      } else {
        console.log('\n✨ Initial sync completed successfully');
      }
      console.log('\n🟢 Server ready to accept requests');
    })
    .catch((error) => {
      console.error('\n🚨 Initial sync failed:', error);
      console.error('⚠️  Server is still running, but initial sync failed');
      isSyncing = false;
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
