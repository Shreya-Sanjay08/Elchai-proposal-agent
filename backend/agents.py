"""
agents.py — Multi-stage AI agent pipeline for Client Brief → Proposal Draft
Elchai Group Assessment | Shreya Sanjay
"""

import os
import json
import time
from datetime import datetime
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="add-api-key-here" # Replace with your actual API key
)

# Load knowledge base once at startup
def load_knowledge_base():
    kb_path = os.path.join(os.path.dirname(__file__), "knowledge_base.txt")
    with open(kb_path, "r") as f:
        return f.read()

KNOWLEDGE_BASE = load_knowledge_base()


def log_entry(node: str, input_data: str, output_data: str, status: str = "COMPLETE") -> dict:
    """Create a structured log entry for the activity log."""
    return {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "node": node,
        "input_summary": input_data[:120] + "..." if len(input_data) > 120 else input_data,
        "output_summary": output_data[:120] + "..." if len(output_data) > 120 else output_data,
        "status": status,
        "model": "gpt-4o"
    }


# ─────────────────────────────────────────────
# NODE 1: EXTRACTOR AGENT
# ─────────────────────────────────────────────
def run_extractor_agent(raw_brief: str) -> tuple[dict, dict]:
    """
    Extracts structured data from raw client brief.
    Returns (extracted_data, log_entry)
    """
    system_prompt = """You are a precise information extraction agent.
Your job is to extract key project details from a raw client brief.
Extract ONLY what is explicitly stated. Never invent or assume missing details.
If a field is not mentioned, set its value to null.

Return a valid JSON object with exactly these fields:
{
  "client_name": string or null,
  "project_type": string or null,
  "project_description": string or null,
  "budget_mentioned": string or null,
  "deadline_mentioned": string or null,
  "deliverables": [list of strings],
  "special_requirements": [list of strings],
  "industry": string or null,
  "contact_info": string or null
}

Return ONLY the JSON. No markdown, no explanation."""

    response = client.chat.completions.create(
        model="openrouter/free",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Extract from this client brief:\n\n{raw_brief}"}
        ],
        temperature=0.1,
        response_format={"type": "json_object"}
    )

    extracted = json.loads(response.choices[0].message.content)
    log = log_entry(
        "Node 1 — Extractor Agent",
        raw_brief,
        json.dumps(extracted, indent=2)
    )
    return extracted, log


# ─────────────────────────────────────────────
# NODE 2: RAG MATCHING AGENT
# ─────────────────────────────────────────────
def run_rag_agent(extracted_data: dict) -> tuple[dict, dict]:
    """
    Matches extracted requirements to relevant services and pricing
    from the company knowledge base.
    Returns (matched_services, log_entry)
    """
    system_prompt = f"""You are a service matching agent for Elchai Group.
You have access to the company's complete service catalogue and pricing.

KNOWLEDGE BASE:
{KNOWLEDGE_BASE}

Your job is to match the client's requirements to the most relevant services.
Return a JSON object with:
{{
  "matched_services": [
    {{
      "service_name": string,
      "relevance_reason": string,
      "price_range": string,
      "timeline": string
    }}
  ],
  "total_estimate_low": number,
  "total_estimate_high": number,
  "total_timeline": string,
  "payment_schedule": {{
    "upfront_40": string,
    "midpoint_30": string,
    "delivery_30": string
  }},
  "recommended_addons": [string]
}}

Base estimates ONLY on the knowledge base pricing. Never invent prices."""

    response = client.chat.completions.create(
        model="openrouter/free",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Match services for this client requirement:\n{json.dumps(extracted_data, indent=2)}"}
        ],
        temperature=0.1,
        response_format={"type": "json_object"}
    )

    matched = json.loads(response.choices[0].message.content)
    log = log_entry(
        "Node 2 — RAG Matching Agent",
        json.dumps(extracted_data, indent=2),
        json.dumps(matched, indent=2)
    )
    return matched, log


