# PRD: DataHub Hackathon — "DataHub Sentinel"
## The Proactive Data Reliability Agent
### Full Product Requirements Document (v2 — Updated with Competitive Intelligence)

---

## 1. RINGKASAN EKSEKUTIF

**Nama Project:** DataHub Sentinel — Proactive Data Reliability Agent
**Kategori Hackathon:** Agents That Do Real Work + Open/Wildcard (kombinasi)
**Tagline:** "AI agent yang gak cuma perbaiki metadata — tapi PREDIKSI masalah sebelum terjadi, auto-generate runbook, dan bikin setiap fix bisa di-trace balik ke root cause-nya."

### Kenapa Harus BEDA dari v1 (Autopilot)?

Dari riset subagent, ada pesaing yang udah bikin hal serupa:
- **datahub-agent-crew** (webnix-space) → udah punya 5-agent pipeline: Investigator→Analyst→Strategist→Regulatory→Codeband + MCP writeback
- **synex-ai** (danilao-bot) → udah punya entity discovery + governance audit + code synthesis + writeback
- Jadi "scan + fix + writeback" BUKAN lagi diferensiasi. Itu baseline.

### Yang Bikin Sentinel MENANG:

| Fitur | datahub-agent-crew | synex-ai | Blast-Radius | **SENTINEL (kita)** |
|-------|-------------------|----------|-------------|---------------------|
| Scan metadata gaps | ✅ | ✅ | ❌ | ✅ |
| Auto-fix writeback | ✅ | ✅ | ✅ (tags) | ✅ |
| Code generation | ❌ | ✅ | ❌ | ✅ |
| Impact analysis | ❌ | ❌ | ✅ | ✅ |
| **PREDICTIVE anomaly** | ❌ | ❌ | ❌ | ✅ ← BARU |
| **Citation traceability** | ❌ | ❌ | ❌ | ✅ ← BARU |
| **Auto-generated runbook** | ❌ | ❌ | ❌ | ✅ ← BARU |
| **Health score trend** | ❌ | ❌ | ❌ | ✅ ← BARU |
| **Slack/webhook alerts** | ❌ | ❌ | ❌ | ✅ ← BARU |
| Interactive dashboard | ❌ | ❌ | ✅ (Streamlit) | ✅ (Streamlit) |

**3 FITUR UNIK yang gak ada di pesaing manapun:**

1. **PREDICTIVE MODE** — Gak cuma deteksi masalah SEKARANG, tapi prediksi masalah BESOK
   - Lineage pattern analysis: "Dataset X punya 5 downstream, tapi gak ada owner. Probability incident dalam 30 hari: 87%"
   - Freshness trend: "Dataset Y update rate melambat 3x lipat dalam seminggu terakhir"
   - Schema drift velocity: "Table Z rata-rata berubah 2 kolom/bulan. Estimasi breakage: high"

2. **CITATION-TRACED FIXES** — Setiap fix yang ditulis agent bisa di-trace ke alasannya
   - Fix description? → Citation: "Generated from schema context [col: customer_id, type: VARCHAR, upstream: raw.orders]"
   - Fix owner? → Citation: "Inferred from lineage: 3/4 upstream datasets owned by @alice, confidence: 75%"
   - Semua fix disimpan di DataHub sebagai structured property + document

3. **AUTO-RUNBOOK GENERATION** — Agent bikin runbook buat setiap issue yang ditemukan
   - Format: "If [condition], then [action], because [evidence]"
   - Disimpan di DataHub sebagai document (via `save_document()`)
   - Tim data bisa review tanpa perlu paham agent-nya

---

## 2. RISET KOMPETITIF LENGKAP

### A. DataHub Official Stack

| Komponen | Repo | Stars | Kita Pakai |
|----------|------|-------|------------|
| DataHub Core | datahub-project/datahub | 12.4k | ✅ Sample datasets |
| Agent Context Kit | (dalam datahub repo) | - | ✅ Inti SDK |
| MCP Server | acryldata/mcp-server-datahub | 79 | ✅ MCP transport |
| DataHub Skills | datahub-project/datahub-skills | 34 | ✅ Extend dengan skill baru |
| Analytics Agent | datahub-project/analytics-agent | 35 | Inspirasi arsitektur |

