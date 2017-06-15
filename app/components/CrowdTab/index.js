import React, { PropTypes } from 'react';
import { Button, Table } from 'react-bootstrap';

class CrowdTab extends React.Component {
  constructor(props) {
    super(props);
    this.rowIsUpdating = this.rowIsUpdating.bind(this);
    this.rowIsRemoved = this.rowIsRemoved.bind(this);
    this.onAnnotationUpdateSubmit = this.onAnnotationUpdateSubmit.bind(this);
    this.onAnnotationDelete = this.onAnnotationDelete.bind(this);
    this.addAnnotation = this.addAnnotation.bind(this);
    this.onDescriptionChange = this.onDescriptionChange.bind(this);
    this.createAnnotation = this.createAnnotation.bind(this);
    this.annotationRefs = {};
    this.updateableRows = {};
    this.updateRowData = {};
    this.removedRows = {};
  }

  onAnnotationUpdateSubmit(id) {
    const p = Promise.resolve();
    if (this.rowIsUpdating(id)) {
      p.then(() => this.props.onAnnotationUpdate(id, this.updateRowData[id].description));
    }
    p.then(() => { this.updateableRows[id] = !this.updateableRows[id]; });
    p.then(() => this.forceUpdate());
  }

  onAnnotationDelete(id) {
    this.removedRows[id] = true;
    this.props.onAnnotationRemove(id)
      .then(() => this.forceUpdate());
  }

  onDescriptionChange(e, id) {
    this.updateRowData[id] = this.updateRowData[id] || {};
    this.updateRowData[id].description = e.target.value;
  }

  addAnnotation() {
    this.isAddingAnnotation = true;
    this.forceUpdate();
  }

  createAnnotation() {
    this.props.onAnnotationCreate(this.newLabel, this.newDescription)
      .then(() => {
        this.newLabel = '';
        this.newDescription = '';
        this.isAddingAnnotation = false;
      })
      .then(() => this.forceUpdate());
  }

  rowIsUpdating(id) {
    return this.updateableRows[id];
  }

  rowIsRemoved(id) {
    return this.removedRows && this.removedRows[id];
  }

  render() {
    if (!this.props.data) {
      return null;
    }

    return (
      <Table striped>
        <thead>
          <tr>
            <th width="20%">Label</th>
            <th width="60%">Description</th>
            <th width="10%"></th>
            <th width="10%"></th>
          </tr>
        </thead>
        <tbody>
          {this.props.data.map((item) => this.rowIsRemoved(item.id) ? null :
          <tr key={item.id}>
            <td>{item.label}</td>
            <td>
              {
                (this.rowIsUpdating(item.id)) ?
                  <input
                    style={{ width: '100%', border: '1px solid #ccc' }}
                    type="text"
                    defaultValue={item.description}
                    onChange={(e) => this.onDescriptionChange(e, item.id)}
                    onKeyPress={(e) => {
                      if (e.charCode === 13) {
                        this.onAnnotationUpdateSubmit(item.id);
                      }
                    }}
                  />
                  : item.description
              }
            </td>
            <td>
              {this.props.loggedIn ?
                <Button onClick={() => this.onAnnotationUpdateSubmit(item.id)}>
                  { this.updateableRows[item.id] ?
                    'Submit' :
                    'Update'
                  }
                </Button>
                : null }
            </td>
            <td>
              {this.props.loggedIn ?
                <Button onClick={() => this.onAnnotationDelete(item.id)}>
                  Delete
                </Button>
                : null }
            </td>
          </tr>)}
          {this.isAddingAnnotation ?
            <tr>
              <td>
                <input
                  style={{ width: '100%', border: '1px solid #ccc' }}
                  placeholder="Add a label..."
                  onChange={(e) => { this.newLabel = e.target.value; }}
                />
              </td>
              <td>
                <input
                  style={{ width: '100%', border: '1px solid #ccc' }}
                  placeholder="Add a description..."
                  onChange={(e) => { this.newDescription = e.target.value; }}
                  onKeyPress={(e) => {
                    if (e.charCode === 13) {
                      this.createAnnotation();
                    }
                  }}
                />
              </td>
              <td colSpan={2} className="text-right">
                <Button onClick={this.createAnnotation}>
                  Submit
                </Button>
              </td>
            </tr>
            :
            <tr>
              <td colSpan={4} className="text-right">
                <Button onClick={this.addAnnotation}>
                  Add
                </Button>
              </td>
            </tr>}
        </tbody>
      </Table>
    );
  }
}

CrowdTab.propTypes = {
  data: PropTypes.array,
  loggedIn: PropTypes.bool,
  onAnnotationCreate: PropTypes.func.isRequired,
  onAnnotationRemove: PropTypes.func.isRequired,
  onAnnotationUpdate: PropTypes.func.isRequired,
};

CrowdTab.defaultProps = {
  data: [],
  loggedIn: false,
};

export default CrowdTab;