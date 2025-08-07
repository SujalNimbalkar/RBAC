# IATF 16949 Technical Implementation Guide
## Building Automotive-Grade Compliance Features

---

## 🎯 IATF Technical Architecture Overview

### **Core Compliance Systems Required:**
1. **Document Control System** - IATF 7.5.1 & 7.5.3
2. **Process Control Framework** - IATF 8.1 & 8.5
3. **Audit Trail Engine** - Complete traceability
4. **Risk-Based Thinking** - IATF 8.1.1
5. **Supplier Management** - IATF 8.4.2
6. **Nonconformity Management** - IATF 8.7 & 10.2

---

## 📋 Week 1-2: Document Control System Implementation

### **Database Schema - Document Control**

```typescript
// backend/src/models/IATFDocument.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentRevision {
  revisionNumber: string;
  revisionDate: Date;
  changesDescription: string;
  approvedBy: string;
  effectiveDate: Date;
  supersededDate?: Date;
  filePath: string;
  checksum: string; // For integrity verification
}

export interface IDocumentDistribution {
  userId: string;
  departmentId: string;
  distributionDate: Date;
  acknowledgmentDate?: Date;
  accessLevel: 'read' | 'edit' | 'approve';
  controlledCopy: boolean;
}

export interface IIATFDocument extends Document {
  documentNumber: string; // Unique document identifier
  title: string;
  documentType: 'procedure' | 'work_instruction' | 'form' | 'specification' | 'control_plan';
  category: 'APQP' | 'PPAP' | 'MSA' | 'SPC' | 'FMEA' | 'CONTROL_PLAN' | 'AUDIT' | 'GENERAL';
  
  // Document Control Requirements
  currentRevision: string;
  revisionHistory: IDocumentRevision[];
  status: 'draft' | 'under_review' | 'approved' | 'active' | 'superseded' | 'obsolete';
  
  // Approval Workflow
  createdBy: string;
  reviewedBy: string[];
  approvedBy: string;
  nextReviewDate: Date;
  reviewFrequency: number; // months
  
  // Distribution Control
  distributionList: IDocumentDistribution[];
  controlledCopies: number;
  uncontrolledCopies: boolean;
  
  // IATF Specific
  processOwner: string;
  affectedProcesses: string[];
  riskAssessment?: string;
  trainingRequired: boolean;
  
  // Metadata
  organizationId: string;
  tags: string[];
  customFields: { [key: string]: any };
  
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IIATFDocument>({
  documentNumber: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  documentType: { 
    type: String, 
    required: true, 
    enum: ['procedure', 'work_instruction', 'form', 'specification', 'control_plan'] 
  },
  category: { 
    type: String, 
    required: true, 
    enum: ['APQP', 'PPAP', 'MSA', 'SPC', 'FMEA', 'CONTROL_PLAN', 'AUDIT', 'GENERAL'] 
  },
  
  currentRevision: { type: String, required: true, default: 'A' },
  revisionHistory: [{
    revisionNumber: String,
    revisionDate: Date,
    changesDescription: String,
    approvedBy: String,
    effectiveDate: Date,
    supersededDate: Date,
    filePath: String,
    checksum: String
  }],
  status: { 
    type: String, 
    enum: ['draft', 'under_review', 'approved', 'active', 'superseded', 'obsolete'],
    default: 'draft' 
  },
  
  createdBy: { type: String, required: true },
  reviewedBy: [String],
  approvedBy: String,
  nextReviewDate: Date,
  reviewFrequency: { type: Number, default: 12 },
  
  distributionList: [{
    userId: String,
    departmentId: String,
    distributionDate: Date,
    acknowledgmentDate: Date,
    accessLevel: { type: String, enum: ['read', 'edit', 'approve'] },
    controlledCopy: Boolean
  }],
  controlledCopies: { type: Number, default: 0 },
  uncontrolledCopies: { type: Boolean, default: false },
  
  processOwner: { type: String, required: true },
  affectedProcesses: [String],
  riskAssessment: String,
  trainingRequired: { type: Boolean, default: false },
  
  organizationId: { type: String, required: true },
  tags: [String],
  customFields: { type: Map, of: Schema.Types.Mixed }
}, {
  timestamps: true
});

// Indexes for IATF compliance queries
documentSchema.index({ documentNumber: 1, organizationId: 1 });
documentSchema.index({ status: 1, nextReviewDate: 1 });
documentSchema.index({ category: 1, organizationId: 1 });

export const IATFDocument = mongoose.model<IIATFDocument>('IATFDocument', documentSchema);
```