### B. Pesaing Hackathon (yang udah submit/ada di GitHub)

| Project | Repo | Fokus | Weakness yang Kita Exploit |
|---------|------|-------|---------------------------|
| datahub-agent-crew | webnix-space/datahub-agent-crew | 5-agent audit + fix | Gak ada prediction, gak ada runbook, gak ada citation |
| Datahub-Agent | YHENG-1/Datahub-Agent | Code gen + citation | Cuma code gen, gak ada health monitoring |
| Blast-Radius | Uchebuzz/Blast-Radius | Schema impact analysis | Read-heavy, cuma impact gak ada remediation plan |
| synex-ai | danilao-bot/synex-ai | Autonomous data eng agent | Full-stack tapi gak ada predictive, gak ada trending |
| warehouse-agent-mvp | juebunengkun/warehouse-agent-mvp | Report-to-warehouse | Gak pakai DataHub deeply |

### C. Open-Source Inspirasi (Non-Hackathon)

| Project | Stars | Yang Kita Ambil |
|---------|-------|-----------------|
| datopian/portaljs | 2.3k | Agentic skills pattern |
| dbt-labs/dbt-agent-skills | 640 | Agent skills format |
| reading-plus-ai/mcp-server-data-exploration | 544 | Data exploration pattern |
| great-expectations | 10k+ | Expectation-based quality pattern |
| elementary-data/elementary | 1.8k+ | Anomaly trending pattern |
| ourmem/omem | 201 | Agent memory pattern |

---

## 3. ARSITEKTUR SENTINEL

```
┌─────────────────────────────────────────────────────────────────┐
│                      DataHub Sentinel                            │
│         "Proactive Data Reliability Agent"                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │   WATCHER    │    │  PREDICTOR   │    │     HEALER       │   │
│  │              │    │              │    │                  │   │
│  │ Scan semua   │    │ Trend        │    │ Auto-fix:        │   │
│  │ entities di  │→  │ Analysis:    │→  │ - Descriptions   │   │
│  │ DataHub:     │    │ - Freshness  │    │ - Owners         │   │
│  │ - Schema     │    │ - Schema     │    │ - Tags           │   │
│  │ - Lineage    │    │   drift rate │    │ - Glossary       │   │
│  │ - Owners     │    │ - Orphan     │    │ - Domains        │   │
│  │ - Quality    │    │   risk score │    │                  │   │
│  │ - Freshness  │    │ - Incident   │    │ + CITATION per   │   │
│  │              │    │   probability│    │   setiap fix     │   │
│  └──────────────┘    └──────────────┘    └────────┬─────────┘   │
│         │                    │                     │             │
│         ▼                    ▼                     ▼             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              RUNBOOK GENERATOR                           │   │
│  │                                                          │   │
│  │  Per issue → auto-generate:                              │   │
│  │  - Condition: "missing owner on dataset with 5+ downstream" │
│  │  - Action: "assign @alice (75% confidence from lineage)"   │ │
│  │  - Evidence: [citation_id_1, citation_id_2]                │ │
│  │  - Risk level: HIGH / MEDIUM / LOW                       │   │
│  │  - Saved as DataHub Document via save_document()         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         DASHBOARD (Streamlit)                            │   │
│  │                                                          │   │
│  │  📊 Health Score: 89/100 (↑ from 62 last scan)          │   │
│  │  📈 Trend: improving (+4.2 per day)                     │   │
│  │  🔮 Predictions: 3 datasets at risk next 7 days         │   │
│  │  📋 Runbooks: 12 generated, 8 auto-applied              │   │
│  │  🔗 Citations: every fix traceable                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  DataHub API Layer: datahub-agent-context[langchain]             │
└─────────────────────────────────────────────────────────────────┘
```

### Alur Kerja Detail:

