export const getDateTime = (unixTimestamp: number) => {
  const date = new Date(unixTimestamp);
  const formattedDate = date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return formattedDate;
};
