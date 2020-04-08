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
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { textAlign } from '@material-ui/system';
import AirtellLogo from './airtellogo.png';

import { mainListItems, secondaryListItems } from './LeftMenuBar';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
      },
      toolbar: {
        paddingRight: 24, // keep right padding when drawer closed
      },
      toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
      },
      appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      },
      appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
      menuButton: {
        marginRight: 36,
      },
      menuButtonHidden: {
        display: 'none',
      },
      title: {
        flexGrow: 1,
      },
      drawerPaper: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
      drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      },
      appBarSpacer: theme.mixins.toolbar,
      content: {
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
      },
      container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
      },
      paper: {
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
      },
      fixedHeight: {
        height: 240,
      },
}));

export default function PostLoginNavBar() {
    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(true);

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
    const mystyle = {
        height:"40px",
        width: "30px"
      };

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
                    <Typography variant="h6"  noWrap> 
                        Retailer Web Portal
                    </Typography>
                   
                </Toolbar>
            </AppBar>

             <Drawer
                variant="permanent"
                classes={{
                paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
                }}
                open={open}
            >
                <div className={classes.toolbarIcon}>
                <img style={{height:30, marginRight:"73px"}} src={ AirtellLogo } />

                <IconButton onClick={handleDrawerClose}>
                    <ChevronLeftIcon />
                </IconButton>
                </div>
                <Divider />
                <List>{mainListItems}</List>
                <Divider />
                <List>{secondaryListItems}</List>
            </Drawer>
            {/* <Drawer
                className={classes.drawer}
                variant="persistent"
                anchor="left"
                open={open}
                classes={{
                    paper: classes.drawerPaper,
                }}
            >
                <div className={classes.drawerHeader}>
                <img width="40" style={{ color: "red", marginRight:"130px"}} src={ 'https://www.pinclipart.com/picdir/middle/498-4988102_36-53k-airtel-logos-of-indian-companies-quiz.png'} />

                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </div>
                <Divider />
                <List>
                    <ListItem button onClick={handleClick}>
                        <Link style={{textDecoration: "none"}} to="/dashboard"><ListItemText primary="Verify Documents" /></Link>
                    </ListItem>
                   <ListItem button onClick={handleClick}>
                        <Link style={{textDecoration: "none"}} to="/attendance"><ListItemText primary="Verify Documents" /></Link>
                    </ListItem>
                     <ListItem button onClick={handleClick}>
                        <Link style={{textDecoration: "none"}} to="/products"><ListItemText primary="Data Entry" /></Link>
                    </ListItem>
                    <ListItem  button onClick={handleClick}>
                        <Link style={{textDecoration: "none"}} to="/queues"><ListItemText primary="Queue Master"/></Link>
                    </ListItem>
                    <ListItem button onClick={handleClick}>
                        <Link style={{textDecoration: "none"}} to="/segments"><ListItemText primary="Segment Master"/></Link>
                    </ListItem>
                    <ListItem button onClick={handleClick}>
                        <Link style={{textDecoration: "none"}} to="/stores"><ListItemText primary="Store Master"/></Link>
                    </ListItem>
                    <ListItem button onClick={handleClick}>
                        <Link style={{textDecoration: "none"}} to="/cros"><ListItemText primary="CRO Details"/></Link>
                    </ListItem>
                </List>
                <Divider />
                    <ListItem button onClick={handleClick}>
                        <Link style={{textDecoration: "none"}} to="/"><ListItemText primary="Logout"/></Link>
                    </ListItem>
            </Drawer> */}
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
