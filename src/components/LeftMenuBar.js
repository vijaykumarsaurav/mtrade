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

import storeService from "./service/StoreService";

//import RouterComponent from '../RouterComponent'; 

// function appLogout(props) {
//  // this.props.history.push('/dashboard');
//  alert("ddd")
// }


// class AppLogout extends  React.Component {
//   constructor(props) {
//     super(props);
//     this.logout = this.logout.bind(this);
//   }
  
//   logout() {


//     storeService.login(loginPayload)
//     .then(res => {
//     //  alert(JSON.stringify(res));

  
        
//     });

//    //alert("logout")
//    console.log(this.props); 

//    //const { history } = this.props;
//    // history.push("/login")

//    //this.props.history.push('/login');
//     //return  (<Redirect to='/login' /> ); 
  
//   }

//   render() {


//     return (
     
      
//       //  onClick={this.logout()} 
//     <ListItem button component="a" href="/login" >
//         <ListItemIcon>
//           <PowerSettingsNewIcon />
//         </ListItemIcon>
//         <ListItemText primary="Logout" />
//     </ListItem>
//     );
//   }


// }


export const  BOAMenuList  = (

  <div>
    {/* selected */}
   
    <ListItem component='a' href={"/#/verify"} button>
      <ListItemIcon>
        <VerifiedUserIcon />
      </ListItemIcon>
      <ListItemText primary="Verify Docs" />
    </ListItem>
    
  </div>
);



export const AdminMenuList = (
  <div>
    {/* <ListSubheader inset>Upload & Create</ListSubheader> */}
   
    <ListItem button component='a' href={"/#/welcome"} >  
      <ListItemIcon>
        <LayersIcon />
      </ListItemIcon>
      <ListItemText primary="Welcome" />
    </ListItem>

    <ListItem button component='a' href={"/#/packs"} >  
      <ListItemIcon>
        <LayersIcon />
      </ListItemIcon>
      <ListItemText primary="Pack Activation" />
    </ListItem>

    <ListItem button component='a' href={"/#/offerupload"} >
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="Offer Upload" />
    </ListItem>

    <ListItem button component='a' href={"/#/banners"} >
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Upload Banner" />
    </ListItem>

    
    <ListItem button component='a' href={"/#/backoffice"} >
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="BO Agent" />
    </ListItem>


    <ListItem button component='a' href={"/#/role"} >
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="Role Management" />
    </ListItem>
  
    
    <ListItem button component='a' href={"/#/report"}>
      <ListItemIcon>
        <BarChartIcon />
      </ListItemIcon>
      <ListItemText primary="Reports" />
    </ListItem>
  

  </div>
);





export const DISTMenuList = (
  <div>
    {/* <ListSubheader inset>Upload</ListSubheader> */}
   
    <ListItem component='a' href={"/#/distributor"} button>
      <ListItemIcon>
        <CloudUploadIcon />
      </ListItemIcon>
      <ListItemText primary="Upload Document" />
    </ListItem>   

  </div>
);

export const DEMenuList = (
  <div>
    {/* <ListSubheader inset>Update Acquisition</ListSubheader> */}
   
    <ListItem component='a' href={"/#/dataentry"} button>
      <ListItemIcon>
        <EditIcon />
      </ListItemIcon>
      <ListItemText primary="Data Entry" />
    </ListItem>   

  </div>
);

function logoutPortal(){
  //console.log("yo_man")

  storeService.logout()
  .then(res => {
   // {"status":200,"message":"Success","result":{"message":"User logged out successfully"}}
   console.log(res.data);
   if(res.data &&  res.data.message == "Success"){
    localStorage.clear();
   }
   window.location.replace("/#/login");
   return;
 
  });
 //  window.localStorage.setItem("userDetails", '' );
}

export const LogoutMenu = (
  <div>
    <Link style={{textDecoration: "none"}} onClick={logoutPortal}>
      <ListItem button>
          <ListItemIcon><PowerSettingsNewIcon/></ListItemIcon><ListItemText primary="Logout" />
      </ListItem>
    </Link>
  </div>
);
