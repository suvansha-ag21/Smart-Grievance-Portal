// AI Review Service for Grievance Redressal and Fraud/Duplicate Detection

const CATEGORY_KEYWORDS = {
  "Roads & Infrastructure": ["pothole", "road", "tar", "footpath", "bridge", "divider", "crater", "asphalt", "traffic signal"],
  "Water Supply": ["water", "leak", "pipeline", "tap", "pressure", "contamination", "dirty water", "tanker"],
  "Electricity": ["electricity", "power", "street light", "wire", "spark", "transformer", "blackout", "pole", "meter"],
  "Sanitation & Waste": ["garbage", "trash", "dump", "waste", "drainage", "sewage", "gutter", "overflow", "smell", "dustbin"],
  "Public Health": ["mosquito", "dengue", "malaria", "stagnant", "hospital", "dispensary", "sanitation", "cleanliness"],
};

const CRITICAL_KEYWORDS = [
  "exposed wire", "live wire", "sparking", "electric shock", "explosion",
  "drinking water contaminated", "open manhole", "deep crater", "major accident"
];

const HIGH_PRIORITY_KEYWORDS = [
  "flooding", "sewage backup", "blackout", "traffic blocked", "burst pipe",
  "broken streetlight", "urgent", "hospital route"
];

// Calculate Jaccard text similarity between two strings
function computeTextSimilarity(textA = "", textB = "") {
  const wordsA = new Set(textA.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean));
  const wordsB = new Set(textB.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }

  const union = wordsA.size + wordsB.size - intersection;
  return union === 0 ? 0 : Math.round((intersection / union) * 100);
}

