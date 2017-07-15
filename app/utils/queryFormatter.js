/**
 * Converts a provided search string, query, and an aggregator object, aggs, and converts it to a query string
 * e.g. "bei", {city: {Beijing: 1}} would be converted to "query=bei&agg_filters[]=city&city[]=Beijing"
 * @param {string} query - A search string
 * @param {Object} [aggs={}] - An aggregator object of the form {aggregator: {filter: 1}}
 * @returns {string} - A valid query string that may be appended to a url
 */
export function getAggregatorQueryString(query, aggs = {}) {
  const queryParams = [];
  if (query) {
    queryParams.push(`query=${query}`);
  }
  Object.keys(aggs).forEach((aggKey) => {
    queryParams.push(`agg_filters[]=${aggKey}`);
    Object.keys(aggs[aggKey]).forEach((filterKey) => {
      queryParams.push(`${aggKey}[]=${filterKey}`);
    });
  });
  return queryParams.join('&');
}
