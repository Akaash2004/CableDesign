# AI-Driven Cable Design Validation System

An intelligent system for validating cable design specifications against IEC standards (e.g., IEC 60502-1) using AI reasoning and dynamic heuristics.

## Features

-   **AI-Powered Validation**: Uses LLMs (OpenAI-compatible / Ollama) to reason about cable designs.
-   **Dynamic Mock Engine**: Smart fallback mechanism that enforces critical rules (e.g., Min Insulation Thickness) even without an active AI connection.
-   **Structured & Free-Text Input**: Accepts both form-based data and raw engineering text (e.g., "10mm sq cable with 0.5mm ins").
-   **Detailed Reasoning**: Provides actionable feedback and remediation steps for failed validations.
-   **Modern UI**: Dark-themed, responsive interface built with Next.js and Material UI.

## Technology Stack

-   **Frontend**: Next.js 14, TypeScript, Material UI (MUI), DataGrid.
-   **Backend**: NestJS, TypeScript, Axios.
-   **AI Integration**: OpenAI API compatible interface (Supports GPT-4, Ollama Llama3, etc.).

## Prerequisites

-   Node.js (v18+)
-   Ollama (optional, for local AI reasoning)

## Installation & Running

### 1. Backend

```bash
cd backend
npm install
# Update .env if using a custom AI model (default: Ollama/Llama3)
npm run start:dev
```
*Runs on Port 3000.*

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```
*Runs on Port 3001.*

## Usage

1.  Open [http://localhost:3001](http://localhost:3001).
2.  Enter cable details (e.g., `IEC 60502-1`, `10 mm²`, `PVC`, `0.6/1 kV`).
3.  Click **VALIDATE**.
4.  View PASS/FAIL status. Click **"View AI Reasoning"** for detailed explanations.

## License

Private / Internal Use.
