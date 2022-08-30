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
            symbolList :  [
                {
                    token: "26009",
                    symbol: "Nifty 50",
                    name: "Nifty 50",
                },
                {
                    token: "26000",
                    symbol: "Nifty Bank",
                    name: "Nifty Bank",
                }
            ], 
            
        
        };
        this.myCallback = this.myCallback.bind(this);
    }

    makeConnection = (wsClint) => {
        var firstTime_req = '{"task":"cn","channel":"NONLM","token":"' + this.state.feedToken + '","user": "' + this.state.clientcode + '","acctid":"' + this.state.clientcode + '"}';
        if(this.wsClint.readyState === this.wsClint.OPEN){
            wsClint.send(firstTime_req);
            this.updateSocketWatch(wsClint);
        }
    }
    decodeWebsocketData = (array) => {
        var newarray = [];
        try {
            for (var i = 0; i < array.length; i++) {
                newarray.push(String.fromCharCode(array[i]));
            }
        } catch (e) { }
        //  console.log(newarray.join(''))
        return newarray.join('');
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
     
    componentDidMount() {

        var tokens = JSON.parse(localStorage.getItem("userTokens"));
        var feedToken = tokens && tokens.feedToken;
        var userProfile = JSON.parse(localStorage.getItem("userProfile"));
        var clientcode = userProfile && userProfile.clientcode;
        this.setState({ feedToken: feedToken, clientcode: clientcode }, function () {
            this.wsClint = new w3cwebsocket('wss://omnefeeds.angelbroking.com/NestHtml5Mobile/socket/stream');
            this.updateSocketDetails(this.wsClint);
        });

        var list = localStorage.getItem('watchList');
        if(!list){
            localStorage.setItem('watchList', []);
        }
      
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

    updateSocketWatch = (wsClint) => {


        // var channel = this.state.symbolList.map(element => {
        //     return 'nse_cm|' + element.token;
        // });

        let channel = []; 
       this.state.symbolList.forEach((element, index) => {
            channel.push('nse_cm|' + element.token);
        });

        channel = channel.join('&');
      //  "channel": "nse_cm|Nifty 50&nse_cm|Nifty Bank&nse_cm|Nifty Auto&nse_cm|Nifty FMCG&nse_cm|Nifty IT&nse_cm|Nifty Media&nse_cm|Nifty Metal&nse_cm|Nifty Pharma&nse_cm|Nifty PSU Bank&nse_cm|Nifty Reality&nse_cm&nse_cm|Nifty Private Bank",

        var updateSocket = {
            "task": "sfi",
            "channel":   "nse_cm|Nifty 50&nse_cm|Nifty Bank",
            "token": this.state.feedToken,
            "user": this.state.clientcode,
            "acctid": this.state.clientcode
        }
      //  console.log("wsClint", wsClint)

        wsClint.send(JSON.stringify(updateSocket));
    }

    updateSocketDetails = (wsClint) => {
        wsClint.onopen = (res) => {
            this.makeConnection(wsClint);
            this.updateSocketWatch(wsClint);
        }
        wsClint.onmessage = (message) => {
            var decoded = window.atob(message.data);
            var data = this.decodeWebsocketData(pako.inflate(decoded));
            var liveData = JSON.parse(data);

            var symbolListArray = this.state.symbolList;
            this.state.symbolList && this.state.symbolList.forEach((element, index) => {
                var foundLive = liveData.filter(row => row.tk == element.name);
             //   console.log("live", JSON.stringify(foundLive))

                if (foundLive.length > 0 && foundLive[0].tvalue) {
                    symbolListArray[index].tvalue = foundLive[0].tvalue;
                    symbolListArray[index].cng = foundLive[0].cng;
                    symbolListArray[index].iv = foundLive[0].iv;
                    symbolListArray[index].tk = foundLive[0].tk;
                    symbolListArray[index].nc = foundLive[0].nc;   
                    if(foundLive[0].tk == 'Nifty Bank'){
                        this.props && this.props.getBankNiftyLiveLtp(foundLive[0])
                    }
                }

                
            });
          
            this.setState({ symbolList: symbolListArray }, ()=> {
              //  console.log('updated',  this.state.symbolList )
            });
        }

        wsClint.onerror = (e) => {
            console.log("socket error", e);
            this.makeConnection(this.wsClint);
        }

        setInterval(() => {
         //   console.log("this.wsClint", this.wsClint)

            if(this.wsClint.readyState != 1){
                this.makeConnection(this.wsClint);
            }

           if(this.wsClint.readyState === this.wsClint.OPEN){
            var _req = '{"task":"hb","channel":"","token":"' + this.state.feedToken + '","user": "' + this.state.clientcode + '","acctid":"' + this.state.clientcode + '"}';
            console.log("Request :- " + _req);
            wsClint.send(_req);
           }else{
            this.wsClint.close();
                this.wsClint = new w3cwebsocket('wss://omnefeeds.angelbroking.com/NestHtml5Mobile/socket/stream');
                this.updateSocketDetails(this.wsClint);
           }

        
            // if ( this.wsClint.readyState === 3 ) {
            //     this.wsClint.close();
            //     this.wsClint = new w3cwebsocket('wss://omnefeeds.angelbroking.com/NestHtml5Mobile/socket/stream');
            //     this.updateSocketDetails(this.wsClint);
            // }

        }, 60000);
    }


    render() {
      
        return(
            <React.Fragment>                
               
                 <Grid spacing={1}   alignItems="center" container>

                    <Grid item xs={10} sm={12}> 
                    <Paper style={{ overflow:"auto"}} >


                    <Table  size="small"   aria-label="sticky table" >
                        <TableHead  style={{width:"",whiteSpace: "nowrap"}} variant="head">
                            <TableRow   variant="head" style={{fontWeight: 'bold'}}>                                
                           
                                <TableCell className="TableHeadFormat" align="center">Index </TableCell>
                                <TableCell  className="TableHeadFormat"   align="center">Val</TableCell>
                                <TableCell  className="TableHeadFormat"   align="center">Change</TableCell>
                                <TableCell  className="TableHeadFormat"   align="center">Time</TableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody style={{width:"",whiteSpace: "nowrap"}}>
                            {this.state.symbolList ? this.state.symbolList.map((row, i) => (
                                <TableRow style={{background : row.nc > 0 ? "chartreuse" : "coral"}} key={i} >

                                    <TableCell align="center">{row.name}</TableCell>
                                    <TableCell align="center">{row.iv}({row.nc}%)</TableCell>
                                    <TableCell align="center">{row.cng}</TableCell>
                                    <TableCell align="center">{row.tvalue}</TableCell>
                                
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