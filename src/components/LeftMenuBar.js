import React from 'react';

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import LayersIcon from '@material-ui/icons/Layers';
import AssignmentIcon from '@material-ui/icons/Assignment';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import { Redirect } from 'react-router-dom'
import { Link } from "react-router-dom";

import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import EditIcon from '@material-ui/icons/Edit';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import HistoryIcon from '@material-ui/icons/History';

import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import UserService from "./service/UserService";

import FileCopyIcon from '@material-ui/icons/FileCopy';
//import RouterComponent from '../RouterComponent'; 

export const AdminMenuList = (
  <div>
    {/* <ListSubheader inset>Upload & Create</ListSubheader> */}
   

    <ListItem button component='a' href={"#/welcome"} >  
      <ListItemIcon>
        <EmojiEmotionsIcon />
      </ListItemIcon>
      <ListItemText primary="Welcome" />
    </ListItem>

    <ListItem button component='a' href={"#/msisdn-status"} >  
      <ListItemIcon>
        <FileCopyIcon />
      </ListItemIcon>
      <ListItemText primary="MSISDN History" />
    </ListItem>

    <ListItem button component='a' href={"#/packs"} >  
      <ListItemIcon>
        <LayersIcon />
      </ListItemIcon>
      <ListItemText primary="Pack Activation" />
    </ListItem>

    <ListItem button component='a' href={"#/offerupload"} >
      <ListItemIcon>
        <LocalOfferIcon />
      </ListItemIcon>
      <ListItemText primary="Offer Upload" />
    </ListItem>

    {/* <ListItem button component='a' href={"#/fse"} >
      <ListItemIcon>
        <LocalOfferIcon />
      </ListItemIcon>
      <ListItemText primary="FSE Upload" />
    </ListItem> */}

    <ListItem button component='a' href={"#/re-registration"} >
      <ListItemIcon>
        <LocalOfferIcon />
      </ListItemIcon>
      <ListItemText primary="KYC Re-Registration" />
    </ListItem>

    <ListItem button component='a' href={"#/banners"} >
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Upload Banner" />
    </ListItem>

    
    <ListItem button component='a' href={"#/backoffice"} >
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="User Creations" />
    </ListItem>


    {/* <ListItem button component='a' href={"#/role"} >
      <ListItemIcon>
        <PeopleIcon /> 
      </ListItemIcon>
      <ListItemText primary="Role Management" />
    </ListItem> */}
  
    
    <ListItem button component='a' href={"#/report"}>
      <ListItemIcon>
        <BarChartIcon />
      </ListItemIcon>
      <ListItemText primary="Reports" />
    </ListItem>

    {/* <ListItem button component='a' href={"#/reportpoc"}>
      <ListItemIcon>
        <BarChartIcon />
      </ListItemIcon>
      <ListItemText primary="Reports POC" />
    </ListItem> */}



  </div>
);


export const  BOAMenuList  = (

  <div>
    {/* selected */}
   
    <ListItem component='a' href={"#/verify"} button>
      <ListItemIcon>
        <VerifiedUserIcon />
      </ListItemIcon>
      <ListItemText primary="Acquisition Verification" />
    </ListItem>

    {/* sprint 7 &  8 changes */}
    <ListItem component='a' href={"#/resubmit-verify"} button>
     <ListItemIcon>
        <HistoryIcon />
      </ListItemIcon>
      <ListItemText primary="Resubmit Verification" />
    </ListItem>   

    <ListItem component='a' href={"#/kyc"} button>
     <ListItemIcon>
        <HistoryIcon />
      </ListItemIcon>
      <ListItemText primary="KYC Re-Registration" />
    </ListItem>   

    <ListItem component='a' href={"#/disconnection"} button>
     <ListItemIcon>
        <HistoryIcon />
      </ListItemIcon>
      <ListItemText primary="Disconnection Verification" />
    </ListItem> 

     <ListItem component='a' href={"#/ownership"} button>
     <ListItemIcon>
        <HistoryIcon />
      </ListItemIcon>
      <ListItemText primary="Ownership Change Verification" />
    </ListItem>   
    
  </div>
);

export const  QVAMenuList  = (

  <div>
    <ListItem component='a' href={"#/qva"} button>
      <ListItemIcon>
        <VerifiedUserIcon />
      </ListItemIcon>
      <ListItemText primary="Quick Verifications" />
    </ListItem>
    
  </div>
);

export const DEMenuList = (
  <div>
    {/* <ListSubheader inset>Update Acquisition</ListSubheader> */}

    <ListItem component='a' href={"#/dataentry"} button>
      <ListItemIcon>
        <VerifiedUserIcon />
      </ListItemIcon>
        {/* sprint 7 &  8 changes */}
      <ListItemText primary="Acquisition Data Entry" />
      {/* <ListItemText primary="Data Entry" /> */}

    </ListItem> 
    
    {/* sprint 7 &  8 changes */}
    <ListItem component='a' href={"#/resubmit-dataentry"} button>
     <ListItemIcon>
        <HistoryIcon />
      </ListItemIcon>
      <ListItemText primary="Resubmit Data Entry" />
    </ListItem>   

    <ListItem component='a' href={"#/kyc-dataentry"} button>
     <ListItemIcon>
        <HistoryIcon />
      </ListItemIcon>
      <ListItemText primary="KYC Re-Registration" />
    </ListItem>  

    <ListItem component='a' href={"#/ownership-dataentry"} button>
     <ListItemIcon>
        <HistoryIcon />
      </ListItemIcon>
      <ListItemText primary="Ownership Change Dataentry" />
    </ListItem>  
  </div>
);


export const DISTMenuList = (
  <div>
    {/* <ListSubheader inset>Upload</ListSubheader> */}
   
    <ListItem component='a' href={"#/distributor"} button>
      <ListItemIcon>
        <CloudUploadIcon />
      </ListItemIcon>
      <ListItemText primary="Upload Document" />
    </ListItem>   

    <ListItem component='a' href={"#/dist-resubmit"} button>
      <ListItemIcon>
        <CloudUploadIcon />
      </ListItemIcon>
      <ListItemText primary="Resubmit Document" />
    </ListItem>   
    
    <ListItem button component='a' href={"#/report"}>
      <ListItemIcon>
        <BarChartIcon />
      </ListItemIcon>
      <ListItemText primary="Reports" />
    </ListItem>

    <ListItem button component='a' href={"#/msisdn-status"} >  
      <ListItemIcon>
        <FileCopyIcon />
      </ListItemIcon>
      <ListItemText primary="Document View" />
    </ListItem>
  </div>
);

function logoutPortal(){
  //console.log("yo_man")

  UserService.logout()
  .then(res => {
   // {"status":200,"message":"Success","result":{"message":"User logged out successfully"}}
   //console.log(res.data);   
   localStorage.clear();
   window.location.replace("#/login");
   return;
  //  if(res.data && res.data.message == "Unauthorised" || res.data.message == "Success"){
  //   localStorage.clear();
  //   window.location.replace("#/login");
  //   return;
  //  }

  });
 //  window.localStorage.setItem("userDetails", '' );
}

export const LogoutMenu = (
  <div>
    <Link to={''} style={{textDecoration: "none"}} onClick={logoutPortal}>
      <ListItem button>
          <ListItemIcon><PowerSettingsNewIcon/></ListItemIcon><ListItemText primary="Logout" />
      </ListItem>
    </Link>
  </div>
);
