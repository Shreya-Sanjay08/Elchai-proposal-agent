# Elchai Proposal Agent

> Multi-agent AI pipeline that converts unstructured client briefs 
> into structured, legally-defensible business proposals.

**Built as part of the Elchai Group AI Agent & OpenClaw 
Research Intern pre-interview assessment.**

---

## 📹 Demo

🎥 [Watch Full System Demo]([your-google-drive-link-here](https://drive.google.com/drive/folders/18FKe99tvuxQc205v4QvlVE_l37pAvzMW?usp=drive_link))

---

## ✨ Features

- **Multi-agent pipeline** — 3 specialised AI nodes working sequentially
- **OpenRouter free router** — dynamic failover across multiple LLM providers
- **Human-in-the-Loop guardrail** — mandatory review before any proposal reaches a client
- **Out-of-scope detection** — rejects requests outside company catalogue
- **Automated costing model** — calculates estimates from company rate cards
- **Real-time pipeline tracing** — live activity log with timestamps
- **Responsive dashboard UI** — built with FastAPI backend and vanilla JS frontend

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI |
| AI Routing | OpenRouter API (openrouter/free) |
| Models | GPT-4o, Claude 3.5 Sonnet (fallback) |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Logging | Custom timestamped activity tracker |

---

## 📁 Project Structure

```
elchai-proposal-agent/
├── backend/
│   ├── main.py          # FastAPI server + agent logic
│   ├── requirements.txt # Python dependencies
│   └── .env.example     # Environment variables template
├── frontend/
│   ├── index.html       # Main dashboard
│   ├── style.css        # UI styling
│   └── app.js           # Frontend logic
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- OpenRouter API key (free at openrouter.ai)

### Installation

```bash
# Clone the repository
git clone https://github.com/Shreya-Sanjay08/elchai-proposal-agent.git
cd elchai-proposal-agent

# Install dependencies
pip install -r backend/requirements.txt

# Set up environment variables
cp backend/.env.example backend/.env
# Add your OpenRouter API key to .env

# Run the backend
cd backend
uvicorn main:app --reload

# Open frontend
# Open frontend/index.html in your browser
```

---

## ⚙️ Environment Variables

```env
OPENROUTER_API_KEY=your_key_here
```

Get your free API key at [openrouter.ai](https://openrouter.ai)

---

## 🔒 Safety & Risk Controls

| Risk | Control Implemented |
|---|---|
| Hallucinated pricing | RAG locked to company catalogue only |
| Out-of-scope requests | Hard rejection with explanation |
| Unsupervised delivery | Mandatory HITL review gate |
| Data exposure | No client data stored or logged to cloud |
| Model downtime | Automatic fallback to secondary LLM |

---

## 📊 Pipeline Activity Log

Every run generates a full timestamped log:

```
Timestamp          | Node      | Status
-------------------|-----------|------------------
2026-07-18 14:32:01 | Extractor | Complete
2026-07-18 14:32:04 | Matcher   | Complete  
2026-07-18 14:32:09 | Composer  | Complete
2026-07-18 14:32:10 | HITL Gate | Pending Human Review ⚠️
```

---

## ⚠️ Known Limitations

- Context window threshold: briefs exceeding 5,000 characters
  may experience peripheral information loss
- No persistent memory between sessions — stateless by design
- Pricing accuracy dependent on knowledge base being current
- Async state drift possible if connection lost mid-pipeline

---

## 📋 Assessment Context

This system was built as a pre-interview technical assessment 
for the **AI Agent & OpenClaw Research Intern** role at 
**Elchai Group, Dubai**.

The task required independently researching, building, 
testing, documenting and evaluating whether an AI agent 
tool is genuinely useful for real business use.

**Workflow chosen:** Client Brief → Proposal Draft  
**Rationale:** High business value, well-scoped, 
directly applicable to agency operations.

---

## 👩‍💻 Author

**Shreya Sanjay**  
CSE Graduate — Middlesex University Dubai (2026)  
🏆 Future Hack 2026 Winner | URIC 2026 Finalist | Changemakers Top 10 

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://linkedin.com/in/shreyasanjay08s)
[![GitHub](https://img.shields.io/badge/GitHub-Profile-black)](https://github.com/Shreya-Sanjay08)
[![Email](https://img.shields.io/badge/Email-Contact-red)](mailto:shreyasanjay811@gmail.com)

---

*Confidential — Built exclusively for Elchai Group 
assessment purposes*"# Elchai-proposal-agent" 
