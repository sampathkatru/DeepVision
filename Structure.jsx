import { useState, useEffect, useRef } from "react";

const diagrams = [
  {
    id: "overview",
    label: "System Overview",
    icon: "⬡",
    color: "#00d4ff",
    description: "High-level architecture: how Frontend, Backend, ML Service, and Database interact.",
    code: `graph TD
    Browser["🖥️ React Frontend\n(Port 3000)"]
    Backend["⚙️ Node/Express Backend\n(Port 5000)"]
    ML["🧠 ML Service\nFastAPI (Port 8000)"]
    DB[("🗄️ MongoDB")]
    Firebase["🔥 Firebase\nGoogle OAuth"]
    FileStore["📁 File Storage\n/uploads/scans"]

    Browser -->|"REST API calls\n(JWT Bearer)"| Backend
    Browser -->|"Google Sign-In"| Firebase
    Firebase -->|"ID Token"| Backend
    Backend -->|"Mongoose ODM"| DB
    Backend -->|"Image file upload\nmultipart/form-data"| ML
    ML -->|"Predictions + GradCAM"| Backend
    Backend -->|"Store images"| FileStore
    Backend -->|"Serve static files"| Browser`
  },
  {
    id: "models",
    label: "Data Models",
    icon: "◈",
    color: "#a78bfa",
    description: "MongoDB schemas, embedded documents, and relationships between all collections.",
    code: `classDiagram
    class User {
        +ObjectId _id
        +String name
        +String email
        +String password
        +role: patient|doctor|admin
        +String firebaseUid
        +String avatar
        +Boolean isActive
        +matchPassword(entered) Boolean
    }

    class Patient {
        +ObjectId _id
        +String name
        +Number age
        +gender: Male|Female|Other
        +String phone
        +String patientId
    }

    class MedicalHistory {
        +Boolean diabetes
        +Boolean hypertension
        +Boolean familyGlaucoma
        +Boolean familyCataract
        +String currentMeds
    }

    class Scan {
        +ObjectId _id
        +String imagePath
        +String imageUrl
        +String[] diseaseTypes
        +Number threshold
        +status: pending|processing|completed|failed
        +String clinicianName
        +Date examDate
    }

    class Report {
        +ObjectId _id
        +String doctorNotes
        +String pdfPath
    }

    class DiseaseResult {
        +String disease
        +String prediction
        +Number confidence
        +Map probabilities
        +String gradcam
    }

    Patient "1" *-- "1" MedicalHistory : embeds
    Report "1" *-- "1..*" DiseaseResult : embeds
    User "1" --> "0..*" Patient : createdBy
    Patient "1" --> "0..1" User : userId
    Patient "1" --> "0..*" Scan : has
    Patient "1" --> "0..*" Report : has
    Scan "1" --> "1" Report : generates
    User "1" --> "0..*" Scan : uploadedBy
    User "1" --> "0..*" Report : createdBy`
  },
  {
    id: "backend",
    label: "Backend API",
    icon: "⬡",
    color: "#34d399",
    description: "Express routes, controllers, middleware chain, and service layer.",
    code: `graph LR
    subgraph MW ["🔐 Middleware"]
        Auth["protect()\nJWT Verify"]
        RoleGuard["requireDoctor()\nRole Guard"]
        Upload["upload.single()\nMulter"]
    end

    subgraph ROUTES ["📡 Routes"]
        R1["/api/auth"]
        R2["/api/patients"]
        R3["/api/scans"]
        R4["/api/reports"]
    end

    subgraph CTRL ["🎮 Controllers"]
        C1["AuthController\nregister · login\nfirebaseAuth · getMe"]
        C2["PatientController\ngetPatients · createPatient\ngetPatient · updatePatient"]
        C3["ScanController\nuploadScan\ngetPatientScans"]
        C4["ReportController\ngetAllReports · getReport\ngetPatientReports\nupdateNotes · downloadPDF"]
    end

    subgraph SVC ["🛠 Services"]
        PDF["PDFService\ngenerateReport()"]
        ML2["ML Service\nHTTP calls"]
    end

    R1 --> C1
    R2 --> Auth --> C2
    R3 --> Auth --> Upload --> C3
    R4 --> Auth --> C4
    R4 --> RoleGuard --> C4
    C3 --> ML2
    C4 --> PDF`
  },
  {
    id: "ml",
    label: "ML Service",
    icon: "◉",
    color: "#f59e0b",
    description: "FastAPI ML microservice: prediction endpoints, model inference, and GradCAM heatmaps.",
    code: `graph TD
    subgraph API ["🌐 FastAPI Endpoints"]
        EP1["POST /predict/glaucoma"]
        EP2["POST /predict/cataract"]
        EP3["POST /predict/dr"]
        EP4["POST /predict/all"]
    end

    subgraph PREP ["⚙️ Preprocessing"]
        PRE["Preprocessor\nresize · normalize\nto_tensor"]
    end

    subgraph INFER ["🧠 Inference"]
        G["GlaucomaPredictor\npredict_glaucoma()"]
        C["CataractPredictor\npredict_cataract()"]
        D["DRPredictor\npredict_dr()"]
    end

    subgraph HEAT ["🌡️ Explainability"]
        GC["GradCAM\ngenerate_heatmap()\n→ base64 PNG"]
    end

    subgraph OUT ["📤 Response"]
        RES["JSON Response\nprediction · confidence\nprobabilities · gradcam"]
    end

    EP1 --> PRE --> G --> GC --> RES
    EP2 --> PRE --> C --> GC --> RES
    EP3 --> PRE --> D --> GC --> RES
    EP4 --> PRE
    PRE --> G & C & D`
  },
  {
    id: "frontend",
    label: "Frontend",
    icon: "◧",
    color: "#f472b6",
    description: "React pages, routing, shared services, and Firebase integration.",
    code: `graph TD
    subgraph AUTH ["🔐 Auth"]
        LP["LoginPage\nEmail / Google OAuth"]
        FB["FirebaseService\nsignInWithGoogle()"]
    end

    subgraph PAGES ["📄 Pages"]
        DB["Dashboard\nStats & Overview"]
        PR["PatientRegister\nNew Patient Form"]
        PH["PatientHistory\nPatient List Table"]
        US["UploadScan\nImage + Disease Select"]
        RV["ReportViewer\nResults + GradCAM"]
        DP["DoctorPanel\nAll Reports View"]
    end

    subgraph SVC ["🔌 Services"]
        API["APIService\naxios instance\n+ auth interceptor"]
    end

    subgraph BACK ["⚙️ Backend REST"]
        BA["/api/auth"]
        BP["/api/patients"]
        BS["/api/scans"]
        BR["/api/reports"]
    end

    LP --> FB
    LP --> API --> BA
    DB --> API --> BP
    PR --> API
    PH --> API
    US --> API --> BS
    RV --> API --> BR
    DP --> API`
  },
  {
    id: "auth",
    label: "Auth Flow",
    icon: "◎",
    color: "#fb923c",
    description: "Complete authentication flow: email/password registration, login, and Google OAuth via Firebase.",
    code: `sequenceDiagram
    actor U as User
    participant FE as React Frontend
    participant FB as Firebase
    participant BE as Express Backend
    participant DB as MongoDB

    Note over U,DB: Email / Password Flow
    U->>FE: Fill register form
    FE->>BE: POST /api/auth/register
    BE->>DB: Save User (bcrypt hash)
    DB-->>BE: User doc
    BE-->>FE: JWT token

    Note over U,DB: Google OAuth Flow
    U->>FE: Click "Sign in with Google"
    FE->>FB: signInWithGoogle()
    FB-->>FE: Firebase ID Token
    FE->>BE: POST /api/auth/firebase {idToken}
    BE->>FB: Verify ID Token
    FB-->>BE: Decoded user info
    BE->>DB: findOrCreate User
    DB-->>BE: User doc
    BE-->>FE: JWT token

    Note over U,DB: Protected Request
    U->>FE: Navigate to /patients
    FE->>BE: GET /api/patients Bearer JWT
    BE->>BE: protect() middleware
    BE->>DB: Find user by decoded ID
    DB-->>BE: User doc
    BE-->>FE: Patients list`
  }
];

