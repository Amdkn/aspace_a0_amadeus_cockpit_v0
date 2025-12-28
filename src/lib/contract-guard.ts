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
const AIR_LOCK_MODE = process.env.ASPACE_AIR_LOCK_MODE === 'true';

let prisma: PrismaClient;
try {
  prisma = new PrismaClient();
} catch (error) {
  if (AIR_LOCK_MODE) {
    console.warn('⚠️  [ContractGuard] Air Lock Mode: Database unavailable, operating in read-only mode');
    // @ts-ignore - Allow undefined in Air Lock mode
    prisma = null;
  } else {
    throw error;
  }
}

export interface ContractInput {
  contractId: string;
  contractType: 'Order' | 'Pulse' | 'Decision' | 'Intent' | 'Uplink';
  data: Record<string, any>;
}

export class ContractGuard {
  private protocolsDir: string;

  constructor() {
    this.protocolsDir = path.join(process.cwd(), 'protocols');
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
    if (AIR_LOCK_MODE || !prisma) {
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
      const contractLedger = await prisma.contract.create({
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
   */
  private async writeProjection(contractType: string, data: any): Promise<void> {
    switch (contractType) {
      case 'Order':
        await prisma.order.create({
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
        await prisma.pulse.create({
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
        await prisma.decision.create({
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
        await prisma.intent.create({
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
        await prisma.uplink.create({
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
    if (AIR_LOCK_MODE || !prisma) {
      console.warn(`⚠️  [ContractGuard] Air Lock Mode: Cannot access database`);
      return null;
    }

    const contract = await prisma.contract.findUnique({
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
    if (AIR_LOCK_MODE || !prisma) {
      console.warn(`⚠️  [ContractGuard] Air Lock Mode: Cannot access database`);
      return [];
    }

    const where: any = {};
    
    if (filters?.contractType) where.contractType = filters.contractType;
    if (filters?.status) where.status = filters.status;

    return await prisma.contract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100
    });
  }
}

export default ContractGuard;
