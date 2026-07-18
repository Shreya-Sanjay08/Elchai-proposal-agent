/* ================================================
   Elchai AI Proposal Agent — Frontend Logic
   Author: Shreya Sanjay | Elchai Group Assessment
   ================================================ */

// API Base URL (Relative path since FastAPI serves the frontend)
const API_URL = "";

// State tracking for current tab and dynamic data
let currentData = null;

/**
 * Loads a highly relevant sample brief into the textarea
 */
function loadSample() {
    const sampleBrief = `We are Al Madina Retail, a premium boutique grocery group operating across Dubai. We need a modern e-commerce platform built over the next two months to let clients order high-end artisanal food items directly to their homes. 

Our estimated budget is AED 45,000. 

Key deliverables must include:
1. An elegant, fast storefront with category filtering
2. Secure user registration and profile management
3. Integration with a secure regional payment gateway (like Stripe/Checkout.com)
4. An administrative dashboard to track pending orders and update inventory
5. Automated SMS or Push Notifications for order updates.

We want premium, fast post-launch support and a team training session for our operational staff before going live. Please contact our coordinator at operations@almadinaretail.ae.`;
    
    const textarea = document.getElementById("brief-input");
    textarea.value = sampleBrief;
    // Trigger the character counter update
    updateCharCount({ target: textarea });
}

/**
 * Simple character counter listener
 */
function updateCharCount(e) {
    const count = e.target.value.length;
    document.getElementById("char-count").innerText = `${count} / 5000`;
}

// Add character count listener once DOM loads
document.addEventListener("DOMContentLoaded", () => {
    const textarea = document.getElementById("brief-input");
    if (textarea) {
        textarea.addEventListener("input", updateCharCount);
    }
});

/**
 * Handles the multi-stage pipeline animation and server communication
 */
