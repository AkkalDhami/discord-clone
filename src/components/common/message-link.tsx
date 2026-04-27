import LinkifyIt from "linkify-it";
import { Route } from "next";
import Link from "next/link";
import tlds from "tlds";

const linkify = new LinkifyIt();
linkify.tlds(tlds);

linkify.add("localhost:", {
  validate: (text, pos) => {
    const match = text.slice(pos).match(/^localhost:\d+/);
    if (match) {
      const port = parseInt(match[0].split(":")[1], 10);
      return port > 0 && port < 65536;
    }
    return false;
  },
  normalize: match => {
    match.url = "http://" + match.raw;
  }
});

export function renderMessageLinks(text: string) {
  const matches = linkify.match(text);

  if (!matches) return text;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((match, index) => {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    elements.push(
      <Link
        key={index}
        href={match.url as Route}
        target="_blank"
        rel="noopener noreferrer"
        className="wrap-break-word text-blue-500 underline-offset-2 hover:underline">
        {match.raw}
      </Link>
    );

    lastIndex = match.lastIndex;
  });

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements;
}
