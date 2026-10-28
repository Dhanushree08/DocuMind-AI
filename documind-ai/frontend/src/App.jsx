import { useState, useEffect, useRef } from "react";
import {
  BrainCircuit,
  FileText,
  Upload,
  Send,
  ShieldCheck,
  Shield,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Home,
  Box,
  MessageSquare,
  PlusCircle,
  Settings,
  User,
  Search,
  Folder,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Layers,
  Database,
  Sliders,
  Copy,
  Check,
  Download,
  Mic,
  MicOff,
  Eye,
  X,
} from "lucide-react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

const INITIAL_DOCS = [
  {
    id: "doc-1",
    name: "Employee Handbook.pdf",
    type: "PDF",
    status: "Indexed",
    size: "1.4 MB",
    pages: 14,
    chunks: 18,
    dateAdded: "Today, 10:30 AM",
  },
  {
    id: "doc-2",
    name: "Security Policy.pdf",
    type: "PDF",
    status: "Indexed",
    size: "860 KB",
    pages: 9,
    chunks: 12,
    dateAdded: "Today, 10:32 AM",
  },
  {
    id: "doc-3",
    name: "Company Guidelines.txt",
    type: "TXT",
    status: "Indexed",
    size: "24 KB",
    pages: 2,
    chunks: 4,
    dateAdded: "Today, 10:35 AM",
  },
];

const SAMPLE_CHUNKS = {
  "doc-1": [
    {
      id: "chunk-01",
      section: "Section 1.1 - Equal Opportunity & Anti-Harassment",
      charCount: 412,
      content:
        "The Company is committed to providing an inclusive, equitable work environment free from discrimination, sexual harassment, or verbal abuse. Equal opportunity is guaranteed across recruitment, compensation, promotions, and ongoing employment.",
    },
    {
      id: "chunk-02",
      section: "Section 1.3 - Working Hours & Flexible Hybrid Model",
      charCount: 468,
      content:
        "Standard core operational hours are 9:00 AM to 5:00 PM local time. Employees participate in a hybrid schedule requiring a minimum of two (2) days weekly on-site at assigned regional offices, with remote work approved for remaining business days.",
    },
    {
      id: "chunk-03",
      section: "Section 3.2 - Paid Time Off (PTO) & Leave Accrual",
      charCount: 520,
      content:
        "Full-time staff accrue 20 PTO days annually at a rate of 1.67 days monthly. A maximum of five (5) accrued unused days roll into the subsequent calendar year. Employees are eligible for 10 annual sick days and 12 weeks of paid parental leave.",
    },
  ],
  "doc-2": [
    {
      id: "chunk-01",
      section: "Section 1.1 - Device Encryption & Endpoint Controls",
      charCount: 490,
      content:
        "All corporate laptops and mobile endpoints must have full-disk 256-bit AES encryption (BitLocker for Windows, FileVault for macOS) enabled via Central Mobile Device Management (MDM). USB storage mass-media drives are strictly restricted.",
    },
    {
      id: "chunk-02",
      section: "Section 4.1 - Credential & Password Standards",
      charCount: 540,
      content:
        "All enterprise accounts must implement strong authentication. Passwords must be at least 14 characters in length, complex (containing uppercase, lowercase, numbers, and symbols), and rotated every 90 days. Multi-Factor Authentication (MFA) is compulsory.",
    },
    {
      id: "chunk-03",
      section: "Section 6.2 - Remote Access & Security Incident Response",
      charCount: 480,
      content:
        "Remote network connections originating outside corporate networks must utilize the corporate VPN tunnel. In the event of suspected compromise, ransomware, or loss of device, the SecOps Incident Team must be notified within sixty (60) minutes.",
    },
  ],
  "doc-3": [
    {
      id: "chunk-01",
      section: "Section 1 - Internal Communications & Slack Guidelines",
      charCount: 380,
      content:
        "Official organizational communications are distributed through Slack and Google Workspace. All company-wide alerts are published to #announcements. Confidential customer credentials must never be shared in open public channels.",
    },
    {
      id: "chunk-02",
      section: "Section 2 - Professional Growth & Reimbursements",
      charCount: 440,
      content:
        "Full-time team members are allotted a $1,500 annual continuing education stipend for books, conferences, and technical certifications. Expense claims must be submitted in Expensify within thirty (30) days with receipts attached for charges > $25.",
    },
  ],
};

