# ARCHIVED — DataHub Sentinel Setup Guide (Docker/Python)

> This is a historical planning document only. Do not use it as the primary setup path. The current recommended path is TypeScript/Node.js + DataHub Cloud without Docker. See `SETUP-FINAL-NO-DOCKER.md`.

---

## 1. STATUS ENVIRONMENT KAMU SEKARANG

```
HARDWARE:
├── RAM:        16 GB ✅ (cukup, DataHub butuh minimal 8GB)
├── Disk:       58 GB free ✅ (DataHub butuh ~5GB)
└── OS:         macOS

SOFTWARE:
├── Python:     3.14.0 ✅
├── Node.js:    v24.11.0 ✅
├── pip:        25.2 ✅
├── Streamlit:  1.55.0 ✅ (udah ada!)
├── Docker:     ❌ BELUM INSTALL ← KENDALA UTAMA
├── LangChain:  ❌ belum
├── LangGraph:  ❌ belum
├── OpenAI SDK: ❌ belum
└── DataHub:    ❌ belum
```

---

## 2. YANG HARUS DI-INSTALL (URUT)

### Step 1: Docker Desktop (WAJIB — DataHub jalan di Docker)
```
Download: https://www.docker.com/products/docker-desktop/
Pilih: "Mac with Apple chip" atau "Mac with Intel chip"
Install → buka → tunggu sampai whale icon ijo di menu bar
Verifikasi: docker --version
```

### Step 2: Python Dependencies
```bash
cd ~/datahub-sentinel
python3 -m venv venv
source venv/bin/activate
pip install acryl-datahub "datahub-agent-context[langchain]" langchain langgraph openai streamlit sqlite-utils
```

### Step 3: DataHub Lokal
```bash
datahub quickstart          # ~5 menit download + start
# Buka: http://localhost:9002 (UI)
# API:  http://localhost:8080 (GMS)

datahub datapack load showcase-ecommerce   # 1049 entities
datahub datapack load healthcare           # data quality issues
```

### Step 4: OpenAI API Key
```
Buka: https://platform.openai.com/api-keys
Buat key baru
Estimasi biaya: ~$3-5 total (pakai gpt-4o-mini)
```

---

## 3. DI MANA PROJECT DIJALANKAN

### Folder Lokal:
```
/Users/madaldho/datahub-sentinel/       ← PROJECT ROOT
├── venv/                                ← Python virtual environment
├── sentinel/                            ← Source code
├── streamlit_app.py                     ← Dashboard (jalanin: streamlit run streamlit_app.py)
├── cli.py                               ← CLI (jalanin: python cli.py scan)
├── .env                                 ← API keys (JANGAN commit ke GitHub)
└── ...
```

### Yang Jalan di Docker (otomatis):
```
DataHub GMS Server    → localhost:8080 (API backend)
DataHub Frontend      → localhost:9002 (Web UI)
MySQL                 → localhost:3306 (metadata storage)
Elasticsearch         → localhost:9200 (search index)
Kafka                 → localhost:9092 (event stream)
Schema Registry       → localhost:8081
```
Semua ini otomatis jalan pas `datahub quickstart`. Gak perlu setup manual.

### Yang Jalan di Lokal (kamu jalanin sendiri):
```
Sentinel CLI          → python cli.py scan / heal / runbook
Streamlit Dashboard   → streamlit run streamlit_app.py → localhost:8501
```

### Alur Data:
```
Kamu jalanin CLI/Dashboard
        ↓
Sentinel Python code
        ↓
datahub-agent-context SDK
        ↓
DataHub GMS API (localhost:8080, di Docker)
        ↓
DataHub metadata graph (MySQL + Elasticsearch, di Docker)
```

---

## 4. WIREFRAME PROMPTS UNTUK STITCH

Berikut prompt-prompt yang bisa kamu copy-paste ke Stitch (atau AI design tool lain) untuk bikin design screens.

### PROMPT 1: Dashboard Utama (Health Overview)