### **Document Control API Implementation**

```typescript
// backend/src/routes/iatf/documents.ts
import express from 'express';
import { IATFDocument } from '../../models/IATFDocument';
import { authMiddleware } from '../../middleware/auth';
import { IATFAuditService } from '../../services/IATFAuditService';

const router = express.Router();

// Create new document with IATF controls
router.post('/', authMiddleware, async (req, res) => {
  try {
    const documentNumber = await generateDocumentNumber(req.body.category, req.user.organizationId);
    
    const document = new IATFDocument({
      ...req.body,
      documentNumber,
      organizationId: req.user.organizationId,
      createdBy: req.user.id,
      currentRevision: 'A',
      revisionHistory: [{
        revisionNumber: 'A',
        revisionDate: new Date(),
        changesDescription: 'Initial creation',
        approvedBy: req.user.id,
        effectiveDate: new Date(),
        filePath: '',
        checksum: ''
      }]
    });
    
    await document.save();
    
    // Log audit trail
    await IATFAuditService.logAction({
      action: 'DOCUMENT_CREATED',
      entityType: 'document',
      entityId: document._id,
      userId: req.user.id,
      organizationId: req.user.organizationId,
      details: {
        documentNumber: document.documentNumber,
        title: document.title,
        category: document.category
      }
    });
    
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Document revision control
router.post('/:id/revise', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { changesDescription, effectiveDate } = req.body;
    
    const document = await IATFDocument.findById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Generate next revision number
    const nextRevision = generateNextRevision(document.currentRevision);
    
    // Mark current revision as superseded
    const currentRevisionIndex = document.revisionHistory.findIndex(
      rev => rev.revisionNumber === document.currentRevision
    );
    if (currentRevisionIndex !== -1) {
      document.revisionHistory[currentRevisionIndex].supersededDate = new Date();
    }
    
    // Add new revision
    document.revisionHistory.push({
      revisionNumber: nextRevision,
      revisionDate: new Date(),
      changesDescription,
      approvedBy: req.user.id,
      effectiveDate: new Date(effectiveDate),
      filePath: '', // Will be updated after file upload
      checksum: ''
    });
    
    document.currentRevision = nextRevision;
    document.status = 'under_review';
    
    await document.save();
    
    // Log audit trail
    await IATFAuditService.logAction({
      action: 'DOCUMENT_REVISED',
      entityType: 'document',
      entityId: document._id,
      userId: req.user.id,
      organizationId: req.user.organizationId,
      details: {
        documentNumber: document.documentNumber,
        oldRevision: document.revisionHistory[currentRevisionIndex]?.revisionNumber,
        newRevision: nextRevision,
        changesDescription
      }
    });
    
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Document distribution control
router.post('/:id/distribute', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { distributionList, controlledCopy } = req.body;
    
    const document = await IATFDocument.findById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Add distribution records
    for (const distribution of distributionList) {
      document.distributionList.push({
        ...distribution,
        distributionDate: new Date(),
        controlledCopy
      });
      
      if (controlledCopy) {
        document.controlledCopies += 1;
      }
    }
    
    await document.save();
    
    // Log audit trail
    await IATFAuditService.logAction({
      action: 'DOCUMENT_DISTRIBUTED',
      entityType: 'document',
      entityId: document._id,
      userId: req.user.id,
      organizationId: req.user.organizationId,
      details: {
        documentNumber: document.documentNumber,
        distributionCount: distributionList.length,
        controlledCopy
      }
    });
    
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// IATF compliance check
router.get('/:id/compliance', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const document = await IATFDocument.findById(id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const complianceCheck = {
      documentNumber: !!document.documentNumber,
      currentRevision: !!document.currentRevision,
      approvedBy: !!document.approvedBy,
      effectiveDate: document.revisionHistory.some(rev => rev.effectiveDate),
      distributionControlled: document.distributionList.length > 0,
      reviewScheduled: !!document.nextReviewDate,
      processOwnerAssigned: !!document.processOwner,
      riskAssessed: document.riskAssessment ? true : false
    };
    
    const complianceScore = Object.values(complianceCheck).filter(Boolean).length / Object.keys(complianceCheck).length * 100;
    
    res.json({
      complianceCheck,
      complianceScore,
      issues: Object.entries(complianceCheck)
        .filter(([_, passed]) => !passed)
        .map(([requirement]) => `Missing: ${requirement}`)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as iatfDocumentRoutes };
```