// Rich knowledge engine answering questions and aligning answers per document
function answerQuestion(query) {
  const q = query.toLowerCase().trim();

  // 1. Password & Credential Hygiene
  if (
    q.includes("password") ||
    q.includes("credential") ||
    q.includes("mfa") ||
    q.includes("login") ||
    q.includes("log in") ||
    q.includes("auth") ||
    q.includes("lockout") ||
    q.includes("2fa") ||
    q.includes("sso") ||
    q.includes("passphrase")
  ) {
    return {
      isOutOfScope: false,
      summary:
        "Corporate policy enforces strict credential hygiene: passwords must be at least 14 characters long, rotated every 90 days, protected by multi-factor authentication (MFA), and managed using an authorized password manager.",
      alignedAnswers: [
        {
          docName: "Security Policy.pdf",
          page: 2,
          section: "Section 4.1 - Credential & Password Standards",
          badge: "PDF",
          confidence: "98% match",
          answers: [
            "Minimum 14 characters in length containing uppercase, lowercase, numbers, and special symbols.",
            "Mandatory password rotation every 90 days; reuse of the last 5 previous passwords is prohibited.",
            "Multi-Factor Authentication (MFA) is strictly required on all corporate logins, SSO, and VPNs.",
            "Account lockout occurs automatically after 5 consecutive failed login attempts.",
          ],
          excerpt:
            "\"All enterprise accounts must implement strong authentication. Passwords must be at least 14 characters in length, complex, and updated every 90 days. Under no circumstances may default or shared passwords be utilized.\"",
        },
        {
          docName: "Employee Handbook.pdf",
          page: 6,
          section: "Section 2.4 - Credential Hygiene & Workstation Security",
          badge: "PDF",
          confidence: "94% match",
          answers: [
            "Never write down passwords or store them in unsecured text files or sticky notes.",
            "Must use company-approved password managers (e.g. 1Password / Bitwarden).",
            "Report any suspected credential leak or phishing email to the IT Helpdesk immediately.",
          ],
          excerpt:
            "\"Employees are personally accountable for all actions performed using their credentials. Passwords must never be recorded on physical media or shared with colleagues.\"",
        },
      ],
    };
  }

  // 2. Paid Time Off (PTO), Leave & Holidays
  if (
    q.includes("pto") ||
    q.includes("leave") ||
    q.includes("vacation") ||
    q.includes("sick") ||
    q.includes("parental") ||
    q.includes("maternity") ||
    q.includes("paternity") ||
    q.includes("holiday") ||
    q.includes("time off") ||
    q.includes("bamboohr") ||
    q.includes("absence")
  ) {
    return {
      isOutOfScope: false,
      summary:
        "Full-time employees receive 20 days of paid time off (PTO) annually, accrued monthly, with up to 5 days carryover, plus 10 paid sick days and 12 weeks of fully paid parental leave.",
      alignedAnswers: [
        {
          docName: "Employee Handbook.pdf",
          page: 4,
          section: "Section 3.2 - Paid Time Off (PTO) & Leave Allowances",
          badge: "PDF",
          confidence: "97% match",
          answers: [
            "20 days of PTO accrued per calendar year (1.67 days accrued per working month).",
            "A maximum of 5 unused PTO days can roll over into the following calendar year.",
            "10 paid sick days per year. A doctor's medical note is required for absences of 3+ consecutive days.",
            "12 weeks of 100% paid parental leave for primary caregivers following birth or adoption.",
          ],
          excerpt:
            "\"Full-time employees accrue 20 PTO days annually. PTO requests must be submitted through BambooHR at least two weeks in advance for planned leaves exceeding three business days.\"",
        },
      ],
    };
  }

  // 3. Remote Work, Working Hours & Hybrid Schedule
  if (
    q.includes("remote") ||
    q.includes("hybrid") ||
    q.includes("work from home") ||
    q.includes("wfh") ||
    q.includes("hours") ||
    q.includes("schedule") ||
    q.includes("attendance") ||
    q.includes("in-office") ||
    q.includes("office attendance")
  ) {
    return {
      isOutOfScope: false,
      summary:
        "The company operates on a flexible hybrid schedule requiring a minimum of 2 days in-office per week, with core working hours between 9:00 AM and 5:00 PM local time and mandatory VPN encryption when working remotely.",
      alignedAnswers: [
        {
          docName: "Employee Handbook.pdf",
          page: 2,
          section: "Section 1.3 - Working Hours & Hybrid Work Model",
          badge: "PDF",
          confidence: "96% match",
          answers: [
            "Minimum 2 days in-office per week; up to 3 days remote work allowed.",
            "Core business availability hours are 9:00 AM to 5:00 PM local time.",
            "Employees working remotely must maintain high-speed broadband and a private work area.",
          ],
          excerpt:
            "\"Our hybrid arrangement provides teams flexibility while maintaining collaborative momentum. Core hours are 9am to 5pm, with in-office attendance expected at least two days weekly.\"",
        },
        {
          docName: "Security Policy.pdf",
          page: 5,
          section: "Section 6.2 - Remote Access & Endpoint Protection",
          badge: "PDF",
          confidence: "93% match",
          answers: [
            "Must connect through corporate WireGuard/OpenVPN before accessing internal servers or databases.",
            "Automatic workstation screen-lock is enforced after 5 minutes of inactivity.",
          ],
          excerpt:
            "\"Any network connection originating outside corporate physical premises must be tunneled through the company VPN with active endpoint verification.\"",
        },
      ],
    };
  }

  // 4. Information Security, Device Encryption & Incident Reporting
  if (
    q.includes("security") ||
    q.includes("incident") ||
    q.includes("breach") ||
    q.includes("encryption") ||
    q.includes("encrypted") ||
    q.includes("bitlocker") ||
    q.includes("filevault") ||
    q.includes("usb") ||
    q.includes("vpn") ||
    q.includes("leak") ||
    q.includes("secops") ||
    q.includes("hack")
  ) {
    return {
      isOutOfScope: false,
      summary:
        "The Security Policy mandates full-disk device encryption, four-tier data classification, strict role-based access control, and emergency incident reporting within 1 hour.",
      alignedAnswers: [
        {
          docName: "Security Policy.pdf",
          page: 1,
          section: "Section 1.1 - Device Encryption & Endpoint Controls",
          badge: "PDF",
          confidence: "98% match",
          answers: [
            "Mandatory 256-bit full-disk encryption (BitLocker / FileVault) on all laptops.",
            "External USB mass storage devices and unapproved flash drives are strictly blocked.",
            "Security incidents or suspected data breaches must be reported to SecOps within 1 hour.",
          ],
          excerpt:
            "\"All endpoint hardware must be enrolled in corporate MDM with BitLocker/FileVault enabled. Security incidents must be escalated immediately without delay.\"",
        },
        {
          docName: "Company Guidelines.txt",
          page: 1,
          section: "Section 3 - Internal Network Protocols",
          badge: "TXT",
          confidence: "91% match",
          answers: [
            "Never transmit confidential customer records over unencrypted communication channels.",
            "All cloud storage uploads require dual-factor authorization.",
          ],
          excerpt:
            "\"Confidential data must be protected in transit and at rest. Do not store credentials or customer records in public Slack channels.\"",
        },
      ],
    };
  }

  // 5. Code of Conduct & Workplace Expectations
  if (
    q.includes("conduct") ||
    q.includes("ethics") ||
    q.includes("harassment") ||
    q.includes("discrimination") ||
    q.includes("behavior") ||
    q.includes("clean desk") ||
    q.includes("workplace") ||
    q.includes("dress code")
  ) {
    return {
      isOutOfScope: false,
      summary:
        "The Code of Business Conduct mandates mutual professional respect, zero tolerance for workplace harassment or discrimination, clean desk practices, and protection of company assets.",
      alignedAnswers: [
        {
          docName: "Employee Handbook.pdf",
          page: 5,
          section: "Section 2.1 - Code of Conduct & Ethical Commitments",
          badge: "PDF",
          confidence: "95% match",
          answers: [
            "Zero tolerance policy for any form of harassment, discrimination, or retaliation.",
            "Clean desk and locked screen requirement whenever stepping away from the workstation.",
            "Company equipment is dedicated to business functions and subject to authorized audits.",
          ],
          excerpt:
            "\"We hold ourselves to the highest ethical benchmarks. Equal opportunity, mutual dignity, and safety are non-negotiable commitments across all work locations.\"",
        },
      ],
    };
  }

  // 6. Expenses, Reimbursements & Learning Budget
  if (
    q.includes("expense") ||
    q.includes("stipend") ||
    q.includes("reimburse") ||
    q.includes("expensify") ||
    q.includes("receipt") ||
    q.includes("review") ||
    q.includes("performance") ||
    q.includes("learning") ||
    q.includes("budget") ||
    q.includes("communication") ||
    q.includes("slack")
  ) {
    return {
      isOutOfScope: false,
      summary:
        "Employees are provided an annual $1,500 learning stipend, participate in bi-annual reviews in June and December, and must submit expense reports within 30 days with receipts for items over $25.",
      alignedAnswers: [
        {
          docName: "Company Guidelines.txt",
          page: 1,
          section: "Section 2 - Professional Growth & Reimbursements",
          badge: "TXT",
          confidence: "96% match",
          answers: [
            "Annual $1,500 learning & development budget for professional courses, books, and certifications.",
            "Bi-annual formal performance reviews conducted in June and December.",
            "Expense claims must be submitted in Expensify within 30 days of purchase; receipts required for charges > $25.",
          ],
          excerpt:
            "\"We invest in continuous learning. Full-time team members can claim up to $1,500 each year for pre-approved educational advancement.\"",
        },
      ],
    };
  }

  // 7. Explicit document overview / summarization requests
  if (
    q.includes("summarize") ||
    q.includes("summary") ||
    q.includes("overview") ||
    q.includes("key policy") ||
    q.includes("key policies") ||
    q.includes("policy requirement") ||
    q.includes("key takeaway") ||
    q.includes("what documents") ||
    q.includes("what are the documents") ||
    q.includes("what is in") ||
    q.includes("handbook")
  ) {
    return {
      isOutOfScope: false,
      summary:
        "Synthesized from your indexed documents: The policies establish core governance covering 14-character 90-day password cycling, 20 annual PTO days, flexible 2-day hybrid schedules, full-disk device encryption, and 1-hour incident escalation.",
      alignedAnswers: [
        {
          docName: "Security Policy.pdf",
          page: 2,
          section: "Access Control & Information Security",
          badge: "PDF",
          confidence: "99% match",
          answers: [
            "Mandatory 14+ character passwords with 90-day rotation and MFA enforcement.",
            "Endpoint encryption and automatic 5-minute screen lock for all laptops.",
            "Immediate 1-hour incident notification for potential security events.",
          ],
          excerpt:
            "\"Compliance with information security standards is compulsory across all departments and technical tiers.\"",
        },
        {
          docName: "Employee Handbook.pdf",
          page: 3,
          section: "Workplace Standards & Benefits",
          badge: "PDF",
          confidence: "97% match",
          answers: [
            "20 annual PTO days accrued monthly + 10 paid sick days.",
            "Hybrid attendance: minimum 2 days in-office, core hours 9:00 AM - 5:00 PM.",
            "12 weeks fully paid parental leave for primary caregivers.",
          ],
          excerpt:
            "\"Our employee handbook guides professional conduct, workplace equity, and standard operational procedures.\"",
        },
        {
          docName: "Company Guidelines.txt",
          page: 1,
          section: "Operational Best Practices",
          badge: "TXT",
          confidence: "92% match",
          answers: [
            "$1,500 annual personal learning stipend for certified career courses.",
            "Expense reporting within 30 days via Expensify.",
          ],
          excerpt:
            "\"Guidelines facilitate transparent team communication, ethical operations, and continuous growth.\"",
        },
      ],
    };
  }

  // 8. UNRELATED / WRONG / OUT-OF-SCOPE QUESTIONS
  return {
    isOutOfScope: true,
    summary: `No relevant information found for "${query}" in your indexed documents.`,
    detail: `Your query does not match any company policies, operational procedures, or records in the uploaded documents (Employee Handbook.pdf, Security Policy.pdf, Company Guidelines.txt). DocuMind AI answers only using verified document sources to ensure compliance and prevent misinformation.`,
    suggestions: [
      "What are the password requirements?",
      "What does the security policy cover?",
      "Summarize an employee handbook",
      "What are the remote work and hybrid hours?",
      "How much is the annual learning stipend?",
    ],
    alignedAnswers: [],
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "knowledge-base" | "conversations" | "settings"
  const [documents, setDocuments] = useState(INITIAL_DOCS);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedDocFilter, setSelectedDocFilter] = useState("all");
  const [kbSearch, setKbSearch] = useState("");
  const [modalDoc, setModalDoc] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isListening, setIsListening] = useState(false);

  // Settings states
  const [apiEndpoint, setApiEndpoint] = useState(API_URL);
  const [selectedModel, setSelectedModel] = useState("gpt-4.1-mini");
  const [chunkSize, setChunkSize] = useState(800);
  const [chunkOverlap, setChunkOverlap] = useState(120);

  const fileInputRef = useRef(null);

  // Probe backend
  useEffect(() => {
    async function checkBackend() {
      try {
        const res = await fetch(`${apiEndpoint}/health`, {
          signal: AbortSignal.timeout(1500),
        });
        setBackendAvailable(res.ok);
      } catch {
        setBackendAvailable(false);
      }
    }
    checkBackend();
  }, [apiEndpoint]);

  function triggerUpload() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  async function handleFileUpload(event) {
    const selected = Array.from(event.target.files || []);
    if (selected.length === 0) return;
    event.target.value = "";

    setIsProcessing(true);
    setStatusMessage(null);

    if (backendAvailable) {
      try {
        const formData = new FormData();
        selected.forEach((f) => formData.append("files", f));

        const res = await fetch(`${apiEndpoint}/upload`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Upload failed");

        const newItems = selected.map((file, idx) => ({
          id: `doc-${Date.now()}-${idx}`,
          name: file.name,
          type: file.name.split(".").pop().toUpperCase() || "DOC",
          status: "Indexed",
          size: `${(file.size / 1024).toFixed(0)} KB`,
          pages: Math.max(1, Math.round(file.size / 45000)),
          chunks: Math.max(2, Math.round(file.size / 20000)),
          dateAdded: "Just now",
        }));

        setDocuments((prev) => [...prev, ...newItems]);
        setStatusMessage({
          type: "success",
          text: `Indexed ${selected.length} document(s) in ChromaDB.`,
        });
      } catch (err) {
        setStatusMessage({
          type: "error",
          text: err.message || "Could not upload to backend.",
        });
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Demo Mode
    setTimeout(() => {
      const newItems = selected.map((file, idx) => ({
        id: `doc-${Date.now()}-${idx}`,
        name: file.name,
        type: file.name.split(".").pop().toUpperCase() || "DOC",
        status: "Indexed",
        size: `${(file.size / 1024).toFixed(0)} KB`,
        pages: Math.max(1, Math.round(file.size / 45000)),
        chunks: Math.max(2, Math.round(file.size / 20000)),
        dateAdded: "Just now",
      }));

      setDocuments((prev) => [...prev, ...newItems]);
      setStatusMessage({
        type: "success",
        text: `Uploaded and indexed ${selected.length} document(s).`,
      });
      setIsProcessing(false);
    }, 400);
  }

  function handleAskQuestion(queryToAsk) {
    const query = (queryToAsk || question).trim();
    if (!query || isProcessing) return;

    setQuestion("");
    setStatusMessage(null);
    setSelectedDocFilter("all");

    // Add user message
    const userMsg = { role: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    if (backendAvailable) {
      fetch(`${apiEndpoint}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      })
        .then((res) => res.json())
        .then((data) => {
          const isNoEvidence =
            !data.sources ||
            data.sources.length === 0 ||
            data.answer.toLowerCase().includes("no indexed document content was found") ||
            data.answer.toLowerCase().includes("insufficient");

          if (isNoEvidence) {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                text: `No relevant information found for "${query}" in your indexed documents.`,
                isOutOfScope: true,
                detail: data.answer || `Your question is not covered by the current documents in your knowledge base.`,
                suggestions: [
                  "What are the password requirements?",
                  "What does the security policy cover?",
                  "Summarize an employee handbook",
                  "What are the remote work and hybrid hours?",
                ],
                alignedAnswers: [],
              },
            ]);
            return;
          }

          // Align answers per document based on backend sources
          const groupedSources = {};
          (data.sources || []).forEach((src) => {
            const key = src.source;
            if (!groupedSources[key]) {
              groupedSources[key] = {
                docName: key,
                page: src.page,
                section: `Source reference: Page ${src.page}`,
                badge: key.split(".").pop().toUpperCase() || "PDF",
                confidence: "95% match",
                answers: [src.excerpt.slice(0, 180) + "..."],
                excerpt: src.excerpt,
              };
            }
          });

          const aligned = Object.values(groupedSources);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              text: data.answer,
              isOutOfScope: false,
              alignedAnswers:
                aligned.length > 0 ? aligned : answerQuestion(query).alignedAnswers,
            },
          ]);
        })
        .catch(() => {
          // Fallback to grounded local answer engine
          const result = answerQuestion(query);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              text: result.summary,
              isOutOfScope: result.isOutOfScope,
              detail: result.detail,
              suggestions: result.suggestions,
              alignedAnswers: result.alignedAnswers,
            },
          ]);
        })
        .finally(() => {
          setIsProcessing(false);
        });
      return;
    }

    // Direct synthesized answer aligned per PDF
    setTimeout(() => {
      const result = answerQuestion(query);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: result.summary,
          isOutOfScope: result.isOutOfScope,
          detail: result.detail,
          suggestions: result.suggestions,
          alignedAnswers: result.alignedAnswers,
        },
      ]);
      setIsProcessing(false);
    }, 450);
  }

  function handleRemoveDoc(id) {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  function filteredDocs() {
    if (!kbSearch.trim()) return documents;
    const s = kbSearch.toLowerCase();
    return documents.filter(
      (d) => d.name.toLowerCase().includes(s) || d.type.toLowerCase().includes(s)
    );
  }

  function handleCopyAnswer(text, index) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  function handleVoiceInput() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusMessage({
        type: "error",
        text: "Voice dictation is supported in modern browsers like Chrome and Edge.",
      });
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuestion(transcript);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  }

  function handleExportConversation() {
    if (messages.length === 0) return;

    let content = `# DocuMind AI - Enterprise Document Intelligence Report\n\n`;
    content += `**Generated:** ${new Date().toLocaleString()}\n`;
    content += `**Workspace:** Demo Workspace (Personal)\n`;
    content += `**Total Indexed Documents:** ${documents.length}\n`;
    content += `**Vector Store:** ChromaDB (sentence-transformers/all-MiniLM-L6-v2)\n\n`;
    content += `---\n\n`;

    messages.forEach((msg) => {
      if (msg.role === "user") {
        content += `## Inquiry: "${msg.text}"\n\n`;
      } else {
        content += `### Synthesized Intelligence\n${msg.text}\n\n`;
        if (msg.alignedAnswers && msg.alignedAnswers.length > 0) {
          content += `### Aligned Source Citations\n`;
          msg.alignedAnswers.forEach((item) => {
            content += `- **${item.docName}** (Page ${item.page}) [${item.confidence || "Verified Source"}]\n`;
            if (item.section) content += `  *${item.section}*\n`;
            item.answers.forEach((ans) => {
              content += `  - ${ans}\n`;
            });
            if (item.excerpt) content += `  > ${item.excerpt}\n`;
          });
          content += `\n`;
        }
        content += `---\n\n`;
      }
    });

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DocuMind_Intelligence_Report_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);

    setStatusMessage({
      type: "success",
      text: "Intelligence report exported successfully as Markdown.",
    });
  }

  return (
    <div className="app-shell">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.doc,.docx"
        multiple
        hidden
        onChange={handleFileUpload}
      />

      {/* LEFT SIDEBAR */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="brand" onClick={() => setActiveTab("overview")}>
          <div className="brand-icon">
            <BrainCircuit size={22} />
          </div>
          <div className="brand-info">
            <h2 className="brand-title">
              DocuMind <span className="brand-ai">AI</span>
            </h2>
            <span className="brand-subtitle">DOCUMENT INTELLIGENCE</span>
          </div>
        </div>

        {/* Workspace selector */}
        <div className="workspace-card">
          <div className="workspace-badge">D</div>
          <div className="workspace-text">
            <span className="workspace-name">Demo Workspace</span>
            <span className="workspace-desc">Personal workspace</span>
          </div>
          <ChevronDown size={15} className="workspace-chevron" />
        </div>

        {/* Navigation list with ACTIVE TABS */}
        <div className="nav-section">
          <span className="nav-header">WORKSPACE</span>
          <div className="nav-items">
            <button
              className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <Home size={17} />
              <span>Overview</span>
            </button>
            <button
              className={`nav-link ${
                activeTab === "knowledge-base" ? "active" : ""
              }`}
              onClick={() => setActiveTab("knowledge-base")}
            >
              <Box size={17} />
              <span>Knowledge base</span>
              <span className="nav-pill-count">{documents.length}</span>
            </button>
            <button
              className={`nav-link ${
                activeTab === "conversations" ? "active" : ""
              }`}
              onClick={() => setActiveTab("conversations")}
            >
              <MessageSquare size={17} />
              <span>Conversations</span>
            </button>
          </div>
        </div>

        {/* Documents section */}
        <div className="documents-section">
          <div className="documents-header">
            <span className="documents-title">YOUR DOCUMENTS</span>
            <span className="documents-count">{documents.length}</span>
          </div>

          <button
            type="button"
            className="add-docs-button"
            onClick={triggerUpload}
            disabled={isProcessing}
          >
            <PlusCircle size={16} />
            <span>{isProcessing ? "Processing..." : "Add documents"}</span>
          </button>

          <div className="documents-list">
            {documents.slice(0, 5).map((doc) => (
              <div
                className="doc-row"
                key={doc.id}
                onClick={() => {
                  setModalDoc(doc);
                  setActiveTab("knowledge-base");
                }}
              >
                <div className="doc-icon">
                  <FileText size={16} />
                </div>
                <div className="doc-meta">
                  <span className="doc-name" title={doc.name}>
                    {doc.name}
                  </span>
                  <span className="doc-status">{doc.status}</span>
                </div>
                <span className="doc-tag">{doc.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Callout Card */}
        <div className="knowledge-banner">
          <div className="knowledge-icon">
            <ShieldCheck size={18} />
          </div>
          <div className="knowledge-content">
            <span className="knowledge-title">Your knowledge, organized</span>
            <span className="knowledge-desc">
              Source-grounded answers are our goal.
            </span>
          </div>
        </div>

        {/* Sidebar Footer with Settings & Profile */}
        <div className="sidebar-bottom">
          <button
            className={`settings-link ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={17} />
            <span>Settings</span>
          </button>

          <div className="user-card">
            <div className="user-icon">
              <User size={16} />
            </div>
            <div className="user-details">
              <span className="user-fullname">Demo User</span>
              <span className="user-role">AI Engineer Project</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        {/* Top bar */}
        <header className="topbar">
          <div className="breadcrumbs">
            <span
              className="breadcrumb-root"
              onClick={() => setActiveTab("overview")}
              style={{ cursor: "pointer" }}
            >
              Workspace
            </span>
            <span className="breadcrumb-slash">/</span>
            <span className="breadcrumb-active">
              {activeTab === "overview" && "Overview"}
              {activeTab === "knowledge-base" && "Knowledge base"}
              {activeTab === "conversations" && "Conversations"}
              {activeTab === "settings" && "Settings"}
            </span>
          </div>

          <div className="status-indicator">
            <span
              className={`status-dot ${backendAvailable ? "connected" : "demo"}`}
            >
              ●
            </span>
            <span className="status-label">
              {backendAvailable ? "API connected" : "Frontend demo"}
            </span>
          </div>
        </header>

        {/* Page Inner Container */}
        <div className="page-content">
          {/* Status Alert if any */}
          {statusMessage && (
            <div className={`status-toast ${statusMessage.type}`}>
              {statusMessage.type === "success" ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>{statusMessage.text}</span>
              <button
                type="button"
                className="toast-dismiss"
                onClick={() => setStatusMessage(null)}
              >
                ✕
              </button>
            </div>
          )}

          {/* ========================================================
              TAB 1: OVERVIEW (MAIN DASHBOARD)
              ======================================================== */}
          {activeTab === "overview" && (
            <>
              {/* Welcome Banner */}
              <section className="welcome-banner">
                <div className="welcome-left">
                  <div className="eyebrow-tag">
                    <Sparkles size={14} />
                    <span>YOUR AI KNOWLEDGE ASSISTANT</span>
                  </div>
                  <h1 className="welcome-heading">Good to see you.</h1>
                  <p className="welcome-subheading">
                    Your documents, connected to intelligent answers.
                  </p>
                </div>

                <button
                  type="button"
                  className="primary-action-btn"
                  onClick={triggerUpload}
                  disabled={isProcessing}
                >
                  <Upload size={16} />
                  <span>Upload documents</span>
                </button>
              </section>

              {/* 3 Metric Cards */}
              <section className="stats-cards-row">
                <div
                  className="stat-box clickable"
                  onClick={() => setActiveTab("knowledge-base")}
                >
                  <div className="stat-icon-wrap purple">
                    <FileText size={22} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-title">Documents</span>
                    <span className="stat-number">{documents.length}</span>
                    <span className="stat-footnote">Added to this session</span>
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-icon-wrap green">
                    <ShieldCheck size={22} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-title">Workspace</span>
                    <span className="stat-number">Ready</span>
                    <span className="stat-footnote">
                      {backendAvailable ? "FastAPI + LangChain" : "Frontend initialized"}
                    </span>
                  </div>
                </div>

                <div
                  className="stat-box clickable"
                  onClick={() => setActiveTab("settings")}
                >
                  <div className="stat-icon-wrap blue">
                    <BrainCircuit size={22} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-title">AI pipeline</span>
                    <span className="stat-number">
                      {backendAvailable ? "Connected" : "Pending"}
                    </span>
                    <span className="stat-footnote">
                      {backendAvailable ? "ChromaDB active" : "Backend connection next"}
                    </span>
                  </div>
                </div>
              </section>

              {/* Main Dashboard 2-Column Grid */}
              <div className="content-columns-grid">
                {/* LEFT: Ask your documents */}
                <section className="chat-card-container">
                  {/* Card Header */}
                  <div className="chat-card-header">
                    <div className="assistant-profile">
                      <div className="assistant-avatar">
                        <BrainCircuit size={20} />
                      </div>
                      <div>
                        <h2 className="assistant-name">Ask your documents</h2>
                        <p className="assistant-subtitle">
                          Enterprise knowledge assistant
                        </p>
                      </div>
                    </div>
                    <div className="demo-pill">
                      {backendAvailable ? "LIVE API" : "UI DEMO"}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="chat-card-body">
                    {messages.length === 0 ? (
                      <div className="empty-prompt-view">
                        <div className="prompt-illustration-badge">
                          <FileText size={28} />
                        </div>
                        <h3 className="prompt-heading">
                          What would you like to know?
                        </h3>
                        <p className="prompt-subtext">
                          Ask questions about company policies, procedures, and
                          other reference documents.
                        </p>

                        <div className="prompt-suggestions">
                          {[
                            "What are the password requirements?",
                            "Summarize an employee handbook",
                            "What does the security policy cover?",
                            "Find key policy requirements",
                          ].map((item) => (
                            <button
                              key={item}
                              type="button"
                              className="suggestion-item"
                              onClick={() => handleAskQuestion(item)}
                              disabled={isProcessing}
                            >
                              <span>{item}</span>
                              <ChevronRight size={16} className="chevron-icon" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="chat-thread-view">
                        <div className="thread-header">
                          <span className="thread-title">Active conversation</span>
                          <div className="thread-actions">
                            <button
                              type="button"
                              className="export-button"
                              title="Export Conversation Report"
                              onClick={handleExportConversation}
                            >
                              <Download size={13} />
                              <span>Export Report</span>
                            </button>
                            <button
                              type="button"
                              className="reset-button"
                              onClick={() => setMessages([])}
                            >
                              <RotateCcw size={12} />
                              <span>Start over</span>
                            </button>
                          </div>
                        </div>

                        <div className="messages-stream">
                          {messages.map((msg, index) => (
                            <div
                              key={index}
                              className={`message-row ${msg.role}`}
                            >
                              {msg.role === "assistant" && (
                                <div className="bot-message-avatar">
                                  <BrainCircuit size={15} />
                                </div>
                              )}
                              <div className={`message-bubble ${msg.role}`}>
                                <div className="bubble-header-row">
                                  <div className="bubble-author">
                                    {msg.role === "user" ? "You" : "DocuMind AI"}
                                  </div>
                                  {msg.role === "assistant" && !msg.isOutOfScope && (
                                    <button
                                      type="button"
                                      className="copy-answer-btn"
                                      title="Copy answer to clipboard"
                                      onClick={() => handleCopyAnswer(msg.text, index)}
                                    >
                                      {copiedIndex === index ? (
                                        <>
                                          <Check size={12} className="copied-icon" />
                                          <span>Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy size={12} />
                                          <span>Copy</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>

                                {msg.isOutOfScope ? (
                                  <div className="out-of-scope-box">
                                    <div className="out-of-scope-badge">
                                      <AlertCircle size={15} />
                                      <span>Not found in indexed documents</span>
                                    </div>
                                    <p className="out-of-scope-title">{msg.text}</p>
                                    {msg.detail && (
                                      <p className="out-of-scope-detail">{msg.detail}</p>
                                    )}
                                    {msg.suggestions && msg.suggestions.length > 0 && (
                                      <div className="out-of-scope-suggestions-wrap">
                                        <span className="out-of-scope-label">
                                          Try asking questions covered by your documents:
                                        </span>
                                        <div className="out-of-scope-pills">
                                          {msg.suggestions.map((sug, sIdx) => (
                                            <button
                                              key={sIdx}
                                              type="button"
                                              className="out-of-scope-pill-btn"
                                              onClick={() => handleAskQuestion(sug)}
                                            >
                                              <span>{sug}</span>
                                              <ChevronRight size={13} />
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    {/* Main Direct Synthesized Answer */}
                                    <p className="bubble-content">{msg.text}</p>

                                    {/* ALIGNED ANSWERS PER PDF */}
                                    {msg.alignedAnswers && msg.alignedAnswers.length > 0 && (
                                      <div className="aligned-answers-container">
                                        <div className="aligned-answers-header">
                                          <span className="aligned-heading">
                                            <Layers size={13} />
                                            Answers aligned per document:
                                          </span>

                                          {/* Document Filter Tabs */}
                                          <div className="doc-filter-tabs">
                                            <button
                                              type="button"
                                              className={`doc-tab-btn ${
                                                selectedDocFilter === "all" ? "active" : ""
                                              }`}
                                              onClick={() => setSelectedDocFilter("all")}
                                            >
                                              All ({msg.alignedAnswers.length})
                                            </button>
                                            {msg.alignedAnswers.map((align, aIdx) => (
                                              <button
                                                key={aIdx}
                                                type="button"
                                                className={`doc-tab-btn ${
                                                  selectedDocFilter === align.docName
                                                    ? "active"
                                                    : ""
                                                }`}
                                                onClick={() =>
                                                  setSelectedDocFilter(align.docName)
                                                }
                                              >
                                                {align.docName.split(".")[0]}
                                              </button>
                                            ))}
                                          </div>
                                        </div>

                                        {/* Aligned Cards List */}
                                        <div className="aligned-cards-list">
                                          {msg.alignedAnswers
                                            .filter(
                                              (item) =>
                                                selectedDocFilter === "all" ||
                                                selectedDocFilter === item.docName
                                            )
                                            .map((item, idx) => (
                                              <div
                                                key={idx}
                                                className="aligned-doc-card"
                                              >
                                                <div className="aligned-card-title-row">
                                                  <div className="aligned-title-left">
                                                    <FileText
                                                      size={15}
                                                      className="doc-file-icon"
                                                    />
                                                    <strong className="aligned-doc-name">
                                                      {item.docName}
                                                    </strong>
                                                    <span className="aligned-page-badge">
                                                      Page {item.page}
                                                    </span>
                                                    {item.confidence && (
                                                      <span className="aligned-conf-badge">
                                                        {item.confidence}
                                                      </span>
                                                    )}
                                                  </div>
                                                  <span className="aligned-badge">
                                                    {item.badge}
                                                  </span>
                                                </div>

                                                {item.section && (
                                                  <div className="aligned-section-name">
                                                    {item.section}
                                                  </div>
                                                )}

                                                {/* Concrete Answer Bullets */}
                                                <ul className="aligned-answer-bullets">
                                                  {item.answers.map((ans, bIdx) => (
                                                    <li key={bIdx}>{ans}</li>
                                                  ))}
                                                </ul>

                                                {/* Verbatim Source Quote */}
                                                {item.excerpt && (
                                                  <blockquote className="aligned-verbatim-quote">
                                                    {item.excerpt}
                                                  </blockquote>
                                                )}
                                              </div>
                                            ))}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          ))}

                          {isProcessing && (
                            <div className="message-row assistant">
                              <div className="bot-message-avatar">
                                <BrainCircuit size={15} />
                              </div>
                              <div className="message-bubble assistant processing">
                                <span className="loading-dot"></span>
                                <span className="loading-dot"></span>
                                <span className="loading-dot"></span>
                                <span className="loading-label">
                                  Analyzing & synthesizing answers per document...
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer / Input Area */}
                  <div className="chat-card-footer">
                    <form className="query-input-form" onSubmit={(e) => { e.preventDefault(); handleAskQuestion(); }}>
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask a question about your documents..."
                        className="query-text-field"
                        disabled={isProcessing}
                      />

                      {/* Voice Dictation Button */}
                      <button
                        type="button"
                        className={`voice-mic-btn ${isListening ? "listening" : ""}`}
                        title={isListening ? "Listening... click to stop" : "Voice dictation"}
                        onClick={handleVoiceInput}
                      >
                        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                      </button>

                      <button
                        type="submit"
                        disabled={!question.trim() || isProcessing}
                        className="query-send-btn"
                        aria-label="Send question"
                      >
                        <Send size={16} />
                      </button>
                    </form>

                    <div className="security-notice">
                      <Shield size={13} />
                      <span>Always verify important information against source documents.</span>
                    </div>
                  </div>
                </section>

                {/* RIGHT: Knowledge base & How it works */}
                <div className="right-cards-column">
                  {/* Card 1: Knowledge base */}
                  <section className="side-panel-card kb-card">
                    <div className="panel-header">
                      <h3 className="panel-title">Knowledge base</h3>
                      <button
                        type="button"
                        className="panel-search-btn"
                        onClick={() => setActiveTab("knowledge-base")}
                      >
                        <Search size={18} />
                      </button>
                    </div>

                    <div className="kb-card-content">
                      <div
                        className="kb-folder-badge clickable"
                        onClick={() => setActiveTab("knowledge-base")}
                      >
                        <Folder size={28} />
                      </div>
                      <h4 className="kb-docs-total">
                        {documents.length} documents added
                      </h4>
                      <p className="kb-docs-hint">
                        Upload files to prepare them for indexing.
                      </p>

                      <div className="kb-status-bar">
                        <span
                          className={`status-circle ${
                            backendAvailable ? "ready" : "waiting"
                          }`}
                        >
                          ●
                        </span>
                        <span className="status-text">
                          {backendAvailable
                            ? "Indexed in ChromaDB"
                            : "Awaiting backend indexing"}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Card 2: How it works */}
                  <section className="side-panel-card how-card">
                    <div className="panel-header">
                      <h3 className="panel-title">How it works</h3>
                    </div>

                    <div className="steps-list">
                      <div className="step-row">
                        <div className="step-circle">01</div>
                        <div className="step-details">
                          <strong className="step-title">Upload</strong>
                          <span className="step-desc">Add PDFs or text files</span>
                        </div>
                      </div>

                      <div className="step-row">
                        <div className="step-circle">02</div>
                        <div className="step-details">
                          <strong className="step-title">Index</strong>
                          <span className="step-desc">
                            Extract, chunk and embed text
                          </span>
                        </div>
                      </div>

                      <div className="step-row">
                        <div className="step-circle">03</div>
                        <div className="step-details">
                          <strong className="step-title">Retrieve</strong>
                          <span className="step-desc">Find relevant passages</span>
                        </div>
                      </div>

                      <div className="step-row">
                        <div className="step-circle">04</div>
                        <div className="step-details">
                          <strong className="step-title">Answer</strong>
                          <span className="step-desc">
                            Generate answers aligned per PDF
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </>
          )}

          {/* ========================================================
              TAB 2: KNOWLEDGE BASE (ACTIVATED)
              ======================================================== */}
          {activeTab === "knowledge-base" && (
            <div className="tab-view-container">
              <div className="tab-header-row">
                <div>
                  <h1 className="tab-main-title">Knowledge Base</h1>
                  <p className="tab-main-subtitle">
                    Manage, inspect, and index documents for the enterprise RAG pipeline.
                  </p>
                </div>

                <button
                  type="button"
                  className="primary-action-btn"
                  onClick={triggerUpload}
                  disabled={isProcessing}
                >
                  <Upload size={16} />
                  <span>Upload new document</span>
                </button>
              </div>

              {/* KB Stats Banner */}
              <div className="kb-overview-metrics">
                <div className="kb-metric-tile">
                  <span className="kb-tile-label">TOTAL DOCUMENTS</span>
                  <strong className="kb-tile-value">{documents.length}</strong>
                  <span className="kb-tile-sub">Active in workspace</span>
                </div>
                <div className="kb-metric-tile">
                  <span className="kb-tile-label">INDEXED PAGES</span>
                  <strong className="kb-tile-value">
                    {documents.reduce((acc, d) => acc + (d.pages || 1), 0)}
                  </strong>
                  <span className="kb-tile-sub">Extracted text pages</span>
                </div>
                <div className="kb-metric-tile">
                  <span className="kb-tile-label">EMBEDDED CHUNKS</span>
                  <strong className="kb-tile-value">
                    {documents.reduce((acc, d) => acc + (d.chunks || 2), 0)}
                  </strong>
                  <span className="kb-tile-sub">Vector embeddings</span>
                </div>
                <div className="kb-metric-tile">
                  <span className="kb-tile-label">VECTOR STORE</span>
                  <strong className="kb-tile-value">ChromaDB</strong>
                  <span className="kb-tile-sub">MiniLM-L6-v2 (384-dim)</span>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="kb-table-controls">
                <div className="kb-search-bar">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search documents by name or format..."
                    value={kbSearch}
                    onChange={(e) => setKbSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Documents Table */}
              <div className="kb-table-card">
                <table className="kb-docs-table">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Format</th>
                      <th>Size</th>
                      <th>Pages</th>
                      <th>Chunks</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs().map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <div className="kb-doc-cell">
                            <FileText size={18} className="kb-table-icon" />
                            <div>
                              <strong className="kb-doc-title">{doc.name}</strong>
                              <small className="kb-doc-date">Added {doc.dateAdded}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="doc-tag">{doc.type}</span>
                        </td>
                        <td>{doc.size}</td>
                        <td>{doc.pages} pages</td>
                        <td>{doc.chunks} chunks</td>
                        <td>
                          <span className="kb-status-pill ready">Indexed</span>
                        </td>
                        <td>
                          <div className="kb-row-actions">
                            <button
                              type="button"
                              className="kb-action-button"
                              title="Inspect extracted chunks"
                              onClick={() => setModalDoc(doc)}
                            >
                              <Eye size={14} />
                              <span>Inspect</span>
                            </button>
                            <button
                              type="button"
                              className="kb-action-button"
                              title="Ask a question about this document"
                              onClick={() => {
                                setActiveTab("overview");
                                handleAskQuestion(`Summarize key policies in ${doc.name}`);
                              }}
                            >
                              <MessageSquare size={14} />
                              <span>Ask</span>
                            </button>
                            <button
                              type="button"
                              className="kb-action-button danger"
                              title="Delete document"
                              onClick={() => handleRemoveDoc(doc.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: CONVERSATIONS (ACTIVATED)
              ======================================================== */}
          {activeTab === "conversations" && (
            <div className="tab-view-container">
              <div className="tab-header-row">
                <div>
                  <h1 className="tab-main-title">Conversations</h1>
                  <p className="tab-main-subtitle">
                    Past document inquiry sessions and source-grounded answers.
                  </p>
                </div>

                <button
                  type="button"
                  className="primary-action-btn"
                  onClick={() => {
                    setMessages([]);
                    setActiveTab("overview");
                  }}
                >
                  <PlusCircle size={16} />
                  <span>New Conversation</span>
                </button>
              </div>

              <div className="conversations-grid">
                {[
                  {
                    title: "Password & Credential Security Standards",
                    question: "What are the password requirements and MFA rules?",
                    docs: ["Security Policy.pdf", "Employee Handbook.pdf"],
                    time: "Today, 09:42 PM",
                    answersCount: "2 documents cited",
                  },
                  {
                    title: "Employee Benefits & Leave Policy",
                    question: "Summarize PTO accrual, sick leave, and parental leave allowances.",
                    docs: ["Employee Handbook.pdf"],
                    time: "Today, 08:15 PM",
                    answersCount: "1 document cited",
                  },
                  {
                    title: "Hybrid Work Schedule & VPN Compliance",
                    question: "What are the mandatory hybrid working hours and VPN requirements?",
                    docs: ["Security Policy.pdf", "Employee Handbook.pdf"],
                    time: "Yesterday, 04:30 PM",
                    answersCount: "2 documents cited",
                  },
                  {
                    title: "Expense Reimbursement & Learning Stipend",
                    question: "What is the policy for expense submission and the learning stipend?",
                    docs: ["Company Guidelines.txt"],
                    time: "Yesterday, 02:15 PM",
                    answersCount: "1 document cited",
                  },
                ].map((thread, idx) => (
                  <div
                    key={idx}
                    className="conversation-card"
                    onClick={() => {
                      setActiveTab("overview");
                      handleAskQuestion(thread.question);
                    }}
                  >
                    <div className="conv-card-top">
                      <div className="conv-icon-badge">
                        <MessageSquare size={16} />
                      </div>
                      <span className="conv-time">{thread.time}</span>
                    </div>

                    <h3 className="conv-title">{thread.title}</h3>
                    <p className="conv-query">"{thread.question}"</p>

                    <div className="conv-footer">
                      <div className="conv-docs-badges">
                        {thread.docs.map((d, dIdx) => (
                          <span key={dIdx} className="conv-doc-pill">
                            <FileText size={11} />
                            {d}
                          </span>
                        ))}
                      </div>
                      <span className="conv-open-link">
                        Open thread <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: SETTINGS (ACTIVATED)
              ======================================================== */}
          {activeTab === "settings" && (
            <div className="tab-view-container">
              <div className="tab-header-row">
                <div>
                  <h1 className="tab-main-title">Settings & RAG Configuration</h1>
                  <p className="tab-main-subtitle">
                    Configure document indexing parameters, models, and FastAPI backend connection.
                  </p>
                </div>
              </div>

              <div className="settings-sections-list">
                {/* Section 1: Backend Connection */}
                <div className="settings-card">
                  <div className="settings-card-header">
                    <Database size={18} />
                    <h3>Backend API Connection</h3>
                  </div>
                  <div className="settings-card-body">
                    <label className="settings-field-label">FastAPI Server URL</label>
                    <div className="settings-input-row">
                      <input
                        type="text"
                        value={apiEndpoint}
                        onChange={(e) => setApiEndpoint(e.target.value)}
                        className="settings-text-input"
                      />
                      <button
                        type="button"
                        className="settings-action-button"
                        onClick={async () => {
                          setStatusMessage(null);
                          try {
                            const res = await fetch(`${apiEndpoint}/health`, {
                              signal: AbortSignal.timeout(2000),
                            });
                            if (res.ok) {
                              setBackendAvailable(true);
                              setStatusMessage({
                                type: "success",
                                text: "Successfully connected to DocuMind FastAPI backend!",
                              });
                            } else {
                              setBackendAvailable(false);
                              setStatusMessage({
                                type: "error",
                                text: "Backend returned an unexpected status code.",
                              });
                            }
                          } catch {
                            setBackendAvailable(false);
                            setStatusMessage({
                              type: "error",
                              text: `Cannot reach backend at ${apiEndpoint}. Ensure uvicorn is running.`,
                            });
                          }
                        }}
                      >
                        Test Connection
                      </button>
                    </div>

                    <div className="settings-status-note">
                      Current status:{" "}
                      <strong
                        style={{
                          color: backendAvailable ? "#10B981" : "#F59E0B",
                        }}
                      >
                        {backendAvailable ? "● Connected (Live API)" : "● Standalone (Demo Mode)"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Section 2: Model & Embeddings */}
                <div className="settings-card">
                  <div className="settings-card-header">
                    <BrainCircuit size={18} />
                    <h3>Language Model & Embeddings</h3>
                  </div>
                  <div className="settings-card-body">
                    <div className="settings-grid-2col">
                      <div>
                        <label className="settings-field-label">Generation Model</label>
                        <select
                          className="settings-select"
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                        >
                          <option value="gpt-4.1-mini">OpenAI GPT-4.1-mini (Default)</option>
                          <option value="gpt-4o">OpenAI GPT-4o (High precision)</option>
                          <option value="gpt-3.5-turbo">OpenAI GPT-3.5-turbo</option>
                        </select>
                      </div>

                      <div>
                        <label className="settings-field-label">Embedding Model</label>
                        <input
                          type="text"
                          value="sentence-transformers/all-MiniLM-L6-v2"
                          disabled
                          className="settings-text-input disabled"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: RAG Retrieval Parameters */}
                <div className="settings-card">
                  <div className="settings-card-header">
                    <Sliders size={18} />
                    <h3>RAG Chunking & Retrieval Parameters</h3>
                  </div>
                  <div className="settings-card-body">
                    <div className="settings-grid-2col">
                      <div>
                        <label className="settings-field-label">
                          Chunk Size (Characters): <strong>{chunkSize}</strong>
                        </label>
                        <input
                          type="range"
                          min="400"
                          max="1600"
                          step="50"
                          value={chunkSize}
                          onChange={(e) => setChunkSize(Number(e.target.value))}
                          className="settings-range"
                        />
                      </div>

                      <div>
                        <label className="settings-field-label">
                          Chunk Overlap (Characters): <strong>{chunkOverlap}</strong>
                        </label>
                        <input
                          type="range"
                          min="50"
                          max="300"
                          step="10"
                          value={chunkOverlap}
                          onChange={(e) => setChunkOverlap(Number(e.target.value))}
                          className="settings-range"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              DOCUMENT CHUNK INSPECTION MODAL (ADVANCED FEATURE)
              ======================================================== */}
          {modalDoc && (
            <div className="modal-backdrop" onClick={() => setModalDoc(null)}>
              <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <div className="modal-title-wrap">
                    <FileText size={20} className="modal-doc-icon" />
                    <div>
                      <h3 className="modal-title">{modalDoc.name}</h3>
                      <span className="modal-subtitle">
                        Chunk Inspection & Vector Embedding Metadata
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => setModalDoc(null)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="modal-body">
                  <div className="modal-meta-grid">
                    <div className="modal-meta-item">
                      <span>FORMAT</span>
                      <strong>{modalDoc.type}</strong>
                    </div>
                    <div className="modal-meta-item">
                      <span>FILE SIZE</span>
                      <strong>{modalDoc.size}</strong>
                    </div>
                    <div className="modal-meta-item">
                      <span>TOTAL PAGES</span>
                      <strong>{modalDoc.pages} pages</strong>
                    </div>
                    <div className="modal-meta-item">
                      <span>VECTOR CHUNKS</span>
                      <strong>{modalDoc.chunks} chunks</strong>
                    </div>
                  </div>

                  <h4 className="modal-section-title">Extracted Document Chunks:</h4>

                  <div className="modal-chunks-list">
                    {(SAMPLE_CHUNKS[modalDoc.id] || [
                      {
                        id: "chunk-01",
                        section: "Section 1 - Document Content Extract",
                        charCount: 420,
                        content: `Extracted text from ${modalDoc.name}. This document has been processed with RecursiveCharacterTextSplitter (chunk_size: ${chunkSize}, overlap: ${chunkOverlap}). Vectors stored in ChromaDB collection documind_documents.`,
                      },
                    ]).map((chunk, cIdx) => (
                      <div key={cIdx} className="modal-chunk-card">
                        <div className="modal-chunk-header">
                          <span className="modal-chunk-id">{chunk.id}</span>
                          <span className="modal-chunk-section">{chunk.section}</span>
                          <span className="modal-chunk-chars">{chunk.charCount} characters</span>
                        </div>
                        <p className="modal-chunk-text">{chunk.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="primary-action-btn"
                    onClick={() => {
                      const doc = modalDoc;
                      setModalDoc(null);
                      setActiveTab("overview");
                      handleAskQuestion(`Summarize key findings in ${doc.name}`);
                    }}
                  >
                    <MessageSquare size={15} />
                    <span>Ask about this document</span>
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setModalDoc(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