```
Step 1: WATCH
  └→ search() semua entities
  └→ get_entities() detail per entity
  └→ get_lineage() graph per entity
  └→ list_schema_fields() schema per dataset
  └→ Output: EntityReport[] — semua metadata mentah

Step 2: PREDICT
  └→ Hitung health_score per entity (0-100)
       - has_description? (+15)
       - has_owner? (+20)
       - has_tags? (+10)
       - has_glossary_terms? (+10)
       - lineage_connected? (+15)
       - freshness_ok? (+15)
       - no_schema_drift? (+15)
  └→ Hitung risk_score per entity (0-100)
       - downstream_count * 10 (semakin banyak downstream = semakin risky)
       - no_owner? +30
       - no_description? +20
       - stale_data? +25
       - broken_lineage? +25
  └→ Rank entities by risk_score DESC
  └→ Predict: "Top 10 datasets paling berisiko incident dalam 7 hari"

Step 3: HEAL
  └→ For each issue (sorted by risk):
       └→ Generate fix via LLM
       └→ Attach citation: {"source": "lineage", "confidence": 0.85, "evidence": "..."}
       └→ Apply fix via mutations API:
            - update_description(urn, description, citation)
            - add_owners(urn, owners, citation)
            - add_tags(urn, tags, citation)
            - add_glossary_terms(urn, terms, citation)
       └→ Log: {entity, issue, fix, citation, timestamp}

Step 4: RUNBOOK
  └→ For each fix applied:
       └→ Generate runbook entry:
            {
              "condition": "Dataset has 5+ downstream but no owner",
              "action": "Assign most likely owner from upstream lineage",
              "evidence": ["upstream_1 owned by @alice", "upstream_2 owned by @alice"],
              "confidence": 0.75,
              "risk_if_ignored": "HIGH — 5 dashboards depend on this"
            }
       └→ Save as DataHub Document via save_document()

Step 5: REPORT
  └→ Generate health_score_trend (historical)
  └→ Generate risk_predictions
  └→ Display in Streamlit dashboard
  └→ Optional: webhook notification
```

---

## 4. FITUR DETAIL

### 4.1 Health Score Engine (per entity)

```python
def calculate_health_score(entity) -> int:
    score = 0
    score += 15 if entity.description else 0
    score += 20 if entity.owners else 0
    score += 10 if entity.tags else 0
    score += 10 if entity.glossary_terms else 0
    score += 15 if entity.has_lineage else 0
    score += 15 if entity.is_fresh else 0
    score += 15 if not entity.has_schema_drift else 0
    return score  # 0-100
```

### 4.2 Risk Predictor

```python
def calculate_risk_score(entity) -> int:
    risk = 0
    risk += entity.downstream_count * 10      # More downstream = more risk
    risk += 30 if not entity.owners else 0     # No owner = nobody to fix
    risk += 20 if not entity.description else 0 # No docs = nobody understands
    risk += 25 if entity.is_stale else 0       # Stale data = silent failure
    risk += 25 if entity.broken_lineage else 0 # Broken lineage = lost context
    return min(risk, 100)
```

### 4.3 Citation System

Setiap fix yg ditulis agent punya citation:

```json
{
  "fix_type": "add_description",
  "entity_urn": "urn:li:dataset:(urn:li:dataPlatform:snowflake,...)",
  "generated_description": "Customer orders table containing...",
  "citation": {
    "method": "schema_inference",
    "source_columns": ["customer_id", "order_date", "total_amount"],
    "source_lineage": ["raw.orders -> stg.stg_orders -> marts.customer_orders"],
    "confidence": 0.85,
    "model": "gpt-4o-mini",
    "timestamp": "2026-08-01T10:00:00Z"
  }
}
```

### 4.4 Runbook Document (disimpan di DataHub)

