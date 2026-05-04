import { formatDistanceToNow } from "date-fns";

export function getRemainingTime(date: Date) {
  const now = new Date();
  const diff = date.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      days: 0,
      minutes: 0,
      seconds: 0
    };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return {
    days,
    minutes,
    seconds
  };
}

export function timeAgo(dateString: string) {
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true
  }).replace("about", "");
}

export function formatDateLabel(date: string) {
  const d = new Date(date);
  const today = new Date();

  const isToday = d.toDateString() === today.toDateString();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return d.toLocaleDateString([], {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export function getDateKey(date: string | Date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
