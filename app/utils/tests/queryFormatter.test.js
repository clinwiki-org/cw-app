import * as assert from 'assert';
import * as queryFormatter from 'utils/queryFormatter';
describe.only('queryFormatter', () => {
  describe('getAggregatorQueryString', () => {
    it('should return both query string parameter and aggregator parameters when provided', () => {
      const queryString = queryFormatter.getAggregatorQueryString('bei', { cities: { Beijing: 1 } });
      assert.equal(queryString, 'query=bei&agg_filters[]=cities&cities[]=Beijing');
    });

    it('should return only aggregator parameters when no query string provided', () => {
      const queryString = queryFormatter.getAggregatorQueryString(undefined, { cities: { Beijing: 1 } });
      assert.equal(queryString, 'agg_filters[]=cities&cities[]=Beijing');
    });

    it('should not return aggregator parameters when not provided', () => {
      const queryString = queryFormatter.getAggregatorQueryString('bei', undefined);
      assert.equal(queryString, 'query=bei');
    });

    it('should return empty string when there neither query nor aggregator was provided', () => {
      const queryString = queryFormatter.getAggregatorQueryString(undefined, undefined);
      assert.equal(queryString, '');
    });
  });
});
