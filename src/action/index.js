import * as actionTypes from "./types";
import performServerAction from "../api"
import AuthService from "../components/service/AuthService";

export const setPackLoaded = ()=> async dispatch=> {
    var data = { allPacks:true, portal: true}; 
    const response = await performServerAction.post('getPrepaidPacks', data)
    
    dispatch( { type: actionTypes.SET_PACK_LOADED,payload:response });
  };
  export const getPackById = (id)=> async dispatch=> {
    try{
     

      //add getPrepaidPacksById after / in sprint 7 and 8
     // const response = await performServerAction.post('/', { productId : id}, AuthService.getHeader());
    
     //sprint 8 & 9
      const response = await performServerAction.get('?productId='+id, AuthService.getHeader());

      return  dispatch( { type: actionTypes.GET_PACK_INFO_BY_ID,payload:response });
    }catch(err){
      console.log(err,"ERRRR")
    }
   
  };
  export const editPackInfo = (updatedInfo)=> async dispatch=> {
    try{
      console.log("ERROR",updatedInfo);
      updatedInfo.activationStatus =  String( updatedInfo.activationStatus );
      updatedInfo.displayOrder =  String( updatedInfo.displayOrder );
      updatedInfo.productId =  String( updatedInfo.productId );
      updatedInfo.validityDays =  String( updatedInfo.validityDays );
      updatedInfo.active =  String( updatedInfo.active );
     // updatedInfo.ftr =  String( updatedInfo.ftr );
      updatedInfo.isFtr =  String( updatedInfo.ftr );

      


      const response = await performServerAction.post('updatePrepaidPack',updatedInfo, AuthService.getHeader());
      dispatch( { type: actionTypes.EDIT_PACK_INFO,payload:response });
    }
    catch(err){
      console.log(err)
    }
  };
  export const AddPackInfo = (packInfo)=> async dispatch=> {
    try{
      console.log("ERROR",packInfo)
      const response = await performServerAction.post('getPrepaidPacks',{packInfo}, AuthService.getHeader());
      dispatch( { type: actionTypes.EDIT_PACK_INFO,payload:response });
    }
    catch(err){
      console.log(err)
    }
  };