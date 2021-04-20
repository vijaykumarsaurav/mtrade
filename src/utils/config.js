import { domain } from "process";

var RETAILER_API_BASE_URL = 'https://retailer.airtel.lk/SLRetailer/';
var STAGING_IP_PORT = 'https://125.16.74.160:30611/';
var DEV_IP_PORT = 'https://125.17.6.6/retailer/';
var templatePath = '',domainIpName=window.location.hostname; 

if(window.location.hostname == "retailer.airtel.lk"){
    RETAILER_API_BASE_URL = 'https://retailer.airtel.lk/SLRetailer/';
}
if(window.location.hostname == "retailer.srilanka.airtel.itm"){
    RETAILER_API_BASE_URL = 'http://retailer.srilanka.airtel.itm:5443/SLRetailer/';
}

if(window.location.hostname == "125.17.6.6"){
   // RETAILER_API_BASE_URL = 'http://125.17.6.6/retailer/SLRetailer/';
    RETAILER_API_BASE_URL = 'https://125.17.6.6/retailer_sit/SLRetailer/';
    templatePath =  '/retailerdev';  
    domainIpName = '125.17.6.6'; 
}

if(window.location.hostname == "125.17.6.6" && window.location.pathname == "/mitradev/"){
    RETAILER_API_BASE_URL = 'https://125.17.6.6/retailer/SLRetailer/';
     templatePath =  '/mitradev';  
     domainIpName = '125.17.6.6'; 
 } 
 
//dev private url
if(window.location.hostname == "10.92.210.103"){
    templatePath =  '/retailerdev';  
    domainIpName = '10.92.210.103'; 
}

if( window.location.hostname == "slretailer-web-ui-service.development.slmitra.airtelworld.in"){
    domainIpName = window.location.hostname; 
    RETAILER_API_BASE_URL = 'http://slretailer-service.development.slmitra.airtelworld.in/SLRetailer/';
    templatePath =  '';  
}

if(window.location.hostname == "tstretailer.airtel.lk"){
    RETAILER_API_BASE_URL = 'https://tstretailer.airtel.lk/SLRetailer/';
    domainIpName = 'tstretailer.airtel.lk'; 
}

if(window.location.hostname == "127.0.0.1" || window.location.hostname == "localhost"){
    //RETAILER_API_BASE_URL = 'https://125.16.74.160:30611/SLRetailer/'; //staging
     RETAILER_API_BASE_URL = 'https://125.17.6.6/retailer/SLRetailer/'; //dev
   //  RETAILER_API_BASE_URL = 'http://slretailer-service.development.slmitra.airtelworld.in/SLRetailer/';
     //RETAILER_API_BASE_URL = 'http://125.17.6.6/retailer_sit/SLRetailer/'; //sit public service
     domainIpName = '125.17.6.6'; 
  }


//reports 
export const RETAILER_REPORT_BASEAPI = RETAILER_API_BASE_URL + 'reports/';
// export const RETAILER_RECHAGE_REPORT_BASEAPI = STAGING_IP_PORT + 'SLRetailerA/' + 'recharges/';
// export const RETAILER_SIMSWAP_REPORT_BASEAPI = STAGING_IP_PORT + 'SLRetailerA/' + 'swapping/';
// export const RETAILER_RETAILER_REPORT_BASEAPI = STAGING_IP_PORT + 'SLRetailerA/' + 'retailer/';
// export const RETAILER_SLRetailerA = STAGING_IP_PORT + 'SLRetailerA/' + 'reports/';

//d1 reports changes 
export const RETAILER_RECHAGE_REPORT_BASEAPI = RETAILER_API_BASE_URL + 'recharges/';
export const RETAILER_SIMSWAP_REPORT_BASEAPI = RETAILER_API_BASE_URL + 'simswap/';
export const RETAILER_RETAILER_REPORT_BASEAPI = RETAILER_API_BASE_URL + 'retailer/';
export const RETAILER_SLRetailerA = RETAILER_API_BASE_URL+ 'reports/';
//disconnetion reports bashpath
export const RETAILER_DISCONNECTION_KYC_REPORT = RETAILER_API_BASE_URL+ 'cs/reports/';