# ─────────────────────────────────────────────
# NODE 3: PROPOSAL GENERATOR AGENT
# ─────────────────────────────────────────────
def run_proposal_generator(extracted_data: dict, matched_services: dict) -> tuple[str, dict]:
    """
    Generates a complete, professional business proposal.
    Returns (proposal_markdown, log_entry)
    """
    system_prompt = """You are a senior business proposal writer for Elchai Group, Dubai.
Write professional, compelling, client-focused proposals.
Use formal but warm language. Be specific. Avoid generic filler.

Structure the proposal with these sections using markdown:
1. Executive Summary
2. Understanding Your Requirements
3. Proposed Scope of Work
4. Deliverables & Timeline
5. Investment
6. Payment Schedule
7. Why Choose Elchai Group
8. Next Steps
9. Terms & Conditions

For the Investment section, present pricing in a clear table format.
Tailor every section to the specific client and project. Make it feel personal, not templated."""

    user_content = f"""Generate a complete business proposal using this data:

CLIENT BRIEF ANALYSIS:
{json.dumps(extracted_data, indent=2)}

MATCHED SERVICES & PRICING:
{json.dumps(matched_services, indent=2)}

Make it professional, specific to this client, and compelling."""

    response = client.chat.completions.create(
        model="openrouter/free",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        temperature=0.7,
        max_tokens=2500
    )

    proposal = response.choices[0].message.content
    log = log_entry(
        "Node 3 — Proposal Generator",
        f"Extracted: {extracted_data.get('project_type', 'N/A')} | Services: {len(matched_services.get('matched_services', []))} matched",
        proposal[:150]
    )
    return proposal, log


# ─────────────────────────────────────────────
# NODE 4: HUMAN REVIEW FLAGGING
# ─────────────────────────────────────────────
def run_review_flag(proposal: str, matched_services: dict) -> tuple[dict, dict]:
    """
    Adds mandatory human review flag before output reaches client.
    Returns (review_metadata, log_entry)
    """
    total_low = matched_services.get("total_estimate_low", 0)
    total_high = matched_services.get("total_estimate_high", 0)

    # Determine risk level based on proposal value
    if total_high > 50000:
        risk_level = "HIGH"
        review_note = "High-value proposal — requires Director approval"
    elif total_high > 20000:
        risk_level = "MEDIUM"
        review_note = "Mid-value proposal — requires Senior Manager approval"
    else:
        risk_level = "LOW"
        review_note = "Standard proposal — requires Manager approval"

    review_metadata = {
        "status": "PENDING HUMAN REVIEW",
        "risk_level": risk_level,
        "review_note": review_note,
        "flagged_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "estimated_value": f"AED {total_low:,} – {total_high:,}",
        "review_checklist": [
            "Verify pricing matches current rate card",
            "Confirm timeline is achievable with current team",
            "Check client name and contact details",
            "Validate all deliverables are within scope",
            "Review payment terms for client type",
            "Approve before sending to client"
        ],
        "auto_send_blocked": True,
        "reason": "Financial commitment requires human verification"
    }

    log = log_entry(
        "Node 4 — Human Review Flag",
        f"Proposal value: AED {total_low:,} – {total_high:,}",
        f"Status: PENDING HUMAN REVIEW | Risk: {risk_level}",
        status="PENDING HUMAN REVIEW"
    )
    return review_metadata, log


# ─────────────────────────────────────────────
# MAIN PIPELINE ORCHESTRATOR
# ─────────────────────────────────────────────
def run_pipeline(raw_brief: str) -> dict:
    """
    Runs the complete 4-node agent pipeline.
    Returns full result with proposal, metadata, and activity log.
    """
    activity_log = []
    start_time = time.time()

    try:
        # Node 1: Extract
        extracted_data, log1 = run_extractor_agent(raw_brief)
        activity_log.append(log1)

        # Node 2: RAG Match
        matched_services, log2 = run_rag_agent(extracted_data)
        activity_log.append(log2)

        # Node 3: Generate Proposal
        proposal, log3 = run_proposal_generator(extracted_data, matched_services)
        activity_log.append(log3)

        # Node 4: Human Review Flag
        review_metadata, log4 = run_review_flag(proposal, matched_services)
        activity_log.append(log4)

        elapsed = round(time.time() - start_time, 2)

        return {
            "success": True,
            "pipeline_duration_seconds": elapsed,
            "extracted_data": extracted_data,
            "matched_services": matched_services,
            "proposal": proposal,
            "review_metadata": review_metadata,
            "activity_log": activity_log
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "activity_log": activity_log
        }