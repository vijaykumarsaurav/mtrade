import React from "react";
import AdminService from "../service/AdminService";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import PostLoginNavBar from "../PostLoginNavbar";
import {resolveResponse} from "../../utils/ResponseHandler";
import Spinner from "react-spinner-material";
import TextField from "@material-ui/core/TextField";
import pako from 'pako';
import * as moment from 'moment';
import CommonOrderMethod from "../../utils/CommonMethods";
import { w3cwebsocket } from 'websocket';

class OrderBook extends React.Component{

    constructor(props) {
        super(props);

        this.state = {
            oderbookData:[],
            listofzones:[],
            selectedZone:[],
            niftyLtp: {},
            zone:'',
            selectAllzone:'Select All',
            triggerprice :0,
            price:0,
            lotsize:0,

            firstTimeFlag: true,
            selectedStrike:[],
            symbolList: [],
            trackSLPrice: localStorage.getItem('trackSLPrice') && JSON.parse(localStorage.getItem('trackSLPrice')) || [], 

        }
    }

    getTodayOrder = () => {

      //  console.log('this.state.trackSLPrice', this.state.trackSLPrice);

        let trackSLPrice = localStorage.getItem('trackSLPrice') && JSON.parse(localStorage.getItem('trackSLPrice')) || []; 
        AdminService.retrieveOrderBook()
        .then((res) => {
            let data = resolveResponse(res, "noPop");
            if(data && data.data){
                var orderlist = data.data; 
                  orderlist.sort(function(a,b){
                    return new Date(b.updatetime) - new Date(a.updatetime);
                  });

                  
                  orderlist.forEach(element => {
                        let trakingRecord = trackSLPrice.filter((item)=> item.tradingsymbol == element.tradingsymbol); 
                        
                        if(trakingRecord.length > 0 && element.tradingsymbol == trakingRecord[0].tradingsymbol){
                           this.setState({ ['priceTarget_' + element.tradingsymbol] :  trakingRecord[0].priceTarget })  
                           this.setState({ ['priceStopLoss_' + element.tradingsymbol] :  trakingRecord[0].priceStopLoss })  
                        }
                  });
                  

           //     orderlist.sort((a, b) => a.status - b.status); 
                this.setState({oderbookData: orderlist});
                localStorage.setItem('oderbookData', JSON.stringify( orderlist ));

          
            }
        });
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

    updateSocketWatch = (wsClint) => {

        var channel = this.state.symbolList.map(element => {
            return 'nse_cm|' + element.token;
        });
        channel = channel.join('&');
        var updateSocket = {
            "task": "mw",
            "channel": channel,
            "token": this.state.feedToken,
            "user": this.state.clientcode,
            "acctid": this.state.clientcode
        }
      //  console.log("wsClint", wsClint)

        wsClint.send(JSON.stringify(updateSocket));
    }

    makeConnection = (wsClint) => {
        var firstTime_req = '{"task":"cn","channel":"NONLM","token":"' + this.state.feedToken + '","user": "' + this.state.clientcode + '","acctid":"' + this.state.clientcode + '"}';
        wsClint.send(firstTime_req);
        this.updateSocketWatch(wsClint);
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
                var foundLive = liveData.filter(row => row.tk == element.token);
                if (foundLive.length > 0 && foundLive[0].ltp && foundLive[0].nc) {

                    symbolListArray[index].ltp = foundLive[0].ltp;
                    symbolListArray[index].pChange = foundLive[0].nc;
                    symbolListArray[index].totalBuyQuantity = foundLive[0].tbq;
                    symbolListArray[index].totalSellQuantity = foundLive[0].tsq;
                    symbolListArray[index].totalTradedVolume = foundLive[0].v;
                    symbolListArray[index].averagePrice = foundLive[0].ap;
                    symbolListArray[index].lowPrice = foundLive[0].lo;
                    symbolListArray[index].highPrice = foundLive[0].h;
                    symbolListArray[index].openPrice = foundLive[0].op;
                    symbolListArray[index].volume = foundLive[0].v;

                    symbolListArray[index].bestbuyquantity = foundLive[0].bq;
                    symbolListArray[index].bestbuyprice = foundLive[0].bp;
                    symbolListArray[index].bestsellquantity = foundLive[0].bs;
                    symbolListArray[index].bestsellprice = foundLive[0].sp;
                    symbolListArray[index].ltt = moment(foundLive[0].ltt,'YYYY-MM-DD HH:mm:ss').toString();

                    // symbolListArray[index].upperCircuitLimit = foundLive[0].ucl;
                    // symbolListArray[index].lowerCircuitLimit = foundLive[0].lcl;

                    symbolListArray[index].buytosellTime = (foundLive[0].tbq / foundLive[0].tsq).toFixed(2);
                    symbolListArray[index].selltobuyTime = (foundLive[0].tsq / foundLive[0].tbq).toFixed(2);

                }
            });


