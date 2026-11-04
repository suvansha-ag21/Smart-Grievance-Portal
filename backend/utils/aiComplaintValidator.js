const { analyzeCivicImage, computeHammingDistance } = require("./aiVisionAnalyzer");

// Department Taxonomy
const DEPARTMENT_TAXONOMY = {
  "Roads Department": {
    keywords: [
      "pothole", "potholes", "crater", "craters", "road", "roads", "asphalt",
      "tar", "bitumen", "divider", "dividers", "footpath", "footpaths", "pavement",
      "sidewalk", "sidewalks", "speed breaker", "speedbreaker", "curb", "manhole cover broken",
      "damaged road", "broken road", "street repair"
    ],
    categories: ["Roads & Infrastructure", "Roads Department"],
  },
  "Water Supply": {
    keywords: [
      "water", "leak", "leaking", "leakage", "pipeline", "pipe", "burst pipe",
      "water supply", "drinking water", "tap", "taps", "water pressure", "low pressure",
      "contamination", "dirty water", "muddy water", "tanker", "main line leak",
      "water meter", "no water"
    ],
    categories: ["Water Supply", "Water Supply & Drainage", "Water Supply Department"],
  },
  "Sanitation": {
    keywords: [
      "garbage", "trash", "waste", "dump", "dumpster", "dustbin", "bins", "litter",
      "overflowing bin", "garbage pile", "dead animal", "sweeping", "uncollected waste",
      "drainage", "sewage", "gutter", "gutters", "sewer", "stagnant water", "foul smell",
      "open sewage", "filth", "cleaning"
    ],
    categories: ["Sanitation", "Sanitation & Waste", "Sanitation & Waste Management", "Sanitation Department"],
  },
  "Electricity": {
    keywords: [
      "electricity", "power", "street light", "streetlight", "streetlights", "lamp",
      "light pole", "pole", "wire", "wires", "cable", "cables", "spark", "sparking",
      "transformer", "blackout", "power outage", "electric shock", "exposed wire",
      "damaged wire", "live wire", "voltage", "meter box"
    ],
    categories: ["Electricity", "Electricity & Power", "Electricity Department"],
  },
  "Public Safety": {
    keywords: [
      "hazard", "hazardous", "danger", "dangerous", "open manhole", "deep crater",
      "unbarricaded excavation", "collapse", "collapsed wall", "building collapse risk",
      "fallen tree", "tree blocking road", "landslide", "live high voltage wire",
      "gas leak", "chemical spill", "major accident risk", "safety hazard"
    ],
    categories: ["Public Safety", "Public Health & Safety", "Public Safety Department"],
  },
};

// Political Slogan / Non-Civic / Propaganda Patterns
const NON_CIVIC_POLITICAL_PATTERNS = [
  /\bmodi\s*(ko)?\s*(hatao|hataao|murdabad|chor|hata)\b/i,
  /\b(rahul|modi|kejr[ie]wal|shah|yogi)\s*(hatao|zindabad|murdabad|chor|ko hatao)\b/i,
  /\bvote\s+for\s+(bjp|congress|aap|bsp|cpi|sp|nda|upa)\b/i,
  /\b(election|political party|party rally|sarkar giraao|hatao sarkar)\b/i,
  /\b(jai\s+shri|allah\s+hu|religious fight|dharma yudh)\b/i,
  /\bcollege\s+holidays?\b/i, // Personal non-infrastructure complaint
  /\bgive\s+us\s+(more|extra)\s+holidays?\b/i,
];

// Vague / Meaningless / Placeholder Patterns
const MEANINGLESS_PATTERNS = [
  /^(asdf|qwerty|1234|test|testing|sample|check|hello|hi|random|xxx|xyz|abc|abcd)\b/i,
  /^(a{4,}|b{4,}|c{4,}|d{4,}|e{4,}|f{4,}|g{4,}|h{4,}|x{4,}|z{4,}|\.{4,}|-{4,})$/i,
];

/**
 * Text Similarity (Jaccard on words)
 */
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

/**
 * Validate Civic Complaint & Compute Automatic Routing
 *
 * @param {Object} complaintData - { title, description, category, location, image }
 * @param {Array} existingComplaints - Active complaints for duplicate detection
 * @returns {Object} Full AI validation report & recommended workflow status
 */
