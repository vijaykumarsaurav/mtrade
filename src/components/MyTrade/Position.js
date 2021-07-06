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
import  {API_KEY} from "../../utils/config";
import * as moment from 'moment';
import Autocomplete from '@material-ui/lab/Autocomplete';
import myWatchListOne from './myWatchListOne.json';

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { w3cwebsocket } from 'websocket'; 
import pako from 'pako';
import DeleteIcon from '@material-ui/icons/Delete';


class Home extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            positionList : [],
            userName: "",
            password: "",
            autoSearchList :[],
            isDasable:false,
            isError:false,
            InstrumentLTP : {},
            ifNotBought : true,
            autoSearchTemp : [],
            symboltoken: "", 
            tradingsymbol : "" ,
            buyPrice : 0,
            quantity : 1,
            producttype : "INTRADAY",
            symbolList : JSON.parse(localStorage.getItem('watchList'))
        
        };
        this.myCallback = this.myCallback.bind(this);
    }
    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value});
        var data  = e.target.value; 
        AdminService.autoCompleteSearch(data).then(res => {
            let data =  res.data; 
        //    console.log(data);       
            localStorage.setItem('autoSearchTemp',JSON.stringify(data)); 
            this.setState({ autoSearchList : data });
       })

    }

    myCallback = (date, fromDate) => {
        if (fromDate === "START_DATE") {
          this.setState({ startDate: date  });
        } else if (fromDate === "END_DATE") {
          this.setState({ endDate: date  });
        }
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
   
    getPositionData =() => {
       
        AdminService.getPosition().then(res => {
            let data = resolveResponse(res, 'noPop');
             var positionList = data && data.data;

         //    console.log(positionList);
             this.setState({ positionList : positionList});

            
        
       })
    }
   

    
    componentDidMount() {

        this.setState({
            positionInterval :  setInterval(() => {this.getPositionData(); }, 1002)
        }) 
    }

    componentWillUnmount() {
        clearInterval( this.state.positionInterval);
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
          //  console.log(data);   
            if(data.status  && data.message == 'SUCCESS'){
                localStorage.setItem('ifNotBought' ,  'false')
                this.setState({ orderid : data.data && data.data.orderid });

                if(this.state.stoploss){
                    this.placeSLMOrder(this.state.stoploss);
                }
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
                }
                this.getLTP();
              }
        })
    }

    onSelectItem = (event, values) =>{
    
        var autoSearchTemp = JSON.parse( localStorage.getItem('autoSearchTemp')); 
        if(autoSearchTemp.length> 0){
            var fdata = '';       
             for (let index = 0; index < autoSearchTemp.length; index++) {
                console.log("fdata", autoSearchTemp[index].symbol); 
                if( autoSearchTemp[index].symbol === values){
                 fdata = autoSearchTemp[index];
                 break;
                }  
             }
           
             var list = localStorage.getItem('watchList');
             if(!list){
                var data = []; 
                data.push(fdata); 
                localStorage.setItem('watchList',  JSON.stringify(data)); 
             }else{
                var list = JSON.parse( localStorage.getItem('watchList'));
                var found = list.filter(row => row.symbol  === values);
                if(found.length == 0){
                    list.push(fdata); 
                    localStorage.setItem('watchList',  JSON.stringify(list)); 
                }
               
             }
          
             this.setState({ symbolList : JSON.parse(localStorage.getItem('watchList')), search : "" });
            setTimeout(() => {
                this.updateSocketWatch();
            }, 100);
            
        }
     
    }

    deleteItemWatchlist = (symbol) => {
        var list = JSON.parse( localStorage.getItem('watchList'));
        var index = list.findIndex(data => data.symbol == symbol)
        list.splice(index,1);
        localStorage.setItem('watchList',  JSON.stringify(list)); 
        this.setState({ symbolList : list });
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

    squareOff = (row) =>  {
       
        var data = {
            "variety":"NORMAL",
            "tradingsymbol": row.tradingsymbol,
            "symboltoken":row.symboltoken,
            "transactiontype":row.buyqty > 0 ? 'SELL' : "BUY", 
            "exchange": row.exchange, 
            "ordertype": "MARKET", 
            "producttype": row.producttype, //"INTRADAY",//"DELIVERY",
            "duration":"DAY",
            "price": 0,
            "squareoff":"0",
            "stoploss":"0",
            "quantity": row.buyqty,
        }

        if(window.confirm("Squire Off!!! Sure?")){
            AdminService.placeOrder(data).then(res => {
                let data = resolveResponse(res);
                console.log("squireoff", data);   
                if(data.status  && data.message == 'SUCCESS'){
                    this.setState({ orderid : data.data && data.data.orderid });
                }
            })
        }
       
    }
    
    // placeSLMOrder = (row, minprice) => {

    //     var data = {
    //         "variety":"NORMAL",
    //         "tradingsymbol": row.tradingsymbol,
    //         "symboltoken": row.symboltoken,
    //         "transactiontype":row.buyqty > 0 ? 'SELL' : "BUY", 
    //         "exchange":row.exchange, 
    //         "producttype": row.producttype, //"INTRADAY",//"DELIVERY",
    //         "duration":"DAY",
    //         "price": 0,
    //         "squareoff":"0",
    //         "stoploss":"0",
    //         "quantity": row.buyqty, 
    //         "triggerprice":minprice,
    //         "ordertype":"STOPLOSS_MARKET", //STOPLOSS_MARKET STOPLOSS_LIMIT
    //         "variety" : "STOPLOSS"
    //     }

    //     AdminService.placeOrder(data).then(res => {
    //         let data = resolveResponse(res);
    //       //  console.log(data);   
    //         if(data.status  && data.message == 'SUCCESS'){
    //             localStorage.setItem('ifNotBought' ,  'false')
    //             this.setState({ orderid : data.data && data.data.orderid });
    //         }
    //     })
    // }

    getOpenPeningOrderId =(orderId) => {

        var oderbookData = localStorage.getItem('oderbookData');
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
    modifyOrder = (row, minPrice) => {
        //console.log(this.state.triggerprice);


        var data = {
            "variety" : "STOPLOSS",
            "orderid": '',
            "ordertype": "STOPLOSS_MARKET",   // "STOPLOSS_LIMIT",
            "producttype":  row.producttype, //"DELIVERY",
            "duration": "DAY",
            "price":  0,
            "triggerprice": parseFloat( minPrice ),
            "quantity":row.buyqty,
            "tradingsymbol": row.tradingsymbol,
            "symboltoken": row.symboltoken,
            "exchange": row.exchange
        }
        AdminService.modifyOrder(data).then(res => {
            let data = resolveResponse(res);
            console.log(data);   
            if(data.status  && data.message == 'SUCCESS'){
               // localStorage.setItem('ifNotBought' ,  'false')
            }
        })
    }

    getPercentage = (avgPrice,  ltp , row) =>  {

        avgPrice =  parseFloat(avgPrice); 
        var per = ((ltp - avgPrice)*100/avgPrice).toFixed(2); 

        console.log('avgPrice',avgPrice);
         if(!localStorage.getItem('firstTimeModify') && per > 0.5){
           var minPrice =  avgPrice + (avgPrice * 0.25/100);

           minPrice =  minPrice.toFixed(2); 

            var wholenumber = parseInt( minPrice.split('.')[0]);
            var decimal =  parseInt( minPrice.split('.')[1]);
            var tickedecimal =  decimal -decimal%5; 
            var minPrice = parseFloat( wholenumber + '.'+tickedecimal); 
           
           console.log('minPrice',minPrice);
           this.modifyOrder(row, minPrice);
           localStorage.setItem('firstTimeModify', 'No')
         }


        return per;

    }


    render() {
      

        return(
            <React.Fragment>
                 <PostLoginNavBar/>
                     <br />
                
                    <Grid container spacing={1}  direction="row" alignItems="center" container>
                        <Grid item xs={12} sm={6} >
                            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Positions ({this.state.positionList.length})
                            </Typography> 
                        </Grid>
                        
                        <Grid item xs={12} sm={6} >
                            <Button  type="number" variant="contained" color="" style={{float:"right"}} onClick={() => this.getPositionData()}>Refresh</Button>    

                        </Grid>
                            


                </Grid>

               
                 <Grid  container spacing={1}  direction="row" alignItems="center" container>
                                

                    <Grid item xs={12} sm={12}> 
                    <Paper style={{padding:"10px", overflow:"auto"}} >
                                 
                    <Table  size="small"   aria-label="sticky table" >
                        <TableHead  style={{width:"",whiteSpace: "nowrap"}} variant="head">
                            <TableRow   variant="head" style={{fontWeight: 'bold'}}>

                                {/* <TableCell className="TableHeadFormat" align="center">Instrument</TableCell> */}
                                
                                <TableCell className="TableHeadFormat" align="center">Trading symbol</TableCell>

                                <TableCell className="TableHeadFormat" align="center">Product type</TableCell>
                              
                                <TableCell  className="TableHeadFormat" align="center">Quantity</TableCell>
                                <TableCell  className="TableHeadFormat" align="center">Average Buy Price</TableCell>
                                <TableCell  className="TableHeadFormat" align="center">Average Sell Price</TableCell>
                                <TableCell  className="TableHeadFormat" align="center">LTP</TableCell>

                                <TableCell className="TableHeadFormat" align="center">P/L </TableCell>
                                <TableCell className="TableHeadFormat" align="center">Chng % </TableCell>

                           
                            </TableRow>
                        </TableHead>
                        <TableBody style={{width:"",whiteSpace: "nowrap"}}>
{/* 
                        avgnetprice: "0.00"
                        boardlotsize: "1"
                        buyamount: "207.00"
                        buyavgprice: "207.00"
                        buyqty: "1"
                        cfbuyamount: "0.00"
                        cfbuyavgprice: "0.00"
                        cfbuyqty: "0"
                        cfsellamount: "0.00"
                        cfsellavgprice: "0.00"
                        cfsellqty: "0"
                        close: "200.55"
                        exchange: "NSE"
                        expirydate: ""
                        genden: "1.00"
                        gennum: "1.00"
                        instrumenttype: ""
                        lotsize: "1"
                        ltp: "207.3"
                        multiplier: "-1"
                        netprice: "0.00"
                        netqty: "0"
                        netvalue: "-2.30"
                        optiontype: ""
                        pnl: "-2.30"
                        precision: "2"
                        priceden: "1.00"
                        pricenum: "1.00"
                        producttype: "INTRADAY"
                        realised: "-2.30"
                        sellamount: "204.70"
                        sellavgprice: "204.70"
                        sellqty: "1"
                        strikeprice: "-1"
                        symbolgroup: "EQ"
                        symbolname: "RAIN"
                        symboltoken: "15337"
                        totalbuyavgprice: "207.00"
                        totalbuyvalue: "207.00"
                        totalsellavgprice: "204.70"
                        totalsellvalue: "204.70"
                        tradingsymbol: "RAIN-EQ"
                        unrealised: "-0.00" */}

                            {this.state.positionList ? this.state.positionList.map(row => (
                                <TableRow key={row.productId} style={{background : row.netqty != 0? 'gray': ""}} >


                                    <TableCell align="center">{row.tradingsymbol}</TableCell>
                                    <TableCell align="center">{row.producttype}</TableCell>
                                    
                                    <TableCell align="center">{row.netqty}</TableCell>
                                    <TableCell align="center">{row.totalbuyavgprice}</TableCell>
                                    <TableCell align="center">{row.totalsellavgprice}</TableCell>
                                    <TableCell align="center">{row.ltp}</TableCell>
                                    
                                    <TableCell align="center">{row.pnl}</TableCell>
                                    <TableCell align="center">{ row.netqty != 0 ? this.getPercentage(row.totalbuyavgprice, row.ltp, row) : ""}</TableCell>
                                    
                                    <TableCell align="center">
                                     
                                     {row.netqty != 0 ? <Button  type="number" variant="contained" color="Secondary"  onClick={() => this.squareOff(row)}>Square Off</Button>  : ""}  
                                    </TableCell>
                  

                                </TableRow>
                            )):''}


                        </TableBody>
                    </Table>

                    </Paper>
                    </Grid>




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