```
Design a dark-themed data reliability dashboard called "DataHub Sentinel".

Layout:
- Top bar: Logo "🛡️ Sentinel" on left, "Last scan: 2 min ago" on right, dark navy #0f172a background
- Below top bar: 4 metric cards in a row:
  1. "Health Score" — big number "89/100" with green circular gauge, subtitle "↑27 from last scan"
  2. "Entities Scanned" — big number "1,104", subtitle "across 2 datapacks"
  3. "Issues Found" — big number "47", subtitle "12 critical, 23 warning"
  4. "Auto-Fixed" — big number "35", subtitle "12 need human review"

- Middle section (2 columns):
  Left: Line chart "Health Score Trend" showing score going from 62 → 75 → 89 over 3 scan dates
  Right: Heatmap grid "Risk Heatmap" with colored squares (red/orange/yellow/green) representing entities

- Bottom section (full width):
  Table "Top 10 At-Risk Entities" with columns:
  | Entity Name | Health | Risk | Prediction (7d) | Issues | Status |
  | healthcare.patients | 45/100 | 92 | 87% incident | No owner, no desc | 🔴 Critical |
  | ecommerce.raw_events | 58/100 | 78 | 72% stale | Freshness declining | 🟠 Warning |
  ...

Color scheme: Dark background #0f172a, cards #1e293b, accent green #22c55e, warning amber #f59e0b, critical red #ef4444
Font: Inter or system sans-serif
Style: Clean, minimal, similar to Datadog or Grafana dark mode
Dimensions: 1440x900 desktop web app
```

### PROMPT 2: Scan Results Page

```
Design a scan results page for "DataHub Sentinel" data reliability tool.

Dark theme (#0f172a background).

Layout:
- Top: Breadcrumb "Sentinel > Scan Results > 2026-08-01 10:05"
- Summary bar: "47 issues found" with severity breakdown pills: "12 Critical" (red), "15 Warning" (amber), "20 Info" (blue)

- Main content: Card list of issues, each card contains:
  ┌────────────────────────────────────────────────────┐
  │ 🔴 CRITICAL                        healthcare.patients │
  │                                                        │
  │ Issue: Missing owner                                   │
  │ Risk: 92/100 — 87% chance of incident in 7 days       │
  │                                                        │
  │ Impact: 3 downstream dashboards, 1 ML feature          │
  │                                                        │
  │ Recommended: Assign @dr.smith (67% confidence)         │
  │ Evidence: 2/3 upstream datasets owned by @dr.smith     │
  │                                                        │
  │ [Auto-Fix] [View Runbook] [Dismiss]                    │
  └────────────────────────────────────────────────────────┘

- Show 5-6 issue cards with varying severity (critical, warning, info)
- Each card has left border color matching severity
- Buttons: "Auto-Fix All" (green), "Export Report" (outline) at top right

Dimensions: 1440x900
Style: Similar to Linear.app issue list or GitHub security alerts, dark mode
```

### PROMPT 3: Runbook Viewer

```
Design a runbook viewer page for "DataHub Sentinel".

Dark theme (#0f172a background).

Layout:
- Left sidebar (250px): List of runbooks
  - "healthcare.patients — Missing Owner" (active, highlighted)
  - "ecommerce.raw_events — Stale Data"
  - "ecommerce.stg_orders — Schema Drift"
  - ... 8 more items

- Main content (right): Selected runbook displayed as formatted document

  ┌──────────────────────────────────────────────────────────┐
  │ 📋 Runbook: healthcare.patients — Missing Owner           │
  │                                                            │
  │ CONDITION                                                  │
  │ Dataset has 3+ downstream dependents but no assigned owner │
  │                                                            │
  │ RISK ASSESSMENT                                           │
  │ ┌─────────────────────────────────────────┐               │
  │ │ Risk Level:  🔴 HIGH                     │               │
  │ │ Downstream:  3 dashboards, 1 ML feature  │               │
  │ │ Probability: 87% incident in 7 days      │               │
  │ └─────────────────────────────────────────┘               │
  │                                                            │
  │ RECOMMENDED ACTION                                        │
  │ Assign @dr.smith as owner                                  │
  │ Confidence: 67%                                            │
  │                                                            │
  │ EVIDENCE                                                   │
  │ 1. ✓ Upstream raw.patient_records → owner: @dr.smith      │
  │ 2. ✓ Upstream raw.lab_results → owner: @dr.smith          │
  │ 3. ✗ Upstream raw.prescriptions → owner: @nurse.jones     │
  │                                                            │
  │ STATUS                                                     │
  │ ✅ Auto-applied at 2026-08-01 10:05:00                    │
  │ Citation ID: CIT-2026-08-01-001                            │
  │                                                            │
  │ [View in DataHub] [Revert Fix] [Approve]                   │
  └──────────────────────────────────────────────────────────┘

Dimensions: 1440x900
Style: Documentation/wiki style, like Notion page in dark mode
```

### PROMPT 4: Citation Trail Page