export const aiReviewService = {
  // Suggest category based on complaint title & description
  suggestCategory: (text = "") => {
    const lower = text.toLowerCase();
    let bestCategory = "Roads & Infrastructure";
    let maxHits = 0;

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      let hits = 0;
      for (const kw of keywords) {
        if (lower.includes(kw)) hits++;
      }
      if (hits > maxHits) {
        maxHits = hits;
        bestCategory = category;
      }
    }

    return {
      suggestedCategory: bestCategory,
      confidence: maxHits > 0 ? Math.min(60 + maxHits * 15, 95) : 50,
    };
  },

  // Recommend priority based on public safety keywords
  recommendPriority: (title = "", description = "") => {
    const fullText = `${title} ${description}`.toLowerCase();

    for (const kw of CRITICAL_KEYWORDS) {
      if (fullText.includes(kw)) {
        return {
          priority: "Critical",
          reason: `High public safety hazard detected ("${kw}")`,
        };
      }
    }

    for (const kw of HIGH_PRIORITY_KEYWORDS) {
      if (fullText.includes(kw)) {
        return {
          priority: "High",
          reason: `Urgent civic condition indicated ("${kw}")`,
        };
      }
    }

    return {
      priority: "Medium",
      reason: "Standard civic issue resolution timeline",
    };
  },

  // Detect duplicate complaints from existing complaints list
  findDuplicates: (targetComplaint, allComplaints = [], threshold = 35) => {
    if (!targetComplaint || !allComplaints.length) return [];

    const matches = [];
    const targetText = `${targetComplaint.title} ${targetComplaint.description}`;

    for (const other of allComplaints) {
      if (String(other._id) === String(targetComplaint._id)) continue;

      const otherText = `${other.title} ${other.description}`;
      const textScore = computeTextSimilarity(targetText, otherText);

      // Check location overlap
      const sameLoc = (targetComplaint.location && other.location &&
        (targetComplaint.location.toLowerCase().includes(other.location.toLowerCase()) ||
         other.location.toLowerCase().includes(targetComplaint.location.toLowerCase())));

      let totalScore = textScore;
      if (sameLoc) totalScore += 20;
      totalScore = Math.min(totalScore, 100);

      if (totalScore >= threshold) {
        matches.push({
          complaint: other,
          similarityScore: totalScore,
          isSameLocation: Boolean(sameLoc),
        });
      }
    }

    return matches.sort((a, b) => b.similarityScore - a.similarityScore);
  },

  // Check for suspicious or low-evidence complaint
  evaluateEvidence: (complaint) => {
    const desc = complaint.description || "";
    const hasImage = Boolean(complaint.image);
    const flags = [];

    // Backend AI vision inspection findings (e.g. Canva/AI metadata, texture mismatch)
    if (complaint.analysisReasons && Array.isArray(complaint.analysisReasons) && complaint.analysisReasons.length > 0) {
      complaint.analysisReasons.forEach((r) => {
        if (!flags.includes(r)) flags.push(r);
      });
    }

    if (complaint.aiFlag && (
      complaint.aiFlag.includes("Synthetic") ||
      complaint.aiFlag.includes("Canva") ||
      complaint.aiFlag.includes("Graphic") ||
      complaint.aiFlag.includes("Irrelevant") ||
      complaint.aiFlag.includes("Fake") ||
      complaint.aiFlag.includes("Manipulated")
    )) {
      if (!flags.some((f) => f.includes("Synthetic") || f.includes("Canva"))) {
        flags.unshift(complaint.aiFlag);
      }
    }

    if (desc.trim().length < 25 && !flags.some((f) => f.includes("description"))) {
      flags.push("Very short description; insufficient details for investigation");
    }

    if (!hasImage) {
      flags.push("No photographic evidence provided (requires physical verification)");
    }

    if (/^(test|fake|asdf|qwerty|1234|check)\b/i.test(complaint.title || "")) {
      flags.push("Title matches test/placeholder pattern");
    }

    if (complaint.authenticityScore !== undefined && complaint.authenticityScore < 75) {
      if (!flags.some((f) => f.includes("authenticity") || f.includes("Authenticity"))) {
        flags.push(`Low authenticity score (${complaint.authenticityScore}%); potential synthetic export or non-camera sensor capture`);
      }
    }

    const isFlagged =
      flags.length > 0 ||
      (complaint.authenticityScore !== undefined && complaint.authenticityScore < 75) ||
      (complaint.aiFlag && complaint.aiFlag !== "Clean" && !complaint.aiFlag.includes("Verified"));

    const score =
      complaint.authenticityScore !== undefined
        ? complaint.authenticityScore
        : isFlagged
        ? Math.max(15, 100 - flags.length * 25)
        : 95;

    return {
      isFlagged,
      flags,
      score,
    };
  },

  // Generate full AI summary across complaints
  analyzeAllComplaints: (complaints = []) => {
    let duplicateCount = 0;
    let suspiciousCount = 0;
    let highRiskCount = 0;
    let unclearCount = 0;
    let reverificationCount = 0;

    const duplicatesList = [];
    const flaggedList = [];
    const unclearList = [];
    const reverificationList = [];

    for (let i = 0; i < complaints.length; i++) {
      const c = complaints[i];
      const dupes = aiReviewService.findDuplicates(
        c,
        complaints.filter((other) => String(other._id) !== String(c._id))
      );
      if (dupes.length > 0 || (c.aiFlag && c.aiFlag.toLowerCase().includes("duplicate"))) {
        duplicateCount++;
        duplicatesList.push({ complaint: c, matches: dupes });
      }

      const ev = aiReviewService.evaluateEvidence(c);
      if (ev.isFlagged) {
        suspiciousCount++;
        flaggedList.push({ complaint: c, flags: ev.flags, score: ev.score });
      }

      if (!c.category || c.category === "General" || c.category === "Uncategorized") {
        unclearCount++;
        unclearList.push(c);
      }

      if (c.reopenedAt || (c.aiFlag && c.aiFlag.toLowerCase().includes("re-open")) || c.status === "In Progress") {
        reverificationCount++;
        reverificationList.push(c);
      }

      const pr = aiReviewService.recommendPriority(c.title, c.description);
      if (pr.priority === "Critical" || pr.priority === "High") {
        highRiskCount++;
      }
    }

    return {
      duplicateCount,
      suspiciousCount,
      highRiskCount,
      unclearCount,
      reverificationCount,
      duplicatesList,
      flaggedList,
      unclearList,
      reverificationList,
    };
  },
};

export default aiReviewService;
