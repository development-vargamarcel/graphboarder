export const string_transformer = (value) => {
  return `'${value}'`;
}
export const ISO8601_transformer = (value) => {
  let date_ISO8601 = new Date(value).toISOString();
  return string_transformer(date_ISO8601);
}