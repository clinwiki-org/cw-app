/*
 *
 * Search
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ReactStars from 'react-stars';
import ReactPaginate from 'react-paginate';
import { Table, Column, Cell } from 'fixed-data-table';
import { Row, Col, Form, FormGroup, Label,
  FormControl, Button } from 'react-bootstrap';
import Helmet from 'react-helmet';
import FontAwesome from 'react-fontawesome';
import { createStructuredSelector } from 'reselect';
import aggToField from '../../utils/aggToField';
import { getAggregatorQueryString } from '../../utils/queryFormatter';
import SearchWrapper from '../../components/SearchWrapper';
import AuthButton from '../../components/AuthButton';
import AggDropdownGroup from '../../components/AggDropdownGroup';
import { makeSelectAuthState } from '../App/selectors';
import makeSelectSearch from './selectors';
import * as actions from './actions';

export class Search extends React.Component { // eslint-disable-line react/prefer-stateless-function

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.getAggs = this.getAggs.bind(this);
  }

  componentWillMount() {
    this.doSearch(this.props);
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.onQueryChange(this.query)
      .then(() => this.doSearch(this.props, this.query))
      .then(() => this.props.router.push(`/search/${this.props.Search.query}`));
  }

  onSearchChange(e) {
    console.log(this.getExportUrl());
    console.log(this.query);
    console.log(this.props.Search.aggsSent);
    this.query = e.target.value;
  }

  getRowCount() {
    return (this.props.Search && this.props.Search.rows
      && this.props.Search.rows.length) || 0;
  }

  getAggs(agg) {
    return this.props.onAggViewed({ ...actions.getSearchParams(this.props), agg });
  }

  getExportUrl() {
    let rootUrl = '/api/studies/search/export/aact-studies-export.xlsx';
    const queryString = getAggregatorQueryString(this.query, this.props.Search.aggsSent);
    if (queryString) {
      rootUrl += `?${queryString}`;
    }
    return rootUrl;
  }

  doSearch(props, query) {
    const theProps = props || this.props;
    theProps.search(actions.getSearchParams(theProps, query));
  }

  cellForField(field) {
    return ({ rowIndex, ...props }) => (
      <Cell {...props} className="text-center">
        {this.cellInner(field, this.props.Search.rows[rowIndex])}
      </Cell>
    );
  }

  keyToInner(field, bucketKey) {
    switch (field) {
      case 'average_rating':
        return ({
          0: '☆☆☆☆☆',
          1: '★☆☆☆☆',
          2: '★★☆☆☆',
          3: '★★★☆☆',
          4: '★★★★☆',
          5: '★★★★★',
        }[bucketKey]);
      case 'completion_date':
      case 'start_date':
        return (new Date(parseInt(bucketKey, 10)).getFullYear());
      default:
        return (bucketKey);
    }
  }

  cellInner(field, row) {
    switch (field) {
      case 'rating':
        return (
          <ReactStars
            count={5}
            edit={false}
            value={row[field]}
          />
        );
      case 'nct_id':
      case 'title':
        return <Link to={`/study/${row.nct_id}`}>{row[field]}</Link>;
      default:
        return row[field];
    }
  }

  searchFilters() {
    const searchFilters = [];
    Object.keys(this.props.Search.aggsSent).forEach((field) => {
      if (this.props.Search.aggsSent[field]) {
        Object.keys(this.props.Search.aggsSent[field]).forEach((key) => {
          searchFilters.push(
            <Label style={{ marginRight: '5px' }} key={key}>
              {aggToField[field]}: {this.keyToInner(field, key)}
              {' '}
              <FontAwesome
                style={{ cursor: 'pointer', color: '#cc1111' }}
                name="remove"
                onClick={() =>
                  this.props.onAggRemoved(field, key)
                  .then(() => this.doSearch(this.props))
                }
              />
            </Label>);
        });
      }
    });
    return searchFilters;
  }

  headerCell(field, passedKey = null) {
    const key = passedKey || field;
    return (
      <Cell className="text-center">
        {field}
        {' '}
        <FontAwesome
          name={`sort${this.props.Search.sorts[key] ? `-${this.props.Search.sorts[key]}` : ''}`}
          onClick={() => this.props.onToggleSort(key).then(() => this.doSearch(this.props))}
          style={{ cursor: 'pointer' }}
        />
      </Cell>
    );
  }

  render() {
    return (
      <SearchWrapper id="search-wrapper">
        <Helmet
          title="Search"
          meta={[
            { name: 'description', content: 'Description of Search' },
          ]}
        />
        <Row id="clinwiki-header" className="">
          <Col md={8}>
            <h1><a href="/">Clinwiki</a></h1>
          </Col>
          <Col md={4} className="text-right">
            <AuthButton {...this.props.Auth} router={this.props.router} />
          </Col>
        </Row>
        <Row id="search-controls" style={{ marginBottom: '10px' }}>
          <AggDropdownGroup
            Search={this.props.Search}
            onAggSelected={this.props.onAggSelected}
            doSearch={() => this.doSearch(this.props)}
            keyToInner={this.keyToInner}
            onAggViewed={(agg) => this.getAggs(agg)}
          />
          <Col md={4} id="query" className="text-right">
            <Row>
              <Col md={12}>
                <Form inline onSubmit={this.onSubmit}>
                  <FormGroup controlId="formInlineEmail">
                    <FormControl
                      type="text"
                      placeholder={'Search...'}
                      defaultValue={actions.getQuery(this.props)}
                      onChange={this.onSearchChange}
                    />
                  </FormGroup>
                  {' '}
                  <Button type="submit">
                    Search
                    {' '}
                    <FontAwesome name="search" />
                  </Button>
                  <Button href={this.getExportUrl()}>Download Excel</Button>
                </Form>
              </Col>
            </Row>
            <Row>
              <Col md={12} className="text-right" style={{ marginTop: '10px', color: '#777' }}>
                <i>
                  Showing {(this.props.Search.page * this.props.pageLength) + 1}
                  {' '}
                  to {Math.min(((this.props.Search.page + 1) * this.props.pageLength),
                                parseInt(this.props.Search.total, 10))}
                  {' '}
                  out of {this.props.Search.total}
                  {' '}
                  {this.props.Search.query ?
                    <span>for <strong>{this.props.Search.query}</strong></span>
                    : null}

                </i>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row id="search-filters" style={{ height: '15px', marginBottom: '10px' }}>
          <Col md={12}>
            {this.searchFilters()}
          </Col>
        </Row>
        <Row id="search-main">
          <Col md={12}>
            <Table
              ref={(table) => { this.table = table; }}
              rowHeight={50}
              rowsCount={this.getRowCount()}
              height={400}
              width={1140}
              headerHeight={50}
            >
              <Column
                header={this.headerCell('nct_id')}
                cell={this.cellForField('nct_id')}
                width={125}
              />
              <Column
                header={this.headerCell('rating', 'average_rating')}
                cell={this.cellForField('rating')}
                width={100}
              />
              <Column
                header={this.headerCell('status', 'overall_status')}
                cell={this.cellForField('status')}
                width={150}
              />
              <Column
                header={this.headerCell('title', 'brief_title')}
                cell={this.cellForField('title')}
                width={555}
              />
              <Column
                header={this.headerCell('started', 'start_date')}
                cell={this.cellForField('started')}
                width={105}
              />
              <Column
                header={this.headerCell('completed', 'completion_date')}
                cell={this.cellForField('completed')}
                width={105}
              />
            </Table>
          </Col>
        </Row>
        <Row>
          <Col md={12} className="text-center">
            <ReactPaginate
              pageCount={Math.ceil(this.props.Search.total / 25)}
              previousLabel="previous"
              nextLabel="next"
              breakLabel={<a href="">...</a>}
              breakClassName="break-me"
              initialPage={this.props.Search.page}
              marginPagesDisplayed={2}
              pageRangeDisplayed={15}
              onPageChange={(e) => this.props.onPageChange(e).then(() => this.doSearch(this.props))}
              containerClassName="pagination"
              subContainerClassName="pages pagination"
              activeClassName="active"
            />
          </Col>
        </Row>
      </SearchWrapper>
    );
  }
}

Search.propTypes = {
  onToggleSort: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onAggSelected: PropTypes.func.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  onAggRemoved: PropTypes.func.isRequired,
  onAggViewed: PropTypes.func.isRequired,
  pageLength: PropTypes.number,
  router: PropTypes.object,
  Auth: PropTypes.object,
  Search: PropTypes.shape({
    page: PropTypes.number,
    query: PropTypes.string,
    total: PropTypes.number,
    aggs: PropTypes.shape({}),
    aggsSent: PropTypes.shape({}),
    sorts: PropTypes.shape({}),
    rows: PropTypes.arrayOf(PropTypes.shape({})),
  }),
};

Search.defaultProps = {
  query: '',
  pageLength: 25,
  Search: {
    total: 0,
    page: 0,
    aggsSent: {},
    sorts: {},
    aggs: {},
  },
};

const mapStateToProps = createStructuredSelector({
  Search: makeSelectSearch(),
  Auth: makeSelectAuthState(),
});

function mapDispatchToProps(dispatch) {
  return {
    search: actions.searchAction(dispatch),
    onPageChange: actions.pageChangeAction(dispatch),
    onAggViewed: actions.allBucketsForAgg(dispatch),
    onAggSelected: actions.selectAggAction(dispatch),
    onAggRemoved: actions.removeAggAction(dispatch),
    onToggleSort: actions.toggleSortAction(dispatch),
    onQueryChange: actions.queryChangeAction(dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Search);
