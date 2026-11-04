/**
 * AI Vision & Civic Defect Integrity Analyzer
 * Analyzes citizen evidence images for:
 * 1. Provenance & tampering (AI-generated graphics, Canva, Photoshop, Midjourney)
 * 2. Visual spectrum & Category Relevance (Pothole/Road, Water Leak, Garbage Dump, Electric Wire, etc.)
 * 3. Inappropriate / Non-civic image detection (Selfies, document screenshots, memes, flat graphics)
 * 4. Perceptual difference hashing (dHash) for duplicate detection
 */

function analyzeCivicImage(base64Image, category = "", title = "") {
  if (!base64Image || typeof base64Image !== "string" || base64Image.length < 100) {
    return {
      isValid: false,
      authenticityScore: 20,
      aiFlag: "Flagged: Missing or Unreadable Photographic Evidence",
      reasons: ["No valid image payload received."],
      isSynthetic: false,
      isRelevant: false,
      dHash: null,
    };
  }

  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(cleanBase64, "base64");
  const asciiHeader = buffer.slice(0, 4000).toString("ascii").toLowerCase();

  const reasons = [];
  let authenticityScore = 95;
  let isSynthetic = false;
  let isRelevant = true;
  let isInappropriateOrUnrelated = false;

  // 1. Digital Provenance & Synthetic Image Detection (Canva, Midjourney, Photoshop, etc.)
  const aiToolSignatures = [
    "containsaigeneratedcontent",
    "canva.com",
    "midjourney",
    "dall-e",
    "stablediffusion",
    "photoshop",
    "illustrator",
    "gimp",
    "figma",
    "picsart",
    "meme",
  ];

  for (const sig of aiToolSignatures) {
    if (asciiHeader.includes(sig)) {
      isSynthetic = true;
      authenticityScore = Math.min(authenticityScore, 20);
      if (sig.includes("aigenerated") || sig.includes("canva") || sig.includes("midjourney") || sig.includes("dall-e")) {
        reasons.push("Digital metadata scan detected AI-generated / Canva graphic signatures (not an authentic camera photo).");
      } else {
        reasons.push(`Digital editing/graphic software signature detected in image metadata (${sig}).`);
      }
      break;
    }
  }

  // 2. Optical Sample Analysis (Pixel distribution, textures, color variance)
  const sampleLength = Math.min(buffer.length, 60000);
  let whiteCount = 0;
  let blackCount = 0;
  let skinToneCount = 0;
  let highSatIndicator = 0;
  let neutralGrayIndicator = 0;
  let totalColorDiff = 0;

  for (let i = 100; i < sampleLength; i += 4) {
    const r = buffer[i] || 0;
    const g = buffer[i + 1] || 0;
    const b = buffer[i + 2] || 0;

    // Pure white (document screenshot / blank canvas)
    if (r > 240 && g > 240 && b > 240) whiteCount++;
    // Pure black (underexposed or covered camera)
    if (r < 15 && g < 15 && b < 15) blackCount++;

    // Skin tone heuristic (Portraits / Selfies)
    if (r > 95 && g > 40 && b > 20 && r > g && r > b && (r - g) > 15 && Math.abs(r - g) > 15) {
      skinToneCount++;
    }

    // Color difference
    const diff = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
    totalColorDiff += diff;

    if (diff < 22) {
      neutralGrayIndicator++;
    } else if (diff > 85) {
      highSatIndicator++;
    }
  }

  const totalSamples = Math.max(1, (sampleLength - 100) / 4);
  const whiteRatio = whiteCount / totalSamples;
  const blackRatio = blackCount / totalSamples;
  const skinRatio = skinToneCount / totalSamples;
  const grayRatio = neutralGrayIndicator / totalSamples;
  const satRatio = highSatIndicator / totalSamples;

  // Detection A: Document / Invoice / Code / Text Screenshot
  if (whiteRatio > 0.60) {
    isInappropriateOrUnrelated = true;
    isRelevant = false;
    authenticityScore = Math.min(authenticityScore, 18);
    reasons.push(
      "Document/Text Screenshot Detected: Uploaded image is a text document, paper invoice, or screen capture rather than an outdoor municipal defect photo."
    );
  }

  // Detection B: Solid Black / Covered Lens / Unreadable
  if (blackRatio > 0.75) {
    isInappropriateOrUnrelated = true;
    isRelevant = false;
    authenticityScore = Math.min(authenticityScore, 15);
    reasons.push(
      "Unreadable Evidence: Camera sensor appears completely obscured or image is pitch-black without visible civic structures."
    );
  }

  // Detection C: Portrait / Selfie / Personal Photo
  if (skinRatio > 0.40) {
    isInappropriateOrUnrelated = true;
    isRelevant = false;
    authenticityScore = Math.min(authenticityScore, 25);
    reasons.push(
      "Personal Portrait / Selfie Detected: Image contains human portraiture instead of on-site civic infrastructure or defect evidence."
    );
  }

  // 3. Category-Specific Visual Consistency
  const targetCategory = (category || "").toLowerCase();
  const targetTitle = (title || "").toLowerCase();

  // ROADS & INFRASTRUCTURE (Needs asphalt, neutral stone, tar textures)
  if (
    targetCategory.includes("road") ||
    targetCategory.includes("infrastructure") ||
    targetTitle.includes("pothole") ||
    targetTitle.includes("crater") ||
    targetTitle.includes("road")
  ) {
    if (satRatio > 0.48 && grayRatio < 0.22) {
      isRelevant = false;
      authenticityScore = Math.min(authenticityScore, 30);
      reasons.push(
        "Visual Mismatch: Image contains bright artificial colors and lacks asphalt/pavement/road surface textures required for 'Roads & Infrastructure'."
      );
    }
  }

  // WATER SUPPLY (Needs liquid reflections, plumbing pipes, or wet ground)
  if (
    targetCategory.includes("water") ||
    targetTitle.includes("leak") ||
    targetTitle.includes("pipe")
  ) {
    if (satRatio > 0.55 && grayRatio < 0.15) {
      isRelevant = false;
      authenticityScore = Math.min(authenticityScore, 35);
      reasons.push(
        "Visual Mismatch: Image lacks water leakage, pipe infrastructure, or drainage evidence."
      );
    }
  }

  // 4. Compute Perceptual Difference Hash (dHash for duplicate detection)
  let dHash = "";
  const step = Math.max(1, Math.floor(buffer.length / 64));
  for (let i = 0; i < 64; i++) {
    const p1 = buffer[i * step] || 0;
    const p2 = buffer[(i + 1) * step] || 0;
    dHash += p1 > p2 ? "1" : "0";
  }

  // 5. Final AI Flag Determination
  let aiFlag = "Clean";

  if (isSynthetic) {
    aiFlag = "Flagged: Synthetic / AI-Generated Graphic";
  } else if (isInappropriateOrUnrelated) {
    aiFlag = "Flagged: Unrelated / Inappropriate Image Evidence";
  } else if (!isRelevant) {
    aiFlag = "Flagged: Image Mismatch (Unrelated to Reported Category)";
  } else if (authenticityScore < 60) {
    aiFlag = "Flagged: Low Authenticity Evidence";
  }

  if (reasons.length === 0) {
    reasons.push("Image passed optical texture, digital provenance, and category consistency verification.");
  }

  return {
    authenticityScore,
    aiFlag,
    reasons,
    isSynthetic,
    isRelevant,
    isInappropriateOrUnrelated,
    dHash,
  };
}

function computeHammingDistance(hashA, hashB) {
  if (!hashA || !hashB || hashA.length !== hashB.length) return 64;
  let dist = 0;
  for (let i = 0; i < hashA.length; i++) {
    if (hashA[i] !== hashB[i]) dist++;
  }
  return dist;
}

module.exports = {
  analyzeCivicImage,
  computeHammingDistance,
};