---

## 🔍 Week 2: Audit Trail Engine Implementation

### **Comprehensive Audit Trail System**

```typescript
// backend/src/models/IATFAuditTrail.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IIATFAuditTrail extends Document {
  id: string;
  timestamp: Date;
  action: string;
  entityType: 'document' | 'procedure' | 'task' | 'user' | 'system';
  entityId: string;
  userId: string;
  userRole: string;
  organizationId: string;
  
  // IATF Specific Fields
  processArea?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  complianceImpact: boolean;
  
  // Change Details
  oldValues?: { [key: string]: any };
  newValues?: { [key: string]: any };
  changeReason?: string;
  approvalRequired: boolean;
  approvedBy?: string;
  approvalDate?: Date;
  
  // Context Information
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  
  // Additional Details
  details: { [key: string]: any };
  attachments?: string[];
  
  // Integrity
  checksum: string;
  digitalSignature?: string;
}

const auditTrailSchema = new Schema<IIATFAuditTrail>({
  timestamp: { type: Date, default: Date.now, required: true },
  action: { type: String, required: true },
  entityType: { 
    type: String, 
    required: true, 
    enum: ['document', 'procedure', 'task', 'user', 'system'] 
  },
  entityId: { type: String, required: true },
  userId: { type: String, required: true },
  userRole: { type: String, required: true },
  organizationId: { type: String, required: true },
  
  processArea: String,
  riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
  complianceImpact: { type: Boolean, default: false },
  
  oldValues: { type: Map, of: Schema.Types.Mixed },
  newValues: { type: Map, of: Schema.Types.Mixed },
  changeReason: String,
  approvalRequired: { type: Boolean, default: false },
  approvedBy: String,
  approvalDate: Date,
  
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  sessionId: { type: String, required: true },
  
  details: { type: Map, of: Schema.Types.Mixed },
  attachments: [String],
  
  checksum: { type: String, required: true },
  digitalSignature: String
}, {
  timestamps: false // We use our own timestamp field
});

// Indexes for audit queries
auditTrailSchema.index({ timestamp: -1, organizationId: 1 });
auditTrailSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
auditTrailSchema.index({ userId: 1, timestamp: -1 });
auditTrailSchema.index({ action: 1, complianceImpact: 1 });

export const IATFAuditTrail = mongoose.model<IIATFAuditTrail>('IATFAuditTrail', auditTrailSchema);
```

### **Audit Service Implementation**

