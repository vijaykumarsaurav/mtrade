import { combineReducers } from 'redux';

import getPackReducer from './packReducer';

export default combineReducers({
    packs: getPackReducer,
});