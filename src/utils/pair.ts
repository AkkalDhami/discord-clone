export function generatePairKey(a: string, b: string) {
  return [a, b].sort().join("_");
}
