import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import MyLogo from './mylogo.png';

const LoginNavBar = (props) => {
    
    return (
        <React.Fragment>
            {/* <AppBar position="static" style={{backgroundColor: '#f44336'}}/> */}
            <AppBar position="static">
                <Toolbar>
                <img alt="logo"  style={{width:"190px"}} src={MyLogo} />

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