export default function App() {
  const [active, setActive] = useState("overview");
  const [rendered, setRendered] = useState({});
  const containerRef = useRef(null);

  const current = diagrams.find(d => d.id === active);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js";
    script.onload = () => {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          background: "#0f1117",
          primaryColor: "#1e2330",
          primaryTextColor: "#e2e8f0",
          primaryBorderColor: "#334155",
          lineColor: "#64748b",
          secondaryColor: "#1a2035",
          tertiaryColor: "#151c2c",
          edgeLabelBackground: "#1e2330",
          clusterBkg: "#151c2c",
          clusterBorder: "#334155",
          titleColor: "#94a3b8",
          attributeBackgroundColorEven: "#1e2330",
          attributeBackgroundColorOdd: "#151c2c",
          nodeBorder: "#334155",
          mainBkg: "#1e2330",
        },
        flowchart: { curve: "basis", padding: 20 },
        sequence: { actorMargin: 60, messageMargin: 40 },
      });
      renderAll();
    };
    document.head.appendChild(script);
  }, []);

  const renderAll = async () => {
    if (!window.mermaid) return;
    const results = {};
    for (const d of diagrams) {
      try {
        const id = `mermaid-${d.id}-${Date.now()}`;
        const { svg } = await window.mermaid.render(id, d.code);
        results[d.id] = svg;
      } catch (e) {
        results[d.id] = `<p style="color:#f87171;padding:1rem">Error rendering diagram: ${e.message}</p>`;
      }
    }
    setRendered(results);
  };

  useEffect(() => {
    if (window.mermaid && Object.keys(rendered).length === 0) {
      renderAll();
    }
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080c14",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      color: "#e2e8f0",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <header style={{
        padding: "1.5rem 2rem 1rem",
        borderBottom: "1px solid #1e2d45",
        background: "linear-gradient(180deg, #0d1525 0%, #080c14 100%)",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: "linear-gradient(135deg, #00d4ff22, #a78bfa22)",
          border: "1px solid #00d4ff44",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>👁</div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.05em", color: "#e2e8f0" }}>
            EYEAI — UML Architecture
          </h1>
          <p style={{ margin: 0, fontSize: "0.7rem", color: "#475569", letterSpacing: "0.08em" }}>
            SYSTEM DESIGN DOCUMENTATION
          </p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
          {["#ff5f57","#ffbd2e","#28c840"].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
      </header>

      {/* Tab Bar */}
      <nav style={{
        display: "flex",
        overflowX: "auto",
        background: "#0a0f1a",
        borderBottom: "1px solid #1e2d45",
        padding: "0 1rem",
        gap: "0",
        scrollbarWidth: "none",
      }}>
        {diagrams.map(d => (
          <button key={d.id} onClick={() => setActive(d.id)} style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.9rem 1.2rem",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.07em",
            whiteSpace: "nowrap",
            color: active === d.id ? d.color : "#475569",
            borderBottom: active === d.id ? `2px solid ${d.color}` : "2px solid transparent",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}>
            <span style={{ fontSize: "0.9rem" }}>{d.icon}</span>
            {d.label.toUpperCase()}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", padding: "1.5rem 2rem" }}>
        {/* Description bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          marginBottom: "1.5rem",
          padding: "0.8rem 1.2rem",
          background: "#0d1525",
          border: `1px solid ${current.color}22`,
          borderLeft: `3px solid ${current.color}`,
          borderRadius: "0 8px 8px 0",
        }}>
          <span style={{ fontSize: "1.2rem" }}>{current.icon}</span>
          <div>
            <div style={{ fontSize: "0.65rem", color: current.color, letterSpacing: "0.1em", fontWeight: 700, marginBottom: 2 }}>
              {current.label.toUpperCase()}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{current.description}</div>
          </div>
          <div style={{
            marginLeft: "auto",
            fontSize: "0.65rem",
            color: "#334155",
            letterSpacing: "0.05em",
          }}>
            {diagrams.findIndex(d => d.id === active) + 1} / {diagrams.length}
          </div>
        </div>

        {/* Diagram Area */}
        <div style={{
          flex: 1,
          background: "#0d1525",
          border: "1px solid #1e2d45",
          borderRadius: 12,
          overflow: "auto",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "2rem",
          minHeight: 400,
          position: "relative",
        }}>
          {!rendered[active] ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              height: 300,
              color: "#334155",
            }}>
              <div style={{
                width: 40, height: 40,
                border: `2px solid ${current.color}44`,
                borderTop: `2px solid ${current.color}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }} />
              <span style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}>RENDERING DIAGRAM...</span>
            </div>
          ) : (
            <div
              ref={containerRef}
              style={{ width: "100%", maxWidth: 900 }}
              dangerouslySetInnerHTML={{ __html: rendered[active] }}
            />
          )}
        </div>

        {/* Navigation dots */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.5rem",
          marginTop: "1.2rem",
        }}>
          {diagrams.map(d => (
            <button key={d.id} onClick={() => setActive(d.id)} style={{
              width: active === d.id ? 24 : 8,
              height: 8,
              borderRadius: 4,
              border: "none",
              background: active === d.id ? d.color : "#1e2d45",
              cursor: "pointer",
              transition: "all 0.3s",
              padding: 0,
            }} />
          ))}
        </div>

        {/* Nav buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
          {(() => {
            const idx = diagrams.findIndex(d => d.id === active);
            const prev = diagrams[idx - 1];
            const next = diagrams[idx + 1];
            return (
              <>
                <button onClick={() => prev && setActive(prev.id)} disabled={!prev} style={{
                  background: "none",
                  border: `1px solid ${prev ? "#1e2d45" : "transparent"}`,
                  borderRadius: 6,
                  padding: "0.5rem 1rem",
                  color: prev ? "#64748b" : "transparent",
                  cursor: prev ? "pointer" : "default",
                  fontSize: "0.7rem",
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: "0.05em",
                  display: "flex", alignItems: "center", gap: "0.4rem",
                }}>← {prev?.label.toUpperCase()}</button>
                <button onClick={() => next && setActive(next.id)} disabled={!next} style={{
                  background: "none",
                  border: `1px solid ${next ? next.color + "44" : "transparent"}`,
                  borderRadius: 6,
                  padding: "0.5rem 1rem",
                  color: next ? next.color : "transparent",
                  cursor: next ? "pointer" : "default",
                  fontSize: "0.7rem",
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: "0.05em",
                  display: "flex", alignItems: "center", gap: "0.4rem",
                }}>{next?.label.toUpperCase()} →</button>
              </>
            );
          })()}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #080c14; }
        ::-webkit-scrollbar-thumb { background: #1e2d45; border-radius: 2px; }
        .mermaid svg { max-width: 100%; height: auto; }
        nav::-webkit-scrollbar { height: 0; }
      `}</style>
    </div>
  );
}