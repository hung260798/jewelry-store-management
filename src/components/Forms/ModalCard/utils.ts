export type CardControl = {
  label: string;
  name: string | string[];
  component?: React.ReactNode;
  render?: (value: unknown) => React.ReactNode;
};

const formatLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();

export const getCardControlsFromRecord = (
  record: Record<string, unknown>
): CardControl[] =>
  Object.keys(record)
    .filter((key) => typeof record[key] !== "function")
    .map((key) => ({
      name: key,
      label: formatLabel(key),
      component: null,
    }));
