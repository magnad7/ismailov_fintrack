export default (amount: null | number | string | undefined): string => {
  if (amount !== null && amount !== undefined) {
    const formatter = new Intl.NumberFormat("uz-UZ", {
      currency: "UZS",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });

    return formatter.format(Number(amount));
  }
  return "";
};