//login
export const SL_AD_LOGIN_URL = RETAILER_API_BASE_URL + 'auth/portaLogin';
export const SL_AD_LOGOUT_URL = RETAILER_API_BASE_URL + 'auth/logout'; 

export const VERIFY_DOCS_LISTING = RETAILER_API_BASE_URL + 'avde/prepaidAcquisitions';
export const KYC_VERIFY_DOCS_LISTING = RETAILER_API_BASE_URL + 'cs/avde/pendingRecords';

export const VERIFY_DOCS_LISTING_RESUBMIT = RETAILER_API_BASE_URL + 'avde/prepaidResubmits';
export const RECORD_TOBE_PROCESSED =  RETAILER_API_BASE_URL + "avde/pendingCount";

export const KYC_RECORD_TOBE_PROCESSED =  RETAILER_API_BASE_URL + "cs/avde/pendingCount";

export const QVA_DOCS_LISTING = RETAILER_API_BASE_URL + 'avde/prepaidAcquisitionsResubmits';

export const UNLOCK_QVA_SKIP_VERIFICATION = RETAILER_API_BASE_URL + 'avde/skipQva';



// export const VERIFY_DOCS_LISTING = STAGING_IP_PORT + 'SLRetailerA/' + 'avde/prepaidAcquisitions';
// export const VERIFY_DOCS_LISTING_RESUBMIT = STAGING_IP_PORT + 'SLRetailerA/'  + 'avde/prepaidResubmits';
// export const RECORD_TOBE_PROCESSED =  STAGING_IP_PORT + 'SLRetailerA/'  + "avde/pendingCount";

//packs 
export const RECHARGE_PACK_LISTING = RETAILER_API_BASE_URL + 'recharges/getPrepaidPacksForPortal';
export const RECHARGE_PACK_GET_BY_ID= RETAILER_API_BASE_URL + "recharges/getPrepaidPacksById"
export const SAVE_PACK= RETAILER_API_BASE_URL + 'recharges/uploadPrepaidPack';
export const UPLAOD_PACK_IMAGE= RETAILER_API_BASE_URL + 'recharges/uploadRechargeImage';


//Baneer 
export const GET_ALL_BANNERS_DETAILS = RETAILER_API_BASE_URL + 'banner/getAllBannersForPortal';
export const SAVE_BANNER = RETAILER_API_BASE_URL + 'banner/upload';
export const UPDATE_BANNER = RETAILER_API_BASE_URL + 'banner/update';


export const UPLOAD_IMG_BANNER = RETAILER_API_BASE_URL + 'recharges/uploadRechargeImage';
export const GET_ONE_BANNER = RETAILER_API_BASE_URL + 'banner/getById';

//arti api  old: createCAF/prepaidAcqTxnData new: avde/acqDataForDataEntry
export const SEARCH_BY_MOBILE_NO = RETAILER_API_BASE_URL + 'avde/acqDataForDataEntry';
export const VERIFY_DOCS_BY_ID = RETAILER_API_BASE_URL + 'avde/acqDataForDataEntry?role=AV';
export const VERIFICATION_STATIC_DATA = RETAILER_API_BASE_URL + 'cms/data';
export const DASHBOARD_COUNT_API = RETAILER_API_BASE_URL + 'cms/dashboardCount';

export const VERIFY_DETAILS = RETAILER_API_BASE_URL + 'avde/acqDataForVerification';
export const VERIFY_DOCS_APPROVE = RETAILER_API_BASE_URL + 'avde/saveVerificationDetails';

//KYC 
export const KYC_VERIFY_DETAILS = RETAILER_API_BASE_URL + 'cs/avde/dataForVerification';
export const KYC_VERIFY_DOCS_APPROVE = RETAILER_API_BASE_URL + 'cs/avde/saveVerificationDetails';
export const KYC_UNLOCK_SKIP_VERIFICATION = RETAILER_API_BASE_URL + 'cs/avde/unlockSelection';

