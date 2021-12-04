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
import ShowChartIcon from '@material-ui/icons/ShowChart';
import EqualizerIcon from '@material-ui/icons/Equalizer';

export const AdminMenuList = (

  <div>
    {/* <ListSubheader inset>Upload & Create</ListSubheader> */}
   

    <ListItem button component='a' href={"/mtrade/#/home"} >  
      <ListItemIcon>
        <ShowChartIcon />
      </ListItemIcon>
      <ListItemText primary="Home" />
    </ListItem>
    
    <ListItem button component='a' href={"/mtrade/#/position"} >  
      <ListItemIcon>
        <EmojiEmotionsIcon />
      </ListItemIcon>
      <ListItemText primary="Positions" />
    </ListItem>

    <ListItem button component='a' href={"/mtrade/#/sector-heat-map2"} >  
      <ListItemIcon>
        <ShowChartIcon />
      </ListItemIcon>
      <ListItemText primary="Heat Map2" />
    </ListItem>



    <ListItem button component='a' href={"/mtrade/#/delivery"} >  
      <ListItemIcon>
        <ShowChartIcon />
      </ListItemIcon>
      <ListItemText primary="Delivery" />
    </ListItem>


    <ListItem button component='a' href={"/mtrade/#/slow-motion"} >  
      <ListItemIcon>
        <ShowChartIcon />
      </ListItemIcon>
      <ListItemText primary="Slow Motion" />
    </ListItem>


   
    <ListItem button component='a' target={'_blank'} href={"/mtrade/#/find-fast-movement"} >  
      <ListItemIcon>
        <ShowChartIcon />
      </ListItemIcon>
      <ListItemText primary="Fast Movement" />
    </ListItem>

    <ListItem button component='a' target={'_blank'} href={"/mtrade/#/index-charts"} >  
      <ListItemIcon>
        <EqualizerIcon />
      </ListItemIcon>
      <ListItemText primary="Index Charts" />
    </ListItem>
    


  

    <ListItem button component='a' href={"/mtrade/#/order-watchlist"} >  
      <ListItemIcon>
        <EmojiEmotionsIcon />
      </ListItemIcon>
      <ListItemText primary="Order Watchlist" />
    </ListItem>

    <ListItem button component='a' href={"/mtrade/#/funds"} >  
      <ListItemIcon>
        <FileCopyIcon />
      </ListItemIcon>
      <ListItemText primary="Funds" />
    </ListItem>

    <ListItem button component='a' href={"/mtrade/#/order"} >  
      <ListItemIcon>
        <FileCopyIcon />
      </ListItemIcon>
      <ListItemText primary="Order Book" />
    </ListItem>
    <ListItem button component='a' href={"/mtrade/#/trade"} >  
      <ListItemIcon>
        <FileCopyIcon />
      </ListItemIcon>
      <ListItemText primary="Trade Book" />
    </ListItem>

    <ListItem button component='a' href={"/mtrade/#/sector-heat-map"} >  
      <ListItemIcon>
        <ShowChartIcon />
      </ListItemIcon>
      <ListItemText primary="Heat Map" />
    </ListItem>
  

    <ListItem button component='a' href={"/mtrade/#/market-depth"} >  
      <ListItemIcon>
        <ShowChartIcon />
      </ListItemIcon>
      <ListItemText primary="Depth Live" />
    </ListItem>

    <ListItem button component='a' href={"/mtrade/#/market-depth-mobile"} >  
      <ListItemIcon>
        <ShowChartIcon />
      </ListItemIcon>
      <ListItemText primary="Depth Live Mobile" />
    </ListItem>
    
    {/* <ListItem button component='a' href={"/mtrade/#/bn-view"} >  
      <ListItemIcon>
        <EmojiEmotionsIcon />
      </ListItemIcon>
      <ListItemText primary="NiftyBank View" />
    </ListItem>

    <ListItem button component='a' href={"/mtrade/#/nifty-view"} >  
      <ListItemIcon>
        <FileCopyIcon />
      </ListItemIcon>
      <ListItemText primary="Nifty View" />
    </ListItem>


    <ListItem button component='a' href={"/mtrade/#/sector"} >  
      <ListItemIcon>
        <FileCopyIcon />
      </ListItemIcon>
      <ListItemText primary="Sector Top" />
    </ListItem> */}

    <ListItem button component='a' href={"/mtrade/#/backtest"} >  
      <ListItemIcon>
        <FileCopyIcon />
      </ListItemIcon>
      <ListItemText primary="Backtest - Research" />
    </ListItem>
  


    <ListItem button component='a' href={"/mtrade/#/addtowatchlist"} >  
      <ListItemIcon>
        <FileCopyIcon />
      </ListItemIcon>
      <ListItemText primary={"Watchlist (" + (localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')).length) + ")"} />
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
    
    localStorage.clear();
    //localStorage.setItem('userTokens', '');
    //localStorage.setItem('userProfile', '');
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
