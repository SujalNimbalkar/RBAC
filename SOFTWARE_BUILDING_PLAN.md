# Software Building Plan - IATF Procedure Management System
## Month 1: Core Development Tasks

---

## 🎯 **Week 1: Document Control System**

### **Day 1: Database Schema Setup**

#### **Create IATF Document Model**
```bash
# Create new model file
touch backend/src/models/IATFDocument.ts
```

**File: `backend/src/models/IATFDocument.ts`**
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IIATFDocument extends Document {
  documentNumber: string;
  title: string;
  documentType: 'procedure' | 'work_instruction' | 'form' | 'specification';
  category: 'APQP' | 'PPAP' | 'MSA' | 'SPC' | 'FMEA' | 'GENERAL';
  currentRevision: string;
  status: 'draft' | 'under_review' | 'approved' | 'active' | 'obsolete';
  createdBy: string;
  approvedBy?: string;
  organizationId: string;
  content: string; // JSON string of procedure steps
  createdAt: Date;
  updatedAt: Date;
}

const iatfDocumentSchema = new Schema<IIATFDocument>({
  documentNumber: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  documentType: { 
    type: String, 
    required: true, 
    enum: ['procedure', 'work_instruction', 'form', 'specification'] 
  },
  category: { 
    type: String, 
    required: true, 
    enum: ['APQP', 'PPAP', 'MSA', 'SPC', 'FMEA', 'GENERAL'] 
  },
  currentRevision: { type: String, required: true, default: 'A' },
  status: { 
    type: String, 
    enum: ['draft', 'under_review', 'approved', 'active', 'obsolete'],
    default: 'draft' 
  },
  createdBy: { type: String, required: true },
  approvedBy: String,
  organizationId: { type: String, required: true },
  content: { type: String, required: true },
}, {
  timestamps: true
});

export const IATFDocument = mongoose.model<IIATFDocument>('IATFDocument', iatfDocumentSchema);
```

### **Day 2: Basic API Routes**

#### **Create Document Routes**
```bash
# Create routes directory and file
mkdir -p backend/src/routes/iatf
touch backend/src/routes/iatf/documents.ts
```

**File: `backend/src/routes/iatf/documents.ts`**
```typescript
import express from 'express';
import { IATFDocument } from '../../models/IATFDocument';
import { authMiddleware } from '../../middleware/auth';

const router = express.Router();

