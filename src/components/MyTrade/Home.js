import React from 'react';
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import AdminService from "../service/AdminService";
import LoginNavBar from "../LoginNavbar";
import {Container} from "@material-ui/core";
import Notify from "../../utils/Notify";
import Grid from '@material-ui/core/Grid';
//import AdminWelcome from '../adminwelcome.png';
import PostLoginNavBar from "../PostLoginNavbar";
import {resolveResponse} from "../../utils/ResponseHandler";
import Dialogbox from "./Dialogbox";
import MaterialUIDateTimePicker from "../../utils/MaterialUIDateTimePicker";
import Paper from '@material-ui/core/Paper';
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Spinner from "react-spinner-material";
import  {DEV_PROTJECT_PATH, IMAGE_VALIDATION_TOKEN,COOKIE_DOMAIN} from "../../utils/config";
import * as moment from 'moment';

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

class Home extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            userName: "",
            password: "", 
            isDasable:false,
            isError:false,
            InstrumentLTP : {},
            ifNotBought : true,
            symboltoken: "", 
            tradingsymbol : "" ,
            buyPrice : 0,
            quantity : 1,
            producttype : "INTRADAY",
            symbolList : [
                {
                    "token": "2885",
                    "symbol": "RELIANCE-EQ",
                    "name": "RELIANCE",
                    "expiry": "",
                    "strike": "-1.000000",
                    "lotsize": "1",
                    "instrumenttype": "",
                    "exch_seg": "NSE",
                    "tick_size": "5.000000"
                },{
                "token": "3045",
                "symbol": "SBIN-EQ",
                "name": "SBIN",
                "expiry": "",
                "strike": "-1.000000",
                "lotsize": "1",
                "instrumenttype": "",
                "exch_seg": "NSE",
                "tick_size": "5.000000"
            },
            {
                "token": "3456",
                "symbol": "TATAMOTORS-EQ",
                "name": "TATAMOTORS",
                "expiry": "",
                "strike": "-1.000000",
                "lotsize": "1",
                "instrumenttype": "",
                "exch_seg": "NSE",
                "tick_size": "5.000000"
            },
            {
                "token": "212",
                "symbol": "ASHOKLEY-EQ",
                "name": "ASHOKLEY",
                "expiry": "",
                "strike": "-1.000000",
                "lotsize": "1",
                "instrumenttype": "",
                "exch_seg": "NSE",
                "tick_size": "5.000000"
            },{
                "token": "11630",
                "symbol": "NTPC-EQ",
                "name": "NTPC",
                "expiry": "",
                "strike": "-1.000000",
                "lotsize": "1",
                "instrumenttype": "",
                "exch_seg": "NSE",
                "tick_size": "5.000000"
            }]
           // InstrumentHistroy :  JSON.parse(localStorage.getItem('InstrumentHistroy'))
        
        };
        this.myCallback = this.myCallback.bind(this);
      //  this.login = this.login.bind(this);
    }

    myCallback = (date, fromDate) => {
        if (fromDate === "START_DATE") {
          this.setState({ startDate: date  });
        } else if (fromDate === "END_DATE") {
          this.setState({ endDate: date  });
        }

        //endDate: date.getFullYear()+'-'+ date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth()+ '-'+date.getDate() < 10 ? '0' + date.getDate() : date.getDate()  + ' '+date.getHours() < 10 ? '0' + date.getHours() : date.getHours() + ':'+ date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()  
      };
    getLTP =() => {
        var data  = {
            "exchange":"NSE",
            "tradingsymbol":  this.state.tradingsymbol,
            "symboltoken":this.state.symboltoken,
        }
        AdminService.getLTP(data).then(res => {
            let data = resolveResponse(res, 'noPop');
             var LtpData = data && data.data; 
             this.setState({ InstrumentLTP : LtpData});

            //  if(!localStorage.getItem('ifNotBought') && LtpData &&  LtpData.ltp > this.state.buyPrice){
            //    this.placeOrder(this.state.buyPrice); 
            //  }

            //  if(LtpData.ltp > this.getAveragePrice(this.state.orderid)){
            //    this.placeSLMOrder(LtpData.ltp); 
            //  }
       })
    }

    componentDidMount() {
        //get ltd 

        this.setState({ tradingsymbol :  this.state.symbolList[0].symbol, symboltoken : this.state.symbolList[0].token});
        this.getHistory(this.state.symbolList[0].token ); 

     //   this.placeSLMOrder(424); 
        
        setInterval(() => {
            this.getLTP(); 
        }, 5000);


        // setInterval(() => {
        //     this.getHistory(); 
        // }, 30000 * 1);
      
    }

    placeOrder = (transactiontype) => {

        var data = {
            "variety":"NORMAL",
            "tradingsymbol": this.state.tradingsymbol,
            "symboltoken":this.state.symboltoken,
            "transactiontype":transactiontype, //BUY OR SELL
            "exchange":"NSE",
            "ordertype":   this.state.buyPrice  == 0 ? "MARKET" : "LIMIT", 
            "producttype": this.state.producttype, //"INTRADAY",//"DELIVERY",
            "duration":"DAY",
            "price": this.state.buyPrice,
            "squareoff":"0",
            "stoploss":"0",
            "quantity":this.state.quantity,
        }

        AdminService.placeOrder(data).then(res => {
            let data = resolveResponse(res);
            console.log(data);   
            if(data.status  && data.message == 'SUCCESS'){
                localStorage.setItem('ifNotBought' ,  'false')
                this.setState({ orderid : data.data && data.data.orderid });

                if(this.state.stoploss){
                    this.placeSLMOrder(this.state.stoploss);
                }
            }
        })
    }

    LoadSymbolDetails =(name) => {
       
        var token= ''; 
        for (let index = 0; index <  this.state.symbolList.length; index++) {
            const element =  this.state.symbolList[index];
            if(this.state.symbolList[index].symbol == name){
                    token =  this.state.symbolList[index].token; 
                   this.setState({ tradingsymbol : name, symboltoken : this.state.symbolList[index].token});
                    break; 
            }
        }  
        this.getHistory(token); 
    }

    placeSLMOrder = (price) => {

        var data = {
            "variety":"NORMAL",
            "tradingsymbol": this.state.tradingsymbol,
            "symboltoken":this.state.symboltoken,
            "transactiontype":"SELL",
            "exchange":"NSE",
            "ordertype":"STOPLOSS_MARKET", //STOPLOSS_MARKET STOPLOSS_LIMIT
            "producttype": this.state.producttype, //"INTRADAY",//"DELIVERY",
            "duration":"DAY",
            "price": 0,
            "squareoff":"0",
            "stoploss":"0",
            "quantity": this.state.quantity, 
            "triggerprice" : price,
            "variety" : "STOPLOSS"
        }

        AdminService.placeOrder(data).then(res => {
            let data = resolveResponse(res);
            console.log(data);   
            if(data.status  && data.message == 'SUCCESS'){
                localStorage.setItem('ifNotBought' ,  'false')
                this.setState({ orderid : data.data && data.data.orderid });
            }
        })

        // let changePercentage = (price - this.state.averageprice)*100/this.state.averageprice; 
        // if(changePercentage > 0.5){           
        //     let minprice =  (this.state.averageprice * 0.25)/100 + this.state.averageprice ; 
        // }

    }

    modifyOrder = (price) => {

        var data = {
            "variety" : "STOPLOSS",
            "orderid": "210628000592416",
            "ordertype":"STOPLOSS_LIMIT",
            "producttype":"DELIVERY",
            "duration":"DAY",
            "price":670,
            "triggerprice": 670.1,
            "quantity":"1",
            "tradingsymbol":"GLENMARK-EQ",
            "symboltoken":"7406",
            "exchange":"NSE"
            }
        AdminService.modifyOrder(data).then(res => {
            let data = resolveResponse(res);
            console.log(data);   
            if(data.status  && data.message == 'SUCCESS'){
                localStorage.setItem('ifNotBought' ,  'false')
            }
        })
    }

    getHistory = (token) => {

        const format1 = "YYYY-MM-DD HH:mm";

        var time = moment.duration("00:50:00");
        var startdate = moment(new Date()).subtract(time);
     // var startdate = moment(this.state.startDate).subtract(time);

        var data  = {
            "exchange": "NSE",
            "symboltoken": token ,
            "interval": "FIFTEEN_MINUTE", //ONE_DAY FIVE_MINUTE 
            "fromdate": moment(startdate).format(format1) , 
            "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
       }
       

        AdminService.getHistoryData(data).then(res => {
             let data = resolveResponse(res,'noPop' );
              console.log(data); 
              if(data && data.data){
                 
                var histCandles = data.data; 
                histCandles &&  histCandles.sort(function(a,b){
                  return new Date(b[0]) - new Date(a[0]);
                });
                if(histCandles.length > 0){
                    localStorage.setItem('InstrumentHistroy', JSON.stringify(histCandles));
                    this.setState({ InstrumentHistroy :histCandles , buyPrice : histCandles[0][2]});
                    this.getLTP();
                }

              
              }
              
        })
    }

    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value.trim() });
    }

    getAveragePrice =(orderId) => {

       var  oderbookData = localStorage.getItem('oderbookData');
       var averageprice = 0; 
        for (let index = 0; index < oderbookData.length; index++) {
           if(oderbookData[index].orderid ==  'orderId'){
            averageprice =oderbookData[index].averageprice 
            this.setState({ averageprice : averageprice });
            break;
           }
        } 
        return averageprice;
    }

    render() {
        const dateParam = {
            myCallback: this.myCallback,
            startDate: '',
            endDate:'', 
            firstLavel : "Start Date and Time", 
            secondLavel : "End Date and Time"
          }


        return(
            <React.Fragment>
                 <PostLoginNavBar/>
                
                <Grid container spacing={1}  direction="row" container>
               
                <Grid item xs={2} sm={2}  style={{}}> 
                {/* <Dialogbox /> */}
               
                    {this.state.symbolList && this.state.symbolList ? this.state.symbolList.map(row => (
                        <ListItem button onClick={() => this.LoadSymbolDetails(row.symbol)} >
                          <ListItemText primary={row.name} />
                      </ListItem>
                    )):''}
                </Grid>
                
                <Grid item xs={10} sm={10}> 

                    <Grid  container spacing={1}  direction="row" alignItems="center" container>
                    
                        <Grid item xs={10} sm={5}> 
                            <Typography variant="h5"  >
                            {this.state.tradingsymbol} : {this.state.InstrumentLTP ? this.state.InstrumentLTP.ltp : "" }
                            </Typography>    
                            Open : {this.state.InstrumentLTP ? this.state.InstrumentLTP.open : "" } &nbsp;
                            High : {this.state.InstrumentLTP ? this.state.InstrumentLTP.high : "" } &nbsp;
                            Low :  {this.state.InstrumentLTP ? this.state.InstrumentLTP.low : "" }&nbsp;
                            Previous Close :  {this.state.InstrumentLTP ? this.state.InstrumentLTP.close : "" } &nbsp;
      
                        </Grid>
                        <Grid item xs={12} sm={2}>
                                 <FormControl style={styles.selectStyle}>
                                    <InputLabel  htmlFor="gender">Order Type</InputLabel>
                                    <Select value={this.state.producttype}  name="producttype" onChange={this.onChange}>
                                        <MenuItem value={"INTRADAY"}>INTRADAY</MenuItem>
                                        <MenuItem value={"DELIVERY"}>DELIVERY</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        <Grid item xs={10} sm={1}> 
                            <TextField  id="buyPrice"  label="Buy Price"  value={this.state.buyPrice}   name="buyPrice" onChange={this.onChange}/>
                        </Grid>
                        <Grid item xs={10} sm={1}> 
                            <TextField  id="quantity"  label="Qty"  value={this.state.quantity}   name="quantity" onChange={this.onChange}/>
                        </Grid>
                        <Grid item xs={10} sm={1}> 
                            <TextField  id="stoploss"  label="SL"  value={this.state.stoploss}   name="stoploss" onChange={this.onChange}/>
                        </Grid>
                       
                       
                        <Grid item xs={1} sm={2}  > 
                        
                            <Button variant="contained" color="secondary" style={{marginLeft: '20px'}} onClick={() => this.placeOrder('BUY')}>Buy</Button> 
                            <Button variant="contained" color="primary" style={{marginLeft: '20px'}} onClick={() => this.placeOrder('SELL')}>Sell</Button>    
                         </Grid>


                         <Grid item xs={10} sm={12}> 
                         <Paper style={{padding:"10px", overflow:"auto"}} >


                        <Table  size="small"   aria-label="sticky table" >
                            <TableHead  style={{width:"",whiteSpace: "nowrap"}} variant="head">
                                <TableRow   variant="head" style={{fontWeight: 'bold'}}>

                                    {/* <TableCell className="TableHeadFormat" align="center">Instrument</TableCell> */}
                                    <TableCell className="TableHeadFormat" align="center">Timestamp</TableCell>
                                    <TableCell className="TableHeadFormat" align="center">Open</TableCell>
                                    <TableCell  className="TableHeadFormat" align="center">High</TableCell>
                                    <TableCell  className="TableHeadFormat" align="center">Low</TableCell>
                                    <TableCell className="TableHeadFormat" align="center">Close </TableCell>
                                    <TableCell  className="TableHeadFormat"   align="center">Volume</TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody style={{width:"",whiteSpace: "nowrap"}}>


                                {this.state.InstrumentHistroy && this.state.InstrumentHistroy ? this.state.InstrumentHistroy.map(row => (
                                    <TableRow key={row.productId} >

                                        <TableCell align="center">{new Date(row[0]).toLocaleString()}</TableCell>
                                        <TableCell align="center">{row[1]}</TableCell>
                                        <TableCell align="center">{row[2]}</TableCell>
                                        <TableCell align="center">{row[3]}</TableCell>
                                        <TableCell align="center">{row[4]}</TableCell>
                                        <TableCell align="center">{row[5]}</TableCell>
                                    
                                    </TableRow>
                                )):''}
                            </TableBody>
                        </Table>

                        </Paper>
                        </Grid>

                          

                        
                         </Grid>
                  </Grid>

                        {/* <Grid item xs={10} sm={6}> 
                            <MaterialUIDateTimePicker callbackFromParent={dateParam} />
                            <input type="hidden" id="startDateMili" /> 
                            <input type="hidden" id="endDateMili" />   
                            <Button variant="contained" color="default" style={{marginLeft: '20px'}} onClick={this.getHistory}>
                                Search</Button>    
                        </Grid> */}

                

               
                
                </Grid>
               
            </React.Fragment>
        )


    }


}


const styles ={
    formContainer : {
        display: 'flex',
        flexFlow: 'row wrap'
    },

    textStyle :{
        display: 'flex',
        justifyContent: 'center'

    },
    imgStyle:{
        display:'flex'
    }, 

    selectStyle:{
        minWidth: '100%',
        marginBottom: '10px'
    },
    MuiTextField:{
        overflowY: 'scroll',
        fontSize:"12px", 
        maxHeight:"50px",
        
    },
    footerButton: {
        position: 'fixed',
        left: 0,
        bottom: '20px',
        width: '100%',
        textAlign: 'right'
    }

};

export default Home;