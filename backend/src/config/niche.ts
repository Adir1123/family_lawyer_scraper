/**
 * Niche profile for Family Lawyer
 * Source: matched from library
 *
 * This config drives the AI filtering prompt. To tune lead detection:
 * - Add/remove keywords to catch more or fewer posts
 * - Adjust signals to refine what counts as a lead
 * - Edit example posts to improve few-shot accuracy
 */
export const nicheConfig = {
  name: 'Family Lawyer',
  slug: 'family-lawyer',
  keywords_en: ['divorce', 'custody', 'alimony', 'prenup', 'child support', 'family court', 'separation agreement', 'mediation', 'inheritance', 'common-law', 'estate', 'will'],
  keywords_he: ['גירושין', 'משמורת', 'מזונות', 'הסכם ממון', 'בית משפט לענייני משפחה', 'הסכם גירושין', 'גישור', 'חלוקת רכוש', 'משמורת משותפת', 'ירושה', 'יורש', 'יורשים', 'ידועים בציבור', 'צוואה', 'עיזבון'],
  relevant_signals: [
    'Asking for lawyer recommendations for divorce/custody',
    'Questions about the divorce process or timeline',
    'Alimony/child support calculation questions',
    'Custody disputes or visitation rights',
    'Prenup questions before marriage',
    'Someone going through separation seeking legal advice',
    'Posts mentioning בית הדין הרבני (rabbinical court)',
    'Inheritance disputes or questions about rights after a partner/spouse passes away',
    'Common-law partner (ידועים בציבור) rights questions',
    'Questions about wills, estates, or succession in family context',
  ],
  irrelevant_signals: [
    'General legal questions (traffic tickets, criminal, corporate)',
    'Real estate contract disputes',
    'Employment law issues',
    'Posts just venting about an ex without seeking help',
    'Sharing news articles about family law changes',
    'Looking for a private investigator (חוקר פרטי) — not legal services',
    'Posts about detective/investigation services unrelated to legal representation',
  ],
  example_posts: [
    {
      text: 'היי חברות, מישהי יכולה להמליץ על עורך דין לענייני גירושין באזור תל אביב? מעדיפה מישהו שמבין בנושא משמורת ילדים',
      relevant: true,
      reasoning: 'Explicitly asking for a divorce lawyer recommendation, mentions custody — strong lead',
    },
    {
      text: 'שאלה - מישהו יודע כמה עולה תהליך גירושין בערך? ואם חייבים עורך דין או אפשר לעשות את זה לבד?',
      relevant: true,
      reasoning: 'Asking about divorce process costs and whether a lawyer is needed — potential lead',
    },
    {
      text: 'בעלי רוצה להוריד את המזונות, יש לי 3 ילדים. מה הזכויות שלי?',
      relevant: true,
      reasoning: 'Asking about alimony rights with children — needs legal help',
    },
    {
      text: 'מישהו מכיר עורך דין טוב לתביעת נזיקין?',
      relevant: false,
      reasoning: 'Asking about a tort lawyer, not family law — irrelevant',
    },
    {
      text: 'ראיתם את החוק החדש שעבר בכנסת על משמורת?',
      relevant: false,
      reasoning: 'Sharing news about custody legislation — not seeking personal help',
    },
    {
      text: 'מחפשת חוקר פרטי במחיר שפוי',
      relevant: false,
      reasoning: 'Looking for a private investigator, not a lawyer or legal help — irrelevant to family law services',
    },
    {
      text: 'חייתי עם בת זוג 15 שנה בלי להתחתן. היא נפטרה פתאום – האם אני נחשב יורש חוקי שלה כמו בעל?',
      relevant: true,
      reasoning: 'Common-law partner asking about inheritance rights after partner\'s death — classic family law case in Israel (ידועים בציבור)',
    },
  ],
  ai_prompt_hints: 'Focus on posts where someone is personally seeking legal help for family matters including inheritance, common-law partner rights, and succession disputes. A strong lead explicitly asks for a recommendation, describes their situation, or asks about costs/process. Ignore news sharing, general discussion, and legal questions outside family law.',
};
