import * as actionTypes from "../action/types";
const INTIAL_STATE = {
    packs: [],
    pack:[],
    updatedPack:null
  };
 export default (state = INTIAL_STATE,action)=>{
    switch (action.type) {
        case actionTypes.SET_PACK_LOADED:
          return { ...state, packs:action.payload };
        case actionTypes.EDIT_PACK_INFO:
          return {...state,updatedPack:action.payload}
          case actionTypes.GET_PACK_INFO_BY_ID:
              return {...state,pack:action.payload}    
     default:
          return state;
      }
}

