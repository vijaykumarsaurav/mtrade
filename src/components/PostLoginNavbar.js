import React from 'react';
import clsx from 'clsx';
import { Link } from "react-router-dom";
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';

import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { textAlign } from '@material-ui/system';
import * as Menu from './LeftMenuBar';
import AccountCircle from '@material-ui/icons/AccountCircle';
import RightMenuBar from './RightMenuBar';
import MyLogo from './mylogo.png';
import  {IMAGE_VALIDATION_TOKEN,COOKIE_DOMAIN} from "../utils/config";

import NotificationsIcon from '@material-ui/icons/Notifications';
import Badge from '@material-ui/core/Badge';
import Button from '@material-ui/core/Button';
import {resolveResponse} from "../utils/ResponseHandler";
import  InvertColor from './InvertColor';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    endMenu: {
        display: 'flex',
        flexDirection: 'row reverse'
    },
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        //backgroundColor: '#f44336'
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end',
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: -drawerWidth,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    },
}));

export default function PostLoginNavBar(props) {

    const [values, setValues] = React.useState({
        acquisitionCount: '',
        resubmitCount:''
    });
    


    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);

    function handleDrawerOpen() {
        setOpen(true);
    }

    function handleDrawerClose() {
        setOpen(false);
    }

    function handleClick(e) {
        console.log(e.target.innerText)
        //this.props.history.push('/login');
    }

    var userProfile = localStorage.getItem("userProfile")
    userProfile = userProfile && JSON.parse(userProfile);
    

    var CookieExpireDate = new Date();
    CookieExpireDate.setDate(CookieExpireDate.getDate() + 1);
    document.cookie = "token=" + IMAGE_VALIDATION_TOKEN + ";expires=" + CookieExpireDate + ";domain="+COOKIE_DOMAIN+";path=/";


    return (

        <div className={classes.root}>
            <CssBaseline />
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}

            >
                <Toolbar>

                    <IconButton
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, open && classes.hide)}

                    >
                        <MenuIcon />
                    </IconButton>

                        <Grid
                                justify="space-between"
                                container
                            >
                        <Grid item >
                        <Typography variant="h6" noWrap>
                           My App
                         </Typography>
                        </Grid>

                        <Grid item >

                        <Grid
                            container
                            spacing={1}
                            direction="row"
                            style={{ color: "white" }}
                        >

                            <Grid item >
                                <Typography style={{ color: "white" }} >
                                <span id='acqRecordId'>{values.acquisitionCount}</span>
                                </Typography> 
                            </Grid>


                            <Grid item>
                                    <Button variant="contained"  autoFocus href={"#/home"}  color="secondary">
                                        Home
                                    </Button>
                              </Grid>


                            <Grid item>
                                    <Button variant="contained"  autoFocus href={"#/trade"}  color="primary">
                                        Trade
                                    </Button>
                              </Grid>


                                <Grid item>
                                    <Button variant="contained"  autoFocus href={"#/order"}  color="primary">
                                        Order
                                    </Button>
                              </Grid>


                            

                              <Grid item>
                                    <Button variant="contained"  autoFocus href={"#/funds"}  color="primary">
                                        Funds
                                    </Button>
                              </Grid>

                            <Grid item>
                                <Typography  noWrap>

                                <Button color="primary">
                                <AccountCircle />   {userProfile && userProfile.name ? userProfile.name.split(' ')[0] : null}
                                </Button>

                                </Typography> 

                        


                            </Grid>


                        </Grid>



                        </Grid>

                        </Grid>

                </Toolbar>
            </AppBar>
            <Drawer
                className={classes.drawer}
                variant="persistent"
                anchor="left"
                open={open}
                classes={{
                    paper: classes.drawerPaper,
                }}
            >
                <div className={classes.drawerHeader}>
                    {/* <img style={{ width: "100px" }} src={MyLogo} /> */}
        
                    <InvertColor />
                    <IconButton onClick={handleDrawerClose}  >
                        {theme.direction === 'ltr' ? <ChevronLeftIcon style={{ color: "gray" }} /> : <ChevronRightIcon style={{ color: "gray" }} />}
                    </IconButton>
                </div>

            

                <Divider />
                <List>{Menu.AdminMenuList}</List>

                {/* <Divider />
                <List>  <InvertColor /></List> */}

                <Divider />
                <List>{Menu.LogoutMenu}</List>

                
            </Drawer>
            <main
                className={clsx(classes.content, {
                    [classes.contentShift]: open,
                })}
            >
                <div className={classes.drawerHeader} />
            </main>
        </div>
    );
}


// BO agent : BOA
// Data Entry : DE
// Admin : ADMIN
// Distributor : DIST

