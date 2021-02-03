import axios from 'axios';
import AuthService from "./AuthService";
import  * as apiConstant from "../../utils/config";

class AdminService {

    getStaticData(role){
        return axios.get(apiConstant.VERIFICATION_STATIC_DATA + '?role=' + role, AuthService.getHeader());
    }
    getListOfRoles(){
        return axios.get(apiConstant.LIST_OF_ROLES , AuthService.getHeader());
    }

    getRoleDetails(id){
        return axios.get(apiConstant.ROLE_DETAILS_BY_ID+id , AuthService.getHeader());
    }


    downlaodAllOfferData(){
        return axios.get(apiConstant.RETAILER_API_OFFER_DOWNLOAD, AuthService.getHeader());
    }

    uploadRetailer(formData){
        return axios.post(apiConstant.RETAILER_ONBOARD, formData, AuthService.getHeader());
    }

    uploadOffer(formData){
        return axios.post(apiConstant.RETAILER_API_OFFER_UPLOAD, formData, AuthService.getHeader());
    }

    uploadFSCCampin(formData){
        return axios.post(apiConstant.RETAILER_API_FSC_UPLOAD, formData, AuthService.getHeader());
    }

    uploadReRegistration(formData){
        return axios.post(apiConstant.RETAILER_API_RE_RESISTRATION_UPLOAD, formData, AuthService.getHeader());
    }

    deleteRetailer(formData){
        return axios.post(apiConstant.RETAILER_DELETE, formData, AuthService.getHeader());
    }

    deleteFse(formData){
        return axios.post(apiConstant.FSE_DELETE, formData, AuthService.getHeader());
    }

    searchRetailer(lapuNumber){
        return axios.get(apiConstant.RETAILER_SEARCH+"?laId=" +lapuNumber , AuthService.getHeader());
    }

    searchFse(data){
        return axios.get(apiConstant.FSE_SEARCH+ "?fseNumber="+data.fseNumber+"&retailerNumber="+data.retailerNumber+"&monthOfCamp="+data.monthOfCamp, AuthService.getHeader());
    }
    
    getDashboardCount(){
        return axios.get(apiConstant.DASHBOARD_COUNT_API, AuthService.getHeader());
    }
    

    reportDirectDownload(formData,api){
        
       // var url = 'http://125.16.74.160:30611/SLRetailer/reports/ftaDeviationReport?retrieveType=BY_FTA_DATE&startDate=1577817000000&endDate=1592850599059'; 
      //  var url ='ftaDeviationReport?retrieveType=BY_FTA_DATE&startDate=1577817000000&endDate=1593023399059&id=ZXlKaGJHY2lPaUpJVXpJMU5pSjkuZXlKemRXSWlPaUpNUVRGUVRVaExNU0lzSW5SdmEyVnVTV1FpT2lJeE5Ua3lPVGs1T0RZMU16ZzJJaXdpVWs5TVJVTlBSRVVpT2lKQlJFMUpUaUlzSWtsVFgxQlBVbFJCVENJNmRISjFaU3dpUVVsU1ZFVk1YMGxFSWpvaVRFRXhVRTFJU3pFaUxDSnBjM01pT2lKb2RIUndjem92TDJGcGNuUmxiQzVqYjIwaUxDSnBZWFFpT2pFMU9USTVPVGs0TmpVc0ltVjRjQ0k2TVRVNU16QTROakkyTlgwLkhNOXpabHNPdV9rTTgwM1dWWE1SNTVhN3NVNkZLYU5NdmRtNmV1UzU4Rlk='; 
        
      if(api == 'disconnectionReport' || api == 'reconnectionReport'){
        return axios.get(apiConstant.RETAILER_REPORT_BASEAPI+api+"?date="+formData.startDate+'&id='+ localStorage.getItem("token"), AuthService.getHeader());
      }else{
        return axios.get(apiConstant.RETAILER_REPORT_BASEAPI+api+"?retrieveType="+formData.retrieveType+"&startDate="+formData.startDate+"&endDate="+formData.endDate + '&id='+ localStorage.getItem("token"), AuthService.getHeader());
      }
    
      
       

 //        window.open(apiConstant.RETAILER_REPORT_BASEAPI+api+"?retrieveType="+formData.retrieveType+"&startDate="+formData.startDate+"&endDate="+formData.endDate + '&id='+ localStorage.getItem("token"), '');

        // axios({
        //     url: url,
        //     method: 'GET',
        //     responseType: 'blob', 
        //     //headers: AuthService.getHeader(),
        //   }, AuthService.getHeader() ).then((response) => {
        //     const url = window.URL.createObjectURL(new Blob([response.data]));
        //     const link = document.createElement('a');
        //     link.href = url;
        //     link.setAttribute('download', 'file.csv');
        //     document.body.appendChild(link);
        //     link.click();
        //   });

      
      
    //   var request = new XMLHttpRequest();
    //     request.open('GET', url, true);
    //     request.setRequestHeader("Authorization", 'Bearer ' + localStorage.getItem("token"));

    //     request.onload = function() {

    //     if (request.status >= 200 && request.status < 400) {
    //         // Success!
    //         var resp = request.responseText;
            
    //         const saveData = (function () {
    //             const a = document.createElement("a");
    //             document.body.appendChild(a);
    //             a.style = "display: none";
    //             return function (data, fileName) {
    //                 const blob = new Blob([data], {type: "octet/stream"}),
    //                     url = window.URL.createObjectURL(blob);
    //                 a.href = url;
    //                 a.download = fileName;
    //                 a.click();
    //                 window.URL.revokeObjectURL(url);
    //             };
    //         }());
            
    //         //const data = 'a,b,c\n5,6,7',
    //          var   fileName = "my-csv.csv";
            
    //         saveData(resp, fileName);

    //         alert("ok done")
    //     } else {
    //         alert("not done")
    //     }
    //     };

    //     request.onerror = function() {
    //         alert("error came")
    //     };

    //     request.send();


       // window.open(apiConstant.RETAILER_REPORT_BASEAPI+api+"?retrieveType="+formData.retrieveType+"&startDate="+formData.startDate+"&endDate="+formData.endDate, '_blank');
           
       // window.open("http://125.16.74.160:30611/SLRetailer/reports/ftaDeviationReportCsv?retrieveType=BY_FTA_DATE&startDate=1577817000000&endDate=1592850599059", '_blank');        // return axios.get(apiConstant.RETAILER_REPORT_BASEAPI+api+"?retrieveType="+formData.retrieveType+"&startDate="+formData.retrieveType+"&endDate="+formData.endDate, AuthService.getHeader());
    }

