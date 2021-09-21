import React from 'react';
import AdminService from "../service/AdminService";
import Grid from '@material-ui/core/Grid';
//import AdminWelcome from '../adminwelcome.png';
import PostLoginNavBar from "../PostLoginNavbar";
import {resolveResponse} from "../../utils/ResponseHandler";
import Paper from '@material-ui/core/Paper';
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import  {API_KEY} from "../../utils/config";
import * as moment from 'moment';
import { w3cwebsocket } from 'websocket'; 
import pako from 'pako';
const wsClint =  new w3cwebsocket('wss://smartapisocket.angelbroking.com/websocket'); 

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
            console.log(data);       
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
    decodeWebsocketData =(array)  => {

        console.log('atoms'); 
        var newarray = [];
        try {
            for (var i = 0; i < array.length; i++) {
                newarray.push(String.fromCharCode(array[i]));
            }
        } catch (e) { }
    
        return newarray.join('');
    }

    makeConnection = (feedToken ,clientcode ) => {



        var firstTime_req =  {
            "actiontype": "subscribe",
            "feedtype": "order_feed",
            "jwttoken": this.state.jwtToken,
            "clientcode": this.state.clientcode ,
            "apikey": API_KEY
       }

       
        console.log("1st Request :- " + JSON.stringify( firstTime_req));
        wsClint.send(JSON.stringify( firstTime_req));
    }

    updateSocketWatch = (feedToken,clientcode ) => {
      
        var channel = this.state.symbolList.map(element => {
             return 'nse_cm|'+ element.token; 
        });

        channel = channel.join('&'); 
        var sbin =  {
            "task":"mw",
            "channel": channel,
            "token":this.state.feedToken,
            "user":this.state.clientcode,
            "acctid":this.state.clientcode
        }
        wsClint.send( JSON.stringify( sbin)); 
    }

    
    componentDidMount() {

        var tokens = JSON.parse(localStorage.getItem("userTokens")); 
        var feedToken =   tokens &&  tokens.feedToken;
        var jwtToken =   tokens &&  tokens.jwtToken;

        var userProfile = JSON.parse(localStorage.getItem("userProfile")); 
        var clientcode =   userProfile &&  userProfile.clientcode;
        this.setState({ feedToken : feedToken,clientcode : clientcode , jwtToken: jwtToken });

            
        wsClint.onopen  = (res) => {


            var firstTime_req =  {
                "jwttoken": this.state.jwtToken,
                "clientcode": this.state.clientcode ,
                "apikey": API_KEY
           }
    
           
            console.log("1st Request :- " + JSON.stringify( firstTime_req));
            wsClint.send(firstTime_req);

            // this.makeConnection();
            // console.log('connected');
            // this.updateSocketWatch();
                
             setTimeout(function(){
               this.makeConnection(feedToken ,clientcode);
             }, 1000);
        }

        wsClint.onmessage = (message) => {
            
            
            var decoded = window.atob(message.data);
            var data = this.decodeWebsocketData(pako.inflate(decoded));

            this.setState({ positionList : JSON.parse(data) });

        //    this.state.symbolList.forEach(element => {

        //         var foundLive = liveData.filter(row => row.tk  == element.token);
        //     // console.log("foundLive", foundLive);
        //         if(foundLive.length>0 &&  foundLive[0].ltp)
        //             this.setState({ [element.symbol+'ltp'] : foundLive.length>0 &&  foundLive[0].ltp})
        //         if(foundLive.length>0 &&  foundLive[0].cng)
        //             this.setState({ [element.symbol+'nc'] : foundLive.length>0 &&  foundLive[0].nc})
               
               
        //      });
        
        }

        wsClint.onerror = (e) => {
            console.log("socket error", e); 
        }

        setInterval(() => {

            var heartbeatReq =  {
                "actiontype": "heartbeat",
                "feedtype": "order_feed",
                "jwttoken": this.state.feedToken ,
                "clientcode": this.state.clientcode ,
                "apikey": API_KEY
            }
    
            console.log("heartbeatReq : " + heartbeatReq);
            wsClint.send(heartbeatReq);
          //  this.makeConnection(feedToken ,clientcode );
        }, 59000);


        var list = localStorage.getItem('watchList');
        if(!list){
            localStorage.setItem('watchList', []);
        }
      
    }

    placeOrder = (transactiontype) => {

        var data = {
            "variety":"NORMAL",
            "tradingsymbol": this.state.tradingsymbol,
            "symboltoken":this.state.symboltoken,
            "transactiontype":transactiontype, //BUY OR SELL
            "exchange":"NSE",
            "ordertype":   this.state.buyPrice  === 0 ? "MARKET" : "LIMIT", 
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
            if(data.status  && data.message === 'SUCCESS'){
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
            if(this.state.symbolList[index].symbol === name){
                    token =  this.state.symbolList[index].token; 
                   this.setState({ tradingsymbol : name, symboltoken : this.state.symbolList[index].token});
                    break; 
            }
        }  
        this.getHistory(token); 
    }

    placeSLMOrder = () => {

        var data = {
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
            "triggerprice" : this.state.stoploss,
            "variety" : "STOPLOSS"
        }

        AdminService.placeOrder(data).then(res => {
            let data = resolveResponse(res);
            console.log(data);   
            if(data.status  && data.message === 'SUCCESS'){
                localStorage.setItem('ifNotBought' ,  'false')
                this.setState({ orderid : data.data && data.data.orderid });
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
        console.log("values", values); 
        console.log("autoSearchTemp", autoSearchTemp); 
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
                list = JSON.parse( localStorage.getItem('watchList'));
                var found = list.filter(row => row.symbol  === values);
                if(found.length === 0){
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
        var index = list.findIndex(data => data.symbol === symbol)
        list.splice(index,1);
        localStorage.setItem('watchList',  JSON.stringify(list)); 
        this.setState({ symbolList : list });
    }

    getAveragePrice =(orderId) => {

       var  oderbookData = localStorage.getItem('oderbookData');
       var averageprice = 0; 
        for (let index = 0; index < oderbookData.length; index++) {
           if(oderbookData[index].orderid ===  'orderId'){
            averageprice =oderbookData[index].averageprice 
            this.setState({ averageprice : averageprice });
            break;
           }
        } 
        return averageprice;
    }


    render() {
      

        return(
            <React.Fragment>
                 <PostLoginNavBar/>
                
               
                 <Grid spacing={1}  direction="row" alignItems="center" container>

                    <Grid item xs={10} sm={12}> 
                    <Paper style={{padding:"10px", overflow:"auto"}} >


                    <Table  size="small"   aria-label="sticky table" >
                        <TableHead  style={{width:"",whiteSpace: "nowrap"}} variant="head">
                            <TableRow   variant="head" style={{fontWeight: 'bold'}}>

                                {/* <TableCell className="TableHeadFormat" align="center">Instrument</TableCell> */}
                                
                                <TableCell className="TableHeadFormat" align="center">Trading symbol</TableCell>

                                <TableCell className="TableHeadFormat" align="center">Order Type</TableCell>
                                <TableCell className="TableHeadFormat" align="center">Product type</TableCell>
                                <TableCell className="TableHeadFormat" align="center">Transaction type</TableCell>
                              
                                <TableCell  className="TableHeadFormat" align="center">Quantity</TableCell>
                                <TableCell  className="TableHeadFormat" align="center">Average Price</TableCell>

                                <TableCell className="TableHeadFormat" align="center">Status </TableCell>
                                <TableCell  className="TableHeadFormat"   align="center">Order Status</TableCell>
                                <TableCell  className="TableHeadFormat"   align="center">Exec Time</TableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody style={{width:"",whiteSpace: "nowrap"}}>

                            {/* {
                                "variety": null,
                                "ordertype": "LIMIT",
                                "producttype": "INTRADAY",
                                "duration": "DAY",
                                "price": "194",
                                "triggerprice": "0",
                                "quantity": "1",
                                "disclosedquantity": "0",
                                "squareoff": "0",
                                "stoploss": "0",
                                "trailingstoploss": "0",
                                "tradingsymbol": "SBIN-EQ",
                                "transactiontype": "BUY",
                                "exchange": "NSE",
                                "symboltoken": null,
                                "instrumenttype": "",
                                "strikeprice": "-1",
                                "optiontype": "",
                                "expirydate": "",
                                "lotsize": "1",
                                "cancelsize": "1",
                                "averageprice": "0",
                                "filledshares": "0",
                                "unfilledshares": "1",
                                "orderid": "201020000000080",
                                "text": "",
                                "status": "cancelled",
                                "orderstatus": "cancelled",
                                "updatetime": "20-Oct-2020   13:10:59",
                                "exchtime": "20-Oct-2020   13:10:59",
                                "exchorderupdatetime": "20-Oct-2020   13:10:59",
                                "fillid": null,
                                "filltime": null
                            } */}

                            {this.state.positionList ? this.state.positionList.map((row, i) => (
                                <TableRow key={i} >


                                    <TableCell align="center">{row.tradingsymbol}</TableCell>
                                    <TableCell align="center">{row.ordertype}</TableCell>
                                    <TableCell align="center">{row.producttype}</TableCell>
                                    <TableCell align="center">{row.transactiontype}</TableCell>
                                    
                                    <TableCell align="center">{row.quantity}</TableCell>
                                    <TableCell align="center">{row.averageprice}</TableCell>
                                    <TableCell align="center">{row.status}</TableCell>
                                    <TableCell align="center">{row.orderstatus}</TableCell>
                                    <TableCell align="center">{row.exchtime}</TableCell>
                                
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


// const styles ={
//     formContainer : {
//         display: 'flex',
//         flexFlow: 'row wrap'
//     },

    

// };

export default Home;