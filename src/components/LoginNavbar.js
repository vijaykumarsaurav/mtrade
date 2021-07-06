import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import MyLogo from './mylogo.png';
import  {IMAGE_VALIDATION_TOKEN,COOKIE_DOMAIN} from "../utils/config";



const style = {
    flexGrow: 1
}


const LoginNavBar = (props) => {
    
    return (
        <React.Fragment>
            {/* <AppBar position="static" style={{backgroundColor: '#f44336'}}/> */}
            <AppBar position="static">
                <Toolbar>
                <img  style={{width:"190px"}} src={MyLogo} />

                    {/* <div style={{width:"300px"}}>
                        <Typography variant="h6" style={style}>
                             &nbsp;&nbsp;  M-Trade
                        </Typography>
                    </div>               */}
                    
                </Toolbar>
            </AppBar>
        </React.Fragment>
    )
};

export default LoginNavBar;