//kyc data entry
export const KYC_DATAENTRY_DETAILS = RETAILER_API_BASE_URL + 'cs/avde/dataForDataEntry';
export const KYC_SAVE_DATAENTRY_DETAILS = RETAILER_API_BASE_URL + 'cs/avde/saveDataEntryDetails';

export const DATAENTRY_DETAILS = RETAILER_API_BASE_URL + 'avde/acqDataForDataEntry';
export const SAVE_DATAENTRY_DETAILS = RETAILER_API_BASE_URL + 'avde/saveDataEntryDetails';

//distributer
//export const DISTRIBUTER_SEARCH = RETAILER_API_BASE_URL + 'createCAF/validatePreActivation';

//createCAF/validatePreActivation createCAF/submitPreActivationForPortal
export const DISTRIBUTER_SEARCH = RETAILER_API_BASE_URL + 'preactivation/validate';
export const MSISDNDOCS_VIEW = RETAILER_API_BASE_URL + 'acquisition/msisdn/acqData';

export const DISTRIBUTER_SUBMIT = RETAILER_API_BASE_URL + 'createCAF/submitPreActivation';
export const DISTRIBUTER_UPLOAD = RETAILER_API_BASE_URL + 'preactivation/portal';

export const DISTRIBUTER_SEARCH_RESUBMIT = RETAILER_API_BASE_URL + 'resubmit/data';
export const DISTRIBUTER_UPLOAD_RESUBMIT = RETAILER_API_BASE_URL + 'resubmit/portal';

export const UNLOCK_SKIP_VERIFICATION = RETAILER_API_BASE_URL + 'cms/unlockSelection';

//Retailer 
export const RETAILER_ONBOARD = RETAILER_API_BASE_URL + 'agent/add';
export const RETAILER_DELETE  = RETAILER_API_BASE_URL + 'agent/delete';
export const RETAILER_SEARCH = RETAILER_API_BASE_URL + 'agent/retrieve';
//Offer Uplaod  
export const RETAILER_API_OFFER_UPLOAD = RETAILER_API_BASE_URL + 'bestoffers/upload';
export const RETAILER_API_OFFER_DOWNLOAD = RETAILER_API_BASE_URL + 'bestoffers/download';
//fsc
export const RETAILER_API_FSC_UPLOAD = RETAILER_API_BASE_URL + 'fse/camps/upload';
//export const RETAILER_API_FSC_DOWNLOAD = RETAILER_API_BASE_URL + 'fse/view';
//export const RETAILER_API_FSC_UPLOAD =  'http://125.17.6.6/retailer/SLRetailerFSECamping/' + 'fse/camps/upload';
export const FSE_SEARCH =  'http://125.17.6.6/retailer/SLRetailerFSECamping/' +  'fse/camps/view';
export const FSE_DELETE =  'http://125.17.6.6/retailer/SLRetailerFSECamping/' +  'fse/camps/delete';

//KYC RE_RESISTRATION
export const RETAILER_API_RE_RESISTRATION_UPLOAD =  RETAILER_API_BASE_URL + 'customer/kyc/upload';
export const RETAILER_API_RE_RESISTRATION_BULK_UPLOAD =  RETAILER_API_BASE_URL + 'customer/kyc/bulkUpload';

//ftr mapping
export const RETAILER_API_FTR_MAPPING_UPLOAD =  RETAILER_API_BASE_URL + 'retailer/ftr/upload';

//role Management 
export const LIST_OF_ROLES = RETAILER_API_BASE_URL + 'roles/all';
export const ROLE_DETAILS_BY_ID = RETAILER_API_BASE_URL + 'roles/';

//search msisnd
export const SEARCH_BY_MSISDN = RETAILER_API_BASE_URL + 'acquisition/msisdnAcquisitionHistory';

export const CHECK_SESSION_API = RETAILER_API_BASE_URL + 'commomService/checkSession';
export const DEV_PROTJECT_PATH  = templatePath;
export const IMAGE_VALIDATION_TOKEN  = btoa("5dbc98dcc983a70728bd082d1a47546e@"+parseInt( new Date( new Date().getTime() + 60000 * 30 ).getTime() / 1000 ));
export const COOKIE_DOMAIN = domainIpName; 