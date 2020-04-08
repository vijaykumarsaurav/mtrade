const baseUrl = 'http://125.17.6.6/ams/api/v1/';
//const baseUrl = 'http://localhost:8080/api/v1/';
//http://125.16.74.160:30611/SLRetailerM1/recharges/getPrepaidPacks
export const PRODUCT_API_BASE_URL = baseUrl + 'store/portal/products';
export const SEGMENT_API_BASE_URL = baseUrl + 'store/portal/segments';
export const PORTAL_STORE_API_BASE_URL = baseUrl + 'store/portal/stores';
export const STORE_API_BASE_URL = baseUrl + 'store';
export const CIRCLE_API_BASE_URL = baseUrl + 'store/circles';
export const QUEUE_API_BASE_URL = baseUrl + 'store/portal/queues';
export const CRO_API_BASE_URL = STORE_API_BASE_URL + '/set-up';

var RETAILER_API_BASE_URL = 'https://retailer.airtel.lk/';

if(window.location.hostname == "retailer.airtel.lk"){
    RETAILER_API_BASE_URL = 'https://retailer.airtel.lk/';
}
if(window.location.hostname == "retailer.srilanka.airtel.itm"){
    RETAILER_API_BASE_URL = 'http://retailer.srilanka.airtel.itm:5443/';
}

if(window.location.hostname == "125.16.74.160"){
    RETAILER_API_BASE_URL = 'http://125.16.74.160:30611/';
}

//RETAILER_API_BASE_URL = 'http://125.16.74.160:30611/';


export const RETAILER_REPORT_BASEAPI = RETAILER_API_BASE_URL + 'SLRetailer/reports/';

//mansi api
export const SL_AD_LOGIN_URL = RETAILER_API_BASE_URL + 'SLRetailer/auth/portaLogin';
export const SL_AD_LOGOUT_URL = RETAILER_API_BASE_URL + 'SLRetailer/user/logout'; 


export const RECHARGE_PACK_LISTING = RETAILER_API_BASE_URL + 'SLRetailer/recharges/getPrepaidPacks';
export const VERIFY_DOCS_LISTING = RETAILER_API_BASE_URL + 'SLRetailer/createCAF/prepaidAcqTxns';

export const SAVE_PACK= RETAILER_API_BASE_URL + 'SLRetailer/recharges/uploadPrepaidPack';
export const UPLAOD_PACK_IMAGE= RETAILER_API_BASE_URL + 'SLRetailer/recharges/uploadRechargeImage';


export const BASE_URL= RETAILER_API_BASE_URL+"SLRetailer/recharges"
//Baneer 
export const GET_ALL_BANNERS_DETAILS = RETAILER_API_BASE_URL + 'SLRetailer/banner/getBanner/portal';
export const SAVE_BANNER = RETAILER_API_BASE_URL + 'SLRetailer/banner/uploadBanner';
export const UPDATE_BANNER = RETAILER_API_BASE_URL + 'SLRetailer/banner/updateBanner';



export const UPLOAD_IMG_BANNER = RETAILER_API_BASE_URL + 'SLRetailer/recharges/uploadRechargeImage';
export const GET_ONE_BANNER = RETAILER_API_BASE_URL + 'SLRetailer/banner/getBannerById/portal';


//arti api 
export const SEARCH_BY_MOBILE_NO = RETAILER_API_BASE_URL + 'SLRetailer/createCAF/prepaidAcqTxnData';
export const VERIFY_DOCS_BY_ID = RETAILER_API_BASE_URL + 'SLRetailer/createCAF/prepaidAcqTxnData?role=AV';
export const VERIFICATION_STATIC_DATA = RETAILER_API_BASE_URL + 'SLRetailer/cms/data';
export const VERIFY_DOCS_APPROVE = RETAILER_API_BASE_URL + 'SLRetailer/createCAF/saveVerificationDetails';
export const VERIFY_DETAILS = RETAILER_API_BASE_URL + 'SLRetailer/createCAF/prepaidAcqTxnData?role=BOA';
export const DATAENTRY_DETAILS = RETAILER_API_BASE_URL + 'SLRetailer/createCAF/prepaidAcqTxnData?role=DE';
export const SAVE_DATAENTRY_DETAILS = RETAILER_API_BASE_URL + 'SLRetailer/createCAF/saveDataEntryDetails';

//distributer
//export const DISTRIBUTER_SEARCH = RETAILER_API_BASE_URL + 'SLRetailer/createCAF/validatePreActivation';
export const DISTRIBUTER_SEARCH = RETAILER_API_BASE_URL + 'SLRetailer/createCAF/submitPreActivation';
export const DISTRIBUTER_UPLOAD = RETAILER_API_BASE_URL + 'SLRetailer/createCAF/imageUpload';


export const UNLOCK_SKIP_VERIFICATION = RETAILER_API_BASE_URL + 'SLRetailer/cms/unlockSelection';


//Retailer 
export const RETAILER_ONBOARD = RETAILER_API_BASE_URL + 'SLRetailer/agent/add';
export const RETAILER_DELETE  = RETAILER_API_BASE_URL + 'SLRetailer/agent/delete';
export const RETAILER_SEARCH = RETAILER_API_BASE_URL + 'SLRetailer/agent/retrieve';

export const TESTAPI = RETAILER_API_BASE_URL + 'SLRetailer/commomService/getSMSParameters';