```markdown
# Runbook: healthcare.patients — Missing Owner

## Condition
Dataset `healthcare.patients` has 3 downstream dependents but no assigned owner.

## Risk Assessment
- Risk Level: HIGH
- Downstream Impact: 3 dashboards, 1 ML feature
- Probability of incident (7 days): 72%

## Recommended Action
Assign @dr.smith as owner based on:
- 2/3 upstream datasets are owned by @dr.smith
- Dataset is in domain: Healthcare
- Confidence: 67%

## Evidence
1. Upstream `raw.patient_records` → owner: @dr.smith
2. Upstream `raw.lab_results` → owner: @dr.smith
3. Upstream `raw.prescriptions` → owner: @nurse.jones

## Auto-Applied Fix
✅ Owner @dr.smith added via sentinel at 2026-08-01T10:05:00Z
Citation ID: CIT-2026-08-01-001
```

---

## 5. TECH STACK

| Layer | Technology | Alasan |
|-------|-----------|--------|
| Agent Framework | LangGraph (ReAct) | Official support, sama dengan Analytics Agent |
| DataHub SDK | datahub-agent-context[langchain] | Official, mutations API built-in |
| LLM | OpenAI GPT-4o-mini (dev) / GPT-4o (demo) | Cost-effective + quality |
| UI | Streamlit | Fast, visual, free hosting |
| State | SQLite (local) | Health score history, citation log |
| Data | showcase-ecommerce + healthcare datapacks | Planted issues = perfect demo |
| CI | GitHub Actions | Auto-scan cron job |

### Dependencies:
```
datahub-agent-context[langchain]>=0.1.0
langchain>=0.3.0
langgraph>=0.2.0
streamlit>=1.38.0
openai>=1.50.0
sqlite-utils>=3.36
```

---

## 6. STRUKTUR FILE

```
datahub-sentinel/
├── README.md                     # Setup + architecture + demo GIF
├── LICENSE                       # Apache 2.0
├── requirements.txt
├── pyproject.toml
├── .env.example
│
├── sentinel/
│   ├── __init__.py
│   ├── agent.py                  # LangGraph orchestrator
│   ├── watcher.py                # Scan DataHub entities
│   ├── predictor.py              # Health score + risk prediction
│   ├── healer.py                 # Auto-fix + citation
│   ├── runbook.py                # Generate + save runbooks
│   ├── reporter.py               # Generate reports
│   ├── citation.py               # Citation tracking system
│   ├── db.py                     # SQLite state management
│   ├── tools/
│   │   ├── __init__.py
│   │   └── datahub_tools.py      # Wrapper around agent-context
│   └── prompts/
│       ├── description_gen.txt   # Prompt for generating descriptions
│       ├── owner_inference.txt   # Prompt for inferring owners
│       ├── risk_analysis.txt     # Prompt for risk prediction
│       └── runbook_gen.txt       # Prompt for runbook generation
│
├── streamlit_app.py              # Dashboard UI
├── cli.py                        # CLI: sentinel scan/predict/heal/dashboard
│
├── examples/
│   ├── demo_scan_output.json     # Sample scan result
│   ├── demo_runbook.md           # Sample generated runbook
│   ├── demo_citations.json       # Sample citation log
│   └── demo_health_report.html   # Sample dashboard screenshot
│
├── tests/
│   ├── test_watcher.py
│   ├── test_predictor.py
│   ├── test_healer.py
│   ├── test_citation.py
│   └── test_runbook.py
│
├── skills/
│   └── sentinel-scan/            # Contribution: new DataHub Skill
│       ├── SKILL.md
│       └── commands/
│           └── sentinel-scan.md
│
└── .github/
    └── workflows/
        └── sentinel-cron.yml     # Daily automated scan
```

---

## 7. DEMO VIDEO SCRIPT (3 menit)

### 0:00–0:20 — Hook
"Setiap data team punya masalah yang sama: metadata berantakan, owner gak jelas, deskripsi kosong, data basi — dan gak ada yang tau sampai dashboard rusak di depan stakeholder. DataHub Sentinel fixes this BEFORE it happens."

### 0:20–0:50 — Setup (live terminal)
```bash
pip install datahub-sentinel
datahub quickstart
datahub datapack load showcase-ecommerce
datahub datapack load healthcare
sentinel scan
```

