import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import { Link } from "react-router-dom";
import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import AdminService from "./service/AdminService";
import FileCopyIcon from '@material-ui/icons/FileCopy';
//import RouterComponent from '../RouterComponent'; 


export const AdminMenuList = (

  <div>
    {/* <ListSubheader inset>Upload & Create</ListSubheader> */}
   
    <ListItem button component='a' href={"#/livefeed"} >  
      <ListItemIcon>
        <EmojiEmotionsIcon />
      </ListItemIcon>
      <ListItemText primary="Live Feed" />
    </ListItem>

    <ListItem button component='a' href={"#/position"} >  
      <ListItemIcon>
        <EmojiEmotionsIcon />
      </ListItemIcon>
      <ListItemText primary="Positions" />
    </ListItem>

    <ListItem button component='a' href={"#/funds"} >  
      <ListItemIcon>
        <FileCopyIcon />
      </ListItemIcon>
      <ListItemText primary="Funds" />
    </ListItem>

    <ListItem button component='a' href={"#/order"} >  
      <ListItemIcon>
        <FileCopyIcon />
      </ListItemIcon>
      <ListItemText primary="Order Book" />
    </ListItem>
    <ListItem button component='a' href={"#/trade"} >  
      <ListItemIcon>
        <FileCopyIcon />
      </ListItemIcon>
      <ListItemText primary="Trade Book" />
    </ListItem>
  
    <ListItem button component='a' href={"#/bn-view"} >  
      <ListItemIcon>
        <EmojiEmotionsIcon />
      </ListItemIcon>
      <ListItemText primary="NiftyBank View" />
    </ListItem>

    <ListItem button component='a' href={"#/nifty-view"} >  
      <ListItemIcon>
        <FileCopyIcon />
      </ListItemIcon>
      <ListItemText primary="Nifty View" />
    </ListItem>


    <ListItem button component='a' href={"#/sector"} >  
      <ListItemIcon>
        <FileCopyIcon />
      </ListItemIcon>
      <ListItemText primary="Sector Top" />
    </ListItem>

    <ListItem button component='a' href={"#/test"} >  
      <ListItemIcon>
        <FileCopyIcon />
      </ListItemIcon>
      <ListItemText primary="Exprement - Research" />
    </ListItem>
  


  </div>
);

function deleteAllCookies() {
  var cookies = document.cookie.split(";");
  for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

function logoutPortal(){
  //console.log("yo_man")

  if(window.confirm("Are you sure to logout?")){

  var userProfile = localStorage.getItem("userProfile")
  userProfile = userProfile && JSON.parse(userProfile);

  var data = {
    clientcode : userProfile && userProfile.clientcode
    }

    AdminService.logout(data)
    .then(res => {
    
    //localStorage.clear();
    localStorage.setItem('userTokens', '');
    localStorage.setItem('userProfile', '');
    deleteAllCookies();
    
    window.location.replace("#/login");
    return;

    });

  }
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