// Get all documents
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.user;
    const documents = await IATFDocument.find({ organizationId })
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new document
router.post('/', authMiddleware, async (req, res) => {
  try {
    const documentNumber = `DOC-${Date.now()}`;
    const document = new IATFDocument({
      ...req.body,
      documentNumber,
      organizationId: req.user.organizationId,
      createdBy: req.user.id
    });
    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get document by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const document = await IATFDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update document
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const document = await IATFDocument.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as iatfDocumentRoutes };
```

#### **Update Server Routes**
**File: `backend/src/server.ts` - Add this line:**
```typescript
import { iatfDocumentRoutes } from './routes/iatf/documents';

// Add after existing routes
app.use('/api/iatf/documents', iatfDocumentRoutes);
```

### **Day 3: Frontend Document List Component**

#### **Create Document Components**
```bash
# Create directory
mkdir -p frontend/src/components/iatf
touch frontend/src/components/iatf/DocumentList.tsx
touch frontend/src/components/iatf/DocumentForm.tsx
```

**File: `frontend/src/components/iatf/DocumentList.tsx`**
```typescript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface IATFDocument {
  _id: string;
  documentNumber: string;
  title: string;
  documentType: string;
  category: string;
  status: string;
  currentRevision: string;
  createdAt: string;
}

const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<IATFDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/api/iatf/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading documents...</div>;
  }

  return (
    <div className="document-list">
      <div className="document-header">
        <h2>IATF Documents</h2>
        <button 
          className="btn-primary"
          onClick={() => window.location.href = '/iatf/documents/new'}
        >
          New Document
        </button>
      </div>
      
      <div className="document-grid">
        {documents.map(doc => (
          <div key={doc._id} className="document-card">
            <div className="document-number">{doc.documentNumber}</div>
            <h3>{doc.title}</h3>
            <div className="document-meta">
              <span className="doc-type">{doc.documentType}</span>
              <span className="doc-category">{doc.category}</span>
              <span className={`doc-status status-${doc.status}`}>
                {doc.status}
              </span>
            </div>
            <div className="document-actions">
              <button onClick={() => window.location.href = `/iatf/documents/${doc._id}`}>
                View
              </button>
              <button onClick={() => window.location.href = `/iatf/documents/${doc._id}/edit`}>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;
```

**File: `frontend/src/components/iatf/DocumentForm.tsx`**
```typescript
import React, { useState } from 'react';
import axios from 'axios';

interface DocumentFormData {
  title: string;
  documentType: string;
  category: string;
  content: string;
}

const DocumentForm: React.FC = () => {
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    documentType: 'procedure',
    category: 'GENERAL',
    content: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/iatf/documents', formData);
      window.location.href = '/iatf/documents';
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  return (
    <div className="document-form">
      <h2>Create New IATF Document</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Document Type:</label>
          <select
            value={formData.documentType}
            onChange={(e) => setFormData({...formData, documentType: e.target.value})}
          >
            <option value="procedure">Procedure</option>
            <option value="work_instruction">Work Instruction</option>
            <option value="form">Form</option>
            <option value="specification">Specification</option>
          </select>
        </div>

        <div className="form-group">
          <label>Category:</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            <option value="GENERAL">General</option>
            <option value="APQP">APQP</option>
            <option value="PPAP">PPAP</option>
            <option value="MSA">MSA</option>
            <option value="SPC">SPC</option>
            <option value="FMEA">FMEA</option>
          </select>
        </div>

        <div className="form-group">
          <label>Content:</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            rows={10}
            placeholder="Document content..."
          />
        </div>

        <button type="submit" className="btn-primary">Create Document</button>
      </form>
    </div>
  );
};

export default DocumentForm;
```

### **Day 4: Basic CSS Styling**

**File: `frontend/src/components/iatf/iatf.css`**
```css
.document-list {
  padding: 20px;
}

.document-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.document-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.document-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.document-number {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.document-meta {
  display: flex;
  gap: 8px;
  margin: 12px 0;
}

.doc-type, .doc-category {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #f0f0f0;
}

.doc-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.status-draft { background: #ffa500; }
.status-approved { background: #28a745; }
.status-active { background: #007bff; }

.document-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
}

.form-group input, 
.form-group select, 
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
```

---

## 🎯 **Week 2: Procedure Builder**

### **Day 5-6: Procedure Steps Model**

**File: `backend/src/models/ProcedureStep.ts`**
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IProcedureStep extends Document {
  procedureId: string;
  stepNumber: number;
  title: string;
  description: string;
  assignedRole: string;
  estimatedDuration: number; // in hours
  inputs: string[];
  outputs: string[];
  riskLevel: 'low' | 'medium' | 'high';
  approvalRequired: boolean;
  organizationId: string;
}

const procedureStepSchema = new Schema<IProcedureStep>({
  procedureId: { type: String, required: true },
  stepNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedRole: { type: String, required: true },
  estimatedDuration: { type: Number, default: 1 },
  inputs: [String],
  outputs: [String],
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  approvalRequired: { type: Boolean, default: false },
  organizationId: { type: String, required: true }
}, {
  timestamps: true
});

export const ProcedureStep = mongoose.model<IProcedureStep>('ProcedureStep', procedureStepSchema);
```

### **Day 7: Procedure Builder Component**

**File: `frontend/src/components/iatf/ProcedureBuilder.tsx`**
```typescript
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Step {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  assignedRole: string;
  estimatedDuration: number;
  riskLevel: 'low' | 'medium' | 'high';
}

const ProcedureBuilder: React.FC = () => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [newStep, setNewStep] = useState<Partial<Step>>({
    title: '',
    description: '',
    assignedRole: '',
    estimatedDuration: 1,
    riskLevel: 'low'
  });

  const addStep = () => {
    const step: Step = {
      id: Date.now().toString(),
      stepNumber: steps.length + 1,
      title: newStep.title || '',
      description: newStep.description || '',
      assignedRole: newStep.assignedRole || '',
      estimatedDuration: newStep.estimatedDuration || 1,
      riskLevel: newStep.riskLevel || 'low'
    };
    
    setSteps([...steps, step]);
    setNewStep({
      title: '',
      description: '',
      assignedRole: '',
      estimatedDuration: 1,
      riskLevel: 'low'
    });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update step numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      stepNumber: index + 1
    }));

    setSteps(updatedItems);
  };

  return (
    <div className="procedure-builder">
      <h2>Procedure Builder</h2>
      
      {/* Add New Step Form */}
      <div className="add-step-form">
        <h3>Add New Step</h3>
        <div className="form-row">
          <input
            type="text"
            placeholder="Step title"
            value={newStep.title || ''}
            onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Assigned role"
            value={newStep.assignedRole || ''}
            onChange={(e) => setNewStep({ ...newStep, assignedRole: e.target.value })}
          />
        </div>
        <textarea
          placeholder="Step description"
          value={newStep.description || ''}
          onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
        />
        <div className="form-row">
          <input
            type="number"
            placeholder="Duration (hours)"
            value={newStep.estimatedDuration || ''}
            onChange={(e) => setNewStep({ ...newStep, estimatedDuration: parseInt(e.target.value) })}
          />
          <select
            value={newStep.riskLevel || 'low'}
            onChange={(e) => setNewStep({ ...newStep, riskLevel: e.target.value as 'low' | 'medium' | 'high' })}
          >
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>
        <button onClick={addStep} className="btn-primary">Add Step</button>
      </div>

      {/* Steps List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="steps-list">
              {steps.map((step, index) => (
                <Draggable key={step.id} draggableId={step.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`step-card risk-${step.riskLevel}`}
                    >
                      <div className="step-header">
                        <span className="step-number">{step.stepNumber}</span>
                        <h4>{step.title}</h4>
                      </div>
                      <p>{step.description}</p>
                      <div className="step-meta">
                        <span>Role: {step.assignedRole}</span>
                        <span>Duration: {step.estimatedDuration}h</span>
                        <span className={`risk-badge risk-${step.riskLevel}`}>
                          {step.riskLevel} risk
                        </span>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ProcedureBuilder;
```

---

## 🎯 **Week 3: Basic IATF Templates**

### **Day 8-9: APQP Template**

**File: `backend/src/templates/APQPTemplate.ts`**
```typescript
export const APQPPhase1Template = {
  id: 'APQP_PHASE_1',
  name: 'APQP Phase 1: Plan and Define Program',
  category: 'APQP',
  steps: [
    {
      stepNumber: 1,
      title: 'Design Goals and Reliability Targets',
      description: 'Define design goals, reliability targets, and quality objectives',
      assignedRole: 'Design Engineer',
      estimatedDuration: 40,
      inputs: ['Customer Requirements', 'Market Research'],
      outputs: ['Design Goals Document'],
      riskLevel: 'high',
      approvalRequired: true
    },
    {
      stepNumber: 2,
      title: 'Preliminary Bill of Material',
      description: 'Create preliminary bill of materials',
      assignedRole: 'Design Engineer',
      estimatedDuration: 24,
      inputs: ['Design Goals', 'Component Specifications'],
      outputs: ['Preliminary BOM'],
      riskLevel: 'medium',
      approvalRequired: true
    },
    {
      stepNumber: 3,
      title: 'Preliminary Process Flow Chart',
      description: 'Develop preliminary manufacturing process flow',
      assignedRole: 'Process Engineer',
      estimatedDuration: 32,
      inputs: ['Preliminary BOM'],
      outputs: ['Process Flow Chart'],
      riskLevel: 'high',
      approvalRequired: true
    }
  ]
};
```

### **Day 10-11: Template API & Frontend**

**File: `backend/src/routes/iatf/templates.ts`**
```typescript
import express from 'express';
import { APQPPhase1Template } from '../../templates/APQPTemplate';

const router = express.Router();

router.get('/apqp-phase1', (req, res) => {
  res.json(APQPPhase1Template);
});

router.get('/', (req, res) => {
  const templates = [
    {
      id: 'APQP_PHASE_1',
      name: 'APQP Phase 1: Plan and Define Program',
      category: 'APQP',
      description: 'Initial planning phase for new product development'
    }
  ];
  res.json(templates);
});

export { router as templateRoutes };
```

**File: `frontend/src/components/iatf/TemplateLibrary.tsx`**
```typescript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
}

const TemplateLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/iatf/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const useTemplate = async (templateId: string) => {
    try {
      const response = await axios.get(`/api/iatf/templates/${templateId}`);
      // Navigate to procedure builder with template data
      const templateData = encodeURIComponent(JSON.stringify(response.data));
      window.location.href = `/iatf/procedures/new?template=${templateData}`;
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  return (
    <div className="template-library">
      <h2>IATF Template Library</h2>
      <div className="template-grid">
        {templates.map(template => (
          <div key={template.id} className="template-card">
            <h3>{template.name}</h3>
            <p className="template-category">{template.category}</p>
            <p>{template.description}</p>
            <button 
              onClick={() => useTemplate(template.id)}
              className="btn-primary"
            >
              Use Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateLibrary;
```

---

## 🎯 **Week 4: Basic Routing & Integration**

### **Day 12-14: Frontend Routing Setup**

**Install dependencies:**
```bash
cd frontend
npm install react-router-dom react-beautiful-dnd
npm install @types/react-router-dom --save-dev
```

**File: `frontend/src/App.tsx` - Update routing:**
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DocumentList from './components/iatf/DocumentList';
import DocumentForm from './components/iatf/DocumentForm';
import ProcedureBuilder from './components/iatf/ProcedureBuilder';
import TemplateLibrary from './components/iatf/TemplateLibrary';
import './components/iatf/iatf.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="main-nav">
          <h1>IATF Management System</h1>
          <ul>
            <li><a href="/iatf/documents">Documents</a></li>
            <li><a href="/iatf/procedures">Procedures</a></li>
            <li><a href="/iatf/templates">Templates</a></li>
          </ul>
        </nav>
        
        <main>
          <Routes>
            <Route path="/iatf/documents" element={<DocumentList />} />
            <Route path="/iatf/documents/new" element={<DocumentForm />} />
            <Route path="/iatf/procedures" element={<ProcedureBuilder />} />
            <Route path="/iatf/templates" element={<TemplateLibrary />} />
            <Route path="/" element={<DocumentList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
```

---

## ✅ **Week 1-4 Checklist**

### **Backend Tasks:**
- [ ] Create IATFDocument model
- [ ] Create ProcedureStep model  
- [ ] Build document CRUD API
- [ ] Build template API
- [ ] Add routes to server.ts
- [ ] Create APQP template data

### **Frontend Tasks:**
- [ ] Build DocumentList component
- [ ] Build DocumentForm component
- [ ] Build ProcedureBuilder component
- [ ] Build TemplateLibrary component
- [ ] Add routing with React Router
- [ ] Create basic CSS styling

### **Integration Tasks:**
- [ ] Connect frontend to backend APIs
- [ ] Test document creation/viewing
- [ ] Test procedure builder drag-and-drop
- [ ] Test template loading
- [ ] Deploy to development environment

---

## 🚀 **This Week's Focus: Start Coding!**

**Day 1 (Today)**: Create the IATFDocument model and basic API
**Day 2**: Build the document list frontend
**Day 3**: Create the document form
**Day 4**: Add basic styling and test everything

**Focus on getting something working first, then improve it!**

This is your concrete coding plan - start with Day 1 tasks and build incrementally. Each day you'll have something tangible working.