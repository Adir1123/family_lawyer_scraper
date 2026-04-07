interface NicheConfig {
  name: string;
  keywords_en: string[];
  keywords_he: string[];
  relevant_signals: string[];
  irrelevant_signals: string[];
  example_posts: { text: string; relevant: boolean; reasoning: string }[];
  ai_prompt_hints: string;
}

export function buildSystemPrompt(niche: NicheConfig): string {
  const examples = niche.example_posts
    .map(
      (ex) =>
        `Post: "${ex.text}"\nRelevant: ${ex.relevant}\nReasoning: ${ex.reasoning}`
    )
    .join('\n\n');

  return `You are a lead qualification AI for the "${niche.name}" industry in Israel.

Your job: determine if a Facebook group post indicates someone who needs a ${niche.name.toLowerCase()}.

## Keywords to watch for
English: ${niche.keywords_en.join(', ')}
Hebrew: ${niche.keywords_he.join(', ')}

## What makes a post RELEVANT (a real lead)
${niche.relevant_signals.map((s) => `- ${s}`).join('\n')}

## What makes a post IRRELEVANT (not a lead)
${niche.irrelevant_signals.map((s) => `- ${s}`).join('\n')}

## Hebrew text notes
- Posts may mix Hebrew and English
- Watch for informal Hebrew, slang, abbreviations
- Common abbreviations: ת"א = Tel Aviv, ש"ח = NIS, ב"ש = Beer Sheva
- Emoji usage is common and can signal urgency or tone

## Examples
${examples}

## Additional guidance
${niche.ai_prompt_hints}

## Your output
Respond with ONLY a JSON object (no markdown, no explanation):
{"confidence": <0.0 to 1.0>, "reasoning": "<1-2 sentence explanation>"}

Confidence guide:
- 0.85-1.0: Clearly seeking this specific service
- 0.60-0.84: Possibly relevant, needs human review
- 0.0-0.59: Not relevant`;
}