async function generateProposal() {
    const briefInput = document.getElementById("brief-input").value.trim();
    const generateBtn = document.getElementById("generate-btn");
    const loadingSection = document.getElementById("loading-section");
    const resultsSection = document.getElementById("results-section");
    const errorBanner = document.getElementById("error-banner");

    // Clear previous view state
    errorBanner.style.display = "none";
    resultsSection.style.display = "none";

    if (!briefInput || briefInput.length < 20) {
        showError("Please provide a more detailed client brief (minimum 20 characters).");
        return;
    }

    // UI Feedback: Disable button and show the loading timeline
    generateBtn.disabled = true;
    loadingSection.style.display = "block";
    resetLoadingSteps();

    // Visual effect: Progressively highlight your agentic pipeline steps
    const stepIntervals = [];
    stepIntervals.push(setTimeout(() => advanceLoadingStep(1, 2), 1200));
    stepIntervals.push(setTimeout(() => advanceLoadingStep(2, 3), 2800));
    stepIntervals.push(setTimeout(() => advanceLoadingStep(3, 4), 4500));

    try {
        const response = await fetch(`${API_URL}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ brief: briefInput })
        });

        const data = await response.json();

        // Clear simulation intervals if server returned faster
        stepIntervals.forEach(clearTimeout);

        if (!response.ok) {
            throw new Error(data.detail || "An unexpected server error occurred.");
        }

        // Cache server data globally to manipulate later
        currentData = data;

        // Render data out to the view
        renderResults(data);

        // Transition visual panels
        loadingSection.style.display = "none";
        resultsSection.style.display = "block";
        showTab('proposal'); // Default view
        
    } catch (err) {
        loadingSection.style.display = "none";
        showError(err.message);
    } finally {
        generateBtn.disabled = false;
    }
}

/**
 * UI helpers to control pipeline animations
 */
function resetLoadingSteps() {
    for (let i = 1; i <= 4; i++) {
        const item = document.getElementById(`loading-${i}`);
        if (item) {
            item.className = "loading-step" + (i === 1 ? "" : " inactive");
        }
    }
}

function advanceLoadingStep(current, next) {
    const currentItem = document.getElementById(`loading-${current}`);
    const nextItem = document.getElementById(`loading-${next}`);
    if (currentItem) currentItem.className = "loading-step done";
    if (nextItem) nextItem.className = "loading-step";
}

/**
 * Populates all structural data views returned from the FastAPI backend pipeline
 */
function renderResults(data) {
    // 1. Render Status Banner & Checklist (Node 4 Output)
    const review = data.review_metadata;
    document.getElementById("status-desc").innerText = `${review.review_note}. This financial commitment requires human verification.`;
    document.getElementById("status-meta").innerText = `Risk Level: ${review.risk_level}\nValue: ${review.estimated_value}`;
    
    // Render Review Checklist with operational checkboxes
    let checklistHtml = `
        <div class="checklist-header">
            <div class="checklist-title">Human Verification Checklist</div>
            <div class="checklist-subtitle">${review.review_note} (Flagged at ${review.flagged_at})</div>
        </div>
        <div class="checklist-items">
    `;
    review.review_checklist.forEach((item, index) => {
        checklistHtml += `
            <div class="checklist-item" onclick="toggleChecklist(this)">
                <div class="checklist-checkbox"></div>
                <div class="checklist-text">${item}</div>
            </div>
        `;
    });
    checklistHtml += `</div><div class="risk-badge risk-${review.risk_level}">⚠️ Security Protocol Status: Action Blocked Until Approved</div>`;
    document.getElementById("checklist-output").innerHTML = checklistHtml;

    // 2. Render Proposal with basic Markdown parsing rules
    document.getElementById("proposal-meta").innerText = `Framework: GPT-4o Agent | Length: ~${data.proposal.length} chars`;
    document.getElementById("proposal-output").innerHTML = parseMarkdown(data.proposal);

    // 3. Render Extracted Structured JSON (Node 1 Output)
    document.getElementById("extracted-output").innerText = JSON.stringify(data.extracted_data, null, 2);

    // 4. Render Matched Services & Rates (Node 2 Output via RAG)
    const services = data.matched_services;
    let servicesHtml = `
        <div class="services-summary">
            <div class="estimate-total">${services.total_timeline}</div>
            <div class="estimate-label">Calculated Project Duration</div>
            <div class="estimate-total" style="margin-top: 10px; color: var(--success);">AED ${services.total_estimate_low.toLocaleString()} – ${services.total_estimate_high.toLocaleString()}</div>
            <div class="estimate-label">Total Knowledge Base Price Range Mapping</div>
        </div>
        <div class="services-grid">
    `;
    services.matched_services.forEach(srv => {
        servicesHtml += `
            <div class="service-card">
                <div>
                    <div class="service-name">⚡ ${srv.service_name}</div>
                    <div class="service-reason">${srv.relevance_reason}</div>
                </div>
                <div class="service-pricing">
                    <div class="service-price">${srv.price_range}</div>
                    <div class="service-timeline">⏱️ ${srv.timeline}</div>
                </div>
            </div>
        `;
    });
    servicesHtml += `</div>
        <div class="payment-table">
            <h4>Standard Payment Milestones Outlined</h4>
            <div class="payment-row"><span>Upfront Deposit (40%)</span><strong>${services.payment_schedule.upfront_40}</strong></div>
            <div class="payment-row"><span>Midpoint Progress (30%)</span><strong>${services.payment_schedule.midpoint_30}</strong></div>
            <div class="payment-row"><span>Final Delivery Balance (30%)</span><strong>${services.payment_schedule.delivery_30}</strong></div>
        </div>
    `;
    document.getElementById("services-output").innerHTML = servicesHtml;

    // 5. Render Step-by-Step System Activity Log
    let logHtml = "";
    data.activity_log.forEach(log => {
        const isReview = log.status.includes("PENDING");
        logHtml += `
            <tr>
                <td style="white-space: nowrap;">${log.timestamp}</td>
                <td class="log-node">${log.node}</td>
                <td title="${escapeHtml(log.input_summary)}">${escapeHtml(log.input_summary)}</td>
                <td title="${escapeHtml(log.output_summary)}">${escapeHtml(log.output_summary)}</td>
                <td><span class="${isReview ? 'log-status-pending' : 'log-status-complete'}">${log.status}</span></td>
            </tr>
        `;
    });
    document.getElementById("log-body").innerHTML = logHtml;
}

/**
 * Handles tab navigation switcher
 */
function showTab(tabName) {
    // Deactivate all tab controls & contents
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

    // Find target items
    const targetTabBtn = document.querySelector(`.tab[onclick*="'${tabName}'"]`);
    const targetContent = document.getElementById(`tab-${tabName}`);

    if (targetTabBtn) targetTabBtn.classList.add("active");
    if (targetContent) targetContent.classList.add("active");
}

/**
 * Checklist item completion toggle effect
 */
function toggleChecklist(element) {
    element.classList.toggle("checked");
    const checkmark = element.querySelector(".checklist-checkbox");
    checkmark.innerText = element.classList.contains("checked") ? "✓" : "";
}

/**
 * Copies the raw layout to system clipboard
 */
function copyProposal() {
    if (!currentData || !currentData.proposal) return;
    navigator.clipboard.writeText(currentData.proposal)
        .then(() => {
            const copyBtn = document.querySelector(".btn-copy");
            const originalText = copyBtn.innerText;
            copyBtn.innerText = "✓ Copied Text!";
            setTimeout(() => copyBtn.innerText = originalText, 2000);
        })
        .catch(err => alert("Could not copy proposal automatically: ", err));
}

/**
 * Simple client-side Markdown to HTML renderer for clean UI presentation
 */
function parseMarkdown(md) {
    let html = md;
    
    // Parse Markdown tables cleanly
    html = html.replace(/\|(.+)\|/g, (match) => {
        if (match.includes('---')) return ''; // Skip structural break lines
        const cells = match.split('|').map(c => c.trim()).filter(c => c !== '');
        const tag = match.includes('Investment') || match.includes('Service') ? 'th' : 'td';
        return `<tr>${cells.map(c => `<${tag}>${c}</${tag}>`).join('')}</tr>`;
    });
    // Wrap consecutive table row conversions inside a true block
    html = html.replace(/(<tr>[\s\S]*?<\/tr>)+/g, '<table>$&</table>');
    
    // Standard block formatting
    html = html.replace(/### (.*)/g, '<h3>$1</h3>');
    html = html.replace(/## (.*)/g, '<h2>$1</h2>');
    html = html.replace(/# (.*)/g, '<h1>$1</h1>');
    html = html.replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/^\s*\*\s(.*)/gm, '<li>$1</li>');
    
    // Wrap continuous loose list tags neatly
    html = html.replace(/(<li>[\s\S]*?<\/li>)+/g, '<ul>$&</ul>');
    
    // Clean up empty double spaces to form simple paragraph dividers
    html = html.replace(/^\s*(?!<h|<ul|<li|<table|<tr|<td)(.+)/gm, '<p>$1</p>');
    
    return html;
}

function showError(msg) {
    const errorBanner = document.getElementById("error-banner");
    document.getElementById("error-message").innerText = msg;
    errorBanner.style.display = "flex";
    errorBanner.scrollIntoView({ behavior: "smooth" });
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}