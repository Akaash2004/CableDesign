# AI-Driven Cable Design Validation System

This system provides an automated technical audit for low-voltage (LV) cable designs, validating specifications against IEC 60502-1 and IEC 60228 standards. It utilizes Large Language Models (LLM) as the primary reasoning engine to interpret engineering requirements and provide structured validation feedback.

## Core Philosophy: AI-as-Auditor

The system is designed to evaluate AI capability in engineering standards validation. Unlike deterministic rule engines, this application treats the LLM as a Senior Cable Engineering Auditor. All validation logic, including nominal thickness thresholds and material compatibility, is encapsulated within the AI system prompt rather than hardcoded in the application logic.

### System Prompt Logic

The reasoning engine is governed by a technical system prompt that transforms the LLM into a specialized engineering auditor.

#### Engineering Auditor Prompt Structure

```text
You are a Senior Cable Engineering Auditor specialized in IEC 60502-1 and IEC 60228 standards.
Your mission is to perform a rigorous technical audit of the provided cable design.

### ENGINEERING KNOWLEDGE BASE (STRICT RULES)
1. Insulation Thickness (IEC 60502-1 Table 16 - PVC):
   - CSA 1.5 mm² to 6 mm²: Nominal thickness = 0.8 mm
   - CSA 10 mm² to 25 mm²: Nominal thickness = 1.0 mm
   - CSA 35 mm²: Nominal thickness = 1.2 mm
2. Conductor Material (IEC 60228): Cu (Copper), Al (Aluminum).
3. Conductor Class (IEC 60228): Class 2 (Stranded), Class 5 (Flexible).
4. Voltage Rating: Standard Low Voltage (LV) is typically 0.6/1 kV.

### VALIDATION PROTOCOL (SIGNALS)
- PASS: Parameter meets or exceeds nominal requirement with a safe margin.
- WARN: Boundary cases (exactly nominal) or missing data assumptions.
- FAIL: Parameter is strictly below the mandatory IEC threshold.

### AUDIT WORKFLOW
1. Extraction: Parse input (sqmm, Cu, class 2).
2. Field-by-Field Audit: Compare against Knowledge Base.
3. Reasoning Engine: Cite specific tables and provide remediation steps.
```

## Technology Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **AI Gateway**: Custom integration service communicating with OpenAI-compatible endpoints.
- **Local LLM**: Optimized for Gemma 3 (via Ollama) to ensure data privacy and specialized engineering reasoning.

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Material UI (MUI) with a professional dark-themed design system.
- **Components**: High-performance DataGrid for technical attribute display and slide-out drawers for detailed AI justifications.

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- Ollama (for local inference)

### 1. Initialize Local Model
Ensure the Gemma model is available locally:
```bash
ollama pull gemma3:1b
```

### 2. Backend Configuration
Navigate to the backend directory, install dependencies, and configure the environment:
```bash
cd backend
npm install
```
Configure your `.env` file with the following parameters:
```env
AI_API_URL=http://localhost:11434/v1/chat/completions
AI_API_KEY=ollama
AI_MODEL=gemma3:1b
```
Start the development server:
```bash
npm run start:dev
```

### 3. Frontend Configuration
Navigate to the frontend directory and start the development server:
```bash
cd frontend
npm install
npm run dev
```
The application will be accessible at `http://localhost:3001`.

## Usage Manual

1.  **Input Data**: Provide cable specifications using either the structured form or the free-text engineering description field.
2.  **Validation**: Execute the validate command to initiate the AI audit.
3.  **Review Results**: Analyze the attribute-level status indicators (PASS, WARN, FAIL).
4.  **Technical Reasoning**: Access the AI Reasoning Panel for detailed justifications, table citations, and recommended remediation steps.

## Technical Standards Focus
- **IEC 60502-1**: Power cables with extruded insulation and their accessories for rated voltages from 1 kV up to 30 kV.
- **IEC 60228**: Conductors of insulated cables.