```
Design a citation trail page for "DataHub Sentinel" — shows evidence trail for every automated fix.

Dark theme (#0f172a background).

Layout:
- Top: "Citation Trail" title, filter dropdown "All / Descriptions / Owners / Tags"

- Timeline view (vertical), each entry:

  ┌─ 10:05:12 ──────────────────────────────────────────────┐
  │ 📝 Description Added                                      │
  │ Entity: healthcare.patients                                │
  │                                                            │
  │ Generated: "Patient records table containing patient_id,  │
  │ diagnosis codes, lab results, and treatment history..."    │
  │                                                            │
  │ Citation:                                                  │
  │ ├── Method: schema_inference                               │
  │ ├── Source columns: patient_id, diagnosis, lab_result,     │
  │ │   treatment_date, physician_id                           │
  │ ├── Lineage context: raw.patient_records → patients        │
  │ ├── Confidence: 88%                                        │
  │ └── Model: gpt-4o-mini                                     │
  │                                                            │
  │ [View in DataHub] [Edit] [Revert]                          │
  └────────────────────────────────────────────────────────────┘

  ┌─ 10:05:15 ──────────────────────────────────────────────┐
  │ 👤 Owner Assigned                                         │
  │ Entity: healthcare.patients                                │
  │ Assigned: @dr.smith                                        │
  │                                                            │
  │ Citation:                                                  │
  │ ├── Method: lineage_inference                              │
  │ ├── Evidence: 2/3 upstream owned by @dr.smith              │
  │ ├── Confidence: 67%                                        │
  │ └── Model: gpt-4o-mini                                     │
  └────────────────────────────────────────────────────────────┘

Show 4-5 entries. Color-code by type (blue=description, purple=owner, green=tag).
Dimensions: 1440x900
Style: Git log / audit trail style, clean and scannable
```

### PROMPT 5: CLI Output Screenshot (untuk README)

```
Design a terminal screenshot showing DataHub Sentinel CLI output.

Dark terminal background (#1a1b26, Tokyo Night theme).

Show this exact output with syntax highlighting:

$ sentinel run --full

🛡️ DataHub Sentinel v1.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📡 WATCH — Scanning DataHub...
   Found 1,104 entities across 2 datapacks
   ✓ Schemas loaded     ✓ Lineage mapped     ✓ Owners checked

📊 PREDICT — Analyzing risks...
   Average Health Score: 62/100
   Entities at risk:     23 (score > 70)
   Critical:             5  (score > 90)

   🔮 Top predictions (next 7 days):
   ⚠️  healthcare.patients     87% incident (no owner, 3 downstream)
   ⚠️  ecommerce.raw_events   72% staleness (update rate ↓3x)
   ⚠️  ecommerce.stg_orders   65% breakage (undocumented drift)

🔧 HEAL — Applying fixes...
   ✅ 12 descriptions added (schema-inferred, avg confidence: 85%)
   ✅  8 owners assigned    (lineage-inferred, avg confidence: 72%)
   ✅ 15 tags classified    (column-pattern, avg confidence: 91%)
   ⏭️  12 skipped           (need human review)

📋 RUNBOOK — Generating documentation...
   ✅ 23 runbooks generated → saved to DataHub as documents

📈 REPORT
   Health Score: 62 → 89 (+27) 🎉
   Issues fixed: 35/47
   Citations logged: 35
   Runbooks created: 23

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ All changes written back to DataHub
🔗 Dashboard: http://localhost:8501

Terminal dimensions: 800x600
Font: JetBrains Mono or Fira Code
Use colored emoji and ANSI-style colored text (green for success, yellow for warning, red for critical)
```

### PROMPT 6: Architecture Diagram

```
Design a clean architecture diagram for "DataHub Sentinel".

Dark background (#0f172a), white/light text.

Show this flow (left to right):

[DataHub Instance]
  (Docker container)
  Contains: Metadata Graph
  - 1,104 entities
  - Lineage, schemas
  - Owners, tags
       ↕ (bidirectional arrow, labeled "Agent Context Kit API")

[Sentinel Agent]
  (Python, LangGraph)
  4 modules stacked vertically:
  1. 🔍 Watcher — scan entities
  2. 🔮 Predictor — health + risk scores
  3. 🔧 Healer — auto-fix + citations
  4. 📋 Runbook — generate docs
       ↓

[Outputs] (3 items side by side):
  1. 📊 Streamlit Dashboard (localhost:8501)
  2. 📄 Runbooks (saved in DataHub)
  3. 📋 Citation Log (SQLite)

Additional labels:
- Arrow from Healer back to DataHub labeled "Write-back: descriptions, owners, tags, documents"
- Arrow from Watcher to DataHub labeled "Read: search, lineage, entities"
- Small label on Sentinel: "LLM: GPT-4o-mini"

Style: Clean boxes with rounded corners, subtle gradients, connecting arrows with labels
Similar to: Vercel or Supabase architecture diagrams
Dimensions: 1200x600 (landscape, for README embed)
```

