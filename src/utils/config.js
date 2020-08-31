var RETAILER_API_BASE_URL = 'https://retailer.airtel.lk/SLRetailer/';
var STAGING_IP_PORT = 'http://125.16.74.160:30611/';
var DEV_IP_PORT = 'http://125.17.6.6/retailer/';


if(window.location.hostname == "retailer.airtel.lk"){
    RETAILER_API_BASE_URL = 'https://retailer.airtel.lk/SLRetailer/';
}
if(window.location.hostname == "retailer.srilanka.airtel.itm"){
    RETAILER_API_BASE_URL = 'http://retailer.srilanka.airtel.itm:5443/SLRetailer/';
}

//window.location.hostname == "localhost"  SLRetailerIPACS  SLRetailer
if(window.location.hostname == "125.16.74.160"){
    RETAILER_API_BASE_URL = 'http://125.16.74.160:30611/SLRetailer/'; 
}

if(window.location.hostname == "125.17.6.6"){
    RETAILER_API_BASE_URL = 'http://125.17.6.6/retailer/SLRetailer/';
//    RETAILER_API_BASE_URL = 'http://125.16.74.160:30611/SLRetailer/'; 
}

if(window.location.hostname == "tstretailer.airtel.lk"){
    RETAILER_API_BASE_URL = 'https://tstretailer.airtel.lk/SLRetailer/';
}

if(window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1"){
  //  RETAILER_API_BASE_URL = 'http://125.16.74.160:30611/SLRetailer/'; //staging
    RETAILER_API_BASE_URL = 'http://125.17.6.6/retailer/SLRetailer/'; //dev
}

//reports 
export const RETAILER_REPORT_BASEAPI = RETAILER_API_BASE_URL + 'reports/';
export const RETAILER_RECHAGE_REPORT_BASEAPI = STAGING_IP_PORT + 'SLRetailerA/' + 'recharges/';
export const RETAILER_SIMSWAP_REPORT_BASEAPI = STAGING_IP_PORT + 'SLRetailerA/' + 'swapping/';
export const RETAILER_RETAILER_REPORT_BASEAPI = STAGING_IP_PORT + 'SLRetailerA/' + 'retailer/';
export const RETAILER_SLRetailerA = STAGING_IP_PORT + 'SLRetailerA/' + 'reports/';

//d1 reports changes 
// export const RETAILER_REPORT_BASEAPI = RETAILER_API_BASE_URL + 'reports/';
// export const RETAILER_RECHAGE_REPORT_BASEAPI = RETAILER_API_BASE_URL + 'recharges/';
// export const RETAILER_SIMSWAP_REPORT_BASEAPI = RETAILER_API_BASE_URL + 'swapping/';
// export const RETAILER_RETAILER_REPORT_BASEAPI = RETAILER_API_BASE_URL + 'retailer/';
// export const RETAILER_SLRetailerA = RETAILER_API_BASE_URL+ 'reports/';

//login
export const SL_AD_LOGIN_URL = RETAILER_API_BASE_URL + 'auth/portaLogin';
export const SL_AD_LOGOUT_URL = RETAILER_API_BASE_URL + 'user/logout'; 

export const VERIFY_DOCS_LISTING = RETAILER_API_BASE_URL + 'avde/prepaidAcquisitions';
export const VERIFY_DOCS_LISTING_RESUBMIT = RETAILER_API_BASE_URL + 'avde/prepaidResubmits';
export const RECORD_TOBE_PROCESSED =  RETAILER_API_BASE_URL + "avde/pendingCount";

// export const VERIFY_DOCS_LISTING = STAGING_IP_PORT + 'SLRetailerA/' + 'avde/prepaidAcquisitions';
// export const VERIFY_DOCS_LISTING_RESUBMIT = STAGING_IP_PORT + 'SLRetailerA/'  + 'avde/prepaidResubmits';
// export const RECORD_TOBE_PROCESSED =  STAGING_IP_PORT + 'SLRetailerA/'  + "avde/pendingCount";

