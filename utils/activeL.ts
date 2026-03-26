export const activeL = (
  item: null | Record<string, any> | undefined,
  name?: string
) => {
  const { locale } = useI18n();
  if (item) {
    const itemName = name ? `${name}_${locale.value}` : `name_${locale.value}`;
    return item[itemName];
  }
  return undefined;
};