async function validateCivicComplaint(complaintData = {}, existingComplaints = []) {
  try {
    let activeList = [];
    if (Array.isArray(existingComplaints)) {
      activeList = existingComplaints;
    } else if (existingComplaints && typeof existingComplaints.find === "function") {
      activeList = await existingComplaints.find({
        isClosed: { $ne: true },
        status: { $ne: "Closed" },
      }).limit(50).lean();
    }

    const title = (complaintData.title || "").trim();
    const description = (complaintData.description || "").trim();
    const selectedCategory = (complaintData.category || "").trim();
    const location = (complaintData.location || "").trim();
    const image = complaintData.image || "";

    const fullText = `${title} ${description}`.toLowerCase();
    const warnings = [];
    const matchingComplaints = [];

    // =========================================================================
    // 1. Check for Empty / Meaningless / Vague Text
    // =========================================================================
    let isMeaningless = false;
    if (title.length < 4 || description.length < 12) {
      isMeaningless = true;
      warnings.push("Description is too brief or lacks meaningful details required for on-ground inspection.");
    }

    for (const pat of MEANINGLESS_PATTERNS) {
      if (pat.test(title) || pat.test(description)) {
        isMeaningless = true;
        warnings.push(`Complaint text matches placeholder or test pattern ("${title.slice(0, 20)}").`);
        break;
      }
    }

    // =========================================================================
    // 2. Check for Political Slogans / Non-Civic Content
    // =========================================================================
    let isPoliticalOrNonCivic = false;
    for (const pat of NON_CIVIC_POLITICAL_PATTERNS) {
      if (pat.test(fullText)) {
        isPoliticalOrNonCivic = true;
        warnings.push(
          "Flagged: Non-Civic Content / Political Slogan detected. Not an actionable municipal infrastructure grievance."
        );
        break;
      }
    }

    // =========================================================================
    // 3. Department Classification & Confidence
    // =========================================================================
    let bestDept = "Other/Unclear";
    let maxHits = 0;
    const scores = {};

    for (const [deptName, config] of Object.entries(DEPARTMENT_TAXONOMY)) {
      let hits = 0;
      for (const kw of config.keywords) {
        if (fullText.includes(kw)) {
          // Boost whole word match
          const regex = new RegExp(`\\b${kw}\\b`, "i");
          hits += regex.test(fullText) ? 2 : 1;
        }
      }
      scores[deptName] = hits;
      if (hits > maxHits) {
        maxHits = hits;
        bestDept = deptName;
      }
    }

    // Calculate real classification confidence
    let classificationConfidence = 50;
    if (maxHits >= 4) classificationConfidence = 95;
    else if (maxHits === 3) classificationConfidence = 88;
    else if (maxHits === 2) classificationConfidence = 78;
    else if (maxHits === 1) classificationConfidence = 65;
    else classificationConfidence = 40;

    // Check category vs detected department
    let detectedCategory = bestDept;
    if (bestDept === "Roads Department") detectedCategory = "Roads & Infrastructure";
    else if (bestDept === "Water Supply") detectedCategory = "Water Supply & Drainage";
    else if (bestDept === "Sanitation") detectedCategory = "Sanitation & Waste Management";
    else if (bestDept === "Electricity") detectedCategory = "Electricity & Power";
    else if (bestDept === "Public Safety") detectedCategory = "Public Safety & Hazards";
    else detectedCategory = "Other Civic Issue";

    // Detect Category Mismatch
    if (selectedCategory && selectedCategory !== "Select civic category" && selectedCategory !== "Other Civic Issue" && bestDept !== "Other/Unclear") {
      const config = DEPARTMENT_TAXONOMY[bestDept];
      const matchesSelected = config.categories.some(
        (c) => selectedCategory.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(selectedCategory.toLowerCase())
      );

      if (!matchesSelected && maxHits >= 2) {
        warnings.push(
          `Category Mismatch: Citizen selected '${selectedCategory}', but AI semantic analysis classified content as '${bestDept}' (${classificationConfidence}% confidence).`
        );
      }
    }

    // =========================================================================
    // 4. Image Validation & Forensic Relevance
    // =========================================================================
    let imageRelevance = "Relevant Evidence";
    let authenticityScore = 95;
    const hasImage = Boolean(image && image.length > 500);

    if (!hasImage) {
      imageRelevance = "Missing Photo";
      authenticityScore = 50;
      warnings.push("No photographic evidence provided; on-site physical verification required.");
    } else {
      const vision = analyzeCivicImage(image, detectedCategory, title);
      authenticityScore = vision.authenticityScore;

      if (vision.isSynthetic) {
        imageRelevance = "Synthetic / AI-Generated Graphic";
        warnings.push(
          "Digital metadata audit detected AI-generated / Canva export signatures (not an authentic camera photo)."
        );
      } else if (vision.isInappropriateOrUnrelated) {
        imageRelevance = "Inappropriate / Unrelated Photo";
        warnings.push(...(vision.reasons || ["Uploaded photo is unrelated to municipal infrastructure issues."]));
      } else if (!vision.isRelevant) {
        imageRelevance = "Image Mismatch (Texture / Category Discrepancy)";
        warnings.push(...(vision.reasons || [`Visual mismatch: Image lacks textures required for '${detectedCategory}'.`]));
      } else if (!vision.isValid) {
        imageRelevance = "Unreadable / Corrupt Image Evidence";
        warnings.push("Uploaded image payload could not be decoded or is unreadable.");
      } else {
        imageRelevance = "Relevant Evidence";
      }
    }

    // =========================================================================
    // 5. Duplicate Detection (Text Similarity + Image dHash + Location)
    // =========================================================================
    let isPossibleDuplicate = false;
    let duplicateProbability = 0;

    if (Array.isArray(activeList) && activeList.length > 0) {
      for (const existing of activeList) {
        if (!existing || existing.isClosed) continue;

        const existingFull = `${existing.title || ""} ${existing.description || ""}`;
        const textScore = computeTextSimilarity(fullText, existingFull);

        // Location proximity match
        const locA = location.toLowerCase();
        const locB = (existing.location || "").toLowerCase();
        const sameLoc = Boolean(locA && locB && (locA.includes(locB) || locB.includes(locA)));

        // Image dHash comparison
        let imageDuplicate = false;
        if (complaintData.dHash && existing.evidenceAnalysis?.dHash) {
          const dist = computeHammingDistance(complaintData.dHash, existing.evidenceAnalysis.dHash);
          if (dist <= 8) imageDuplicate = true;
        }

        let combinedScore = textScore;
        if (sameLoc) combinedScore += 20;
        if (imageDuplicate) combinedScore += 30;
        combinedScore = Math.min(combinedScore, 98);

        if (combinedScore >= 45 || imageDuplicate) {
          isPossibleDuplicate = true;
          duplicateProbability = Math.max(duplicateProbability, combinedScore);
          matchingComplaints.push({
            complaintId: existing._id,
            complaintNumber: existing.complaintNumber || `GRV-${String(existing._id).slice(-5).toUpperCase()}`,
            title: existing.title,
            similarityScore: combinedScore,
            reason: imageDuplicate
              ? `Visual perceptual hash match (${combinedScore}% confidence) in ${existing.location || "same area"}`
              : `High semantic overlap (${textScore}%) in ${existing.location || "same area"}`,
          });
        }
      }
    }

    if (isPossibleDuplicate) {
      warnings.push(
        `Possible duplicate detected: ${duplicateProbability}% match with active grievance ${matchingComplaints[0]?.complaintNumber}. Flagged for officer consolidation review.`
      );
    }

    // =========================================================================
    // 6. Workflow Status & Next Action Determination
    // =========================================================================
    let finalStatus = "Accepted and Assigned";
    let recommendedAction = "Auto-Route & Assign";
    let explanation = `Grievance classified under ${bestDept} with ${classificationConfidence}% confidence and routed for field action.`;

    if (isMeaningless) {
      finalStatus = "Needs More Information";
      recommendedAction = "Request More Information";
      explanation = "Complaint description is incomplete or lacks actionable civic details.";
    } else if (isPoliticalOrNonCivic) {
      finalStatus = "Under Manual Review";
      recommendedAction = "Review or Reject (Political / Non-Civic Content)";
      explanation = "Grievance contains political slogan or personal non-infrastructure dispute.";
    } else if (isPossibleDuplicate) {
      finalStatus = "Under Manual Review";
      recommendedAction = "Mark Possible Duplicate / Merge";
      explanation = `Potential visual or textual duplicate of active complaint #${matchingComplaints[0]?.complaintNumber}. Requires officer verification before public funds are dispatched.`;
    } else if (imageRelevance.includes("Synthetic") || imageRelevance.includes("Mismatch") || imageRelevance.includes("Unrelated") || imageRelevance.includes("Inappropriate")) {
      finalStatus = "Under Manual Review";
      recommendedAction = "Review Inauthentic / Unrelated Evidence";
      explanation = `Evidence image flagged for inspection (${imageRelevance}). Requires officer audit.`;
    } else if (bestDept === "Other/Unclear" || classificationConfidence < 60) {
      finalStatus = "Under Manual Review";
      recommendedAction = "Manual Classification & Queue Assignment";
      explanation = "Issue category is unclear or ambiguous. Sent to supervisor manual verification queue.";
    }

    return {
      isValidCivic: !isPoliticalOrNonCivic && !isMeaningless,
      classificationConfidence,
      detectedCategory,
      recommendedDepartment: bestDept,
      imageRelevance,
      authenticityScore,
      duplicateProbability,
      isPossibleDuplicate,
      matchingComplaints,
      warnings,
      explanation,
      recommendedAction,
      status: finalStatus,
      analyzedAt: new Date(),
    };
  } catch (error) {
    // If AI service fails or crashes: "mark the complaint 'Needs Manual Review'; do not pretend analysis succeeded"
    console.error("AI Validation Service Error:", error);
    return {
      isValidCivic: true,
      classificationConfidence: 50,
      detectedCategory: complaintData.category || "General",
      recommendedDepartment: "Other/Unclear",
      imageRelevance: "Unverified (AI Service Failure)",
      authenticityScore: 50,
      duplicateProbability: 0,
      isPossibleDuplicate: false,
      matchingComplaints: [],
      warnings: ["Automated AI validation service was temporarily unavailable. Complaint queued for manual officer review."],
      explanation: "Automated analysis could not be completed. Marked for manual verification.",
      recommendedAction: "Manual Review Required",
      status: "Under Manual Review",
      analyzedAt: new Date(),
    };
  }
}

module.exports = {
  validateCivicComplaint,
  DEPARTMENT_TAXONOMY,
};
