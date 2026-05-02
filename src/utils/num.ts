type CompactOptions = {
  locale?: string;
  compactDisplay?: "short" | "long";
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
};

export function formatCompactNumber(
  num: number,
  options: CompactOptions = {}
): string {
  if (!Number.isFinite(num)) return "0";

  return new Intl.NumberFormat(options.locale ?? "en", {
    notation: "compact",
    compactDisplay: options.compactDisplay ?? "short",
    maximumFractionDigits: options.maximumFractionDigits ?? 1,
    minimumFractionDigits: options.minimumFractionDigits ?? 0
  }).format(num);
}