//packs 
export const RECHARGE_PACK_LISTING = RETAILER_API_BASE_URL + 'recharges/getPrepaidPacksForPortal';
export const RECHARGE_PACK_GET_BY_ID= RETAILER_API_BASE_URL + "recharges/getPrepaidPacksById"
export const SAVE_PACK= RETAILER_API_BASE_URL + 'recharges/uploadPrepaidPack';
export const UPLAOD_PACK_IMAGE= RETAILER_API_BASE_URL + 'recharges/uploadRechargeImage';


//Baneer 
export const GET_ALL_BANNERS_DETAILS = RETAILER_API_BASE_URL + 'banner/getBanner/portal';
export const SAVE_BANNER = RETAILER_API_BASE_URL + 'banner/uploadBanner';
export const UPDATE_BANNER = RETAILER_API_BASE_URL + 'banner/updateBanner';


export const UPLOAD_IMG_BANNER = RETAILER_API_BASE_URL + 'recharges/uploadRechargeImage';
export const GET_ONE_BANNER = RETAILER_API_BASE_URL + 'banner/getBannerById/portal';


//arti api 
export const SEARCH_BY_MOBILE_NO = RETAILER_API_BASE_URL + 'createCAF/prepaidAcqTxnData';
export const VERIFY_DOCS_BY_ID = RETAILER_API_BASE_URL + 'createCAF/prepaidAcqTxnData?role=AV';
export const VERIFICATION_STATIC_DATA = RETAILER_API_BASE_URL + 'cms/data';

export const VERIFY_DOCS_APPROVE = RETAILER_API_BASE_URL + 'createCAF/saveVerificationDetails';
export const VERIFY_DETAILS = RETAILER_API_BASE_URL + 'createCAF/prepaidAcqTxnData?role=BOA';
export const DATAENTRY_DETAILS = RETAILER_API_BASE_URL + 'createCAF/prepaidAcqTxnData?role=DE';
export const SAVE_DATAENTRY_DETAILS = RETAILER_API_BASE_URL + 'createCAF/saveDataEntryDetails';

//distributer
//export const DISTRIBUTER_SEARCH = RETAILER_API_BASE_URL + 'createCAF/validatePreActivation';

export const DISTRIBUTER_SEARCH = RETAILER_API_BASE_URL + 'createCAF/validatePreActivation';
export const DISTRIBUTER_SUBMIT = RETAILER_API_BASE_URL + 'createCAF/submitPreActivation';
export const DISTRIBUTER_UPLOAD = RETAILER_API_BASE_URL + 'createCAF/submitPreActivationForPortal';

export const UNLOCK_SKIP_VERIFICATION = RETAILER_API_BASE_URL + 'cms/unlockSelection';

//Retailer 
export const RETAILER_ONBOARD = RETAILER_API_BASE_URL + 'agent/add';
export const RETAILER_DELETE  = RETAILER_API_BASE_URL + 'agent/delete';
export const RETAILER_SEARCH = RETAILER_API_BASE_URL + 'agent/retrieve';

//Offer Uplaod  
export const RETAILER_API_OFFER_UPLOAD = RETAILER_API_BASE_URL + 'bestoffers/upload';
export const RETAILER_API_OFFER_DOWNLOAD = RETAILER_API_BASE_URL + 'bestoffers/download';

//role Management 
export const LIST_OF_ROLES = RETAILER_API_BASE_URL + 'roles/all';
export const ROLE_DETAILS_BY_ID = RETAILER_API_BASE_URL + 'roles/';

//search msisnd
export const SEARCH_BY_MSISDN = RETAILER_API_BASE_URL + 'avde/msisdnAcquisitionHistory';

// for dev environment:   '/retailer'    otherwise ''
export const DEV_PROTJECT_PATH =  '';  