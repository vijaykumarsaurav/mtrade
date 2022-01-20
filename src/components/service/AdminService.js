import axios from 'axios';
import AuthService from "./AuthService";
import  * as apiConstant from "../../utils/config";

class AdminService {

    login(credentials) {
         return axios.post(apiConstant.LOGIN_API, credentials, AuthService.loginHeader());
    } 

    logout(credentials) {
        return axios.post(apiConstant.LOGOUT_API, credentials, AuthService.getHeader());
     } 

    getUserData(formData){
        return axios.get(apiConstant.GET_USER_PROFILE, AuthService.getHeader());
    }

    getFunds(formData){
        return axios.get(apiConstant.GET_FUNDS, AuthService.getHeader());
    }

    retrieveOrderBook(formData){
        return axios.get(apiConstant.GetOrderBook, AuthService.getHeader());
    }
    retrieveTradeBook(formData){
        return axios.get(apiConstant.GetTradeBook, AuthService.getHeader());
    }
    
    retrieveallTradableInstruments(formData){
        return axios.get(apiConstant.GetAllTradableInstruments,'');
    }

    placeOrder(credentials) {
        return axios.post(apiConstant.PlaceOrderApi, credentials, AuthService.getHeader());
    } 
    modifyOrder(credentials) {
        return axios.post(apiConstant.modifyOrderApi, credentials, AuthService.getHeader());
    } 
    cancelOrder(credentials) {

        return axios.post(apiConstant.cancelOrderApi, credentials, AuthService.getHeader());
    } 

    getLTP(credentials) {
        return axios.post(apiConstant.GetLTPAPI, credentials, AuthService.getHeader());
    } 

    getHistoryData(credentials) {
        return axios.post(apiConstant.getCandleData, credentials, AuthService.getHeader());
    } 

    scanStocks(credentials) {
        return axios.post('https://chartink.com/screener/process', credentials, AuthService.getScannerHeader());
     } 

     autoCompleteSearch(query) {
        return axios.get('http://localhost:8081/search/'+query, '');
     } 
     getAllListTokens(data) {
      return axios.post('http://localhost:8081/getAllListTokens', data, '');
   } 
     saveWatchList(data) {
        return axios.get('http://localhost:8081/saveWatchList/'+data, '');
     } 
     addIntoStaticData(data) {
        return axios.post('http://localhost:8081/addIntoStaticData', data, '');
     }
     saveWatchListJSON(data) {
        return axios.post('http://localhost:8081/saveWatchListJSON', data, '');
     }
     getWatchListJSON() {
        return axios.get('/myJsonWatchList.json', '');
     } 
     getStaticData() {
        if(window.location.hostname == "vijaykumarsaurav.github.io")
        return axios.get('/mtrade/staticData.json', '');
        else
        return axios.get('/staticData.json', '');
     } 
     saveCandleHistory(data) {
        return axios.post('http://localhost:8081/saveCandleHistory', data,  '');
     } 

     backupHistoryData(data) {
      return axios.post('http://localhost:8081/backupHistoryData', data,  '');
   } 


   saveDeliveryData(data) {
      return axios.post('http://localhost:8081/store_delivery_data', data,  '');
   } 

   saveBidData(data) {
      return axios.post('http://localhost:8081/store_bid_data', data,  '');
   } 

   getDeliveryDataFromDb(symbol) {
      return axios.get('http://localhost:8081/get_delivery_data?symbol='+symbol, '');
   } 
   getBidDataFromDb(backDate,allSymbol,count) {
      return axios.get('http://localhost:8081/get_bid_data?backDate='+backDate +"&allSymbol="+allSymbol+"&count="+count, '');
   } 

   getBackUpdateList() {
      return axios.get('http://localhost:8081/get_backup_date_list', '');
   } 

   getPosition(data){
      return axios.get(apiConstant.getPosition, AuthService.getHeader());
   }

   getAutoScanStock(){
      return axios.get(apiConstant.getScannedStocks, '');
   }

   getNSETopStock(){
      return axios.get(apiConstant.getNseTopStocks, '');
   }
   getChartInkStock(){
      return axios.get(apiConstant.getIndiceStockNodeServerApi, '');
   }

   getSelectedStockFromDb(){
      return axios.get(apiConstant.getSelectedStock, '');
   }

    //  getBNcpdata(){
    //     return axios.get(apiConstant.'', AuthService.getHeader());
    //  }

    getIndiceStock(index){
        return axios.get(apiConstant.getIndiceStockApi+index, '');
    }

    checkOtherApi(index){
      //  return axios.get('http://localhost:8081/nse/get_indices', '');
     //  return axios.get('http://localhost:3000/nse/get_index_stocks?symbol=bankNifty', '');
        return axios.get("https://www1.nseindia.com/live_market/dynaContent/live_watch/stock_watch/liveIndexWatchData.json", '');
    }

    checkSectorApiOther(index){
        //  return axios.get('http://localhost:3000/nse/get_indices', '');
         return axios.get('http://localhost:8081/nse/get_index_stocks?symbol='+index, '');
       //return axios.get("https://www1.nseindia.com/live_market/dynaContent/live_watch/stock_watch/liveIndexWatchData.json", '');
      }

    

    getAllIndices(){
        return axios.get(apiConstant.allIndices);
    }

    allIndicesDirectJSON(){
        return axios.get('http://localhost:8081/nse/get_indices', '');
      // return axios.get(apiConstant.allIndices2Json);
     }

     getBNcpdata(symbol){
         if(symbol == 'NIFTY' || symbol == 'BANKNIFTY'){
            return axios.get('http://localhost:8081/nse/getOptionChain?symbol='+symbol, '');
         }else{
            return axios.get('http://localhost:8081/nse/getOptionChainEquity?symbol='+symbol, '');
         }
        
     }


     getDeliveryData(symbol){
        return axios.get('http://localhost:8081/nse/get_quote_info?companyName='+ symbol, '');
     }

     checkLiveBids(symbol){
        return axios.get('http://localhost:8081/nse/get_quote_info?companyName='+ symbol, '');
     }


}



export default new AdminService();
