import _ from 'lodash';
import React, { PropTypes } from 'react';
import { Grid, Row, Col, Checkbox, Button } from 'react-bootstrap';
import Modal from 'react-modal';

// cruft from immutable
const junkColumns = ['__ownerID', '__hash', '__altered', '_root'];

function ColumnPicker(props) {
  const columnKeys = Object.keys(_.omit(props.columns, junkColumns));
  columnKeys.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  return (
    <Modal
      isOpen={props.isOpen}
      onRequestClose={props.onRequestClose}
      contentLabel="Choose Your Columns"
      style={{
        overlay: {
          zIndex: 200,
          margin: '0 auto',
        },
        content: {
          zIndex: 200,
          margin: '0 auto',
        },
      }}
      shouldCloseOnOverlayClick
    >
      <Grid>
        <Row className="text-left">
          <h3>Choose Your Columns</h3>
        </Row>
        <Row style={{ textTransform: 'capitalize' }}>
          {columnKeys.map((key) => (
            <Col md={2} key={key}>
              <Checkbox defaultChecked={props.columns[key]} onClick={() => props.onPickColumn(key)}>
                {key}
              </Checkbox>
            </Col>
          ))}
        </Row>
        <Row>
          <Col md={12} className="text-right">
            <Button bsSize="large" onClick={props.onRequestClose}>
              Close
            </Button>
          </Col>
        </Row>
      </Grid>
    </Modal>
  );
}

ColumnPicker.propTypes = {
  isOpen: PropTypes.bool,
  onRequestClose: PropTypes.func,
  columns: PropTypes.object,
  /* eslint-disable */
  onPickColumn: PropTypes.func,
};

export default ColumnPicker;
