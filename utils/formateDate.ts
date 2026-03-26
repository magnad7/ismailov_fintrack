export default (
  reverseOriginalDate: null | string | undefined,
  type: string = "."
): string => {
  if (reverseOriginalDate) {
    const separators = ["-", ".", "/"];
    let formattedDate = reverseOriginalDate;
    for (const separator of separators) {
      if (reverseOriginalDate.includes(separator)) {
        const parts = reverseOriginalDate.split(separator);
        if (parts.length >= 3) {
          formattedDate = `${parts[2]}${type}${parts[1]}${type}${parts[0]}`;
        }
        break;
      }
    }
    return formattedDate;
  }
  return "";
};