    sentReportToEmail(formData,api ){
        const instance = axios.create();
        instance.defaults.timeout = 10 * 60 * 1000;
        
        var fullapiurl = apiConstant.RETAILER_REPORT_BASEAPI+api ; 
        if(api === 'reloadAndBillPayCount'){
             fullapiurl = apiConstant.RETAILER_RECHAGE_REPORT_BASEAPI+api; 
        }
        if(api === 'simSwapCount' ){
            fullapiurl = apiConstant.RETAILER_SIMSWAP_REPORT_BASEAPI+api; 
        }
       if(api === 'mpinResetCount' || api === 'idleRetailers' || api ==='monthlyActiveRetailers' || api === 'dailyActiveRetailers'){
            fullapiurl = apiConstant.RETAILER_RETAILER_REPORT_BASEAPI+api; 
        }

        if(api === 'acquisitionCountReport' || api === 'retailerOnboardedReport' ){
            fullapiurl = apiConstant.RETAILER_SLRetailerA+api; 
        }

        if(api === 'backOfficeReceptionReportPOC'){
            fullapiurl = 'http://125.17.6.6/retailer/SLRetailer/backOfficeReceptionReport/save'; 
        }
        
        if(api === 'barReport' || api === 'unBarReport'){
            fullapiurl = apiConstant.RETAILER_REPORT_BASEAPI+'barUnbarReport' ; 
        }

        if(api == 'disconnectionAgentAuditReport' || api == 'disconnectionReceptionReport' || api == 'disconnectionIpacReadyReport'  || api == 'kycReceptionReport' || api == 'kycAgentAuditReport' ||  api == 'kycIpacReadyReport' ||  api == 'ostReceptionReport'  ||  api == 'ostAgentAuditReport'  ||  api == 'ostIpacReadyReport'){
            fullapiurl = apiConstant.RETAILER_DISCONNECTION_KYC_REPORT + api; 
        }

        return instance.post(fullapiurl, formData, AuthService.getHeader());
    
    }

    

    //from pack service
    uploadPackImage(formData) {
        return axios.post(apiConstant.UPLAOD_PACK_IMAGE, formData, AuthService.getHeader());
    }

    addPack(pack) {
        return axios.post(apiConstant.SAVE_PACK, pack, AuthService.getHeader());
    }

    addBanner(pack) {
        return axios.post(apiConstant.SAVE_BANNER, pack, AuthService.getHeader());
    }

    updateBanner(pack) {
        return axios.post(apiConstant.UPDATE_BANNER, pack, AuthService.getHeader());
    }

    getOneBanner(id) {
        return axios.get(apiConstant.GET_ONE_BANNER+"?Id="+id, AuthService.getHeader());

    }

    //retailer admin service
    listPack(data){
         return axios.get(apiConstant.RECHARGE_PACK_LISTING , AuthService.getHeader());
       // return axios.post(apiConstant.RECHARGE_PACK_LISTING, data, AuthService.getHeader());
 
     }
 
 
     getAllBanner(data){
         return axios.post(apiConstant.GET_ALL_BANNERS_DETAILS,data,  AuthService.getHeader());
     }
 

     searchMSISDN(id) {
        return axios.get(apiConstant.SEARCH_BY_MSISDN+"?msisdn="+id, AuthService.getHeader());
    }

    getReportPOC() {
        return axios.get('http://125.17.6.6/retailer/SLRetailer/backOfficeReceptionReport/getData', AuthService.getHeader());
    }

}



export default new AdminService();
