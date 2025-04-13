// Shared constants for the Smart Browser Assistant extension

export const DEFAULT_PROMPTS = [
  {
    id: "prompt_const_amendment",
    name: "Analyze via Specific Amendment",
    text: "Analyze the following text through the lens of the [Specify Amendment, e.g., First Amendment] of the US Constitution. Identify potential conflicts or alignments. Keep it concise (under 280 chars):\n\n\"%TEXT%\""
  },
  {
    id: "prompt_const_sep_powers",
    name: "Analyze via Separation of Powers",
    text: "Evaluate the following text regarding the US Constitution's principle of separation of powers (legislative, executive, judicial). Note any potential imbalances or checks. Concise analysis (under 280 chars):\n\n\"%TEXT%\""
  },
  {
    id: "prompt_crit_assumptions",
    name: "Identify Underlying Assumptions",
    text: "What are the key underlying assumptions in the following text? Briefly list them (under 280 chars total):\n\n\"%TEXT%\""
  },
  {
    id: "prompt_crit_evidence",
    name: "Evaluate Evidence/Support",
    text: "Briefly assess the strength and type of evidence or support used in the following text (e.g., anecdotal, statistical, logical). Note any weaknesses (under 280 chars):\n\n\"%TEXT%\""
  },
  {
    id: "prompt_crit_counter",
    name: "Generate Counter-Argument",
    text: "Generate a concise, logical counter-argument or opposing viewpoint to the main point of the following text (under 280 chars):\n\n\"%TEXT%\""
  },
  {
    id: "prompt_crit_implications",
    name: "Explore Potential Implications",
    text: "Briefly outline one significant potential implication or consequence (intended or unintended) of the idea presented in the following text (under 280 chars):\n\n\"%TEXT%\""
  },
  {
    id: "prompt_custom_students",
    name: "Counter-Argument (Students/Einstein)",
    text: "Critically analyze the following text based on US Constitutional principles and facts. \nDraw parallel to how USA admited German scientists like Einstein even in a real war condition.  \nUse the facts that Chinese students pay much higher fees to US universities, bringing in much needed revenues to US, besides filling in talent pipelines.\n\nGenerate a concise counter-argument (under 460 characters so I can post two segments):\n\n\"%TEXT%\""
  }
];

// Add other shared constants here if needed in the future
