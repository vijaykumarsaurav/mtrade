import React from 'react';
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import AdminService from "../service/AdminService";
import Grid from '@material-ui/core/Grid';
import PostLoginNavBar from "../PostLoginNavbar";
import {resolveResponse} from "../../utils/ResponseHandler";
import Paper from '@material-ui/core/Paper';
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import * as moment from 'moment';
import Autocomplete from '@material-ui/lab/Autocomplete';

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

//import { w3cwebsocket } from 'websocket'; 
//import pako from 'pako';
import DeleteIcon from '@material-ui/icons/Delete';

//const wsClint =  new w3cwebsocket('wss://omnefeeds.angelbroking.com/NestHtml5Mobile/socket/stream'); 

class Home extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
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
            symbolList : localStorage.getItem('watchList') && JSON.parse(localStorage.getItem('watchList'))
        
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
        var newarray = [];
        try {
            for (var i = 0; i < array.length; i++) {
                newarray.push(String.fromCharCode(array[i]));
            }
        } catch (e) { }
    
        return newarray.join('');
    }

    makeConnection = (feedToken ,clientcode ) => {

     //   var firstTime_req = '{"task":"cn","channel":"NONLM","token":"' + this.state.feedToken + '","user": "' + this.state.clientcode + '","acctid":"' + this.state.clientcode + '"}';
       // console.log("1st Request :- " + firstTime_req);
      //  wsClint.send(firstTime_req);
    }

    updateSocketWatch = (feedToken,clientcode ) => {
      
        // var channel = this.state.symbolList.map(element => {
        //      return 'nse_cm|'+ element.token; 
        // });

      //  channel = channel.join('&'); 
        // var sbin =  {
        //     "task":"mw",
        //     "channel": channel,
        //     "token":this.state.feedToken,
        //     "user":this.state.clientcode,
        //     "acctid":this.state.clientcode
        // }
     //   wsClint.send( JSON.stringify( sbin)); 
    }

    
    componentDidMount() {

        var tokens = JSON.parse(localStorage.getItem("userTokens")); 
        var feedToken =   tokens &&  tokens.feedToken;

        var userProfile = JSON.parse(localStorage.getItem("userProfile")); 
        var clientcode =   userProfile &&  userProfile.clientcode;
        this.setState({ feedToken : feedToken,clientcode : clientcode  });

            
       // wsClint.onopen  = (res) => {

             //this.makeConnection();
            // this.updateSocketWatch();
                
            //  setTimeout(function(){
            //    this.updateSocketWatch(feedToken ,clientcode);
            //  }, 800);
      //  }

        // wsClint.onmessage = (message) => {
            
            
        //     var decoded = window.atob(message.data);
        //     var data = this.decodeWebsocketData(pako.inflate(decoded));
        //     var liveData =  JSON.parse(data); 

        //    this.state.symbolList.forEach(element => {

        //         var foundLive = liveData.filter(row => row.tk  == element.token);
        //     // console.log("foundLive", foundLive);
        //         if(foundLive.length>0 &&  foundLive[0].ltp)
        //             this.setState({ [element.symbol+'ltp'] : foundLive.length>0 &&  foundLive[0].ltp})
        //         if(foundLive.length>0 &&  foundLive[0].cng)
        //             this.setState({ [element.symbol+'nc'] : foundLive.length>0 &&  foundLive[0].nc})
        //         });
        
        // }

        // wsClint.onerror = (e) => {
        //     console.log("socket error", e); 
        // }

        // setInterval(() => {
        //     var _req = '{"task":"hb","channel":"","token":"' + feedToken + '","user": "' + clientcode + '","acctid":"' + clientcode + '"}';
        //     console.log("Request :- " + _req);
        //     wsClint.send(_req);
        //   //  this.makeConnection(feedToken ,clientcode );
        // }, 59000);


        var list = localStorage.getItem('watchList');
        if(!list){
            localStorage.setItem('watchList', []);
        }

        // setInterval(() => {
        //     AdminService.getAutoScanStock().then(res => {
        //         let data = resolveResponse(res);
        //         console.log(data);  
        //         if(data.status  && data.message == 'SUCCESS'){ 
        //         //    this.setState({ orderid : data.data && data.data.orderid });  
        //         }
        //     })    
        // }, 2000);
      
    }

    placeOrder = (transactiontype) => {
   
        var data = {
            "variety":"NORMAL",
            "tradingsymbol": this.state.tradingsymbol,
            "symboltoken": this.state.symboltoken,
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
         //   console.log(data);   
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
       //     console.log(data);   
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
            "interval": "ONE_MINUTE", //ONE_DAY FIVE_MINUTE 
            "fromdate": moment(startdate).format(format1) , 
            "todate": moment(new Date()).format(format1) //moment(this.state.endDate).format(format1) /
       }
       
        AdminService.getHistoryData(data).then(res => {
             let data = resolveResponse(res,'noPop' );
          //    console.log(data); 
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
      //  console.log("values", values); 
     //   console.log("autoSearchTemp", autoSearchTemp); 
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
        // const dateParam = {
        //     myCallback: this.myCallback,
        //     startDate: '',
        //     endDate:'', 
        //     firstLavel : "Start Date and Time", 
        //     secondLavel : "End Date and Time"
        //   }

        return(
            <React.Fragment>
                 <PostLoginNavBar/>
                
                <Grid direction="row" container>
               
                     <Grid item xs={3} sm={3}  style={{}}> 
            

                        <Autocomplete
                            freeSolo
                            id="free-solo-2-demo"
                            disableClearable
                            onChange={this.onSelectItem}
                            //+ ' '+  option.exch_seg
                            options={this.state.autoSearchList.length> 0 ?  this.state.autoSearchList.map((option) => 
                            option.symbol
                            ) : [] }
                            renderInput={(params) => (
                            <TextField
                                onChange={this.onChange}
                                {...params}
                                label="Search Symbol"
                                margin="normal"
                                variant="outlined"
                                name="search"
                                value={this.state.search}
                                InputProps={{ ...params.InputProps, type: 'search' }}
                            />
                            )}
                        />
                        {/* <Dialogbox /> */}

                        {/* <TextField fullWidth  type="text" id="search"  value={this.state.search}  name="search" /> */}

                            {this.state.symbolList && this.state.symbolList ? this.state.symbolList.map(row => (
                               <>
                               <ListItem button >
                                
                                <ListItemText style={{color:this.state[row.symbol+'nc'] > 0 ? 'green' : "red"  }}  onClick={() => this.LoadSymbolDetails(row.symbol)} primary={row.name} /> {this.state[row.symbol+'ltp']} ({this.state[row.symbol+'nc']}%) <DeleteIcon  onClick={() => this.deleteItemWatchlist(row.symbol)} />
                            </ListItem>
                           
                            </>
                            )):''}
                </Grid>

                <Grid item xs={9} sm={9}> 

                    <Grid  direction="row" alignItems="center" container>

                        <Grid item xs={10} sm={5}> 
                            <Typography variant="h5"  >
                            {this.state.tradingsymbol} : {this.state.InstrumentLTP ? this.state.InstrumentLTP.ltp : "" }   {this.state.sbinLtp}
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


                                {this.state.InstrumentHistroy && this.state.InstrumentHistroy ? this.state.InstrumentHistroy.map((row, i) => (
                                    <TableRow key={i} >

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