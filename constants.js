// Shared constants for the Smart Browser Assistant extension

export const DEFAULT_PROMPTS = [
  {
    id: "1", // Changed from "prompt_generate_reply"
    name: "Generate Reply",
    text: "Automatically generate a reply following the text below. Be insightful and suitable for social media like x.com . Limit to 1000 characters. Do not use markdown, use pure text:\n\n\"%TEXT%\""
  },
  {
    id: "2", // Changed from "prompt_proofread"
    name: "Proofread Text",
    text: "Proofread the following text for grammar, spelling, and clarity:\n\n\"%TEXT%\""
  },
  {
    id: "3", // Changed from "prompt_translate_zh"
    name: "Translate to Chinese (Simplified)",
    text: "Translate the following text to Simplified Chinese:\n\n\"%TEXT%\""
  },
  {
    id: "4", 
    name: "Fact and Logic Check with Critical Thinking",
    text: "Critically analyze the following text through the lengs of a critical thinker. conduct both fact and logic checks:\n\n\"%TEXT%\""
  },
  {
    id: "5", // Changed from "prompt_const_sep_powers"
    name: "Analyze via Separation of Powers",
    text: "Evaluate the following text regarding the US Constitution's principle of separation of powers (legislative, executive, judicial). Note any potential imbalances or checks. Concise analysis (under 280 chars):\n\n\"%TEXT%\""
  },
  {
    id: "6", // Changed from "prompt_crit_assumptions"
    name: "Identify Underlying Assumptions",
    text: "What are the key underlying assumptions in the following text? Briefly list them (under 280 chars total):\n\n\"%TEXT%\""
  },
  {
    id: "7", // Changed from "prompt_crit_evidence"
    name: "Evaluate Evidence/Support",
    text: "Briefly assess the strength and type of evidence or support used in the following text (e.g., anecdotal, statistical, logical). Note any weaknesses (under 280 chars):\n\n\"%TEXT%\""
  },
  {
    id: "8", // Changed from "prompt_crit_counter"
    name: "Generate Counter-Argument",
    text: "Generate a concise, logical counter-argument or opposing viewpoint to the main point of the following text (under 280 chars):\n\n\"%TEXT%\""
  },
  {
    id: "9", // Changed from "prompt_crit_implications"
    name: "Explore Potential Implications",
    text: "Briefly outline one significant potential implication or consequence (intended or unintended) of the idea presented in the following text (under 280 chars):\n\n\"%TEXT%\""
  },
  {
    id: "10", // Changed from "prompt_custom_students"
    name: "Counter-Argument (Students/Einstein)",
    text: "Critically analyze the following text based on US Constitutional principles and facts. \nDraw parallel to how USA admited German scientists like Einstein even in a real war condition.  \nUse the facts that Chinese students pay much higher fees to US universities, bringing in much needed revenues to US, besides filling in talent pipelines.\n\nGenerate a concise counter-argument (under 460 characters so I can post two segments):\n\n\"%TEXT%\""
  }
];

export const DEFAULT_MODEL = "openai/gpt-4o-mini-search-preview";

// Add other shared constants here if needed in the future
