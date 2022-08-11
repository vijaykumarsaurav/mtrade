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

<<<<<<< Updated upstream
     getPosition(data){
        return axios.get(apiConstant.getPosition, AuthService.getHeader());
     }
=======
     saveCurrentSassion(data) {
      return axios.post('http://localhost:8081/saveCurrentSassion', data,  '');
     } 
     

     backupHistoryData(data) {
      return axios.post('http://localhost:8081/backupHistoryData', data,  '');
   } 

   getAll145Tokens(data) {
      return axios.post('http://localhost:8081/getAll145Tokens', data,  '');
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
>>>>>>> Stashed changes

     getAutoScanStock(){
        return axios.get(apiConstant.getScannedStocks, '');
     }

     getNSETopStock(){
        return axios.get(apiConstant.getNseTopStocks, '');
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

    getAllIndices(){
       var sessionId =  Math.random().toString(36).substr(2, 9);
       var CookieExpireDate = new Date();
       CookieExpireDate.setDate(CookieExpireDate.getDate() + 1);
       document.cookie = "sessionId=" + sessionId + ";expires=" + CookieExpireDate + ";domain=www.nseindia.com;path=/";


        return axios.get(apiConstant.allIndices);
    }

}



export default new AdminService();