```typescript
// backend/src/services/IATFAuditService.ts
import crypto from 'crypto';
import { IATFAuditTrail } from '../models/IATFAuditTrail';

export interface IAuditEntry {
  action: string;
  entityType: 'document' | 'procedure' | 'task' | 'user' | 'system';
  entityId: string;
  userId: string;
  organizationId: string;
  processArea?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  complianceImpact?: boolean;
  oldValues?: { [key: string]: any };
  newValues?: { [key: string]: any };
  changeReason?: string;
  details?: { [key: string]: any };
  request?: any; // Express request object for IP, user agent, etc.
}

export class IATFAuditService {
  
  static async logAction(entry: IAuditEntry): Promise<void> {
    try {
      // Generate checksum for integrity
      const dataToHash = JSON.stringify({
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        userId: entry.userId,
        timestamp: new Date().toISOString(),
        oldValues: entry.oldValues,
        newValues: entry.newValues
      });
      
      const checksum = crypto.createHash('sha256').update(dataToHash).digest('hex');
      
      const auditEntry = new IATFAuditTrail({
        timestamp: new Date(),
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        userId: entry.userId,
        userRole: 'user', // TODO: Get from user context
        organizationId: entry.organizationId,
        
        processArea: entry.processArea,
        riskLevel: entry.riskLevel || 'low',
        complianceImpact: entry.complianceImpact || false,
        
        oldValues: entry.oldValues,
        newValues: entry.newValues,
        changeReason: entry.changeReason,
        approvalRequired: this.requiresApproval(entry.action),
        
        ipAddress: entry.request?.ip || 'unknown',
        userAgent: entry.request?.get('User-Agent') || 'unknown',
        sessionId: entry.request?.sessionID || 'unknown',
        
        details: entry.details || {},
        checksum
      });
      
      await auditEntry.save();
      
      // Check if this action triggers compliance alerts
      if (entry.complianceImpact) {
        await this.checkComplianceAlerts(entry);
      }
      
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // Don't throw - audit logging should not break application flow
    }
  }
  
  private static requiresApproval(action: string): boolean {
    const approvalRequiredActions = [
      'DOCUMENT_APPROVED',
      'DOCUMENT_SUPERSEDED',
      'PROCEDURE_ACTIVATED',
      'CONTROL_PLAN_MODIFIED',
      'RISK_ASSESSMENT_UPDATED'
    ];
    return approvalRequiredActions.includes(action);
  }
  
  private static async checkComplianceAlerts(entry: IAuditEntry): Promise<void> {
    // Implementation for compliance alerting
    // Could integrate with notification system
  }
  
  // Generate audit reports for IATF compliance
  static async generateComplianceReport(
    organizationId: string, 
    startDate: Date, 
    endDate: Date,
    processArea?: string
  ) {
    const pipeline = [
      {
        $match: {
          organizationId,
          timestamp: { $gte: startDate, $lte: endDate },
          ...(processArea && { processArea })
        }
      },
      {
        $group: {
          _id: {
            action: '$action',
            entityType: '$entityType',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          count: { $sum: 1 },
          users: { $addToSet: '$userId' },
          complianceImpact: { $sum: { $cond: ['$complianceImpact', 1, 0] } }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          actions: {
            $push: {
              action: '$_id.action',
              entityType: '$_id.entityType',
              count: '$count',
              uniqueUsers: { $size: '$users' },
              complianceImpact: '$complianceImpact'
            }
          },
          totalActions: { $sum: '$count' },
          totalComplianceImpact: { $sum: '$complianceImpact' }
        }
      },
      { $sort: { '_id': 1 } }
    ];
    
    return await IATFAuditTrail.aggregate(pipeline);
  }
  
  // Get entity change history for audit purposes
  static async getEntityHistory(entityType: string, entityId: string): Promise<any[]> {
    return await IATFAuditTrail.find({
      entityType,
      entityId
    })
    .sort({ timestamp: -1 })
    .limit(100)
    .lean();
  }
  
  // Verify audit trail integrity
  static async verifyIntegrity(auditId: string): Promise<boolean> {
    const auditEntry = await IATFAuditTrail.findById(auditId);
    if (!auditEntry) return false;
    
    const dataToHash = JSON.stringify({
      action: auditEntry.action,
      entityType: auditEntry.entityType,
      entityId: auditEntry.entityId,
      userId: auditEntry.userId,
      timestamp: auditEntry.timestamp.toISOString(),
      oldValues: auditEntry.oldValues,
      newValues: auditEntry.newValues
    });
    
    const calculatedChecksum = crypto.createHash('sha256').update(dataToHash).digest('hex');
    return calculatedChecksum === auditEntry.checksum;
  }
}
```

---

## 🏭 Week 3: Automotive Process Templates

### **APQP (Advanced Product Quality Planning) Template**

