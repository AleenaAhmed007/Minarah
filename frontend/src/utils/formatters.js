// Formatting helpers

export function formatNumber(num) {
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toString();
}

export function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