### PROMPT 7: Logo

```
Design a minimal logo for "DataHub Sentinel".

Concept: A shield (🛡️) shape with a data/graph node pattern inside it.
- Shield outline: gradient from blue (#3b82f6) to green (#22c55e)
- Inside shield: 3-4 small connected circles (representing data lineage graph)
- Below or right of shield: "SENTINEL" text, clean sans-serif, letter-spaced

Style: Minimal, tech, similar to Vercel/Linear/Supabase logo aesthetic
Background: Transparent (PNG)
Dimensions: 512x512 for icon, also provide 200x60 horizontal version for README header

No realistic elements, no 3D, pure flat/minimal design.
```

---

## 5. FOLDER STRUCTURE LENGKAP (SUDAH SIAP)

```
/Users/madaldho/datahub-sentinel/
│
├── README.md                          # Main documentation
├── LICENSE                            # Apache 2.0
├── requirements.txt                   # Python dependencies
├── pyproject.toml                     # Package metadata
├── .env.example                       # Template for API keys
├── .gitignore                         # Ignore venv, .env, __pycache__
│
├── design/                            # ← TARUH HASIL STITCH DI SINI
│   ├── dashboard-main.png             # Prompt 1 result
│   ├── scan-results.png               # Prompt 2 result
│   ├── runbook-viewer.png             # Prompt 3 result
│   ├── citation-trail.png             # Prompt 4 result
│   ├── cli-screenshot.png             # Prompt 5 result
│   ├── architecture-diagram.png       # Prompt 6 result
│   └── logo.png                       # Prompt 7 result
│
├── sentinel/                          # Source code
│   ├── __init__.py
│   ├── agent.py                       # LangGraph orchestrator
│   ├── watcher.py                     # Scan DataHub
│   ├── predictor.py                   # Health + risk scoring
│   ├── healer.py                      # Auto-fix + mutations
│   ├── citation.py                    # Citation tracking
│   ├── runbook.py                     # Runbook generation
│   ├── reporter.py                    # Report generation
│   ├── db.py                          # SQLite state
│   ├── config.py                      # Config management
│   ├── tools/
│   │   ├── __init__.py
│   │   └── datahub_tools.py           # Agent Context Kit wrapper
│   └── prompts/
│       ├── description_gen.txt
│       ├── owner_inference.txt
│       ├── risk_analysis.txt
│       └── runbook_gen.txt
│
├── streamlit_app.py                   # Dashboard UI
├── cli.py                             # CLI entry point
│
├── examples/                          # Sample outputs for judges
│   ├── demo_scan_output.json
│   ├── demo_runbook.md
│   ├── demo_citations.json
│   ├── demo_health_trend.json
│   └── screenshots/
│       ├── dashboard.png
│       ├── before_scan.png
│       └── after_heal.png
│
├── tests/
│   ├── test_watcher.py
│   ├── test_predictor.py
│   ├── test_healer.py
│   ├── test_citation.py
│   └── test_runbook.py
│
├── skills/                            # DataHub Skill contribution
│   └── sentinel-scan/
│       ├── SKILL.md
│       └── commands/
│           └── sentinel-scan.md
│
└── .github/
    └── workflows/
        └── sentinel-cron.yml          # CI: daily scan
```

---

## 6. CHECKLIST LENGKAP (SEBELUM CODING)

### 🔧 INSTALL (1x aja)

- [ ] Install Docker Desktop → https://docker.com/products/docker-desktop
- [ ] Buka Docker, tunggu sampai running (whale icon ijo)
- [ ] Buat OpenAI API key → https://platform.openai.com/api-keys
- [ ] Register Devpost → https://devpost.com/
- [ ] Join hackathon → https://datahub.devpost.com/ klik "Join Hackathon"

### 📁 PROJECT SETUP (1x aja)

- [ ] Buat folder: mkdir -p ~/datahub-sentinel
- [ ] Buat venv: cd ~/datahub-sentinel && python3 -m venv venv
- [ ] Activate: source venv/bin/activate
- [ ] Install deps: pip install (lihat requirements.txt)
- [ ] Copy .env.example → .env, isi API keys
- [ ] Git init + push ke GitHub (public, Apache 2.0)

### 🐳 DATAHUB (1x setup, jalanin tiap coding session)

- [ ] datahub quickstart (pertama kali, ~5 menit)
- [ ] datahub datapack load showcase-ecommerce
- [ ] datahub datapack load healthcare
- [ ] Buka http://localhost:9002 → pastikan jalan
- [ ] Test API: curl http://localhost:8080/config → pastikan response OK

