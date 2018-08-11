import React from 'react';
import LoadingPane from 'components/LoadingPane';
import { Helmet } from 'react-helmet';
import { Grid, Row, Col } from 'react-bootstrap';
import ReactTable from 'react-table';
import ReactStars from 'react-stars';
import styled from 'styled-components';
import 'react-table/react-table.css';
import SearchFieldName from 'components/SearchFieldName';
import Aggs from './components/Aggs';

const SearchWrapper = styled.div`
  .rt-tr {
    cursor: pointer;
  }
  #search-sidebar{
    padding-right: 0;
  }
  #search-main {
    padding-left: 0;
    padding-top: 6px;
  }
`;

export class SearchView extends React.PureComponent {
  constructor(props) {
    super(props)
  }

  getColumns(cols) {
    return cols.map((col) => {
      const spec = {
        Header: <SearchFieldName field={col} />,
        accessor: col,
        style: {
          overflowWrap: 'break-word',
          overflow: 'visible',
          whiteSpace: 'normal',
        },
      };
      if (col.match('rating')) {
        spec.Cell = (row) => (
          <ReactStars
            count={5}
            edit={false}
            value={Number(row.value)}
          />);
        spec.style.textAlign = 'center';
      }
      return spec;
    });
  }
  
  getDefaultSorted(columns) {
    if (_.includes(columns, 'average_rating')) {
      return [{ id: 'average_rating', desc: true }];
    }
    return [];
  }

  tdProps = (_, rowInfo) => {
    return {
      onClick: (e, handleOriginal) => {
        this.props.history.push(`/study/${rowInfo.row.nct_id}`);
        return handleOriginal();
      },
    };
  }

  render_aggs({aggs,crowdAggs,aggFilters,addFilter,removeFilter}) {
    // fold the raw aggs (from grahql) into a map
    const reducer = (acc,agg) => {
        acc[agg.name] = agg.buckets
        return acc
    }
    const faggs = aggs.reduce(reducer, {});
    const fcrowdAggs = crowdAggs.reduce(reducer, {});

    return <Aggs
            aggs={faggs}
            crowdAggs={fcrowdAggs}
            filters={aggFilters}
            addFilter={addFilter}
            removeFilter={removeFilter}
            />
  }

  render_table(loading, columns, rows, gridProps ) {
    if(loading) {
      return <ReactTable
            className="-striped -highlight"
            columns={this.getColumns(columns)}
            manual
            loading={true}
            defaultSorted={this.getDefaultSorted(columns)}
            defaultSortDesc
          />
    }
    const pageSize = gridProps.pageSize
    const totalPages = Math.ceil(gridProps.recordsTotal / pageSize);

    return <ReactTable
            className="-striped -highlight"
            columns={this.getColumns(columns)}
            manual
            // state.sorted= [0: {id: "average rating", desc: true} ]
            // state.page = page we're on?
            // state.pageSize = 'page size dropdown' (25)
            onFetchData={state => { console.log('grid fetch data state:'); console.log(state) }}
            data={rows}
            pages={totalPages}
            loading={loading}
            defaultPageSize={pageSize}
            getTdProps={this.tdProps}
            defaultSorted={this.getDefaultSorted(columns)}
            defaultSortDesc
          />
  }

  render_query = ({loading,error,data}) => {
  }

  render() {
    const {
      loading,
      cols,
      rows,
      gridProps,
    } = this.props;

    return <SearchWrapper>
    <Helmet>
      <title>Search</title>
      <meta name="description" content="Description of SearchPage" />
    </Helmet>
      <Row>
        <Col md={2} id="search-sidebar">
          { loading ? <LoadingPane /> : this.render_aggs(this.props) }
        </Col>
        <Col md={10} id="search-main">
          <Grid>
            <Row>
              <Col md={12}>
                { this.render_table(loading, cols, rows, gridProps) }
              </Col>
            </Row>
          </Grid>
        </Col>
      </Row>
    </SearchWrapper>
  }
}

export default SearchView;