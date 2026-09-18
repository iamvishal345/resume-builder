export const nameOf = (doc) => {
  const pd = doc?.data?.personalDetails || {};
  const computed = [pd.firstName, pd.lastName].filter(Boolean).join(" ");
  const name = doc?.name;
  if (name && name !== "Untitled resume") return name;
  return computed || name || "Untitled resume";
};

export const relativeTime = (ts) => {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
