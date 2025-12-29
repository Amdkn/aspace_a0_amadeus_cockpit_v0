/**
 * ContractGuard - The Security Guardian for A'Space OS V2
 * 
 * Mission: Enforce contract-first architecture with zero external dependencies
 * Rule: Database is a cache for the Dashboard - invalid JSON must be blocked
 * 
 * This middleware ensures:
 * 1. All contracts are validated via validate_contracts.js before DB writes
 * 2. Contract ledger is updated with ACCEPTED/REJECTED status
 * 3. Only ACCEPTED contracts write to projection tables
 * 4. Validation errors are logged explicitly
 * 5. Immutable ledger with SHA-256 integrity hashes
 * 6. Air Lock mode for graceful degradation
 */

import { PrismaClient } from '../generated/client';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { validateAgainstSchemaFile, ValidationResult } from './aspace-validator';

// Air Lock Mode: Graceful degradation
const DATABASE_URL = process.env.DATABASE_URL;
const AIR_LOCK_MODE = process.env.ASPACE_AIR_LOCK_MODE === 'true' || !DATABASE_URL;

let prisma: PrismaClient | null = null;
if (!AIR_LOCK_MODE) {
  try {
    prisma = new PrismaClient();
  } catch (error) {
    console.warn('⚠️  [ContractGuard] Database initialization failed, falling back to Air Lock mode');
    prisma = null;
  }
} else {
  console.warn('⚠️  [ContractGuard] Air Lock Mode: Database unavailable, operating in read-only mode');
}

export interface ContractInput {
  contractId: string;
  contractType: 'Order' | 'Pulse' | 'Decision' | 'Intent' | 'Uplink';
  data: Record<string, any>;
}

export class ContractGuard {
  private protocolsDir: string;
  private offlineLedger: Map<string, { contractType: string; data: any; status: 'ACCEPTED' | 'REJECTED' }>;

  constructor() {
    this.protocolsDir = path.join(process.cwd(), 'protocols');
    this.offlineLedger = this.loadOfflineLedger();
  }

  /**
   * Validate a contract against its JSON schema
   * Uses the shared zero-dependency validator from aspace-validator.ts
   */
  async validateContract(contract: ContractInput): Promise<ValidationResult> {
    const { contractType, data } = contract;

    // Map contract type to schema file
    const schemaMap: Record<string, string> = {
      'Order': 'order.schema.json',
      'Pulse': 'pulse.schema.json',
      'Decision': 'decision.schema.json',
      'Intent': 'intent.schema.json',
      'Uplink': 'uplink.schema.json'
    };

    const schemaFile = schemaMap[contractType];
    if (!schemaFile) {
      return {
        valid: false,
        errors: [`Unknown contract type: ${contractType}`]
      };
    }

    const schemaPath = path.join(this.protocolsDir, schemaFile);
    if (!fs.existsSync(schemaPath)) {
      return {
        valid: false,
        errors: [`Schema file not found: ${schemaPath}`]
      };
    }

    // Use shared validator
    return validateAgainstSchemaFile(data, schemaPath);
  }

