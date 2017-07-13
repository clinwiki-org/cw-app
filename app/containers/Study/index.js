import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { Row, Col, Tabs, Tab, Well } from 'react-bootstrap';
import { createStructuredSelector } from 'reselect';
import AuthButton from '../../components/AuthButton';
import StudySidenav from '../../components/StudySidenav';
import CrowdTab from '../../components/CrowdTab';
import StudyTab from '../../components/StudyTab';
import ReviewForm from '../../components/ReviewForm';
import ReviewList from '../../components/ReviewList';
import WikiTab from '../../components/WikiTab';
import LoginModal from '../../containers/LoginSignup/LoginModal';
import { SHOULD_OPEN_LOGIN_MODAL } from '../../containers/LoginSignup/constants';
import { makeSelectAuthState } from '../App/selectors';
import makeSelectStudy, { makeSelectWiki, makeSelectWikiMeta } from './selectors';
import * as actions from './actions';

const defaultTabs = [
  'wiki', 'crowd', 'descriptive', 'administrative', 'recruitment', 'tracking',
];

export class Study extends React.Component {
  constructor(props) {
    super(props);
    this.onReviewSubmit = this.onReviewSubmit.bind(this);
    this.onReviewDelete = this.onReviewDelete.bind(this);
    this.reload = this.reload.bind(this);
    this.reviewIsLoading = false;
  }

  componentWillMount() {
    this.props.getStudy(this.props.params.nctId);
    if (this.props.params.reviewId) {
      this.loadReview(this.props.params.reviewId);
    }
    this.tabs = defaultTabs;
  }

  componentWillReceiveProps(props) {
    if (props.params.reviewId && props.params.reviewId !== this.props.params.reviewId) {
      this.loadReview(props.params.reviewId);
    }
  }

  onWikiSubmit(newWikiText) {
    this.props.onWikiSubmit(this.props.params.nctId, newWikiText);
  }

  onReviewSubmit(comment, rating, reviewId) {
    if (reviewId) {
      this.props.onReviewUpdate(reviewId, comment, rating)
        .then(() => this.props.reload(this.props.params.nctId))
        .then(() => this.props.router.push(`/reviews/${this.props.params.nctId}`));
    } else {
      this.props.onReviewSubmit(this.props.params.nctId, comment, rating)
        .then(this.reload)
        .then(() => this.props.router.push(`/reviews/${this.props.params.nctId}`));
    }
  }

  onReviewDelete(nctId, reviewId) {
    this.props.onReviewDelete(reviewId)
      .then(() => this.props.reload(nctId))
      .then(() => this.props.router.push(`/reviews/${nctId}`));
  }

  getTab(tab) {
    switch (tab) {
      case 'crowd':
        return (
          <CrowdTab
            nctId={this.props.params.nctId}
            data={this.props.WikiMeta}
            loggedIn={this.props.Auth.loggedIn}
            onAnonymousClick={this.props.onAnonymousClick}
            onAnnotationRemove={this.props.onAnnotationRemove}
            onAnnotationUpdate={this.props.onAnnotationUpdate}
            onAnnotationCreate={this.props.onAnnotationCreate}
          />);
      case 'wiki':
        return (
          <WikiTab
            wiki={this.props.Wiki}
            loggedIn={this.props.Auth.loggedIn}
            onAnonymousClick={this.props.onAnonymousClick}
            onWikiSubmit={this.props.onWikiSubmit}
          />);
      default:
        return (<StudyTab data={this.props.Study[tab]} />);
    }
  }

  getStudyTabs() {
    return (
      <Tabs defaultActiveKey={this.tabs[0]} id="study-tabs-main">
        {
          this.tabs.map((tab) => (
            <Tab
              key={tab}
              eventKey={tab}
              title={tab.toUpperCase()}
            >
              <Well style={{ background: 'rgba(240, 240, 240, 0.5)' }}>
                { this.getTab(tab) }
              </Well>
            </Tab>
          ))
        }
      </Tabs>
    );
  }

