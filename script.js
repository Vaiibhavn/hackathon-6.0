// ==============================
// Supabase Initialization
// ==============================
const SUPABASE_URL = "https://axfymlpwndgkgahabenj.supabase.co"; // 🔹 replace with your Supabase URL
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZnltbHB3bmRna2dhaGFiZW5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDAzNDEsImV4cCI6MjA3MjMxNjM0MX0.KYIZ7Sjq0a0zkyOmX59eOhovqhOV1Jm0vBsm_eJlsHM"; // 🔹 replace with your anon key
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==============================
// Global State
// ==============================
let allIssues = []; // cache issues so filters/search can work on client

// ==============================
// Utility Functions
// ==============================

// Render issues into the list
function renderIssues(issues) {
  const list = document.getElementById("issuesList");
  list.innerHTML = "";

  if (!issues || issues.length === 0) {
    list.innerHTML = "<p>No issues found.</p>";
    return;
  }

  issues.forEach((issue) => {
    const card = document.createElement("div");
    card.className = "issue-card";

    card.innerHTML = `
      <h3>${issue.title}</h3>
      <p><strong>Description:</strong> ${issue.description}</p>
      <p><strong>Location:</strong> ${issue.location}</p>
      <p><strong>Priority:</strong> ${issue.priority}</p>
      <p><strong>Status:</strong> ${issue.status || "Pending"}</p>
      <p><strong>Tracking ID:</strong> ${issue.tracking_id}</p>
      <p><small>Reported on: ${new Date(issue.date_reported).toLocaleString()}</small></p>
    `;

    list.appendChild(card);
  });
}

// ==============================
// Supabase Queries
// ==============================

// Load all issues
async function loadIssues() {
  const { data, error } = await db
    .from("issues")
    .select("*")
    .order("date_reported", { ascending: false });

  if (error) {
    console.error("Error loading issues:", error.message);
    return;
  }

  allIssues = data || [];
  renderIssues(allIssues);
}

// Submit new issue
async function handleFormSubmit(e) {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const location = document.getElementById("location").value;
  const priority = document.getElementById("priority").value;

  const trackingId =
    "ISSUE-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data, error } = await db
    .from("issues")
    .insert([
      {
        title,
        description,
        location,
        priority,
        tracking_id: trackingId,
      },
    ])
    .select();

  if (error) {
    alert("Error submitting issue: " + error.message);
    return;
  }

  alert("Issue submitted successfully! Tracking ID: " + trackingId);
  e.target.reset();
  loadIssues();
}

// Search issue by tracking ID
async function searchIssue(e) {
  e.preventDefault();

  const trackingId = document.getElementById("searchInput").value.trim();
  if (!trackingId) {
    renderIssues(allIssues); // show all if empty
    return;
  }

  const { data, error } = await db
    .from("issues")
    .select("*")
    .eq("tracking_id", trackingId);

  if (error) {
    console.error("Error searching issue:", error.message);
    return;
  }

  renderIssues(data);
}

// Filter issues by priority or status (extra UI feature)
function filterIssues() {
  const priority = document.getElementById("filterPriority").value;
  const status = document.getElementById("filterStatus").value;

  let filtered = [...allIssues];

  if (priority !== "all") {
    filtered = filtered.filter((i) => i.priority === priority);
  }
  if (status !== "all") {
    filtered = filtered.filter((i) => (i.status || "Pending") === status);
  }

  renderIssues(filtered);
}

// ==============================
// Event Listeners
// ==============================
document
  .getElementById("reportForm")
  .addEventListener("submit", handleFormSubmit);

document
  .getElementById("searchForm")
  .addEventListener("submit", searchIssue);

// Only add these listeners if filters exist in your HTML
if (document.getElementById("filterPriority")) {
  document.getElementById("filterPriority").addEventListener("change", filterIssues);
}
if (document.getElementById("filterStatus")) {
  document.getElementById("filterStatus").addEventListener("change", filterIssues);
}

document.addEventListener("DOMContentLoaded", loadIssues);