### 0:50–1:30 — WATCH + PREDICT (terminal output)
```
🔍 Sentinel scanning 1,104 entities...

📊 Health Summary:
  Average Health Score: 62/100
  Entities at risk:    23 (risk score > 70)
  Critical:            5 (risk score > 90)

🔮 Predictions (next 7 days):
  ⚠️  healthcare.patients     — 87% chance of incident (no owner, 3 downstream)
  ⚠️  ecommerce.raw_events   — 72% chance of staleness (update rate declining)
  ⚠️  ecommerce.stg_orders   — 65% chance of breakage (undocumented schema drift)
```

### 1:30–2:10 — HEAL + CITATION (terminal output)
```
sentinel heal --auto-approve

✅ Applied 35 fixes with full citation trail:

  📝 healthcare.patients → description added
     Citation: inferred from schema [patient_id, diagnosis, lab_result]
     Confidence: 0.88

  👤 healthcare.patients → owner assigned: @dr.smith
     Citation: 2/3 upstream datasets owned by @dr.smith
     Confidence: 0.67

  🏷️  ecommerce.stg_orders → tagged: "needs-review", "schema-drift-detected"
     Citation: column 'discount_code' added without documentation

📋 Generated 23 runbooks → saved to DataHub as documents
```

### 2:10–2:40 — DASHBOARD (Streamlit)
- Health score gauge: 62 → 89 (+27 improvement)
- Trend chart: health improving over 3 scans
- Risk heatmap: entities colored by risk score
- Citation log: clickable, traceable to evidence
- Runbook viewer: one-click view per entity

### 2:40–3:00 — Close
"DataHub Sentinel: bukan cuma perbaiki metadata hari ini — tapi lindungi data stack kamu dari masalah besok. Setiap fix traceable, setiap risiko quantified, setiap runbook actionable. Open source, Apache 2.0."

---

## 8. SCORING STRATEGY vs JUDGING CRITERIA

| Kriteria | Strategi | Expected Score |
|----------|---------|----------------|
| **Use of DataHub** | Agent Context Kit (search, lineage, mutations), write-back (descriptions, tags, owners, glossary, documents), save_document() for runbooks. Deep integration across ALL DataHub APIs. | 9.5/10 |
| **Technical Execution** | LangGraph agent, end-to-end working demo, SQLite state, Streamlit dashboard, tests, CLI. | 8.5/10 |
| **Originality** | PREDICTION engine = gak ada pesaing yg punya. Citation system = unique. Auto-runbook = unique. Tiga hal ini gabungan gak ada di project manapun. | 9.5/10 |
| **Real-World Usefulness** | Every data team struggles with metadata hygiene. Predictive alerts prevent incidents. Runbooks empower non-technical users. | 9/10 |
| **Submission Quality** | 3-min polished video, comprehensive README, examples/ folder, architecture diagrams. | 8.5/10 |
| **BONUS: OS Contribution** | New DataHub Skill: `sentinel-scan`. Optional: PR to datahub-skills repo. | +1 |

---

## 9. TIMELINE (13 hari)

| Hari | Task | Deliverable |
|------|------|-------------|
| 1 | Setup DataHub lokal + sample data + project scaffold | Dev env working |
| 2 | Build watcher.py — scan entities + collect metadata | JSON entity reports |
| 3 | Build predictor.py — health score + risk score engine | Scoring working |
| 4 | Build healer.py — auto-fix via mutations API | Write-back working |
| 5 | Build citation.py — track evidence per fix | Citation log working |
| 6 | Build runbook.py — auto-generate + save_document() | Runbooks in DataHub |
| 7 | Build agent.py — LangGraph orchestrator tying it all together | End-to-end pipeline |
| 8 | Build CLI (sentinel scan/predict/heal/report) | CLI working |
| 9 | Build Streamlit dashboard | Dashboard working |
| 10 | Build DataHub Skill (sentinel-scan) | Skill file ready |
| 11 | Testing + polish + examples/ folder | Tests pass, examples ready |
| 12 | Record demo video | YouTube video uploaded |
| 13 | README polish + submit Devpost + feedback survey | SUBMITTED |

---

## 10. ALUR BELAJAR PEMULA (Step-by-Step)