  getMainView() {
    if (this.props.location.pathname.match(/\/review\//)) {
      let review = '';
      let stars = 0;
      let reviewId = null;
      if (this.props.Study.review) {
        review = this.props.Study.review.comment;
        stars = this.props.Study.review.rating;
        reviewId = this.props.Study.review.id;
      }
      return (
        <ReviewForm
          {...this.props}
          loggedIn={this.props.Auth.loggedIn}
          onReviewSubmit={this.onReviewSubmit}
          review={review}
          stars={stars}
          reviewId={reviewId}
          reviewIsLoading={this.reviewIsLoading}
        />
      );
    }
    if (this.props.location.pathname.match(/\/reviews\//)) {
      return (
        <ReviewList
          reviews={this.props.Study.reviews}
          nctId={this.props.params.nctId}
          Auth={this.props.Auth}
          onReviewDelete={this.onReviewDelete}
          router={this.props.router}
        />);
    }
    return (
      <Row id="study-tabs">
        <Col md={12}>
          {this.getStudyTabs()}
        </Col>
      </Row>
    );
  }

  loadReview(reviewId) {
    this.reviewIsLoading = true;
    this.props.getReview(reviewId)
      .then(() => { this.reviewIsLoading = false; this.forceUpdate(); });
  }

  reload() {
    this.props.reload(this.props.params.nctId);
  }

  render() {
    if (!this.props.Study.study) {
      return null;
    }
    return (
      <div>
        <Helmet
          title={`Study${this.props.Study.study ? `| ${this.props.Study.study.title}` : ''}`}
          meta={[
            { name: 'description', content: 'Description of Study' },
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
        <Row>
          <StudySidenav
            {...this.props.Study.study}
            router={this.props.router}
            loggedIn={this.props.Auth.loggedIn}
            onTagSubmit={this.props.onTagSubmit}
            onTagRemove={this.props.onTagRemove}
            onAnonymousClick={this.props.onAnonymousClick}
          />
          <Col md={9} id="study-main">
            <Row>
              <Col md={12}>
                <h1>{this.props.Study.study.title}</h1>
              </Col>
            </Row>
            {this.getMainView()}
          </Col>
        </Row>
        <LoginModal
          isOpen={this.props.Auth.shouldOpenLoginModal}
          contentLabel="Please register or sign in"
        />
      </div>
    );
  }
}

Study.propTypes = {
  Study: PropTypes.object,
  Auth: PropTypes.object,
  getStudy: PropTypes.func.isRequired,
  params: PropTypes.object,
  location: PropTypes.object,
  router: PropTypes.object,
  onTagSubmit: PropTypes.func.isRequired,
  onTagRemove: PropTypes.func.isRequired,
  onReviewSubmit: PropTypes.func.isRequired,
  onReviewUpdate: PropTypes.func.isRequired,
  onReviewDelete: PropTypes.func.isRequired,
  getReview: PropTypes.func.isRequired,
  reload: PropTypes.func.isRequired,
  onAnnotationRemove: PropTypes.func.isRequired,
  onAnnotationUpdate: PropTypes.func.isRequired,
  onAnnotationCreate: PropTypes.func.isRequired,
  onAnonymousClick: PropTypes.func.isRequired,
  onWikiSubmit: PropTypes.func.isRequired,
  Wiki: PropTypes.object,
  WikiMeta: PropTypes.object,
};

Study.defaultProps = {
  Auth: { loggedIn: false },
};

const mapStateToProps = createStructuredSelector({
  Study: makeSelectStudy(),
  Wiki: makeSelectWiki(),
  WikiMeta: makeSelectWikiMeta(),
  Auth: makeSelectAuthState(),
});

function mapDispatchToProps(dispatch) {
  return {
    reload: (nctId) => dispatch(actions.reloadStudyAction(nctId)),
    getStudy: (nctId) => dispatch(actions.getStudyAction(nctId)),
    onWikiSubmit: (nctId, wikiText) => dispatch(actions.wikiSubmitAction(nctId, wikiText)),
    onAnonymousClick: () => dispatch({ type: SHOULD_OPEN_LOGIN_MODAL }),
    onTagSubmit: (nctId, tag) => dispatch(actions.submitTagAction(nctId, tag)),
    onTagRemove: (nctId, tag) => dispatch(actions.removeTagAction(nctId, tag)),
    onReviewSubmit: actions.submitReviewAction(dispatch),
    onReviewUpdate: actions.updateReviewAction(dispatch),
    onReviewDelete: actions.deleteReviewAction(dispatch),
    getReview: actions.getReviewAction(dispatch),
    onAnnotationRemove: (nctId, key) => dispatch(actions.deleteAnnotationAction(nctId, key)),
    onAnnotationUpdate: (nctId, key, value) => dispatch(actions.updateAnnotationAction(nctId, key, value)),
    onAnnotationCreate: (nctId, key, value) => dispatch(actions.createAnnotationAction(nctId, key, value)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Study);
