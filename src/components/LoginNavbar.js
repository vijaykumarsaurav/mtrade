import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import AirtellLogo from './airtellogo.png';
import  {IMAGE_VALIDATION_TOKEN,COOKIE_DOMAIN} from "../utils/config";



const style = {
    flexGrow: 1
}


const LoginNavBar = (props) => {
    var CookieExpireDate = new Date();
    CookieExpireDate.setDate(CookieExpireDate.getDate() + 1);
    document.cookie = "token=" + IMAGE_VALIDATION_TOKEN + ";expires=" + CookieExpireDate + ";domain="+COOKIE_DOMAIN+";path=/";

    
    return (
        <React.Fragment>
            {/* <AppBar position="static" style={{backgroundColor: '#f44336'}}/> */}
            <AppBar position="static">
                <Toolbar>
                <img  style={{width:"100px"}} src={AirtellLogo} />

                    <div style={{width:"300px"}}>
                        <Typography variant="h6" style={style}>
                             &nbsp;&nbsp;  SL MITRA Retailer Portal
                        </Typography>
                    </div>              
                    
                </Toolbar>
            </AppBar>
        </React.Fragment>
    )
};

export default LoginNavBar;