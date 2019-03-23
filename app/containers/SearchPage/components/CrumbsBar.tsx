import * as React from 'react';
import {
  Grid,
  Row,
  Col,
  Label,
  Button,
  FormControl,
  Form,
  FormGroup,
  } from 'react-bootstrap';
import * as FontAwesome from 'react-fontawesome';
import styled from 'styled-components';
import aggToField from 'utils/aggs/aggToField';

const CrumbsBarStyleWrappper = styled.div`
.crumbs-bar {
  padding: 10px 30px;
  border: solid white 1px;
  background-color: #f2f2f2;
  color: black;
  margin-bottom: 1em;
}
.crumbs-bar .label {
  margin: 2px;
}
.right-align {
  text-align: right;
}
`;

import { AggCallback, SearchParams } from '../Types';

//
interface CrumbsBarProps {
  searchParams : SearchParams;
  removeFilter: AggCallback;
  addSearchTerm : (term:string) => void;
  removeSearchTerm : (term:string, bool?) => void;
  page: number;
  pagesTotal: number;
  pageSize: number;
  update: { page: (n: number) => void };
  onReset: () => void;
}
interface CrumbsBarState {
  searchTerm : string;
}

const Crumb = ({ category, value, onClick }) => {
  return (
    <Label>
      <i>{category}:</i> <b>{value}</b>
      <FontAwesome
        className="remove"
        name="remove"
        style={{ cursor: 'pointer', color: '#cc1111', margin: '0 0 0 3px' }}
        onClick={onClick}
        />
    </Label>);
};

const MultiCrumb = (props: {category:string, values:string[], onClick: (s: string) => void}) => {
  return (
    <Label>
      <i>{props.category}:</i>
      {props.values.map(v => (
        <b key={v}> {v}
          <FontAwesome
            className="remove"
            name="remove"
            style={{ cursor: 'pointer', color: '#cc1111', margin: '0 0 0 3px' }}
            onClick={() => props.onClick(v)}
            />
        </b>
      ))}
    </Label>
  );
};

export default class CrumbsBar extends React.Component<CrumbsBarProps, CrumbsBarState> {
  *mkCrumbs(searchParams : SearchParams, removeFilter) {
    for (const term of searchParams.q || []) {
      yield <MultiCrumb
              key={term}
              category="search"
              values={[term]}
              onClick={ term => this.props.removeSearchTerm(term)}
            />;
    }
    for (const key in searchParams.aggFilters) {
      const agg = searchParams.aggFilters[key];
      const cat = aggToField(agg.field);
      yield <MultiCrumb
              category={cat}
              values={agg.values}
              onClick={ val => removeFilter(agg.field, val)}
              key={cat + agg.values.join()} />;
    }
    for (const key in searchParams.crowdAggFilters) {
      const agg = searchParams.crowdAggFilters[key];
      const cat = aggToField(agg.field);
      yield <MultiCrumb
            category={cat}
            values={agg.values}
            onClick={ val => removeFilter(agg.field, val, true)}
            key={cat + agg.values.join('')} />;
    }
    const totalLength =
      searchParams.q.length + searchParams.crowdAggFilters.length + searchParams.aggFilters.length;
    if (totalLength > 0) {
      yield (
        <Button
          bsSize="small"
          key="reset"
          onClick={this.props.onReset}
          style={{ marginLeft: '10px' }}
        >
          Reset
        </Button>
      );
    }
  }

  localSearchChange = (e) => {
    this.setState({ searchTerm : e.target.value });
  }
  clearPrimarySearch = () => {
    this.props.removeSearchTerm('', true);
  }
  onSubmit = (e) => {
    e.preventDefault();
    this.props.addSearchTerm(this.state.searchTerm);
    this.setState({ searchTerm: '' });
  }

  render() {
    return (
      <CrumbsBarStyleWrappper>
      <Grid className="crumbs-bar">
        <Row>
          <Col xs={12} md={9}>
            <Form inline className="searchInput" onSubmit={this.onSubmit}>
              <FormGroup>
                <b>Search Within: </b>
                <FormControl
                  type="text"
                  placeholder="search..."
                  onChange={this.localSearchChange}
                  />
              </FormGroup>
              <Button type="submit">
                <FontAwesome name="search" />
              </Button>
            </Form>
          </Col>
          <Col xsHidden md={3}>
            <div className="right-align">
              {this.props.page > 0 ? <FontAwesome
                className="arrow-left"
                name="arrow-left"
                style={{ cursor: 'pointer', margin: '5px' }}
                onClick={() => this.props.update.page(this.props.page - 1)}
                /> : null}
              page <b>{this.props.page + 1}/{this.props.pagesTotal} </b>
              {this.props.page + 1 < this.props.pagesTotal ? <FontAwesome
                  className="arrow-right"
                  name="arrow-right"
                  style={{ cursor: 'pointer', margin: '5px' }}
                  onClick={() => this.props.update.page(this.props.page + 1)}
                /> : null}
            </div>
          </Col>
        </Row>
        {/* <Row>
          <Col md={10}>
          </Col>
          <Col md={2}>
            <div className="right-align">
              <DropdownButton title={this.props.pageSize+" Rows"} >
                <MenuItem eventKey="1">5 Rows</MenuItem>
                <MenuItem eventKey="2">10 Rows</MenuItem>
                <MenuItem eventKey="3">20 Rows</MenuItem>
                <MenuItem eventKey="4">25 Rows</MenuItem>
                <MenuItem eventKey="5">50 Rows</MenuItem>
                <MenuItem eventKey="5">100 Rows</MenuItem>
              </DropdownButton>
            </div>
          </Col>
        </Row> */}
        <Row>
          <Col md={12} style={{ padding: '10px 0px' }}>
            <b>Filters: </b>
            { Array.from(this.mkCrumbs(this.props.searchParams, this.props.removeFilter)) }
          </Col>
        </Row>
      </Grid>
      </CrumbsBarStyleWrappper>
    );
  }
}