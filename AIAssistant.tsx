import { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  User,
} from "lucide-react";
import { useGRC } from "../context/GRCContext";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

export default function AIAssistant() {
  const {
    assets,
    risks,
    controls,
    complianceAssessments,
    evidence,
    gaps,
    remediations,
    audits,
    policies,
  } = useGRC();

  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hey! I'm SecureGRC AI. 👋 Ask me about your SecureGRC project, GRC, cybersecurity, or general questions.",
    },
  ]);

  // ------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------

  function normalize(question: string): string {
    return question
      .toLowerCase()
      .replace(/[?!.,]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function hasAny(q: string, words: string[]): boolean {
    return words.some((word) => q.includes(word));
  }

  // ------------------------------------------------------------
  // PROJECT ANSWERS
  // ------------------------------------------------------------

  function getProjectAnswer(question: string): string | null {
    const q = normalize(question);

    // ----------------------------------------------------------
    // AUDITS
    // ----------------------------------------------------------

    if (
      hasAny(q, [
        "audit",
        "audits",
        "internal audit",
        "audit result",
        "audit results",
      ]) &&
      hasAny(q, [
        "summary",
        "summarize",
        "status",
        "result",
        "results",
        "how are",
        "tell me",
        "show me",
        "what are",
      ])
    ) {
      const pass = audits.filter(
        (audit) => audit.status === "Pass"
      ).length;

      const partial = audits.filter(
        (audit) => audit.status === "Partial"
      ).length;

      const fail = audits.filter(
        (audit) => audit.status === "Fail"
      ).length;

      const notTested = audits.filter(
        (audit) => audit.status === "Not Tested"
      ).length;

      const failedAudits = audits.filter(
        (audit) => audit.status === "Fail"
      );

      return [
        `Here is the current SecureGRC audit summary:`,
        "",
        `• Total audits: ${audits.length}`,
        `• Pass: ${pass}`,
        `• Partial: ${partial}`,
        `• Fail: ${fail}`,
        `• Not Tested: ${notTested}`,
        "",
        failedAudits.length > 0
          ? `Failed audit items:\n${failedAudits
              .map(
                (audit) =>
                  `• ${audit.id} — ${audit.question}`
              )
              .join("\n")}`
          : "There are currently no failed audit items.",
      ].join("\n");
    }

    // ----------------------------------------------------------
    // HIGHEST / CRITICAL RISKS
    // ----------------------------------------------------------

    if (
      hasAny(q, [
        "highest risk",
        "highest risks",
        "critical risk",
        "critical risks",
        "high risk",
        "high risks",
        "top risks",
        "most serious risks",
        "important risks",
      ])
    ) {
      const importantRisks = [...risks]
        .filter(
          (risk) =>
            risk.inherentLevel === "Critical" ||
            risk.inherentLevel === "High"
        )
        .sort((a, b) => b.inherentRisk - a.inherentRisk);

      if (importantRisks.length === 0) {
        return "There are currently no Critical or High inherent-risk items in the SecureGRC risk register.";
      }

      return [
        `SecureGRC currently has ${importantRisks.length} Critical/High inherent-risk item(s).`,
        "",
        ...importantRisks.slice(0, 5).map(
          (risk) =>
            `• ${risk.id} — ${risk.title} — ${risk.inherentLevel} (${risk.inherentRisk}/25)`
        ),
      ].join("\n");
    }

    // ----------------------------------------------------------
    // ASSETS
    // ----------------------------------------------------------

    if (
      hasAny(q, [
        "how many assets",
        "number of assets",
        "asset count",
        "total assets",
        "our assets",
        "registered assets",
      ])
    ) {
      return `SecureGRC currently contains ${assets.length} registered asset(s).`;
    }

    // ----------------------------------------------------------
    // CONTROLS
    // ----------------------------------------------------------

    if (
      hasAny(q, [
        "how many controls",
        "control count",
        "total controls",
        "our controls",
        "control status",
        "control implementation",
        "implemented controls",
      ])
    ) {
      const implemented = controls.filter(
        (control) =>
          control.implementationStatus === "Implemented"
      ).length;

      const partial = controls.filter(
        (control) =>
          control.implementationStatus ===
          "Partially Implemented"
      ).length;

      const notImplemented = controls.filter(
        (control) =>
          control.implementationStatus ===
          "Not Implemented"
      ).length;

      const notApplicable = controls.filter(
        (control) =>
          control.implementationStatus ===
          "Not Applicable"
      ).length;

      return [
        `SecureGRC currently has ${controls.length} control(s).`,
        "",
        `• Implemented: ${implemented}`,
        `• Partially Implemented: ${partial}`,
        `• Not Implemented: ${notImplemented}`,
        `• Not Applicable: ${notApplicable}`,
      ].join("\n");
    }

    // ----------------------------------------------------------
    // OPEN GAPS
    // ----------------------------------------------------------

    if (
      hasAny(q, [
        "open gap",
        "open gaps",
        "gaps",
        "gap analysis",
        "current gaps",
        "show me gaps",
        "our gaps",
      ])
    ) {
      const openGaps = gaps.filter(
        (gap) => gap.status === "Open"
      );

      if (openGaps.length === 0) {
        return "There are currently no Open gaps in the SecureGRC Gap Analysis.";
      }

      return [
        `SecureGRC currently has ${openGaps.length} Open gap(s).`,
        "",
        ...openGaps.map(
          (gap) =>
            `• ${gap.id} — ${gap.description} — Risk: ${gap.risk} — Owner: ${gap.owner}`
        ),
      ].join("\n");
    }

    // ----------------------------------------------------------
    // REMEDIATION
    // ----------------------------------------------------------

    if (
      hasAny(q, [
        "remediation",
        "remediations",
        "remediation status",
        "open remediation",
        "active remediation",
        "remediation actions",
      ])
    ) {
      const active = remediations.filter(
        (item) =>
          item.status !== "Completed" &&
          item.status !== "Accepted Risk"
      );

      const completed = remediations.filter(
        (item) => item.status === "Completed"
      ).length;

      const accepted = remediations.filter(
        (item) => item.status === "Accepted Risk"
      ).length;

      return [
        `SecureGRC has ${remediations.length} remediation action(s).`,
        "",
        `• Active: ${active.length}`,
        `• Completed: ${completed}`,
        `• Accepted Risk: ${accepted}`,
        "",
        active.length > 0
          ? `Active actions:\n${active
              .slice(0, 8)
              .map(
                (item) =>
                  `• ${item.id} — ${item.finding} — ${item.status} — Due: ${item.dueDate}`
              )
              .join("\n")}`
          : "There are currently no active remediation actions.",
      ].join("\n");
    }

    // ----------------------------------------------------------
    // COMPLIANCE
    // ----------------------------------------------------------

    if (
      hasAny(q, [
        "compliance",
        "compliance status",
        "compliance summary",
        "how compliant",
        "compliance percentage",
        "compliant controls",
      ])
    ) {
      const compliant = complianceAssessments.filter(
        (item) => item.status === "Compliant"
      ).length;

      const partial = complianceAssessments.filter(
        (item) => item.status === "Partially Compliant"
      ).length;

      const nonCompliant = complianceAssessments.filter(
        (item) => item.status === "Non-Compliant"
      ).length;

      const notApplicable = complianceAssessments.filter(
        (item) => item.status === "Not Applicable"
      ).length;

      return [
        `SecureGRC currently has ${complianceAssessments.length} compliance assessment(s).`,
        "",
        `• Compliant: ${compliant}`,
        `• Partially Compliant: ${partial}`,
        `• Non-Compliant: ${nonCompliant}`,
        `• Not Applicable: ${notApplicable}`,
      ].join("\n");
    }

    // ----------------------------------------------------------
    // EVIDENCE
    // ----------------------------------------------------------

    if (
      hasAny(q, [
        "evidence",
        "evidence repository",
        "evidence status",
        "our evidence",
        "show evidence",
      ])
    ) {
      const valid = evidence.filter(
        (item) => item.status === "Valid"
      ).length;

      const expired = evidence.filter(
        (item) => item.status === "Expired"
      ).length;

      const pending = evidence.filter(
        (item) => item.status === "Pending Review"
      ).length;

      return [
        `SecureGRC currently contains ${evidence.length} evidence item(s).`,
        "",
        `• Valid: ${valid}`,
        `• Expired: ${expired}`,
        `• Pending Review: ${pending}`,
      ].join("\n");
    }

    // ----------------------------------------------------------
    // POLICIES
    // ----------------------------------------------------------

    if (
      hasAny(q, [
        "policy",
        "policies",
        "policy status",
        "policy summary",
        "our policies",
      ])
    ) {
      const active = policies.filter(
        (policy) => policy.status === "Active"
      ).length;

      const review = policies.filter(
        (policy) => policy.status === "Under Review"
      ).length;

      const draft = policies.filter(
        (policy) => policy.status === "Draft"
      ).length;

      const retired = policies.filter(
        (policy) => policy.status === "Retired"
      ).length;

      return [
        `SecureGRC currently has ${policies.length} policy record(s).`,
        "",
        `• Active: ${active}`,
        `• Under Review: ${review}`,
        `• Draft: ${draft}`,
        `• Retired: ${retired}`,
      ].join("\n");
    }

    // ----------------------------------------------------------
    // SECUREGRC
    // ----------------------------------------------------------

    if (
      hasAny(q, [
        "what is securegrc",
        "what does securegrc do",
        "about securegrc",
        "securegrc project",
        "explain securegrc",
      ])
    ) {
      return [
        "SecureGRC is an educational Governance, Risk, and Compliance platform that simulates enterprise GRC workflows.",
        "",
        "The current application includes:",
        "• Dashboard",
        "• Asset management",
        "• Risk assessment",
        "• Security controls",
        "• Compliance assessment",
        "• Evidence tracking",
        "• Gap analysis",
        "• Remediation tracking",
        "• Internal audits",
        "• Policy management",
        "• Reports",
        "• AI GRC Assistant",
        "• Settings and authentication",
      ].join("\n");
    }

    return null;
  }

  // ------------------------------------------------------------
  // GENERAL / GRC / CYBERSECURITY ANSWERS
  // ------------------------------------------------------------

  function getFallbackAnswer(question: string): string {
    const q = normalize(question);

    // Casual conversation
    if (
      q === "hi" ||
      q === "hello" ||
      q === "hey" ||
      q.includes("whats up") ||
      q.includes("how are you") ||
      q.includes("how are u")
    ) {
      return "Hey! 👋 I'm doing great. What's up with you?";
    }

    if (
      q === "thanks" ||
      q === "thank you" ||
      q.includes("thanks a lot")
    ) {
      return "You're welcome! 😊";
    }

    if (
      q === "bye" ||
      q.includes("goodbye") ||
      q.includes("see you")
    ) {
      return "Bye! Have a great day!";
    }

    // GRC
    if (
      hasAny(q, [
        "what is grc",
        "what does grc mean",
        "define grc",
        "explain grc",
      ])
    ) {
      return [
        "GRC stands for Governance, Risk, and Compliance.",
        "",
        "• Governance — establishes policies, responsibilities, and decision-making structures.",
        "• Risk — identifies, assesses, and treats risks that could affect the organization.",
        "• Compliance — helps ensure the organization meets applicable laws, regulations, standards, and internal requirements.",
        "",
        "In practice, GRC connects these activities so an organization can manage security and business risk in a structured way.",
      ].join("\n");
    }

    // Residual risk
    if (
      hasAny(q, [
        "residual risk",
        "remaining risk",
        "risk after controls",
      ])
    ) {
      return [
        "Residual risk is the risk that remains after existing controls or risk treatments have been applied.",
        "",
        "Example:",
        "If an application initially has a high risk because of weak access controls, implementing MFA and stronger access restrictions can reduce the risk.",
        "",
        "The risk that remains after those controls are considered is the residual risk.",
        "",
        "In SecureGRC, residual risk is represented using residual likelihood × residual impact.",
      ].join("\n");
    }

    // Inherent risk
    if (
      hasAny(q, [
        "inherent risk",
        "risk before controls",
        "risk without controls",
      ])
    ) {
      return [
        "Inherent risk is the level of risk before considering the effect of existing controls or risk treatments.",
        "",
        "For example, if a system contains sensitive financial data and has a major exposure, its inherent risk may be high before security controls are considered.",
      ].join("\n");
    }

    // Risk vs vulnerability
    if (
      hasAny(q, [
        "risk vs vulnerability",
        "difference between risk and vulnerability",
        "risk and vulnerability",
      ])
    ) {
      return [
        "A vulnerability is a weakness that could potentially be exploited.",
        "",
        "Risk is the potential harm or loss associated with a threat exploiting a vulnerability.",
        "",
        "Example:",
        "• Vulnerability: An outdated web server.",
        "• Threat: An attacker targeting the server.",
        "• Risk: The possibility that exploitation causes data loss or service disruption.",
      ].join("\n");
    }

    // Risk
    if (
      hasAny(q, [
        "what is risk",
        "define risk",
        "explain risk",
      ])
    ) {
      return "Risk is the possibility that a threat or event could exploit a weakness and cause harm, loss, disruption, or another unwanted outcome. In GRC, risk is commonly evaluated using likelihood and impact.";
    }

    // Vulnerability
    if (
      hasAny(q, [
        "what is vulnerability",
        "define vulnerability",
        "explain vulnerability",
      ])
    ) {
      return "A vulnerability is a weakness in a system, application, process, configuration, or control that could potentially be exploited by a threat.";
    }

    // Cybersecurity
    if (
      hasAny(q, [
        "what is cybersecurity",
        "define cybersecurity",
        "explain cybersecurity",
      ])
    ) {
      return "Cybersecurity is the practice of protecting systems, networks, applications, and data from unauthorized access, attacks, disruption, damage, or theft.";
    }

    // CIA
    if (
      hasAny(q, [
        "cia triad",
        "cia triangle",
        "confidentiality integrity availability",
      ])
    ) {
      return [
        "The CIA triad represents three core information-security objectives:",
        "",
        "• Confidentiality — preventing unauthorized access to information.",
        "• Integrity — preventing unauthorized alteration or destruction.",
        "• Availability — ensuring systems and information are accessible when needed.",
      ].join("\n");
    }

    // Phishing
    if (
      hasAny(q, [
        "what is phishing",
        "define phishing",
        "explain phishing",
      ])
    ) {
      return "Phishing is a social-engineering technique where an attacker attempts to trick someone into revealing information, clicking a malicious link, downloading malware, or performing another unsafe action.";
    }

    // ISO 27001
    if (
      hasAny(q, [
        "what is iso 27001",
        "iso 27001",
        "explain iso 27001",
      ])
    ) {
      return "ISO/IEC 27001 is an international standard for establishing, implementing, maintaining, and continually improving an Information Security Management System (ISMS).";
    }

    // Firewall
    if (
      hasAny(q, [
        "what is firewall",
        "define firewall",
        "explain firewall",
      ])
    ) {
      return "A firewall is a security control that monitors and filters network traffic according to defined rules. It can help restrict unauthorized communication while allowing legitimate traffic.";
    }

    // MFA
    if (
      hasAny(q, [
        "what is mfa",
        "what is multi factor authentication",
        "multi factor authentication",
      ])
    ) {
      return "Multi-factor authentication (MFA) requires users to provide two or more types of authentication factors, such as something they know, something they have, or something they are.";
    }

    // IAM
    if (
      hasAny(q, [
        "what is iam",
        "identity and access management",
        "explain iam",
      ])
    ) {
      return "Identity and Access Management (IAM) is the process of managing digital identities and controlling who can access systems, applications, and resources.";
    }

    // Generic fallback
    return [
      "I can help with SecureGRC, GRC, cybersecurity, and many general questions.",
      "",
      "Try asking something like:",
      "• What is residual risk?",
      "• What are our highest risks?",
      "• Summarize our audits",
      "• Show me open gaps",
      "• What is ISO 27001?",
      "• What is MFA?",
    ].join("\n");
  }

  // ------------------------------------------------------------
  // SEND MESSAGE
  // ------------------------------------------------------------

  function sendMessage(text?: string) {
    const question = (text ?? input).trim();

    if (!question) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    const projectAnswer = getProjectAnswer(question);

    const answer =
      projectAnswer ?? getFallbackAnswer(question);

    const assistantMessage: Message = {
      id: Date.now() + 1,
      role: "assistant",
      content: answer,
    };

    setMessages((current) => [
      ...current,
      userMessage,
      assistantMessage,
    ]);

    setInput("");
  }

  // ------------------------------------------------------------
  // CLEAR CHAT
  // ------------------------------------------------------------

  function clearChat() {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content:
          "Chat cleared. Ask me anything about SecureGRC, GRC, cybersecurity, or general topics.",
      },
    ]);
  }

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <div className="p-6 h-[calc(100vh-5rem)]">
      <div className="h-full flex flex-col gap-5">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <Bot className="w-7 h-7 text-cyan-400" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">
                  AI GRC Assistant
                </h1>

                <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SecureGRC AI
                </span>
              </div>

              <p className="text-sm text-slate-400 mt-1">
                GRC, cybersecurity, SecureGRC and general knowledge assistant.
              </p>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Clear Chat
          </button>
        </div>

        {/* Live project status */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-800">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />

          <div>
            <p className="text-sm font-medium text-white">
              SecureGRC project context connected
            </p>

            <p className="text-xs text-slate-500">
              {assets.length} assets • {risks.length} risks •{" "}
              {controls.length} controls •{" "}
              {complianceAssessments.length} compliance assessments •{" "}
              {evidence.length} evidence •{" "}
              {gaps.length} gaps •{" "}
              {remediations.length} remediation actions •{" "}
              {audits.length} audits •{" "}
              {policies.length} policies
            </p>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 min-h-0 bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] ${
                    message.role === "user"
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-slate-800 text-slate-200"
                  } rounded-2xl px-4 py-3`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {message.role === "assistant" ? (
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}

                    <span className="text-xs font-semibold opacity-70">
                      {message.role === "user"
                        ? "You"
                        : "SecureGRC AI"}
                    </span>
                  </div>

                  <div className="text-sm whitespace-pre-line leading-6">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick prompts */}
          <div className="px-5 py-3 border-t border-slate-800">
            <p className="text-xs text-slate-500 mb-2">
              Try asking
            </p>

            <div className="flex gap-2 overflow-x-auto pb-1">
              <QuickPrompt
                text="What is GRC?"
                onClick={sendMessage}
              />

              <QuickPrompt
                text="What are our highest risks?"
                onClick={sendMessage}
              />

              <QuickPrompt
                text="Show me open gaps"
                onClick={sendMessage}
              />

              <QuickPrompt
                text="Explain residual risk"
                onClick={sendMessage}
              />

              <QuickPrompt
                text="Summarize our audits"
                onClick={sendMessage}
              />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Ask anything..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
              />

              <button
                onClick={() => sendMessage()}
                className="px-4 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-600 mt-2">
              SecureGRC AI uses live project data for project-specific
              questions and built-in knowledge for common GRC and
              cybersecurity questions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// QUICK PROMPT
// ------------------------------------------------------------

function QuickPrompt({
  text,
  onClick,
}: {
  text: string;
  onClick: (text: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(text)}
      className="shrink-0 px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-xs text-slate-300 hover:border-cyan-500 hover:text-cyan-400 transition"
    >
      {text}
    </button>
  );
}