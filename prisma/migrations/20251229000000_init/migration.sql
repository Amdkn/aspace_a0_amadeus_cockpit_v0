-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "contractType" TEXT NOT NULL,
    "rawJson" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "validationLog" TEXT,
    "integrityHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "schemaVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "cycleType" TEXT NOT NULL,
    "cycleWeek" INTEGER NOT NULL,
    "rockTitle" TEXT NOT NULL,
    "rockDoD" JSONB NOT NULL,
    "tactics" JSONB NOT NULL,
    "constraints" JSONB NOT NULL,
    "escalationRules" JSONB NOT NULL,
    "linkedDecisionId" TEXT,
    "notes" TEXT,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pulse" (
    "id" TEXT NOT NULL,
    "pulseId" TEXT NOT NULL,
    "schemaVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "signalLevel" TEXT NOT NULL,
    "kpiTmiCurrent" DOUBLE PRECISION NOT NULL,
    "kpiTmiTarget" DOUBLE PRECISION NOT NULL,
    "kpiTvrScore" DOUBLE PRECISION NOT NULL,
    "kpi12wyCompletionPct" DOUBLE PRECISION NOT NULL,
    "domains" JSONB NOT NULL,
    "type4DecisionsNeeded" JSONB NOT NULL,
    "notes" TEXT,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pulse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL,
    "decisionId" TEXT NOT NULL,
    "schemaVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "linkedIntentId" TEXT NOT NULL,
    "projectId" TEXT,
    "signalLevel" TEXT NOT NULL,
    "gate" TEXT,
    "type4Question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "recommendation" TEXT NOT NULL,
    "rationale" JSONB NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "a0Decision" JSONB,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intent" (
    "id" TEXT NOT NULL,
    "intentId" TEXT NOT NULL,
    "schemaVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "intentText" TEXT NOT NULL,
    "domainsTouched" JSONB NOT NULL,
    "expectedEnergyCost" TEXT NOT NULL,
    "timeHorizon" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "constraints" JSONB NOT NULL,
    "successCriteria" JSONB NOT NULL,
    "needsType4Decision" BOOLEAN NOT NULL,
    "attachments" JSONB,
    "notes" TEXT,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Intent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Uplink" (
    "id" TEXT NOT NULL,
    "uplinkId" TEXT NOT NULL,
    "schemaVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "week" INTEGER,
    "projectId" TEXT,
    "lines" JSONB NOT NULL,
    "linkedPulseIds" JSONB NOT NULL,
    "type4Required" BOOLEAN NOT NULL,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Uplink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contract_contractId_key" ON "Contract"("contractId");

-- CreateIndex
CREATE INDEX "Contract_contractId_idx" ON "Contract"("contractId");

-- CreateIndex
CREATE INDEX "Contract_contractType_idx" ON "Contract"("contractType");

-- CreateIndex
CREATE INDEX "Contract_status_idx" ON "Contract"("status");

-- CreateIndex
CREATE INDEX "Contract_createdAt_idx" ON "Contract"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE INDEX "Order_orderId_idx" ON "Order"("orderId");

-- CreateIndex
CREATE INDEX "Order_projectId_idx" ON "Order"("projectId");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Pulse_pulseId_key" ON "Pulse"("pulseId");

-- CreateIndex
CREATE INDEX "Pulse_pulseId_idx" ON "Pulse"("pulseId");

-- CreateIndex
CREATE INDEX "Pulse_projectId_idx" ON "Pulse"("projectId");

-- CreateIndex
CREATE INDEX "Pulse_week_idx" ON "Pulse"("week");

-- CreateIndex
CREATE INDEX "Pulse_signalLevel_idx" ON "Pulse"("signalLevel");

-- CreateIndex
CREATE INDEX "Pulse_createdAt_idx" ON "Pulse"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Decision_decisionId_key" ON "Decision"("decisionId");

-- CreateIndex
CREATE INDEX "Decision_decisionId_idx" ON "Decision"("decisionId");

-- CreateIndex
CREATE INDEX "Decision_linkedIntentId_idx" ON "Decision"("linkedIntentId");

-- CreateIndex
CREATE INDEX "Decision_signalLevel_idx" ON "Decision"("signalLevel");

-- CreateIndex
CREATE INDEX "Decision_createdAt_idx" ON "Decision"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Intent_intentId_key" ON "Intent"("intentId");

-- CreateIndex
CREATE INDEX "Intent_intentId_idx" ON "Intent"("intentId");

-- CreateIndex
CREATE INDEX "Intent_projectId_idx" ON "Intent"("projectId");

-- CreateIndex
CREATE INDEX "Intent_createdAt_idx" ON "Intent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Uplink_uplinkId_key" ON "Uplink"("uplinkId");

-- CreateIndex
CREATE INDEX "Uplink_uplinkId_idx" ON "Uplink"("uplinkId");

-- CreateIndex
CREATE INDEX "Uplink_week_idx" ON "Uplink"("week");

-- CreateIndex
CREATE INDEX "Uplink_createdAt_idx" ON "Uplink"("createdAt");
