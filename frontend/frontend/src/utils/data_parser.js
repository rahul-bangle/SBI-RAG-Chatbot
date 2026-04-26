/**
 * Parses the Markdown output from the LLM agent into a structured object for the UI.
 */
export const parseWeeklyNote = (markdown) => {
  const themes = [];
  const actions = [];
  const quotes = [];

  // Very basic markdown parsing logic for the prototype
  const sections = markdown.split('###');
  
  // Extract Themes
  const themeSection = sections.find(s => s.toLowerCase().includes('themes'));
  if (themeSection) {
    const lines = themeSection.split('\n').filter(l => l.trim().startsWith('*') || l.trim().match(/^\d\./));
    lines.forEach(line => {
      const cleanLine = line.replace(/^\*|\d\./, '').trim();
      if (cleanLine.includes(':')) {
        const [title, ...rest] = cleanLine.split(':');
        themes.push({
          title: title.trim(),
          summary: rest.join(':').trim()
        });
      } else {
        themes.push({
          title: "Theme",
          summary: cleanLine
        });
      }
    });
  }

  // Extract Quotes
  const quoteSection = sections.find(s => s.toLowerCase().includes('quotes'));
  if (quoteSection) {
    const lines = quoteSection.split('\n').filter(l => l.trim().startsWith('*') || l.trim().match(/^\d\./));
    quotes.push(...lines.map(l => l.replace(/^\*|\d\./, '').replace(/"/g, '').trim()));
  }

  // Extract Actions
  const actionSection = sections.find(s => s.toLowerCase().includes('actions') || s.toLowerCase().includes('ideas'));
  if (actionSection) {
    const lines = actionSection.split('\n').filter(l => l.trim().startsWith('*') || l.trim().match(/^\d\./));
    actions.push(...lines.map(l => l.replace(/^\*|\d\./, '').trim()));
  }

  return { themes, quotes, actions };
};