```typescript
// backend/src/templates/APQPTemplate.ts
export const APQPTemplate = {
  id: 'APQP_STANDARD',
  name: 'Advanced Product Quality Planning (APQP)',
  category: 'APQP',
  description: 'Standard APQP process for new product development',
  phases: [
    {
      phase: 1,
      name: 'Plan and Define Program',
      steps: [
        {
          id: 'APQP_1_1',
          title: 'Design Goals/Reliability/Quality Targets',
          description: 'Define design goals, reliability targets, and quality objectives',
          role: 'Design Engineer',
          estimatedDuration: 40, // hours
          inputs: ['Customer Requirements', 'Market Research', 'Regulatory Requirements'],
          outputs: ['Design Goals Document', 'Quality Targets'],
          approvals: ['Engineering Manager', 'Quality Manager'],
          riskLevel: 'high',
          complianceRequired: true
        },
        {
          id: 'APQP_1_2',
          title: 'Preliminary Bill of Material',
          description: 'Create preliminary bill of materials',
          role: 'Design Engineer',
          estimatedDuration: 24,
          inputs: ['Design Goals', 'Component Specifications'],
          outputs: ['Preliminary BOM'],
          approvals: ['Engineering Manager'],
          riskLevel: 'medium'
        },
        {
          id: 'APQP_1_3',
          title: 'Preliminary Process Flow Chart',
          description: 'Develop preliminary manufacturing process flow',
          role: 'Process Engineer',
          estimatedDuration: 32,
          inputs: ['Preliminary BOM', 'Manufacturing Requirements'],
          outputs: ['Preliminary Process Flow Chart'],
          approvals: ['Manufacturing Manager'],
          riskLevel: 'high'
        },
        {
          id: 'APQP_1_4',
          title: 'Product/Process Quality System Review',
          description: 'Review quality system requirements for product/process',
          role: 'Quality Engineer',
          estimatedDuration: 16,
          inputs: ['Process Flow Chart', 'Quality Standards'],
          outputs: ['Quality System Requirements'],
          approvals: ['Quality Manager'],
          riskLevel: 'high',
          complianceRequired: true
        },
        {
          id: 'APQP_1_5',
          title: 'Preliminary FMEA',
          description: 'Conduct preliminary Failure Mode and Effects Analysis',
          role: 'Quality Engineer',
          estimatedDuration: 40,
          inputs: ['Process Flow Chart', 'Design Specifications'],
          outputs: ['Preliminary FMEA'],
          approvals: ['Quality Manager', 'Engineering Manager'],
          riskLevel: 'high',
          complianceRequired: true
        }
      ],
      gateReview: {
        name: 'Gate 1 Review',
        approvers: ['Program Manager', 'Engineering Manager', 'Quality Manager'],
        criteria: [
          'Design goals approved',
          'Preliminary BOM complete',
          'Process flow defined',
          'Quality system requirements identified',
          'Preliminary FMEA completed'
        ]
      }
    },
    {
      phase: 2,
      name: 'Product Design and Development',
      steps: [
        {
          id: 'APQP_2_1',
          title: 'Design FMEA',
          description: 'Conduct detailed Design Failure Mode and Effects Analysis',
          role: 'Design Engineer',
          estimatedDuration: 60,
          inputs: ['Design Specifications', 'Preliminary FMEA'],
          outputs: ['Design FMEA'],
          approvals: ['Engineering Manager', 'Quality Manager'],
          riskLevel: 'high',
          complianceRequired: true
        },
        {
          id: 'APQP_2_2',
          title: 'Design Verification Plan',
          description: 'Develop comprehensive design verification plan',
          role: 'Design Engineer',
          estimatedDuration: 32,
          inputs: ['Design FMEA', 'Customer Requirements'],
          outputs: ['Design Verification Plan'],
          approvals: ['Engineering Manager'],
          riskLevel: 'high'
        },
        {
          id: 'APQP_2_3',
          title: 'Design Reviews',
          description: 'Conduct formal design reviews',
          role: 'Design Team',
          estimatedDuration: 24,
          inputs: ['Design Documentation', 'Verification Plan'],
          outputs: ['Design Review Minutes'],
          approvals: ['Engineering Manager', 'Program Manager'],
          riskLevel: 'medium'
        }
      ]
    }
    // Additional phases would continue...
  ],
  customFields: {
    customerSpecific: true,
    regulatoryRequirements: ['IATF 16949', 'ISO 14001'],
    documentationRequired: ['Control Plan', 'PFMEA', 'MSA Studies']
  }
};
```

### **PPAP (Production Part Approval Process) Template**