            let shortBy = this.state.sortedType;
            symbolListArray && symbolListArray.sort(function (a, b) {
                return b[shortBy] - a[shortBy];
            });
            this.setState({ symbolList: symbolListArray }, ()=> {
              //  console.log('updated',  this.state.symbolList )
            });
        }

        wsClint.onerror = (e) => {
            console.log("socket error", e);
           // this.makeConnection(this.wsClint);
        }

        setInterval(() => {
            console.log("this.wsClint", this.wsClint)

            if(this.wsClint.readyState != 1){
                this.makeConnection(this.wsClint);
            }

            var _req = '{"task":"hb","channel":"","token":"' + this.state.feedToken + '","user": "' + this.state.clientcode + '","acctid":"' + this.state.clientcode + '"}';
            console.log("Request :- " + _req);
            wsClint.send(_req);
        }, 59000);
    }

    componentDidMount() {
        

        setInterval(() => {
            this.getNiftyLTP();
        }, 1000);
       

       // let items = [{"token":"42494","symbol":"NIFTY05MAY2216400PE","name":"NIFTY","expiry":"05MAY2022","strike":"1640000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42493","symbol":"NIFTY05MAY2216400CE","name":"NIFTY","expiry":"05MAY2022","strike":"1640000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42498","symbol":"NIFTY05MAY2216450PE","name":"NIFTY","expiry":"05MAY2022","strike":"1645000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42495","symbol":"NIFTY05MAY2216450CE","name":"NIFTY","expiry":"05MAY2022","strike":"1645000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42500","symbol":"NIFTY05MAY2216500PE","name":"NIFTY","expiry":"05MAY2022","strike":"1650000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42499","symbol":"NIFTY05MAY2216500CE","name":"NIFTY","expiry":"05MAY2022","strike":"1650000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42501","symbol":"NIFTY05MAY2216550CE","name":"NIFTY","expiry":"05MAY2022","strike":"1655000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42502","symbol":"NIFTY05MAY2216550PE","name":"NIFTY","expiry":"05MAY2022","strike":"1655000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42504","symbol":"NIFTY05MAY2216600PE","name":"NIFTY","expiry":"05MAY2022","strike":"1660000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42503","symbol":"NIFTY05MAY2216600CE","name":"NIFTY","expiry":"05MAY2022","strike":"1660000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42506","symbol":"NIFTY05MAY2216650PE","name":"NIFTY","expiry":"05MAY2022","strike":"1665000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42505","symbol":"NIFTY05MAY2216650CE","name":"NIFTY","expiry":"05MAY2022","strike":"1665000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42507","symbol":"NIFTY05MAY2216700CE","name":"NIFTY","expiry":"05MAY2022","strike":"1670000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42508","symbol":"NIFTY05MAY2216700PE","name":"NIFTY","expiry":"05MAY2022","strike":"1670000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42510","symbol":"NIFTY05MAY2216750PE","name":"NIFTY","expiry":"05MAY2022","strike":"1675000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42509","symbol":"NIFTY05MAY2216750CE","name":"NIFTY","expiry":"05MAY2022","strike":"1675000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42513","symbol":"NIFTY05MAY2216800PE","name":"NIFTY","expiry":"05MAY2022","strike":"1680000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42511","symbol":"NIFTY05MAY2216800CE","name":"NIFTY","expiry":"05MAY2022","strike":"1680000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42518","symbol":"NIFTY05MAY2216850PE","name":"NIFTY","expiry":"05MAY2022","strike":"1685000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42515","symbol":"NIFTY05MAY2216850CE","name":"NIFTY","expiry":"05MAY2022","strike":"1685000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42519","symbol":"NIFTY05MAY2216900CE","name":"NIFTY","expiry":"05MAY2022","strike":"1690000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42521","symbol":"NIFTY05MAY2216900PE","name":"NIFTY","expiry":"05MAY2022","strike":"1690000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42524","symbol":"NIFTY05MAY2216950CE","name":"NIFTY","expiry":"05MAY2022","strike":"1695000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42527","symbol":"NIFTY05MAY2216950PE","name":"NIFTY","expiry":"05MAY2022","strike":"1695000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42529","symbol":"NIFTY05MAY2217000CE","name":"NIFTY","expiry":"05MAY2022","strike":"1700000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42530","symbol":"NIFTY05MAY2217000PE","name":"NIFTY","expiry":"05MAY2022","strike":"1700000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42532","symbol":"NIFTY05MAY2217050CE","name":"NIFTY","expiry":"05MAY2022","strike":"1705000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42533","symbol":"NIFTY05MAY2217050PE","name":"NIFTY","expiry":"05MAY2022","strike":"1705000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42534","symbol":"NIFTY05MAY2217100CE","name":"NIFTY","expiry":"05MAY2022","strike":"1710000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42535","symbol":"NIFTY05MAY2217100PE","name":"NIFTY","expiry":"05MAY2022","strike":"1710000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42543","symbol":"NIFTY05MAY2217150PE","name":"NIFTY","expiry":"05MAY2022","strike":"1715000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42536","symbol":"NIFTY05MAY2217150CE","name":"NIFTY","expiry":"05MAY2022","strike":"1715000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42550","symbol":"NIFTY05MAY2217200PE","name":"NIFTY","expiry":"05MAY2022","strike":"1720000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42544","symbol":"NIFTY05MAY2217200CE","name":"NIFTY","expiry":"05MAY2022","strike":"1720000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42558","symbol":"NIFTY05MAY2217250CE","name":"NIFTY","expiry":"05MAY2022","strike":"1725000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42559","symbol":"NIFTY05MAY2217250PE","name":"NIFTY","expiry":"05MAY2022","strike":"1725000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42564","symbol":"NIFTY05MAY2217300PE","name":"NIFTY","expiry":"05MAY2022","strike":"1730000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42563","symbol":"NIFTY05MAY2217300CE","name":"NIFTY","expiry":"05MAY2022","strike":"1730000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42570","symbol":"NIFTY05MAY2217350PE","name":"NIFTY","expiry":"05MAY2022","strike":"1735000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42567","symbol":"NIFTY05MAY2217350CE","name":"NIFTY","expiry":"05MAY2022","strike":"1735000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42572","symbol":"NIFTY05MAY2217400PE","name":"NIFTY","expiry":"05MAY2022","strike":"1740000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42571","symbol":"NIFTY05MAY2217400CE","name":"NIFTY","expiry":"05MAY2022","strike":"1740000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42574","symbol":"NIFTY05MAY2217450PE","name":"NIFTY","expiry":"05MAY2022","strike":"1745000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42573","symbol":"NIFTY05MAY2217450CE","name":"NIFTY","expiry":"05MAY2022","strike":"1745000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42576","symbol":"NIFTY05MAY2217500PE","name":"NIFTY","expiry":"05MAY2022","strike":"1750000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"},{"token":"42575","symbol":"NIFTY05MAY2217500CE","name":"NIFTY","expiry":"05MAY2022","strike":"1750000.000000","lotsize":"50","instrumenttype":"OPTIDX","exch_seg":"NFO","tick_size":"5.000000"}]; 

        var tokens = JSON.parse(localStorage.getItem("userTokens"));
        var feedToken = tokens && tokens.feedToken;
        var userProfile = JSON.parse(localStorage.getItem("userProfile"));
        var clientcode = userProfile && userProfile.clientcode;
        this.setState({ feedToken: feedToken, clientcode: clientcode }, function () {
            this.wsClint = new w3cwebsocket('wss://omnefeeds.angelbroking.com/NestHtml5Mobile/socket/stream');
        //    this.updateSocketDetails(this.wsClint);
        });


        setInterval(() => {
            this.updateLTP();
        }, 1000);
       
        setInterval(() => {
            this.selectOnlyLtp150To170();
        }, 60000 * 2);
      //  this.getTodayOrder();
    }

    getNiftyLTP = () => {
        var data = {
            "exchange": "NSE",
            "tradingsymbol": "NIFTY",
            "symboltoken": "26000",
        }
        AdminService.getLTP(data).then(res => {
            let data = resolveResponse(res, 'noPop');
            var LtpData = data && data.data;
            //console.log(LtpData);
            if (LtpData && LtpData.ltp) {
                let per = (LtpData.ltp - LtpData.close) * 100 / LtpData.close;                 
                this.setState({ niftyLtp: { ltp: LtpData.ltp, per : per.toFixed(2)  }}); 

                if(this.state.firstTimeFlag){ 
                    let lowerLevel = LtpData.ltp - LtpData.ltp * 3/100; 
                    let upperLevel = LtpData.ltp + LtpData.ltp * 3/100; 

                    let roundLower = lowerLevel - lowerLevel % 100;
                    let roundUpper = upperLevel + upperLevel % 100;
    
                    for (let index = roundLower; index <= roundUpper; index+=50) {
                      //  console.log(LtpData.ltp, lowerLevel, upperLevel, "strike",  index);
                        this.setState({ selectedStrike: [...this.state.selectedStrike, index]});
                    }
                    this.getToketForStrike(); 
                    this.setState({firstTimeFlag : false}); 
                }

              }
            
            let trackSLPrice = localStorage.getItem('trackSLPrice') ? JSON.parse( localStorage.getItem('trackSLPrice')) : []; 
        })
    }


    getToketForStrike =() => {
     console.log(this.state.selectedStrike); 
     
     AdminService.getAll145Tokens(this.state.selectedStrike).then(res => {
        
        this.setState({rowSymbolList : res.data },  () => {
           // this.makeConnection(this.wsClint); 
            this.selectOnlyLtp150To170();
        })
     
        //   this.setState({stockList:  res.data}); 
    })
     
    }

    selectOnlyLtp150To170 = async()=> {
        this.setState({  symbolList: []})
        console.log("refresh",this.state.symbolList )

        if(this.state.rowSymbolList) {
            for (let index = 0; index < this.state.rowSymbolList.length; index++) {
                const element = this.state.rowSymbolList[index];
                var data = { "exchange": element.exch_seg, "tradingsymbol": element.symbol, "symboltoken": element.token };
                AdminService.getLTP(data).then(res => {
                    let data = resolveResponse(res, 'noPop');
                    var LtpData = data && data.data;
                    //console.log(LtpData);
                    if (LtpData && LtpData.ltp) {
                        element.ltp = LtpData.ltp;
                        element.perChange = ((LtpData.ltp - LtpData.close) * 100 / LtpData.close).toFixed(2);
                    }
    
                    if (LtpData && LtpData.ltp > 150 && LtpData.ltp < 185) {
                        this.setState({ symbolList: [...this.state.symbolList, element]});
                    }
                })
        }
            await new Promise(r => setTimeout(r, 100));
        }

        
    }

    updateLTP = async () => {

        for (let index = 0; index < this.state.symbolList.length; index++) {
            const element = this.state.symbolList[index];
            var data = { "exchange": element.exch_seg, "tradingsymbol": element.symbol, "symboltoken": element.token };
            AdminService.getLTP(data).then(res => {
                let data = resolveResponse(res, 'noPop');
                var LtpData = data && data.data;
                if (LtpData && LtpData.ltp) {
                    element.ltp = LtpData.ltp;
                    element.perChange = ((LtpData.ltp - LtpData.close) * 100 / LtpData.close).toFixed(2);


                    this.updateBOPerformance(element, LtpData); 
                }
            })

            await new Promise(r => setTimeout(r, 100));
        }

    }

    updateBOPerformance = (element, LtpData) => {
        let Track145 = localStorage.getItem("Track145") && JSON.parse(localStorage.getItem("Track145")) || [];
        let found = Track145.filter((item)=> item.symbol == element.symbol); 
        const objIndex = Track145.findIndex(obj => obj.symbol === element.symbol);

        if(LtpData.ltp>185){
         
            if(!found.length){
                element.entry = LtpData.ltp; 
                element.upsideLtp = LtpData.ltp;
                element.downsideLtp = LtpData.ltp;
                Track145.push(element); 
                localStorage.setItem("Track145", JSON.stringify(Track145) ); 
            }else{ 
                if(LtpData.ltp  > found[0].upsideLtp){
                    const updatedObj = { ...Track145[objIndex], upsideLtp: LtpData.ltp, returnPer: (LtpData.ltp - found[0].entry) * 100 / found[0].entry};
                    const updatedList = [
                        ...Track145.slice(0, objIndex),
                        updatedObj,
                        ...Track145.slice(objIndex + 1),
                        ];
                    console.log("updatedObj",  updatedObj)
                    localStorage.setItem("Track145", JSON.stringify(updatedList) ); 
                }
            }
        }else if(found.length && LtpData.ltp <  found[0].downsideLtp){
            const updatedObj = { ...Track145[objIndex], downsideLtp: LtpData.ltp};
            const updatedList = [
                ...Track145.slice(0, objIndex),
                updatedObj,
                ...Track145.slice(objIndex + 1),
                ];
            localStorage.setItem("Track145", JSON.stringify(updatedList) ); 
        }

    }
   
    cancelOrderOfSame = (orderId,variety) =>  {
       
        var data = {
            "variety":variety,
            "orderid":orderId,
        }
        AdminService.cancelOrder(data).then(res => {
            let data = resolveResponse(res);
            if(data.status  && data.message === 'SUCCESS'){
              //  console.log("cancel order", data);   
                this.getTodayOrder();
               // this.setState({ orderid : data.data && data.data.orderid });
            }
        })
       
    }




    modifyOrder = (row, trailingstoploss) => {


        var data = {
            "variety" :row.variety,  // "STOPLOSS",
            "orderid": row.orderid,
            "ordertype": this.state.price !== 0 ? "STOPLOSS_LIMIT" : "STOPLOSS_MARKET",
            "producttype":  row.producttype, //"DELIVERY",
            "duration": row.duration,
            "price":  this.state.price,
            "triggerprice": trailingstoploss || this.state.triggerprice,
            "quantity":row.quantity,
            "tradingsymbol": row.tradingsymbol,
            "symboltoken": row.symboltoken,
            "exchange": row.exchange
            }
        AdminService.modifyOrder(data).then(res => {
            let data = resolveResponse(res);
           // console.log(data);   
            if(data.status  && data.message === 'SUCCESS'){
               // localStorage.setItem('ifNotBought' ,  'false')
               this.setState({triggerprice : 0}); 
               this.getTodayOrder();
            }
        })
    }

    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value.trim() });
    }

    onChangePriceStopLoss = (e) => {
        this.setState({ [e.target.name]: e.target.value.trim() });
        let tradingsymbol = e.target.name.split('_')[1]; 
        let trackSLPrice = localStorage.getItem('trackSLPrice') && JSON.parse(localStorage.getItem('trackSLPrice')) || []; 
        let isfound = false; 
        for (let index = 0; index < trackSLPrice.length; index++) {
            const element = trackSLPrice[index];
            if(element.tradingsymbol === tradingsymbol){
                element.priceStopLoss = e.target.value.trim(); 
                isfound = true; 
                break;
            }
        }
        if(!isfound){
              trackSLPrice.push({
                priceStopLoss :  e.target.value.trim(), 
                tradingsymbol : tradingsymbol, 
                optiontype : tradingsymbol.substr(tradingsymbol.length-2,tradingsymbol.length-1),
                name : tradingsymbol.includes('BANKNIFTY') ? 'BANKNIFTY' : "NIFTY"
              }); 
        }
        
    //    console.log("slprice tradingsymbol", trackSLPrice , tradingsymbol, isfound)
        localStorage.setItem('trackSLPrice', JSON.stringify(trackSLPrice));
    }

    onChangePriceTarget = (e) => {
        this.setState({ [e.target.name]: e.target.value.trim() });
        let tradingsymbol = e.target.name.split('_')[1]; 
        let trackSLPrice = localStorage.getItem('trackSLPrice') && JSON.parse(localStorage.getItem('trackSLPrice')) || []; 
        let isfound = false; 
        for (let index = 0; index < trackSLPrice.length; index++) {
            const element = trackSLPrice[index];
            if(element.tradingsymbol === tradingsymbol){
                element.priceTarget = e.target.value.trim(); 
                isfound = true; 
                break;
            }
        }
        if(!isfound){
            trackSLPrice.push({
              priceStopLoss :  e.target.value.trim(), 
              tradingsymbol : tradingsymbol, 
              optiontype : tradingsymbol.substr(tradingsymbol.length-2,tradingsymbol.length-1),
              name : tradingsymbol.includes('BANKNIFTY') ? 'BANKNIFTY' : "NIFTY"
 
            }); 
      }
     //   console.log("trarget price update", trackSLPrice)
        localStorage.setItem('trackSLPrice', JSON.stringify(trackSLPrice));
    }


    render(){
        console.log('this.state.symbolList', this.state.symbolList);

        this.state.symbolList.sort(function (a, b) {
            return b.ltp - a.ltp;
        });

        let Track145 = localStorage.getItem("Track145") && JSON.parse(localStorage.getItem("Track145")) || []; 


      return(
        <React.Fragment>


            {window.location.hash !== "#/position" ?    <PostLoginNavBar/> : ""}
            
                
            <Grid direction="row" alignItems="center" container>
            <Grid item xs={12} sm={12} >
                     <Paper style={{padding:"10px"}} >

                     <Grid spacing={1}  direction="row" alignItems="center" container>
                                <Grid item xs={12} sm={6} >
                                    <Typography color="primary" gutterBottom>
                                    145 Strategy: Legs ({this.state.symbolList.length})  <span style={{color: this.state.niftyLtp.per > 0 ? 'green' : 'red'}}> Nifty { this.state.niftyLtp.ltp }  ({ this.state.niftyLtp.per }%) </span>
                                    </Typography> 
                                </Grid>
                                <Grid item xs={12} sm={6} >
                                    <Button id="orderRefresh"  type="number" variant="contained"  style={{float:"right"}} onClick={() => this.selectOnlyLtp150To170()}>Refresh</Button>    
                                </Grid>
                                
                </Grid>

                     <Table  size="small"  style={{width:"100%"}}  aria-label="sticky table" >
               
                        <TableHead style={{whiteSpace: "nowrap"}} variant="head">
                            <TableRow variant="head" >
                                <TableCell align="center"><b>Name</b></TableCell>
                                <TableCell align="center"><b>Option</b></TableCell>
                                <TableCell align="center"><b>Expiry</b></TableCell>

                                <TableCell align="center"><b>Ltp</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        
                            {this.state.symbolList.length ? this.state.symbolList.map((row, i)  => (
                                <TableRow hover key={i} >
                                    <TableCell style={{ width: '10%'}}  align="center">{row.name}</TableCell>
                                    <TableCell align="center">{row.symbol}</TableCell>
                                    <TableCell align="center">{row.expiry}</TableCell>

                                    <TableCell align="center">
                                        <span style={{color: row.perChange > 0 ? 'green' : 'red'}}> {row.ltp} ({ row.perChange }%) </span>
                                    </TableCell>

                                </TableRow>
                            )):<Spinner/>}
                        </TableBody>
                    </Table>
                    </Paper>    
                </Grid>
                 
               </Grid>   


                <Grid direction="row" alignItems="center" container>
                   <Grid item xs={12} sm={12} >
                     <Paper style={{padding:"10px"}} >
                     <Typography color="primary" gutterBottom> Performance</Typography> 

                     <Table  size="small"  style={{width:"100%"}}  aria-label="sticky table" >
               
                        <TableHead style={{whiteSpace: "nowrap"}} variant="head">
                            <TableRow variant="head" >
                                <TableCell align="center"><b>Name</b></TableCell>
                                <TableCell align="center"><b>Option</b></TableCell>
                                <TableCell align="center"><b>Expiry</b></TableCell>
                                <TableCell align="center"><b>Ltp</b></TableCell>
                                <TableCell align="center"><b>Entry</b></TableCell>

                                <TableCell align="center"><b>Upside Price</b></TableCell>
                                <TableCell align="center"><b>Return%</b></TableCell>
                                <TableCell align="center"><b>Downside Price</b></TableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody>
                        
                            {Track145.length ? Track145.map((row, i)  => (
                                <TableRow hover key={i} >
                                    <TableCell style={{ width: '10%'}}  align="center">{row.name}</TableCell>
                                    <TableCell align="center">{row.symbol}</TableCell>
                                    <TableCell align="center">{row.expiry}</TableCell>
                                    <TableCell align="center">
                                        <span style={{color: row.perChange > 0 ? 'green' : 'red'}}> {row.ltp} ({ row.perChange }%) </span>
                                    </TableCell>
                                    <TableCell align="center">{row.entry}</TableCell>

                                    <TableCell align="center">{row.upsideLtp}</TableCell>
                                    <TableCell align="center">{row.returnPer}</TableCell>
                                    <TableCell align="center">{row.downsideLtp}</TableCell>

                                </TableRow>
                            )):<Typography> Nothing crossed as of now</Typography> }
                        </TableBody>
                    </Table>
                    </Paper>    
                </Grid>
                 
               </Grid>   
           
            </React.Fragment> 
        )
    }
  
}

// const styles = {
//     tableStyle : {
//         display: 'flex',
//         justifyContent: 'center'
//     },
//     selectStyle:{
//         // minWidth: '100%',
//          marginBottom: '0px',
//           minWidth: 300,
//           maxWidth: 300,
//     }
// }

// const mapStateToProps=(state)=>{
//     return {packs:state.packs.packs.data};
// }

//export default connect(mapStateToProps,{setPackLoaded})(OrderBook);
export default OrderBook;