### Phase 0: Prerequisite (1 jam)
```bash
# Install Docker Desktop (kalau belum)
# buka https://docker.com/products/docker-desktop

# Install Python 3.11+
python3 --version  # pastikan 3.11+

# Install pipx (optional, buat DataHub CLI)
pip install pipx
```

### Phase 1: DataHub Setup (30 menit)
```bash
# Install DataHub CLI
pip install acryl-datahub

# Start DataHub (Docker-based, otomatis)
datahub quickstart
# Tunggu ~3-5 menit. Buka http://localhost:9002

# Load sample data
datahub datapack load showcase-ecommerce
datahub datapack load healthcare
# Buka browser, browse datasets, lihat lineage graph
```

### Phase 2: Agent Context Kit (1 jam)
```bash
pip install "datahub-agent-context[langchain]"
```

```python
# test_connection.py — jalanin ini dulu
from datahub.sdk.main_client import DataHubClient

client = DataHubClient(server="http://localhost:8080")

# Test search
from datahub_agent_context.langchain_tools import build_langchain_tools
tools = build_langchain_tools(client, include_mutations=True)
print(f"Available tools: {[t.name for t in tools]}")

# Test manual search
from datahub_agent_context.mcp_tools.search import search
results = search(client, query="patients")
print(results)
```

### Phase 3: LangChain + LangGraph (2 jam)
```bash
pip install langchain langgraph openai
```
Baca:
- LangChain quickstart: https://python.langchain.com/docs/get_started/quickstart
- LangGraph intro: https://langchain-ai.github.io/langgraph/

### Phase 4: Build (hari 2-7)
Ikuti timeline di atas. Bangun modul per modul, test per modul.

### Phase 5: Polish + Submit (hari 8-13)
Dashboard, video, README, submit.

---

## 11. RISIKO & MITIGASI

| Risiko | Probabilitas | Mitigasi |
|--------|-------------|---------|
| DataHub quickstart gagal | Low | Docker needs 8GB RAM. Fallback: mock mode |
| Agent Context Kit API berubah | Low | Pin version di requirements.txt |
| LLM API cost tinggi | Medium | Pakai GPT-4o-mini (10x lebih murah). Budget ~$5-10 total |
| Streamlit deployment gagal | Low | Fallback: CLI-only submission juga valid |
| Video recording susah | Low | QuickTime Screen Record + iMovie. 3 menit cukup |
| Waktu sempit | Medium | MVP: watcher + healer + citation dulu. Dashboard terakhir |
| Pesaing bikin hal sama | Low | Citation + prediction + runbook = 3 unique features gak ada di siapapun |

---

## 12. SUBMISSION CHECKLIST

- [ ] GitHub repo public, Apache 2.0 license visible in About section
- [ ] README.md: setup instructions, architecture diagram, features, usage
- [ ] requirements.txt atau pyproject.toml
- [ ] .env.example (gak ada secret leaked)
- [ ] examples/ folder: sample outputs (scan result, runbook, citation log)
- [ ] Demo video < 3 minutes, YouTube/Vimeo, public
- [ ] Devpost submission: URL project, repo URL, description, video
- [ ] Feedback survey completed ($50 bonus prize)
- [ ] DataHub Skill contribution (sentinel-scan) di repo

---

## 13. QUICK START (COPY-PASTE)

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/datahub-sentinel.git
cd datahub-sentinel
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# 2. Start DataHub
datahub quickstart

# 3. Load sample data
datahub datapack load showcase-ecommerce
datahub datapack load healthcare

# 4. Configure
cp .env.example .env
# Edit: DATAHUB_GMS_URL=http://localhost:8080
# Edit: OPENAI_API_KEY=sk-...

# 5. Run
sentinel scan                    # Detect + predict issues
sentinel heal --auto-approve     # Auto-fix with citations
sentinel runbook                 # Generate runbooks
sentinel dashboard               # Open Streamlit dashboard

# 6. One-command full pipeline
sentinel run --full              # scan → predict → heal → runbook → report
```

---

**Ini udah terima-jadi. Mau mulai coding? Bilang aja.**
