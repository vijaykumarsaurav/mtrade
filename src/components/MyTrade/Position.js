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

             this.setState({ positionList : positionList}); 
            //const reducer = (accumulator, currentValue) => parseFloat(accumulator.pnl) + parseFloat(currentValue.pnl);
           // this.setState({ todayProfitPnL : positionList.reduce(reducer)}); 
            var todayProfitPnL=0, totalbuyvalue=0, totalsellvalue=0, totalQtyTraded=0, allbuyavgprice=0,allsellavgprice=0;;
            positionList.forEach(element => {
                todayProfitPnL+= parseFloat( element.pnl); 
                totalbuyvalue+=parseFloat( element.totalbuyvalue); 
                totalsellvalue+=parseFloat( element.totalsellvalue); 
                totalQtyTraded+=parseInt( element.buyqty); 
                allbuyavgprice+=parseFloat(element.buyavgprice); 
                allsellavgprice+=parseFloat(element.sellavgprice); 
                

            }); 
            
            this.setState({ todayProfitPnL :todayProfitPnL.toFixed(2), totalbuyvalue: totalbuyvalue.toFixed(2), totalsellvalue : totalsellvalue.toFixed(2), totalQtyTraded: totalQtyTraded}); 
            this.setState({ allbuyavgprice :(allbuyavgprice/positionList.length).toFixed(2) ,allsellavgprice :(allsellavgprice/positionList.length).toFixed(2)     }); 

       })
    }
   

    
    componentDidMount() {

        var todayTime =  new Date(); 
        // if(todayTime.getHours()>=9 && todayTime.getHours()< 16 ){
        //       this.setState({
        //         positionInterval :  setInterval(() => {this.getPositionData(); }, 1002)
        //     }) 
        // }

        this.getPositionData();


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

    cancelOrderOfSame = (row) =>  {
       
        var orderData =  this.getOpenPeningOrderId(row.symboltoken);  
        var data = {
            "variety":orderData.variety,
            "orderid":orderData.orderId,
        }
        AdminService.cancelOrder(data).then(res => {
            let data = resolveResponse(res);
            if(data.status  && data.message == 'SUCCESS'){
                console.log("cancel order", data);   
               // this.setState({ orderid : data.data && data.data.orderid });
            }
        })
       
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
                    this.cancelOrderOfSame(row); 
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

    getOpenPeningOrderId =(symboltoken) => {

        var oderbookData = JSON.parse(localStorage.getItem('oderbookData'));
        var data = {}; 
         for (let index = 0; index < oderbookData.length; index++) {
            if(oderbookData[index].symboltoken == symboltoken && oderbookData[index].transactiontype ==  "SELL"){
                data.orderId = oderbookData[index].orderid  
                data.variety = oderbookData[index].variety  

             break;
            }
         } 
         return data;
     }
    modifyOrder = (row, minPrice) => {
        //console.log(this.state.triggerprice);

        var orderData = this.getOpenPeningOrderId(row.symboltoken); 

        var data = {
            "variety" : "STOPLOSS",
            "orderid": orderData.orderId,
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

            var msg = new SpeechSynthesisUtterance();
            msg.text = 'modified '+data.message
            window.speechSynthesis.speak(msg);
          
            if(data.status  && data.message == 'SUCCESS'){
              //  this.setState({ ['lastTriggerprice_' + row.symboltoken]:  parseFloat(minPrice)})
                localStorage.setItem('firstTimeModify'+row.symboltoken, 'No');
                localStorage.setItem('lastTriggerprice_' + row.symboltoken, parseFloat(minPrice));

            }
        })
    }

    getPercentage = (avgPrice,  ltp , row) =>  {

        avgPrice =  parseFloat(avgPrice); 
        var percentChange = ((ltp - avgPrice)*100/avgPrice).toFixed(2); 

       
         if(!localStorage.getItem('firstTimeModify'+row.symboltoken) && percentChange > 0.7){
                var minPrice =  avgPrice + (avgPrice * 0.25/100);
                minPrice =  minPrice.toFixed(2); 
                var wholenumber = parseInt( minPrice.split('.')[0]);
                var decimal =  parseInt( minPrice.split('.')[1]);
                var tickedecimal =  decimal-decimal%5; 
                minPrice = parseFloat( wholenumber + '.'+tickedecimal); 
                this.modifyOrder(row, minPrice);
         }else{
           //var lastTriggerprice =  this.state['lastTriggerprice_'+row.symboltoken]; 
           var lastTriggerprice =  parseFloat(localStorage.getItem('lastTriggerprice_'+row.symboltoken)); 

           var perchngfromTriggerPrice = ((ltp - lastTriggerprice)*100/lastTriggerprice).toFixed(2);   
           console.log('perchngfromTriggerPrice',perchngfromTriggerPrice);

           if(perchngfromTriggerPrice > 0.7){

                var minPrice =  lastTriggerprice + (lastTriggerprice * 0.25/100);
                minPrice =  minPrice.toFixed(2); 
                var wholenumber = parseInt( minPrice.split('.')[0]);
                var decimal =  parseInt( minPrice.split('.')[1]);
                var tickedecimal =  decimal-decimal%5; 
                minPrice = parseFloat( wholenumber + '.'+tickedecimal); 
                this.modifyOrder(row, minPrice);
           }

         }


        return percentChange;

    }


    render() {
      

        return(
            <React.Fragment>
                 <PostLoginNavBar/>
                     <br />
                
                    <Grid container direction="row" alignItems="center" container>
                        <Grid item xs={12} sm={10} >
                            <Typography  variant="h6" color="primary" gutterBottom>
                         &nbsp;   Positions ({this.state.positionList && this.state.positionList.length})
                            </Typography> 
                        </Grid>
                        
                        <Grid item xs={12} sm={1} >
                          <Typography component="h3"  style={{color:this.state.todayProfitPnL>0?"red":"green"}} >
                             P/L {this.state.todayProfitPnL}
                            </Typography> 
                        </Grid>
                        
                        <Grid item xs={12} sm={1} >
                        
                            <Button  type="number" variant="contained" color="" style={{float:"right"}} onClick={() => this.getPositionData()}>Refresh</Button>    

                        </Grid>
                </Grid>

               
                 <Grid  container spacing={1}  direction="row" alignItems="center" container>
                                

                    <Grid item xs={12} sm={12}> 
                    <Paper style={{padding:"10px", overflow:"auto"}} >
                                 
                    <Table  size="small"   aria-label="sticky table" >
                        <TableHead  style={{width:"",whiteSpace: "nowrap", backgroundColor: "lightgray"}} variant="head">
                            <TableRow   variant="head" style={{fontWeight: 'bold'}}>

                                {/* <TableCell className="TableHeadFormat" align="left">Instrument</TableCell> */}
                                <TableCell className="TableHeadFormat" align="left">Trading symbol</TableCell>
                                {/* <TableCell className="TableHeadFormat" align="left">Trading Token</TableCell> */}
                                <TableCell className="TableHeadFormat" align="left">Product type</TableCell>
                                <TableCell className="TableHeadFormat" align="left">Bought Qty</TableCell>
                                
                                <TableCell  className="TableHeadFormat" align="left">Net Qty</TableCell>
                                <TableCell  className="TableHeadFormat" align="left">Average Buy Price</TableCell>
                                <TableCell  className="TableHeadFormat" align="left">Total buy value</TableCell>

                                <TableCell  className="TableHeadFormat" align="left">Average Sell Price</TableCell>
                                <TableCell  className="TableHeadFormat" align="left">Total Sell value</TableCell>
                               
                                <TableCell  className="TableHeadFormat" align="left">Last Modify Price</TableCell>
                                <TableCell  className="TableHeadFormat" align="left">LTP</TableCell>
                                <TableCell className="TableHeadFormat" align="left">P/L </TableCell>
                                <TableCell className="TableHeadFormat" align="left">Chng % </TableCell>
                           
                            </TableRow>
                        </TableHead>
                        <TableBody style={{width:"",whiteSpace: "nowrap"}}>

                            {this.state.positionList ? this.state.positionList.map(row => (
                                <TableRow key={row.productId} style={{background : row.netqty != 0? 'gray': ""}} >

                                    <TableCell align="left">{row.tradingsymbol}</TableCell>
                                    {/* <TableCell align="left">{row.symboltoken}</TableCell> */}
                                    <TableCell align="left">{row.producttype}</TableCell>
                                    <TableCell align="left">{row.buyqty}</TableCell>
                                    <TableCell align="left">{row.netqty}</TableCell>
                                    <TableCell align="left">{row.totalbuyavgprice}</TableCell>
                                    <TableCell align="left">{row.totalbuyvalue}</TableCell>

                                    <TableCell align="left">{row.totalsellavgprice}</TableCell>
                                    <TableCell align="left">{row.totalsellvalue}</TableCell>
                                    <TableCell align="left">{parseFloat(localStorage.getItem('lastTriggerprice_'+row.symboltoken))}</TableCell>
                                    <TableCell align="left">{row.ltp}</TableCell>
                                    <TableCell align="left">{row.pnl}</TableCell>
                                    <TableCell align="left">{ row.netqty != 0 ? this.getPercentage(row.totalbuyavgprice, row.ltp, row) : ""}</TableCell>
                                    <TableCell align="left">
                                        {row.netqty != 0 ? <Button small  type="number" variant="contained" color="Secondary"  onClick={() => this.squareOff(row)}>Square Off</Button>  : ""}  
                                    </TableCell>

                                </TableRow>
                            )):''}

                                <TableRow   variant="head" style={{fontWeight: 'bold', backgroundColor: "lightgray"}}>

                                {/* <TableCell className="TableHeadFormat" align="left">Instrument</TableCell> */}
                                <TableCell className="TableHeadFormat" align="left"></TableCell>
                                {/* <TableCell className="TableHeadFormat" align="left"></TableCell> */}
                                <TableCell className="TableHeadFormat" align="left">Total</TableCell>
                                <TableCell  className="TableHeadFormat" align="left">{this.state.totalQtyTraded}</TableCell>
                                <TableCell  className="TableHeadFormat" align="left"></TableCell>
                                <TableCell  className="TableHeadFormat" align="left">{this.state.allbuyavgprice}</TableCell>
                                <TableCell  className="TableHeadFormat" align="left">{this.state.totalbuyvalue}</TableCell>


                                <TableCell  className="TableHeadFormat" align="left">{ this.state.allsellavgprice}</TableCell>
                                <TableCell  className="TableHeadFormat" align="left">{this.state.totalsellvalue}</TableCell>

                                <TableCell  className="TableHeadFormat" align="left"></TableCell>
                                <TableCell  className="TableHeadFormat" align="left"></TableCell>
                                <TableCell className="TableHeadFormat" align="left">{this.state.todayProfitPnL} </TableCell>
                                <TableCell className="TableHeadFormat" align="left"></TableCell>

                                </TableRow>


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