```typescript
// backend/src/templates/PPAPTemplate.ts
export const PPAPTemplate = {
  id: 'PPAP_STANDARD',
  name: 'Production Part Approval Process (PPAP)',
  category: 'PPAP',
  description: 'Standard PPAP submission process',
  level: 3, // PPAP Level 3 by default
  elements: [
    {
      element: 1,
      name: 'Design Records',
      steps: [
        {
          id: 'PPAP_1_1',
          title: 'Customer Engineering Drawings/Specifications',
          description: 'Collect and verify customer engineering drawings and specifications',
          role: 'Quality Engineer',
          estimatedDuration: 8,
          required: true,
          evidence: 'Customer approved drawings with revision level',
          complianceRequired: true
        }
      ]
    },
    {
      element: 2,
      name: 'Engineering Change Documentation',
      steps: [
        {
          id: 'PPAP_2_1',
          title: 'Engineering Change Orders',
          description: 'Document all engineering changes since last submission',
          role: 'Quality Engineer',
          estimatedDuration: 4,
          required: true,
          evidence: 'Engineering change documentation'
        }
      ]
    },
    {
      element: 3,
      name: 'Customer Engineering Approval',
      steps: [
        {
          id: 'PPAP_3_1',
          title: 'Customer Engineering Approval Documentation',
          description: 'Obtain customer engineering approval if required',
          role: 'Quality Engineer',
          estimatedDuration: 16,
          required: false,
          conditionalOn: 'Customer requires engineering approval',
          evidence: 'Customer engineering approval letter'
        }
      ]
    },
    {
      element: 4,
      name: 'Design FMEA',
      steps: [
        {
          id: 'PPAP_4_1',
          title: 'Design FMEA Review',
          description: 'Review and update Design FMEA',
          role: 'Design Engineer',
          estimatedDuration: 24,
          required: true,
          evidence: 'Current Design FMEA',
          complianceRequired: true
        }
      ]
    },
    {
      element: 5,
      name: 'Process Flow Diagram',
      steps: [
        {
          id: 'PPAP_5_1',
          title: 'Process Flow Diagram Creation',
          description: 'Create detailed process flow diagram',
          role: 'Process Engineer',
          estimatedDuration: 16,
          required: true,
          evidence: 'Process flow diagram',
          complianceRequired: true
        }
      ]
    }
    // Continue with all 18 PPAP elements...
  ],
  submissionRequirements: {
    warrantsRequired: true,
    samplesRequired: true,
    sampleQuantity: 300,
    retentionPeriod: '1 year after part discontinuation'
  }
};
```

---

## 📊 Week 4: Compliance Dashboard Implementation

### **IATF Compliance Dashboard Component**

