export function splitContent(content: string, maxLength: number = 20) {
  return content.length > maxLength
    ? content.slice(0, maxLength) + "..."
    : content;
}
