/**
 * Parses the Markdown output from the LLM agent into a structured object for the UI.
 */
export const parseWeeklyNote = (markdown) => {
  const themes = [];
  const actions = [];
  const quotes = [];

  // Very basic markdown parsing logic for the prototype
  const sections = markdown.split('####');
  
  // Extract Themes (Top 3)
  const themeSection = sections.find(s => s.toLowerCase().includes('top 3 themes'));
  if (themeSection) {
    const lines = themeSection.split('\n').filter(l => l.trim().startsWith('*'));
    lines.forEach(line => {
      const [title, ...rest] = line.replace('*', '').split(':');
      themes.push({
        title: title.trim(),
        summary: rest.join(':').trim()
      });
    });
  }

  // Extract Quotes (3)
  const quoteSection = sections.find(s => s.toLowerCase().includes('real user quotes'));
  if (quoteSection) {
    const lines = quoteSection.split('\n').filter(l => l.trim().startsWith('*'));
    quotes.push(...lines.map(l => l.replace('*', '').replace(/"/g, '').trim()));
  }

  // Extract Actions (3)
  const actionSection = sections.find(s => s.toLowerCase().includes('action ideas'));
  if (actionSection) {
    const lines = actionSection.split('\n').filter(l => l.trim().startsWith('*'));
    actions.push(...lines.map(l => l.replace('*', '').trim()));
  }

  return { themes, quotes, actions };
};