```typescript
// frontend/src/components/iatf/ComplianceDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import axios from 'axios';

interface ComplianceMetrics {
  overallScore: number;
  documentControl: number;
  processControl: number;
  auditReadiness: number;
  riskManagement: number;
  supplierCompliance: number;
}

interface ComplianceAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  dueDate?: Date;
  assignedTo: string;
}

const IATFComplianceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [auditHistory, setAuditHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      const [metricsRes, alertsRes, auditRes] = await Promise.all([
        axios.get('/api/iatf/compliance/metrics'),
        axios.get('/api/iatf/compliance/alerts'),
        axios.get('/api/iatf/audit/history')
      ]);
      
      setMetrics(metricsRes.data);
      setAlerts(alertsRes.data);
      setAuditHistory(auditRes.data);
    } catch (error) {
      console.error('Error fetching compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading IATF compliance dashboard...</div>;
  }

  const complianceChartData = {
    labels: ['Document Control', 'Process Control', 'Audit Readiness', 'Risk Management', 'Supplier Compliance'],
    datasets: [{
      label: 'Compliance Score (%)',
      data: metrics ? [
        metrics.documentControl,
        metrics.processControl,
        metrics.auditReadiness,
        metrics.riskManagement,
        metrics.supplierCompliance
      ] : [],
      backgroundColor: [
        'rgba(75, 192, 192, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(153, 102, 255, 0.8)'
      ],
      borderWidth: 2
    }]
  };

  const auditActivityData = {
    labels: auditHistory.map(item => item._id),
    datasets: [{
      label: 'Total Actions',
      data: auditHistory.map(item => item.totalActions),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    }, {
      label: 'Compliance Impact',
      data: auditHistory.map(item => item.totalComplianceImpact),
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      tension: 0.1
    }]
  };

  return (
    <div className="iatf-compliance-dashboard">
      <div className="dashboard-header">
        <h1>IATF 16949 Compliance Dashboard</h1>
        <div className="overall-score">
          <div className="score-circle">
            <span className="score-number">{metrics?.overallScore}%</span>
            <span className="score-label">Overall Compliance</span>
          </div>
        </div>
      </div>

      {/* Compliance Alerts */}
      <div className="alerts-section">
        <h2>Compliance Alerts</h2>
        <div className="alerts-list">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert-card ${alert.type}`}>
              <div className="alert-header">
                <h4>{alert.title}</h4>
                <span className={`alert-badge ${alert.type}`}>{alert.type}</span>
              </div>
              <p>{alert.description}</p>
              {alert.dueDate && (
                <div className="alert-footer">
                  <span>Due: {new Date(alert.dueDate).toLocaleDateString()}</span>
                  <span>Assigned: {alert.assignedTo}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Metrics */}
      <div className="metrics-section">
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Document Control</h3>
            <div className="metric-value">{metrics?.documentControl}%</div>
            <div className="metric-status">
              {metrics?.documentControl >= 90 ? '✅ Compliant' : '⚠️ Needs Attention'}
            </div>
          </div>
          
          <div className="metric-card">
            <h3>Process Control</h3>
            <div className="metric-value">{metrics?.processControl}%</div>
            <div className="metric-status">
              {metrics?.processControl >= 90 ? '✅ Compliant' : '⚠️ Needs Attention'}
            </div>
          </div>
          
          <div className="metric-card">
            <h3>Audit Readiness</h3>
            <div className="metric-value">{metrics?.auditReadiness}%</div>
            <div className="metric-status">
              {metrics?.auditReadiness >= 90 ? '✅ Ready' : '⚠️ Not Ready'}
            </div>
          </div>
          
          <div className="metric-card">
            <h3>Risk Management</h3>
            <div className="metric-value">{metrics?.riskManagement}%</div>
            <div className="metric-status">
              {metrics?.riskManagement >= 90 ? '✅ Controlled' : '⚠️ High Risk'}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Compliance Breakdown</h3>
          <Bar 
            data={complianceChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100
                }
              }
            }}
          />
        </div>

        <div className="chart-container">
          <h3>Audit Activity Trend</h3>
          <Line 
            data={auditActivityData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                }
              }
            }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn primary" onClick={() => window.location.href = '/iatf/documents'}>
            📄 Manage Documents
          </button>
          <button className="action-btn secondary" onClick={() => window.location.href = '/iatf/procedures'}>
            ⚙️ Create Procedure
          </button>
          <button className="action-btn warning" onClick={() => window.location.href = '/iatf/audit'}>
            🔍 Start Audit
          </button>
          <button className="action-btn info" onClick={() => window.location.href = '/iatf/reports'}>
            📊 Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default IATFComplianceDashboard;
```

---

## 📋 Implementation Checklist

### **Week 1-2: Foundation**
- [ ] Create IATF document control schema
- [ ] Implement document revision management
- [ ] Build document distribution tracking
- [ ] Create approval workflow system
- [ ] Implement basic compliance checking

### **Week 3: Audit & Process Control**
- [ ] Implement comprehensive audit trail system
- [ ] Create process control framework
- [ ] Build risk-based thinking integration
- [ ] Implement nonconformity management

### **Week 4: Templates & Dashboard**
- [ ] Create APQP procedure templates
- [ ] Build PPAP workflow templates
- [ ] Implement MSA and SPC templates
- [ ] Create IATF compliance dashboard
- [ ] Build audit reporting system

### **Integration Requirements**
- [ ] ERP system integration planning
- [ ] Supplier portal requirements
- [ ] Document management system integration
- [ ] Quality management system connections

**This IATF 16949 implementation transforms your system into an automotive-grade compliance platform, positioning you for premium pricing in the $2.3 trillion automotive market.**