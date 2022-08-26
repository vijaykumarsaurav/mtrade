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
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import Button from '@material-ui/core/Button';
import InvertColor from '../utils/InvertColor';
import FoundPatternDialog from '../components/MyTrade/FoundPatternDialog'
import AdminService from "./service/AdminService";
import TextField from "@material-ui/core/TextField";
import CommonOrderMethod from "../utils/CommonMethods";
import Spinner from "react-spinner-material";
import Notify from '../utils/Notify';
import Hidden from '@material-ui/core/Hidden';

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';


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
        buyFlag: true,
        sellFlag: true,
        searchSymbol: "",
        producttype: "INTRADAY"

    });

    const CashStocks = localStorage.getItem('staticData') ? JSON.parse(localStorage.getItem('staticData')).CashStocks : []; 
   
    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const autoSearchList = [];

    function handleDrawerOpen() {
        setOpen(true);
    }

    function handleDrawerClose() {
        setOpen(false);
    }

    function handleInput(e) {
        setValues({ ...values, ['searchSymbol']: e.target.value });
        // AdminService.autoCompleteSearch(e.target.value).then(searchRes => {
        //     let searchResdata = searchRes.data;
        //     if (e.target.value) {
        //         var uppercaseName = e.target.value.toUpperCase() + "-EQ";
        //         var found = searchResdata.filter(row => row.exch_seg === "NSE" && row.lotsize === "1" && row.symbol === uppercaseName);
        //         //  console.log("found", found[0] && found[0].symbol); 
        //         if (found.length) {

        //             setValues({ ...values, ['searchSymbol']: found[0].symbol, ['token']: found[0].token });
        //         }
        //     }
        // })
        var uppercaseName = e.target.value.toUpperCase() + "-EQ";
        var found = CashStocks.filter(row => row.exch_seg === "NSE" && row.lotsize === "1" && row.symbol === uppercaseName);
        if (found.length) {
            setValues({ ...values, ['searchSymbol']: found[0].symbol, ['token']: found[0].token });
        }        
    }

    function handleInputQty(e) {
        setValues({ ...values, ['qtyToTake']: e.target.value });
    }

    
    function handleProductType(e) {
        setValues({ ...values, ['producttype']: e.target.value });
        console.log( e.target.value); 
    }


    function callbackAfterOrderDone(order) {
        setValues({ ...values, ['buyFlag']: order.status });
        setValues({ ...values, ['sellFlag']: order.status });
        setValues({ ...values, ['searchSymbol']: '' });
    }

    function handleClick(type) {

        if (values.token && values.searchSymbol) {
            if (type == 'BUY') {
                setValues({ ...values, ['buyFlag']: false });
                var symbolInfo = {
                    token: values.token,
                    symbol: values.searchSymbol,
                    qtyToTake: values.qtyToTake,
                    producttype: values.producttype
                }
                CommonOrderMethod.historyWiseOrderPlace(symbolInfo, 'BUY', "no", callbackAfterOrderDone);
            }

            if (type == 'SELL') {
                setValues({ ...values, ['sellFlag']: false });
                var symbolInfo = {
                    token: values.token,
                    symbol: values.searchSymbol,
                    qtyToTake: values.qtyToTake,
                    producttype: values.producttype
                }
                CommonOrderMethod.historyWiseOrderPlace(symbolInfo, 'SELL', "no", callbackAfterOrderDone);
            }
        } else {
            Notify.showError("Type Symbol!!!");
        }
    }


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
                            <Button href={"/mtrade/#/home"}>
                                <img alt="logo" style={{ width: "125px" }} src={MyLogo} />
                            </Button>

                        </Grid>

                        <Hidden xsDown>
                            <Grid item  >

                                <Grid
                                    justify="space-between"
                                    container
                                    spacing={2}
                                >

                                    {/* <Grid item  >
                                        <Typography style={{ marginTop: '20px', fontSize: "12px" }} variant="h6" noWrap >
                                            <span id="niftySpid"  > </span>  &nbsp;&nbsp;  <span id="bankniftySpid" onClick={() => props.LoadSymbolDetails("BANKNIFTY")} > </span>
                                        </Typography>
                                    </Grid> */}

                                    <Grid item>
                                        <TextField label="Search Symbol" name="searchSymbol" value={values.searchSymbol} onChange={handleInput} />
                                    </Grid>
                                    <Grid item>
                                        <FormControl style={styles.selectStyle} style={{ marginTop: '3px' }} >
                                            <InputLabel htmlFor="gender">Order Type</InputLabel>
                                            <Select value={values.producttype} name="producttype" onChange={handleProductType}>
                                                <MenuItem value={"INTRADAY"}>Interaday</MenuItem>
                                                <MenuItem value={"DELIVERY"}>Delivery</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item>
                                        <TextField label="Qty" style={{ width: "50px" }} type="number" name="qtyToTake" value={values.qtyToTake} onChange={handleInputQty} />
                                    </Grid>
                                    <Grid item>
                                        {values.buyFlag ? <Button variant="contained" color="primary" style={{ marginLeft: '10px', marginTop: '10px' }} onClick={() => handleClick("BUY")}>Buy</Button> : <Spinner />}
                                    </Grid>

                                    <Grid item>
                                        {values.sellFlag ? <Button variant="contained" color="secondary" style={{ marginLeft: '10px', marginTop: '10px' }} onClick={() => handleClick("SELL")}>SELL</Button> : <Spinner />}
                                    </Grid>

                                </Grid>

                            </Grid>

                        </Hidden>

                        <Hidden xsDown smDown>



                            <Grid item >

                                <Grid
                                    container
                                    spacing={1}
                                    direction="row"

                                >

                                    <Grid item>
                                        <Button variant="outlined"  color="primary" href={"/mtrade/#/market-depth-mobile"}>
                                            Depth 
                                        </Button>
                                    </Grid>

                                    <Grid item>
                                        <Button variant="outlined"  target={'_blank'}  color="primary" href={"/mtrade/#/strong-charts"}>
                                            Charts <OpenInNewIcon />
                                        </Button>
                                    </Grid>


                                    <Grid item>
                                        <Button variant="outlined" target={'_blank'} color="primary" href={"/mtrade/#/sector-heat-map2"}>
                                            Sector <OpenInNewIcon />
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <Button variant="outlined" color="primary" target={'_blank'} href={"/mtrade/#/find-fast-movement2"}>
                                            Pattern <OpenInNewIcon />
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <Button variant="contained"  autoFocus href={"/mtrade/#/track145"}>
                                            145
                                        </Button>
                                    </Grid>

                                    <Grid item>
                                        <Button variant="contained" autoFocus href={"/mtrade/#/order-watchlist"} color="primary">
                                            Order WL
                                        </Button>
                                    </Grid>

                                    <Grid item>
                                        <Button variant="contained" autoFocus href={"/mtrade/#/position-new"} color="primary">
                                            Position
                                        </Button>
                                    </Grid>

                                  




                                </Grid>



                            </Grid>

                        </Hidden>


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

                    <List>{Menu.LogoutMenu}</List>                    

                    <IconButton onClick={handleDrawerClose}  >
                        {theme.direction === 'ltr' ? <ChevronLeftIcon style={{ color: "gray" }} /> : <ChevronRightIcon style={{ color: "gray" }} />}
                    </IconButton>
                </div>



                <Divider />
                <List>{Menu.AdminMenuList}</List>

                {/* <Divider />
                <List>  <InvertColor /></List> */}
{/* 
                <Divider />
                <List>{Menu.LogoutMenu}</List> */}

                        <Divider />
                   <InvertColor />



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





const styles = {
    formContainer: {
        display: 'flex',
        flexFlow: 'row wrap'
    },

    textStyle: {
        display: 'flex',
        justifyContent: 'center'

    },
    imgStyle: {
        display: 'flex'
    },

    selectStyle: {
        minWidth: '100%',
        marginBottom: '10px'
    },
    MuiTextField: {
        overflowY: 'scroll',
        fontSize: "12px",
        maxHeight: "50px",

    },
    footerButton: {
        position: 'fixed',
        left: 0,
        bottom: '20px',
        width: '100%',
        textAlign: 'right'
    }

};