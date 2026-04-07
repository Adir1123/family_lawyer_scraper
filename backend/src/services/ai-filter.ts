import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';
import type { FacebookPost } from '../types/facebook-post.js';

const anthropic = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

export interface FilterResult {
  postId: string;
  confidence: number;
  reasoning: string;
  category: 'high' | 'medium' | 'trash';
  tokensUsed: number;
}

export async function filterPosts(
  posts: FacebookPost[],
  systemPrompt: string,
  confidenceHigh?: number,
  confidenceLow?: number,
): Promise<FilterResult[]> {
  const results: FilterResult[] = [];

  for (const post of posts) {
    const result = await filterSinglePost(post, systemPrompt, confidenceHigh, confidenceLow);
    results.push(result);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return results;
}

async function filterSinglePost(
  post: FacebookPost,
  systemPrompt: string,
  confidenceHigh?: number,
  confidenceLow?: number,
): Promise<FilterResult> {
  const highThreshold = confidenceHigh ?? config.AI_CONFIDENCE_HIGH;
  const lowThreshold = confidenceLow ?? config.AI_CONFIDENCE_LOW;
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 256,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Analyze this Facebook group post:\n\nAuthor: ${post.authorName}\nText: ${post.text}\nPosted: ${post.timestamp}\nGroup: ${post.groupUrl}`,
        },
      ],
    });

    const rawText =
      response.content[0].type === 'text' ? response.content[0].text : '';
    const text = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(text);
    const confidence = Math.max(0, Math.min(1, parsed.confidence));
    const tokensUsed =
      response.usage.input_tokens + response.usage.output_tokens;

    return {
      postId: post.postId,
      confidence,
      reasoning: parsed.reasoning ?? '',
      category:
        confidence >= highThreshold
          ? 'high'
          : confidence >= lowThreshold
            ? 'medium'
            : 'trash',
      tokensUsed,
    };
  } catch (error) {
    return {
      postId: post.postId,
      confidence: 0.5,
      reasoning: `AI filter error: ${error instanceof Error ? error.message : 'unknown'}`,
      category: 'medium',
      tokensUsed: 0,
    };
  }
}
