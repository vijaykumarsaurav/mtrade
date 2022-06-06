import { w3cwebsocket } from 'websocket';

const wsClint = new w3cwebsocket('wss://omnefeeds.angelbroking.com/NestHtml5Mobile/socket/stream');

makeConnection = () => {
    var firstTime_req = '{"task":"cn","channel":"NONLM","token":"' + this.state.feedToken + '","user": "' + this.state.clientcode + '","acctid":"' + this.state.clientcode + '"}';
    let status = wsClint.send(firstTime_req);

    if(status == 'connected')
    this.checkPriceLive(wsClint);
}

updateSocketWatch = (symbolList) => {

    var channel =  symbolList.map(element => {
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
    
   let status = wsClint.send(JSON.stringify(updateSocket));
   if(status === 'error'){
        makeConnection();
   }
}

checkPriceLive = (wsClint) => {
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

                let voldata = this.comparePreviousVolume(element.symbol, foundLive[0].v, foundLive[0].ltp, element.token,element.name ); 

                let highlow =  this.updateHighLow(element.name, foundLive[0].ltp, foundLive[0].v, element.token); 
                symbolListArray[index].high = highlow &&  highlow.high; 
                symbolListArray[index].low = highlow &&  highlow.low; 

                symbolListArray[index].highupdated = highlow &&  highlow.highupdated; 
                symbolListArray[index].lowupdated = highlow &&  highlow.lowupdated; 

                symbolListArray[index].volBreakoutCount = voldata.brokenCount; 
                symbolListArray[index].priceVolBreakout = voldata.priceVolBreakout; 
                symbolListArray[index].rsi = voldata.rsi; 

                console.log('high', element.high20Candle, 'ltp', foundLive[0].ltp, new Date().toLocaleTimeString());

               if(foundLive[0].ltp >  element.high20Candle){
                element.high20Candle = foundLive[0].ltp; 
                element.high20CandleFlag = true;  
                this.speckIt(element.symbol + ' higher '); 
                document.title = element.symbol + ' higher ';
               }else{
                element.high20CandleFlag = false;
               }

                if (foundLive[0].tbq / foundLive[0].tsq > 2) {
                    symbolListArray[index].highlightbuy = true;
                    this.takeAction(element.symbol, ' buying')
                } else {
                    symbolListArray[index].highlightbuy = false;
                }

                if (foundLive[0].tsq / foundLive[0].tbq > 2) {
                    symbolListArray[index].highlightsell = true;
                    this.takeAction(element.symbol, ' selling')

                } else {
                    symbolListArray[index].highlightsell = false;
                }

                if (this.state.token == element.token) {
                    this.setState({ livePrice: foundLive[0].ltp, livePChange: foundLive[0].nc })
                }

    

                if(voldata.priceVolBreakout && foundLive[0].ltp >= 200 && foundLive[0].ltp <= 10000 && new Date().getHours() > 10 && new Date().getHours() < 15){
                    if(!localStorage.getItem(symbolListArray[index].symbol)){
                        localStorage.setItem(symbolListArray[index].symbol, "found at " + new Date().toLocaleTimeString())
                        this.speckIt((symbolListArray[index].symbol +' price volume Breakout ').toLocaleLowerCase())
                        console.log(symbolListArray[index].name, foundLive[0].ltp," price volume Breakout")
                        var symbolInfo = {
                            token: symbolListArray[index].token,
                            symbol: symbolListArray[index].symbol,
                            qtyToTake: 1,
                            producttype: 'INTRADAY'
                        }
                        CommonOrderMethod.historyWiseOrderPlace(symbolInfo, 'BUY', "no", this.callbackAfterOrderDone);
                   
                    }
                }
                localStorage.setItem(symbolListArray[index].symbol, "ok") 
           //     console.log("ws onmessage: ", foundLive[0]);

              


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
        this.makeConnection(this.wsClint);
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

