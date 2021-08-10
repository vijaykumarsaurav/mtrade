import React from 'react';
import clsx from 'clsx';
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
import * as Menu from './LeftMenuBar';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MyLogo from './mylogo.png';

import Button from '@material-ui/core/Button';
import  InvertColor from '../utils/InvertColor';

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

    const [values] = React.useState({
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

    // function handleClick(e) {
    //     console.log(e.target.innerText)
    //     //this.props.history.push('/login');
    // }

    var userProfile = localStorage.getItem("userProfile")
    userProfile = userProfile && JSON.parse(userProfile);
    
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
                        {/* <Typography variant="h6" noWrap>
                          M-Trade
                         </Typography> */}
                           <img alt="logo" style={{ width: "125px" }} src={MyLogo} />
                        </Grid>

                        <Grid item >
                        <Typography variant="h6" noWrap>
                        {localStorage.getItem('BankLtpltp')}
                         </Typography>
                         
                        </Grid>

                        <Grid item >

                                <Grid
                                    container
                                    spacing={1}
                                    direction="row"
                                    style={{ color: "white" }}
                                >

                    
                             <Grid item>
                                    <Button  autoFocus href={"#/addtowatchlist"}  >
                                       WatchLit({localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList')).length})
                                    </Button>
                              </Grid>



                            <Grid item>
                                    <Button variant="contained"  autoFocus href={"/mtrade/#/home"}  color="secondary">
                                        Home
                                    </Button>
                              </Grid>
                              <Grid item>
                                    <Button variant="contained"  autoFocus href={"/mtrade/#/position"}  color="primary">
                                      Position
                                    </Button>
                              </Grid>


                              {/* <Grid item>
                                    <Button variant="contained"  autoFocus href={"#/order-status-live"}  color="secondary">
                                        Order Status Live
                                    </Button>
                              </Grid> */}
                              


                                {/* <Grid item>
                                    <Button variant="contained"  autoFocus href={"/mtrade/#/order"}  color="primary">
                                        Order
                                    </Button>
                              </Grid>

                              <Grid item>
                                    <Button variant="contained"  autoFocus href={"/mtrade/#/trade"}  color="primary">
                                        Trade
                                    </Button>
                              </Grid>

                            

                              <Grid item>
                                    <Button variant="contained"  autoFocus href={"/mtrade/#/funds"}  color="primary">
                                        Funds
                                    </Button>
                              </Grid> */}

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
                    {/* <img style={{ width: "207px" }} src={MyLogo} /> */}
        
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