### 🎨 DESIGN (sebelum coding)

- [ ] Generate 7 design assets dari Stitch (lihat prompts di atas)
- [ ] Taruh di ~/datahub-sentinel/design/
- [ ] Review: desain udah sesuai flow?

### 💻 CODING (hari 2-11)

- [ ] watcher.py — scan entities, output issues JSON
- [ ] predictor.py — health score + risk score
- [ ] healer.py — auto-fix via mutations API
- [ ] citation.py — log evidence per fix
- [ ] runbook.py — generate + save_document()
- [ ] agent.py — LangGraph orchestrator
- [ ] cli.py — CLI interface
- [ ] streamlit_app.py — dashboard
- [ ] tests/ — minimal tests

### 📹 VIDEO (hari 12)

- [ ] Script: ikuti demo script di PRD (3 menit)
- [ ] Record: QuickTime Player → File → New Screen Recording
- [ ] Edit: iMovie (trim, add text overlay kalau perlu)
- [ ] Upload: YouTube, set "Public" or "Unlisted"
- [ ] Copy YouTube URL

### 📦 SUBMIT (hari 13)

- [ ] GitHub repo: public, Apache 2.0 license visible di About section
- [ ] README.md lengkap: setup, architecture, features, usage, screenshots
- [ ] examples/ folder ada sample outputs
- [ ] Devpost submission:
  - [ ] Project URL (GitHub)
  - [ ] Demo video URL (YouTube)
  - [ ] Text description
  - [ ] Select challenge category
  - [ ] Select DataHub technologies used
- [ ] Fill feedback survey (buat $50 bonus prize)

---

## 7. KEBUTUHAN BIAYA

| Item | Biaya | Catatan |
|------|-------|---------|
| Docker Desktop | Gratis | Personal use |
| DataHub | Gratis | Open source |
| OpenAI API | ~$3-5 | gpt-4o-mini, ~1M tokens development |
| Streamlit hosting | Gratis | share.streamlit.io |
| GitHub | Gratis | Public repo |
| YouTube | Gratis | Upload video |
| Devpost | Gratis | Register + submit |
| **TOTAL** | **~$3-5 (~Rp50-80rb)** | |

---

## 8. POTENSI KENDALA & SOLUSI

| Kendala | Solusi |
|---------|--------|
| Docker makan RAM banyak | Tutup app lain pas development. DataHub butuh ~4-6GB |
| DataHub quickstart gagal | Restart Docker, coba lagi. Atau pakai `datahub quickstart --quickstart-compose-file` |
| Python 3.14 incompatible | Kemungkinan kecil. Fallback: install Python 3.12 via pyenv |
| OpenAI API rate limit | Pakai gpt-4o-mini, rate limit jauh lebih tinggi |
| Streamlit dashboard lemot | Streamlit cache (@st.cache_data), limit data yg di-render |
| Video recording jelek | QuickTime + zoom in terminal font size ke 16pt |
| Gak sempat semua fitur | MVP: watcher + healer + citation. Skip dashboard kalau kepepet |

---

## 9. URUTAN KERJA YANG OPTIMAL

```
HARI 1 (PREP):
├── Install Docker Desktop
├── datahub quickstart + load data
├── Test koneksi Python → DataHub
├── Generate design di Stitch (7 prompts)
└── Git init + push skeleton ke GitHub

HARI 2-3 (CORE ENGINE):
├── watcher.py → scan semua entities
├── predictor.py → health score + risk score
└── Test: jalanin scan, pastikan output JSON benar

HARI 4-5 (HEALING):
├── healer.py → auto-fix via mutations
├── citation.py → log evidence
└── Test: fix 1 entity, cek di DataHub UI udah berubah

HARI 6-7 (RUNBOOK + ORCHESTRATOR):
├── runbook.py → generate + save_document()
├── agent.py → LangGraph tying everything together
└── Test: full pipeline end-to-end

HARI 8-9 (CLI + DASHBOARD):
├── cli.py → sentinel scan / heal / runbook / dashboard
├── streamlit_app.py → 4 pages (overview, scan, runbook, citation)
└── Test: full flow from CLI and dashboard

HARI 10-11 (POLISH):
├── Tests (pytest)
├── examples/ folder
├── README.md (setup, architecture, screenshots)
├── DataHub Skill contribution
└── Edge case handling

HARI 12 (VIDEO):
├── Rehearse demo 2x
├── Record screen (QuickTime)
├── Edit (iMovie, max 3 min)
└── Upload YouTube

HARI 13 (SUBMIT):
├── Final README polish
├── Push semua ke GitHub
├── Submit di Devpost
└── Fill feedback survey ($50)
```
