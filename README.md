# SecureGRC — Automated GRC Compliance & Risk Assessment Platform

SecureGRC is a web-based Governance, Risk, and Compliance (GRC) platform designed to simulate enterprise security governance, risk management, compliance assessment, evidence management, remediation, internal auditing, and security reporting workflows.

The project was built as a practical cybersecurity/GRC portfolio project to demonstrate how security risks and compliance requirements can be managed through a centralized application.

---

## Overview

Organizations need to continuously understand their security risks, evaluate controls, maintain compliance evidence, identify gaps, and track remediation activities.

SecureGRC brings these activities together into a single platform.

The application provides modules for:

- Asset Management
- Risk Management
- Security Controls
- Compliance Assessment
- Evidence Management
- Gap Analysis
- Remediation Tracking
- Internal Audits
- Policy Management
- Executive Reporting
- AI-Assisted GRC Analysis
- Authentication and Settings

---

## Key Features

### 1. Executive Dashboard

Provides a centralized overview of the organization's GRC posture, including:

- Overall risk posture
- Risk severity distribution
- Asset inventory
- Control implementation
- Compliance status
- Open gaps
- Remediation activity
- GRC metrics and visualizations

---

### 2. Asset Register

The Asset Register allows organizations to maintain an inventory of business and technology assets.

Each asset can include:

- Asset name
- Asset type
- Owner
- Department
- Description
- Location
- Data classification
- Business criticality
- Confidentiality
- Integrity
- Availability
- Active/Inactive status

---

### 3. Risk Register

SecureGRC provides structured risk assessment using:

- Likelihood
- Impact
- Inherent Risk
- Risk Level
- Threat
- Vulnerability
- Existing Controls
- Risk Owner
- Risk Treatment
- Residual Likelihood
- Residual Impact
- Residual Risk
- Risk Status
- Target Date

Risk scores are calculated using:

`Risk Score = Likelihood × Impact`

Risk classification:

| Score | Level |
|---|---|
| 1–4 | Low |
| 5–9 | Medium |
| 10–16 | High |
| 17–25 | Critical |

Risk treatments supported:

- Mitigate
- Transfer
- Accept
- Avoid

---

### 4. Security Controls

The Control Library provides centralized management of security controls.

Controls include:

- Framework
- Control ID
- Control name
- Description
- Category
- Owner
- Implementation status
- Evidence requirement
- Related risks

Supported implementation states:

- Implemented
- Partially Implemented
- Not Implemented
- Not Applicable

---

### 5. Compliance Assessment

SecureGRC supports compliance assessment workflows using framework requirements.

Assessment information includes:

- Framework
- Control
- Requirement
- Compliance status
- Evidence
- Gap
- Risk
- Owner
- Comments

Compliance states:

- Compliant
- Partially Compliant
- Non-Compliant
- Not Applicable

---

### 6. Evidence Repository

The Evidence Repository provides a centralized place to track compliance and control evidence.

Evidence records include:

- Evidence name
- Related control
- Evidence type
- Owner
- Upload date
- Expiry date
- Status
- Notes

Evidence status includes:

- Valid
- Expired
- Pending Review

---

### 7. Gap Analysis

Gap Analysis identifies differences between the current security/compliance state and the required state.

Gap records include:

- Gap ID
- Framework
- Control
- Current State
- Required State
- Gap Description
- Risk
- Business Impact
- Recommendation
- Owner
- Priority
- Target Date
- Status

---

### 8. Remediation Tracker

Remediation management allows identified findings to be converted into trackable corrective actions.

Each remediation record includes:

- Action ID
- Finding
- Risk
- Recommendation
- Owner
- Priority
- Due Date
- Status
- Completion Date
- Notes

Supported statuses:

- Open
- In Progress
- Blocked
- Completed
- Accepted Risk

---

### 9. Internal Audit Module

The Internal Audit module simulates GRC audit workflows.

Audit records include:

- Framework
- Control
- Audit question
- Evidence
- Finding
- Test status
- Auditor notes

Audit statuses:

- Pass
- Partial
- Fail
- Not Tested

---

### 10. Policy Library

The Policy Library provides lifecycle management for organizational security policies.

Policy records include:

- Policy name
- Category
- Owner
- Version
- Status
- Review date
- Description

Policy lifecycle states:

- Draft
- Active
- Under Review
- Retired

---

### 11. Executive Reports

The Reports module consolidates GRC information into an executive-level view.

Reports include:

- Executive Risk Summary
- Risk Distribution
- Control Implementation
- Framework Compliance
- Gap Status
- Remediation Status
- Audit Results
- Policy Status
- Average Risk Score
- Overall Risk Level

Reports can also be printed for documentation purposes.

---

### 12. AI GRC Assistant

SecureGRC includes an AI-assisted GRC interface designed to answer:

- SecureGRC project questions
- GRC questions
- Cybersecurity questions
- Risk management questions
- Compliance questions
- Audit questions
- General knowledge questions
- Casual conversational queries

The assistant can use live SecureGRC application data for project-specific queries.

Examples:

```text
What are our highest risks?

Show me open gaps.

Summarize our audits.

Explain residual risk.

What is GRC?

What is ISO 27001?

What is the CIA triad?
