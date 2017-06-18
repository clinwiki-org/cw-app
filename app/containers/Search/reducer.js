/*
 *
 * Search reducer
 *
 */

import { fromJS } from 'immutable';
import {
  SEARCH_ACTION,
  PAGE_CHANGE_ACTION,
  AGG_SELECTED_ACTION,
  AGG_REMOVED_ACTION,
  TOGGLE_SORT_ACTION,
  QUERY_CHANGE_ACTION,
} from './constants';

const initialState = fromJS({
  total: 0,
  page: 0,
  aggsSent: {},
  sorts: {},
  aggs: {},
});

function searchReducer(state = initialState, action) {
  switch (action.type) {
    case SEARCH_ACTION:
      return state
        .set('query', action.data.query)
        .set('aggsSent', action.data.aggsSent)
        .set('page', action.data.page)
        .set('total', action.data.recordsTotal)
        .set('totalFiltered', action.data.recordsFiltered)
        .set('rows', action.data.data)
        .set('aggs', action.data.aggs);
    case PAGE_CHANGE_ACTION:
      return state.set('page', action.data.selected);
    case AGG_SELECTED_ACTION:
      return state.set('aggsSent',
        Object.assign({}, action.data, state.get('aggsSent')))
        .set('page', 0);
    case AGG_REMOVED_ACTION:
      return state.set('aggsSent',
        () => {
          const aggs = state.get('aggsSent');
          delete aggs[action.data[0]][action.data[1]];
          return aggs;
        })
        .set('page', 0);
    case TOGGLE_SORT_ACTION:
      switch (state.getIn(['sorts', action.data])) {
        case 'asc':
          return state.setIn(['sorts', action.data], 'desc');
        case 'desc':
          return state.deleteIn(['sorts', action.data]);
        default:
          return state.setIn(['sorts', action.data], 'asc');
      }
    case QUERY_CHANGE_ACTION:
      return state.set('query', action.data).set('page', 0);
    default:
      return state;
  }
}

export default searchReducer;