  /**
   * Generate SHA-256 integrity hash for immutable ledger
   * Hash includes: contractId + contractType + rawJson + status + timestamp
   */
  private generateIntegrityHash(
    contractId: string,
    contractType: string,
    rawJson: string,
    status: string,
    timestamp: string
  ): string {
    const data = `${contractId}|${contractType}|${rawJson}|${status}|${timestamp}`;
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Load contracts from examples directory for offline Air Lock mode.
   */
  private loadOfflineLedger(): Map<string, { contractType: string; data: any; status: 'ACCEPTED' | 'REJECTED' }> {
    const ledger = new Map<string, { contractType: string; data: any; status: 'ACCEPTED' | 'REJECTED' }>();
    const examplesDir = path.join(process.cwd(), 'contracts', 'examples');

    if (!fs.existsSync(examplesDir)) return ledger;

    const files = fs.readdirSync(examplesDir).filter((file) => file.endsWith('.json'));

    for (const file of files) {
      const contractType = this.inferContractType(file);
      if (!contractType) continue;

      try {
        const data = JSON.parse(fs.readFileSync(path.join(examplesDir, file), 'utf-8'));
        ledger.set(data.id, { contractType, data, status: 'ACCEPTED' });
      } catch (error) {
        console.warn(`⚠️  [ContractGuard] Failed to load offline contract ${file}: ${error}`);
      }
    }

    return ledger;
  }

  /**
   * Determine if a live database connection is available.
   */
  private isDatabaseAvailable(): boolean {
    return !AIR_LOCK_MODE && !!prisma;
  }

  /**
   * Verify integrity hash (for auditing)
   */
  verifyIntegrityHash(
    contractId: string,
    contractType: string,
    rawJson: string,
    status: string,
    timestamp: string,
    expectedHash: string
  ): boolean {
    const computedHash = this.generateIntegrityHash(contractId, contractType, rawJson, status, timestamp);
    return computedHash === expectedHash;
  }

  /**
   * Write a contract to the database (with validation)
   * This is the ONLY way to write to the database
   */
  async writeContract(contract: ContractInput): Promise<{ success: boolean; error?: string; contractLedgerId?: string }> {
    const { contractId, contractType, data } = contract;

    // Air Lock Mode check
    if (!this.isDatabaseAvailable()) {
      console.warn(`⚠️  [ContractGuard] Air Lock Mode: Cannot write to database`);
      return {
        success: false,
        error: 'Air Lock Mode: Database writes disabled'
      };
    }

    console.log(`🔒 [ContractGuard] Validating ${contractType} contract: ${contractId}`);

    // Step 1: Validate contract
    const validation = await this.validateContract(contract);

    const status = validation.valid ? 'ACCEPTED' : 'REJECTED';
    const validationLog = validation.valid ? null : validation.errors.join('\n');
    
    // Generate timestamp and integrity hash for immutable ledger
    const timestamp = new Date().toISOString();
    const rawJsonString = JSON.stringify(data);
    const integrityHash = this.generateIntegrityHash(contractId, contractType, rawJsonString, status, timestamp);

    // Step 2: Write to Contract ledger (always)
    try {
      const contractLedger = await prisma!.contract.create({
        data: {
          contractId,
          contractType,
          rawJson: data, // Note: Field name is 'rawJson' for backwards compat, but stores JSON object (JSONB)
          status,
          validationLog,
          integrityHash
        }
      });

      if (!validation.valid) {
        console.error(`❌ [ContractGuard] REJECTED: ${contractId}`);
        console.error(`   Validation errors:\n${validation.errors.map(e => `   - ${e}`).join('\n')}`);
        
        return {
          success: false,
          error: `Contract validation failed:\n${validation.errors.join('\n')}`,
          contractLedgerId: contractLedger.id
        };
      }

      console.log(`✅ [ContractGuard] ACCEPTED: ${contractId}`);

      // Step 3: Write to projection table (only for ACCEPTED contracts)
      await this.writeProjection(contractType, data);

      return {
        success: true,
        contractLedgerId: contractLedger.id
      };
    } catch (error) {
      console.error(`🚨 [ContractGuard] Database error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: `Database error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Write to projection tables (Order, Pulse, Decision, Intent, Uplink)
   * Defensive guard: Skip projection writes if database is unavailable or Air Lock mode is active
   */
  private async writeProjection(contractType: string, data: any): Promise<void> {
    // Defensive guard: Check if prisma is available and Air Lock mode is inactive
    if (prisma === null || AIR_LOCK_MODE) {
      console.warn(`⚠️  [ContractGuard] Air Lock Mode: Skipping projection write for ${contractType} (contractId: ${data.id || 'unknown'})`);
      console.warn(`   Reason: Database unavailable or Air Lock mode active`);
      return; // Safe no-op: skip projection write
    }

    switch (contractType) {
      case 'Order':
        await prisma!.order.create({
          data: {
            orderId: data.id,
            schemaVersion: data.schema_version,
            createdAt: new Date(data.created_at),
            createdBy: data.created_by,
            projectId: data.project_id,
            cycleType: data.cycle.type,
            cycleWeek: data.cycle.week,
            rockTitle: data.rock.title,
            rockDoD: data.rock.definition_of_done, // Store as JSON
            tactics: data.tactics, // Store as JSON
            constraints: data.constraints, // Store as JSON
            escalationRules: data.escalation_rules, // Store as JSON
            linkedDecisionId: data.linked_decision_id || null,
            notes: data.notes || null
          }
        });
        break;

      case 'Pulse':
        await prisma!.pulse.create({
          data: {
            pulseId: data.id,
            schemaVersion: data.schema_version,
            createdAt: new Date(data.created_at),
            createdBy: data.created_by,
            projectId: data.project_id,
            week: data.week,
            signalLevel: data.signal_level,
            kpiTmiCurrent: data.kpi.tmi_current,
            kpiTmiTarget: data.kpi.tmi_target,
            kpiTvrScore: data.kpi.tvr_score,
            kpi12wyCompletionPct: data.kpi?.['12wy_completion_pct'] || 0,
            domains: data.domains, // Store as JSON
            type4DecisionsNeeded: data.type4_decisions_needed, // Store as JSON
            notes: data.notes || null
          }
        });
        break;

      case 'Decision':
        await prisma!.decision.create({
          data: {
            decisionId: data.id,
            schemaVersion: data.schema_version,
            createdAt: new Date(data.created_at),
            createdBy: data.created_by,
            linkedIntentId: data.linked_intent_id,
            projectId: data.project_id || null,
            signalLevel: data.signal_level,
            gate: data.gate || null,
            type4Question: data.type4_question,
            options: data.options, // Store as JSON
            recommendation: data.recommendation,
            rationale: data.rationale_10_lines_max, // Store as JSON
            deadline: new Date(data.deadline),
            a0Decision: data.a0_decision || null // Store as JSON or null
          }
        });
        break;

      case 'Intent':
        await prisma!.intent.create({
          data: {
            intentId: data.id,
            schemaVersion: data.schema_version,
            createdAt: new Date(data.created_at),
            createdBy: data.created_by,
            projectId: data.project_id || null,
            title: data.title,
            intentText: data.intent_text,
            domainsTouched: data.domains_touched, // Store as JSON
            expectedEnergyCost: data.expected_energy_cost,
            timeHorizon: data.time_horizon,
            riskLevel: data.risk_level,
            constraints: data.constraints, // Store as JSON
            successCriteria: data.success_criteria, // Store as JSON
            needsType4Decision: data.needs_type4_decision,
            attachments: data.attachments || null, // Store as JSON or null
            notes: data.notes || null
          }
        });
        break;

      case 'Uplink':
        await prisma!.uplink.create({
          data: {
            uplinkId: data.id,
            schemaVersion: data.schema_version,
            createdAt: new Date(data.created_at),
            createdBy: data.created_by,
            week: data.week || null,
            projectId: data.project_id || null,
            lines: data.lines, // Store as JSON
            linkedPulseIds: data.linked_pulse_ids, // Store as JSON
            type4Required: data.type4_required
          }
        });
        break;

      default:
        throw new Error(`Unknown projection type: ${contractType}`);
    }

    console.log(`   📊 [ContractGuard] Projection written: ${contractType}`);
  }

  /**
   * Get contract status from ledger
   */
  async getContractStatus(contractId: string): Promise<{ status: string; validationLog?: string; integrityHash?: string } | null> {
    if (!this.isDatabaseAvailable()) {
      const offline = this.offlineLedger.get(contractId);
      if (!offline) return null;

      return {
        status: offline.status
      };
    }

    const contract = await prisma!.contract.findUnique({
      where: { contractId },
      select: { status: true, validationLog: true, integrityHash: true }
    });

    if (!contract) return null;

    return {
      status: contract.status,
      validationLog: contract.validationLog || undefined,
      integrityHash: contract.integrityHash
    };
  }

  /**
   * List all contracts with optional filtering
   */
  async listContracts(filters?: {
    contractType?: string;
    status?: string;
    limit?: number;
  }): Promise<any[]> {
    if (!this.isDatabaseAvailable()) {
      const contracts = Array.from(this.offlineLedger.entries()).map(([contractId, details]) => ({
        contractId,
        contractType: details.contractType,
        status: details.status,
        rawJson: details.data,
        createdAt: new Date(details.data.created_at),
        createdBy: details.data.created_by
      }));

      return contracts
        .filter((contract) => !filters?.contractType || contract.contractType === filters.contractType)
        .filter((contract) => !filters?.status || contract.status === filters.status)
        .slice(0, filters?.limit || 100);
    }

    const where: any = {};
    
    if (filters?.contractType) where.contractType = filters.contractType;
    if (filters?.status) where.status = filters.status;

    return await prisma!.contract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100
    });
  }

  /**
   * Infer contract type from filename (used for offline ledger loading)
   */
  private inferContractType(filename: string): string | null {
    const typeMap: Record<string, string> = {
      order: 'Order',
      pulse: 'Pulse',
      decision: 'Decision',
      intent: 'Intent',
      uplink: 'Uplink'
    };

    for (const [prefix, type] of Object.entries(typeMap)) {
      if (filename.toLowerCase().startsWith(prefix)) return type;
    }

    return null;
  }
}

export default ContractGuard;
