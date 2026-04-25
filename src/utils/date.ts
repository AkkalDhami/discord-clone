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
