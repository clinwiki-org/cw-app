import { put, takeEvery, call, take, cancel, select } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';
import { browserHistory } from 'react-router';
import {
  REQUEST_STUDY_ACTION,
  RELOAD_STUDY_ACTION,
  WIKI_SUBMIT_ACTION,
  ANNOTATION_CREATE_ACTION,
  ANNOTATION_DELETE_ACTION,
  ANNOTATION_UPDATE_ACTION,
  TAG_REMOVE_ACTION,
  TAG_SUBMIT_ACTION,
  SET_WIKI_OVERRIDE_ACTION,
  REVIEW_SUBMIT_ACTION,
  REVIEW_UPDATE_ACTION,
  REVIEW_DELETE_ACTION,
  GET_REVIEW_ACTION,
} from './constants';
import { makeSelectWikiOverride } from './selectors';
import {
  defaultAction,
  trackingAction,
  descriptiveAction,
  adminAction,
  recruitmentAction,
  reviewsAction,
  wikiAction,
  reviewReceiveAction,
} from './actions';
import client from '../../utils/client';

export function* loadDefault(action) {
  const override = yield select(makeSelectWikiOverride());
  const data = yield client.get(`/studies/${action.nctId}/json?wiki_override=${override}`);
  yield put(defaultAction(data.data));
}

export function* loadTracking(action) {
  const data = yield client.get(`/studies/${action.nctId}/tracking`);
  yield put(trackingAction(data.data));
}

export function* loadDescriptive(action) {
  const data = yield client.get(`/studies/${action.nctId}/descriptive`);
  yield put(descriptiveAction(data.data));
}

export function* loadAdmin(action) {
  const data = yield client.get(`/studies/${action.nctId}/administrative`);
  yield put(adminAction(data.data));
}

export function* loadRecruitment(action) {
  const data = yield client.get(`/studies/${action.nctId}/recruitment`);
  yield put(recruitmentAction(data.data));
}

export function* loadReviews(action) {
  const data = yield client.get(`/reviews/${action.nctId}`);
  yield put(reviewsAction(data.data));
}

export function* loadWiki(action) {
  const data = yield client.get(`/studies/${action.nctId}/wiki`);
  yield put(wikiAction(data.data));
}

export function* loadStudy(action) {
  yield call(loadDefault, action);
  yield call(loadWiki, action);
  yield call(loadTracking, action);
  yield call(loadDescriptive, action);
  yield call(loadAdmin, action);
  yield call(loadRecruitment, action);
  yield call(loadReviews, action);
}

export function* reloadStudy(action) {
  yield call(loadDefault, action);
  yield call(loadWiki, action);
  yield call(loadReviews, action);
}

export const wikiUrl = (action) => `/studies/${action.nctId}/wiki`;

export function* submitWiki(action) {
  yield client.post(
    wikiUrl(action),
    { wiki_text: action.wikiText }
  );
  yield put({ type: RELOAD_STUDY_ACTION, nctId: action.nctId });
}

export function* postAnnotation(action) {
  yield client.post(
    wikiUrl(action),
    { add_meta: action }
  );
  yield put({ type: RELOAD_STUDY_ACTION, nctId: action.nctId });
}

export function* deleteAnnotation(action) {
  yield client.post(
    wikiUrl(action),
    { delete_meta: { key: action.key } }
  );
  yield put({ type: RELOAD_STUDY_ACTION, nctId: action.nctId });
}

export function* submitTag(action) {
  yield client.post(
    wikiUrl(action),
    { add_tag: action.tag }
  );
  yield put({ type: RELOAD_STUDY_ACTION, nctId: action.nctId });
}

export function* removeTag(action) {
  yield client.post(
    wikiUrl(action),
    { remove_tag: action.tag }
  );
  yield put({ type: RELOAD_STUDY_ACTION, nctId: action.nctId });
}

export function* reloadStudySaga() {
  const requestWatcher = yield takeEvery(REQUEST_STUDY_ACTION, loadStudy);
  const reloadWatcher = yield takeEvery(RELOAD_STUDY_ACTION, reloadStudy);

  yield take(LOCATION_CHANGE);

  yield cancel(requestWatcher);
  yield cancel(reloadWatcher);
}

export function* wikiSaga() {
  const submitWatcher = yield takeEvery(WIKI_SUBMIT_ACTION, submitWiki);
  yield take(LOCATION_CHANGE);
  yield cancel(submitWatcher);
}

export function* annotationsSaga() {
  const createAnnotationWatcher = yield takeEvery(ANNOTATION_CREATE_ACTION, postAnnotation);
  const deleteAnnotationWatcher = yield takeEvery(ANNOTATION_DELETE_ACTION, deleteAnnotation);
  const updateAnnotationWatcher = yield takeEvery(ANNOTATION_UPDATE_ACTION, postAnnotation);

  yield take(LOCATION_CHANGE);

  yield cancel(createAnnotationWatcher);
  yield cancel(deleteAnnotationWatcher);
  yield cancel(updateAnnotationWatcher);
}

export function* tagsSubmitSaga() {
  const watcher = yield takeEvery(TAG_SUBMIT_ACTION, submitTag);
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

export function* tagRemoveSaga() {
  const watcher = yield takeEvery(TAG_REMOVE_ACTION, removeTag);
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

export function* wikiOverrideSaga() {
  const watcher = yield takeEvery(SET_WIKI_OVERRIDE_ACTION, reloadStudy);
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

export function* submitReview(action) {
  yield client.post(`/reviews/${action.nctId}`, action);
  yield call(reloadStudy, action);
  browserHistory.push(`/reviews/${action.nctId}`);
}

export function* submitReviewSaga() {
  const watcher = yield takeEvery(REVIEW_SUBMIT_ACTION, submitReview);
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

export function* updateReview(action) {
  yield client.patch(`/review/${action.reviewId}`, action);
  yield call(reloadStudy, action);
  browserHistory.push(`/reviews/${action.nctId}`);
}

export function* updateReviewSaga() {
  const watcher = yield takeEvery(REVIEW_UPDATE_ACTION, updateReview);
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

export function* deleteReview(action) {
  yield client.delete(`/review/${action.reviewId}`);
  yield call(reloadStudy, action);
  browserHistory.push(`/reviews/${action.nctId}`);
}

export function* deleteReviewSaga() {
  const watcher = yield takeEvery(REVIEW_DELETE_ACTION, deleteReview);
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

export function* getReview(action) {
  const { data } = yield client.get(`/review/${action.reviewId}`);
  yield put(reviewReceiveAction(data));
}

export function* getReviewSaga() {
  const watcher = yield takeEvery(GET_REVIEW_ACTION, getReview);
  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}


export default [
  reloadStudySaga,
  wikiSaga,
  annotationsSaga,
  tagsSubmitSaga,
  tagRemoveSaga,
  wikiOverrideSaga,
  submitReviewSaga,
  deleteReviewSaga,
  updateReviewSaga,
  getReviewSaga,
];
