export const toggleDate = (prev: string[], date: string) =>
  prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date];
