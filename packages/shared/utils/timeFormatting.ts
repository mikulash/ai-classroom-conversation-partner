export const formatIsoStringToLocaleString = (dateString: string) => {
  if (dateString.length === 0) return '-';
  const date = new Date(dateString);
  return date.toLocaleString();
};
