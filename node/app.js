// var API = require('indian-stock-exchange');
var express = require("express");
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');  
var mysql = require('mysql');
app.use(cors());
var chartinkAutoOrder = require('./chartinkAutoOrder'); 


app.use(bodyParser.json({
  limit: '500mb'
}));

app.use(bodyParser.urlencoded({
  limit: '500mb',
  parameterLimit: 1000000,
  extended: true 
}));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


var fs = require('fs');
var moment = require('moment');

var API = require('./index');
var BSEAPI = API.BSE;
var NSEAPI = API.NSE;


// var con = mysql.createConnection({
//   host: "remotemysql.com",
//   user: "q0XJUKCMPl",
//   password: "WYqSiKWW0M",
//   database: "q0XJUKCMPl",
//   port: 3306
// });

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("DB Connected 11!");
// });


// Initialize pool
var pool = mysql.createPool(
{
  host: "remotemysql.com",
  user: "q0XJUKCMPl",
  password: "WYqSiKWW0M",
  database: "q0XJUKCMPl",
  port: 3306,
  debug    :  false
}
);    
//module.exports = pool;

// Attempt to catch disconnects 


var poolLocal = mysql.createPool(
  {
    host: "localhost",
    user: "root",
    password: "password",
    database: "mtrade",
    port: 3306,
    debug    :  false
  }
  );  

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "mtrade",
  port: 3306
});

con.connect(function(err) {
  if (err) throw err;
  console.log("DB Connected 11!");
});



app.listen(8081, () => {
  console.log("Server running on port 8081");
});


// National Stock Exchange (NSE) APIS

// Get the stock market status (open/closed) - JSON
// Example: http://localhost:8081/get_market_status
app.get("/get_market_status", (req, res, next) => {
  NSEAPI.getMarketStatus()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the NSE indexes information (last updated, name, previous close, open, low, high, last, percent change, year high and low, index order) - JSON
// Example: http://localhost:8081/nse/get_indices
app.get("/nse/get_indices", (req, res, next) => {
  NSEAPI.getIndices()
    .then(function (response) {
      res.json(response.data);
    });
});

app.get("/get_chartink_stock", (req, res, next) => {
  NSEAPI.getChartInkStock()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the quotes of all indexes in NSE - HTML
// Example: http://localhost:8081/nse/get_quotes
app.get("/nse/get_quotes", (req, res, next) => {
  NSEAPI.getQuotes()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the quotation data of the symbol (companyName) from NSE - JSON
// Example: http://localhost:8081/nse/get_quote_info?companyName=TCS
app.get("/nse/get_quote_info", (req, res, next) => {
  NSEAPI.getQuoteInfo(req.query.companyName)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the top 10 gainers of NSE - JSON
// Example: http://localhost:8081/nse/get_gainers
app.get("/nse/get_gainers", (req, res, next) => {
  NSEAPI.getGainers()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the top 10 losers of NSE - JSON
// Example: http://localhost:8081/nse/get_losers
app.get("/nse/get_losers", (req, res, next) => {
  NSEAPI.getLosers()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get advances/declines of individual index, and the value if its changed or not - JSON
// Example: http://localhost:8081/nse/get_incline_decline
app.get("/nse/get_incline_decline", (req, res, next) => {
  NSEAPI.getInclineDecline()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the information of all the companies in a single NSE index (slug) JSON
// Example: http://localhost:8081/nse/get_index_stocks?symbol=nifty
app.get("/nse/get_index_stocks", (req, res, next) => {

  NSEAPI.getIndexStocks(req.query.symbol)
    .then(function (response) {
      console.log(req.query.symbol, 'sector api called at ' + new Date().toLocaleTimeString(), response.data)

      res.json(response.data);
    });
});

// Get the list of companies in provided NSE index with matching keyword data - JSON
// Example: http://localhost:8081/nse/search_stocks?keyword=AXIS
app.get("/nse/search_stocks", (req, res, next) => {
  NSEAPI.searchStocks(req.query.keyword)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the intra day data of company in NSE - XML
// Example: http://localhost:8081/nse/get_intra_day_data?companyName=TCS&time=1
// Example: http://localhost:8081/nse/get_intra_day_data?companyName=TCS&time=month
app.get("/nse/get_intra_day_data", (req, res, next) => {
  NSEAPI.getIntraDayData(req.query.companyName, req.query.time)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get 52 weeks all high stocks in NSE - JSON
// Example: http://localhost:8081/nse/get_52_week_high
app.get("/nse/get_52_week_high", (req, res, next) => {
  NSEAPI.get52WeekHigh()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get 52 weeks all low stocks in NSE - JSON
// Example: http://localhost:8081/nse/get_52_week_low
app.get("/nse/get_52_week_low", (req, res, next) => {
  NSEAPI.get52WeekLow()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the NSE stocks whose values are highest - JSON
// Example: http://localhost:8081/nse/get_top_value_stocks
app.get("/nse/get_top_value_stocks", (req, res, next) => {
  NSEAPI.getTopValueStocks()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the NSE stocks whose volumes sold are highest - JSON
// Example: http://localhost:8081/nse/get_top_volume_stocks
app.get("/nse/get_top_volume_stocks", (req, res, next) => {
  NSEAPI.getTopVolumeStocks()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the futures data for a company stock (symbol) and time - JSON
// Example: http://localhost:8081/nse/get_stock_futures_data?companyName=TCS&time=15
// Example: http://localhost:8081/nse/get_stock_futures_data?companyName=VEDL&time=month
app.get("/nse/get_stock_futures_data", (req, res, next) => {
  NSEAPI.getStockFuturesData(req.query.companyName, req.query.time)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get chart data of a companyName(symbol) depending on time in NSE - CSV Format (delimiter - |)
// Example: http://localhost:8081/nse/get_chart_data_new?companyName=VEDL&time=5
// Example: http://localhost:8081/nse/get_chart_data_new?companyName=VEDL&time=year
app.get("/nse/get_chart_data_new", (req, res, next) => {
  NSEAPI.getChartDataNew(req.query.companyName, req.query.time)
    .then(function (response) {
      res.json(response.data);
    });
});

// Bombay Stock Exchange (NSE) APIS

// Get details of all index in BSE Stock exchange - JSON
// Example: http://localhost:8081/bse/get_indices
app.get("/bse/get_indices", (req, res, next) => {
  BSEAPI.getIndices()
    .then(function (response) {
      console.log(req.query.symbol, 'sector api called at ' + new Date().toLocaleTimeString(), response.data)

      res.json(response.data);
    });
});

// Get the information of only a single index eg. SENSEX (16) - JSON
// Example: http://localhost:8081/bse/getIndexInfo?indexId=16
app.get("/bse/getIndexInfo", (req, res, next) => {
  BSEAPI.getIndexInfo(req.query.indexId)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get todays closing data and daily data of past time using IndexId and time from BSE  - JSON
// Example: http://localhost:8081/bse/get_index_chart_data?indexId=16
app.get("/bse/get_index_chart_data", (req, res, next) => {
  BSEAPI.getIndexChartData(req.query.indexId, req.query.time)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get details of all the stocks in an index - JSON
// Example: http://localhost:8081/bse/get_index_stocks?indexId=16
app.get("/bse/get_index_stocks", (req, res, next) => {
  BSEAPI.getIndexStocks(req.query.indexId)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get details of company (stock) using securityCode - JSON
// 500112 - symbol (securityCode) of SBIN stock BSE
// Example: http://localhost:8081/bse/get_company_info?companyKey=500325
app.get("/bse/get_company_info", (req, res, next) => {
  BSEAPI.getCompanyInfo(req.query.companyKey)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get chart type details of stocks in BSE using companyKey and time - JSON
// returns(StockValue, Volume) for company in specified past time
// Example: http://localhost:8081/bse/get_stocks_chart_data?companyKey=500325&time=5
// Example: http://localhost:8081/bse/get_stocks_chart_data?companyKey=500325&time=month
app.get("/bse/get_stocks_chart_data", (req, res, next) => {
  BSEAPI.getStocksChartData(req.query.companyKey, req.query.time)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get BSE stock data of stock info and day chart - HTML
// Example: http://localhost:8081/bse/get_stock_info_and_day_chart_data?companyKey=500325
app.get("/bse/get_stock_info_and_day_chart_data", (req, res, next) => {
  BSEAPI.getStockInfoAndDayChartData(req.query.companyKey)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the top gainers of BSE stock exchange - JSON
// Example: http://localhost:8081/bse/get_gainers
app.get("/bse/get_gainers", (req, res, next) => {
  BSEAPI.getGainers()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the top losers of BSE stock exchange - JSON
// Example: http://localhost:8081/bse/get_losers
app.get("/bse/get_losers", (req, res, next) => {
  BSEAPI.getLosers()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the top turnovers of BSE stock exchange - JSON
// Example: http://localhost:8081/bse/getTopTurnOvers
app.get("/bse/getTopTurnOvers", (req, res, next) => {
  BSEAPI.getTopTurnOvers()
    .then(function (response) {
      res.json(response.data);
    });
});


// Example: http://localhost:8081/nse/getOptionChain?companyName=TCS
app.get("/nse/getOptionChain", (req, res, next) => {
  NSEAPI.getQuoteInfoOptionChain(req.query.symbol)
    .then(function (response) {
      res.json(response.data);
    });
});


// Example: http://localhost:8081/nse/get_quote_info?companyName=TCS
app.get("/nse/getOptionChainEquity", (req, res, next) => {
  NSEAPI.getQuoteInfoOptionChainEquity(req.query.symbol)
    .then(function (response) {
      res.json(response.data);
    });
});


// On localhost:8081/welcome
app.post('/getAllListTokens', function (req, res) {

  const sybollist = req.body
  var obj, fillertedData = [];

  fs.readFile('OpenAPIScripMaster.json', 'utf8', function (err, data) {
    if (err) throw err;
    obj = JSON.parse(data);

    sybollist.forEach(element => {
      for (let index = 0; index < obj.length; index++) {
        // if(obj[index].name.startsWith(symbolName) && obj[index].lotsize == "1" && obj[index].exch_seg == "NSE"  && !obj[index].symbol.endsWith("-BL")) {
        //   fillertedData.push(obj[index])
        // }
        if(obj[index].symbol.endsWith('-EQ')  && obj[index].name == element.name  && obj[index].lotsize == "1") {
          fillertedData.push(obj[index])
        }
      }
    });

    res.status(200).send(JSON.stringify(fillertedData));

  });
  return;

});
// On localhost:8081/welcome
app.get('/search/:query', function (req, res) {

  const symbolName = req.params.query.toUpperCase();
  var obj, fillertedData = [];

  fs.readFile('OpenAPIScripMaster.json', 'utf8', function (err, data) {
    if (err) throw err;
    obj = JSON.parse(data);

    for (let index = 0; index < obj.length; index++) {

      if(obj[index].name.startsWith(symbolName) && obj[index].lotsize == "1" && !obj[index].symbol.endsWith("-BL")) {
        fillertedData.push(obj[index])
      }


      //BANKNIFTY16SEP2137700CE
      if(obj[index].symbol  == symbolName) {
        fillertedData.push(obj[index])
      }

    }
    res.status(200).send(JSON.stringify(fillertedData));

  });
  return;

});

app.get('/stockOptionSearch/:query', function (req, res) {

  const query = JSON.parse( req.params.query) 

  var obj, fillertedData = [];
  console.log("query", query)

  fs.readFile('OpenAPIScripMaster.json', 'utf8', function (err, data) {
    if (err) throw err;
    obj = JSON.parse(data);

    for (let index = 0; index < obj.length; index++) {
      //BANKNIFTY16SEP2137700CE
      if(obj[index].name  == query.name && obj[index].exch_seg === "NFO") {
        fillertedData.push(obj[index])
      }
    }

    let otmOption = []; 
    for (let index1 = 0; index1 < fillertedData.length; index1++) {
      const element = fillertedData[index1];
      if( parseFloat(element.strike)/100 > query.ltp){
        console.log(parseFloat(element.strike)/100, query.ltp), 
        element.expiry = moment(element.expiry);
        otmOption.push(element);
      } 
    }
    otmOption.sort(function (a, b) {
      return a.expiry - b.expiry || parseFloat(a.strike)/100 - parseFloat(b.strike)/100 
    })

    console.log("syboll",query.name, otmOption.slice(0, 2) )
    res.status(200).send(JSON.stringify(otmOption.slice(0, 2)));

  });
  return;

});

// On localhost:8081/welcome
app.get('/getScannedStocks/', function (req, res) {

  //const symbolName = req.params.query.toUpperCase(); 
  var obj, fillertedData = [];

  fs.readFile('myScan.json', 'utf8', function (err, data) {

    if (err) throw err;
    obj = JSON.parse(data);
    var response = {
      result: obj,
      message: "SUCCESS",
      status: true
    }

    res.status(200).send(response);

  });
  return;

});


app.post('/saveWatchListJSON', function (req, res) {
  //res.status(200).send(name) ;

  //  obj.table.push({symbolName: symbolName});
  //  var json = JSON.stringify(obj);
  //  fs.writeFile('myScan.json', json, 'utf8', function callback(){
  //    console.log("added");
  //    res.status(200).send(symbolName + "Added") ;
  //  });

  var stock = req.body.stock;
  console.log("stock", stock);
  var path = 'myJsonWatchList.json'
  fs.readFile(path, 'utf8', function readFileCallback(err, data) {
    if (err) {
      console.log(err);
    } else {

      var watchlist = JSON.parse(data) ? JSON.parse(data) : [];
      var found = watchlist.filter(row => row.token == stock.token);
      console.log('found', found);

      if (!found.length) {
        watchlist.push({ stock }); //add some data
        fs.writeFile(path, JSON.stringify(watchlist), 'utf8', function callback() {


          console.log(stock.symbol, 'added');

          // var res = {status : 'added'};
          // res.setHeader('Content-Type', 'application/json');

          res.status(200).send(" Added");
        }); // write it back 
      }


    }
  });


  return;

});


app.post('/addIntoStaticData', function (req, res) {
  //res.status(200).send(name) ;

  //  obj.table.push({symbolName: symbolName});
  //  var json = JSON.stringify(obj);
  //  fs.writeFile('myScan.json', json, 'utf8', function callback(){
  //    console.log("added");
  //    res.status(200).send(symbolName + "Added") ;
  //  });

  // console.log("body", req.body);
  // var path = '/Users/B0208058/Documents/m-trade/public/staticData.json';


  var path = __dirname.split('/')
  path.pop();
  console.log(__dirname, path);
  path = path && path.join('/');
  path = path + "/public/staticData.json";

  //    var path = 'C:/Users/AkashWay/mtrade/LearnNew/public/staticData.json';
  fs.readFile(path, 'utf8', function readFileCallback(err, data) {
    if (err) {
      console.log(err);
    } else {

      var watchlist = JSON.parse(data) ? JSON.parse(data) : {};
      // var found = watchlist.filter(row => row.token  == stock.token);
      // console.log('found',found);
      // if(!found.length ){
      // }

      watchlist[req.body.listName] = req.body.listItem;


      fs.writeFile(path, JSON.stringify(watchlist), 'utf8', function callback() {

        console.log(req.body.listName, " added/updated ", req.body.listItem.length);

        var response = { status: 'Added', listName: req.body.listName, count: req.body.listItem.length };
        res.setHeader('Content-Type', 'application/json');

        res.status(200).send(response);
      }); // write it back 


    }
  });


  return;

});



app.post("/store_delivery_data", (req, res, next) => {


  var sql = "INSERT INTO `deliveryData` (`symbol`, `quantityTraded`, `deliveryQuantity`, `deliveryToTradedQuantity`, `datetime`, `ltp`, `todayChange`, `averagePrice`) VALUES ?";
  var backupDeleverydata = req.body.backupDeleverydata;
  var values = [];
  backupDeleverydata.forEach(element => {
    values.push([element.symbol, element.quantityTraded, element.deliveryQuantity ,element.deliveryToTradedQuantity, element.datetime, element.ltp, element.todayChange, element.averagePrice]);
  });

  // con.query(sql, [values], function (err, result) {
  //   if (err) throw err;

  //   console.log("result",result);
  //   res.status(200).send({ status: 200, result: values.length });
  //   console.log(values.length, " record inserted");
  // });

  pool.getConnection(function(err,connection){

    console.log("err",err);
    if (err) {
      connection.release();
      throw err;
    }   
    connection.query(sql,[values], function(err,rows){
        connection.release();
        if(!err) {
          console.log("rows",rows);
          res.status(200).send({ status: 200, result: rows });

        }           
    });
    connection.on('error', function(err) {      
          throw err;
          return;     
    });
  });

});



app.post("/store_bid_data", (req, res, next) => {

  var sql = "INSERT INTO `bidData` (`symbol`, `totalBuyBid`, `totalSellBid`, `updatedTime`, `ltp`, `priceChangePer`, `dbUpdateTime`, `quantityTraded`, `deliveryQuantity`, `deliveryToTradedQuantity`, `averagePrice`, `buyPrice1`, `buyPrice2`, `buyPrice3`, `buyPrice4`, `buyPrice5`, `buyQuantity1`, `buyQuantity2`, `buyQuantity3`, `buyQuantity4`, `buyQuantity5`, `sellPrice1`, `sellPrice2`, `sellPrice3`, `sellPrice4`, `sellPrice5`, `sellQuantity1`, `sellQuantity2`, `sellQuantity3`, `sellQuantity4`, `sellQuantity5`) VALUES ?";
  
  var backupBiddata = req.body.backupBiddata;
  var dbUpdateTime = req.body.dbUpdateTime;
  
  var values = [], allSymbol = []; 
  backupBiddata.forEach(element => {
    values.push([element.symbol, element.totalBuyBid, element.totalSellBid ,element.updatedTime, element.ltp, element.priceChangePer, dbUpdateTime, element.quantityTraded,element.deliveryQuantity, element.deliveryToTradedQuantity,   element.averagePrice, element.buyPrice1, element.buyPrice2, element.buyPrice3, element.buyPrice4, element.buyPrice5, element.buyQuantity1, element.buyQuantity2, element.buyQuantity3, element.buyQuantity4, element.buyQuantity5, element.sellPrice1, element.sellPrice2, element.sellPrice3, element.sellPrice4, element.sellPrice5, element.sellQuantity1, element.sellQuantity2, element.sellQuantity3, element.sellQuantity4, element.sellQuantity5
    
    ]);
 
 
    allSymbol.push( "'" + element.symbol+"'"); 
  });
   console.log("biddata", values);
    con.query(sql, [values], function (err, result) {
    if (err) throw err;
    console.log(values.length, " record inserted");

      let selectSql = "SELECT symbol, totalBuyBid, totalSellBid, updatedTime  FROM biddata where symbol in ("+ allSymbol.join(',')+")  order by dbUpdateTime desc  LIMIT "+allSymbol.length*5+";"
    // console.log( selectSql) ;

        con.query(selectSql, function (err, selectResult) {
          if (err) throw err;
            
          console.log("selectResult",selectResult);
          res.status(200).send({ status: 200, result: selectResult });
          
        });

        

    // console.log("result",result);
    // res.status(200).send({ status: 200, result: values.length });
    console.log(values.length, " record inserted");
  });





  // console.log("biddata", values);

  // poolLocal.getConnection(function(err,connection){

  //   console.log("dbError",err);
  //   if (err) {
  //    // connection.release();
  //     throw err;
  //   }   
  //   connection.query(sql,[values], function(err,rows){
  //       connection.release();
  //       if(!err) {
  //         console.log("rows",rows);
  //         res.status(200).send({ status: 200, result: rows });

  //       }           
  //   });
  //   connection.on('error', function(err) {      
  //         throw err;
  //         return;     
  //   });
  // });

});


app.get("/get_backup_date_list", (req, res, next) => {
  var sql = "select DISTINCT dbUpdateTime FROM biddata";
  con.query(sql, function  (err, result) {
    if (err) throw err;
    console.log("result",result);
    res.status(200).send({ status: 200, result: result });
  });
return;

});

app.get("/get_bid_data", (req, res, next) => {

  let backDate = req.query.backDate; 
  let allSymbol = req.query.allSymbol; 
  let count = req.query.count; 
  
  var sql = "select *  FROM biddata where dbUpdateTime='" + backDate + "'";
  con.query(sql, function  (err, result) {
    if (err) throw err;
    console.log("result",result.length);

    let selectSql = "SELECT symbol, totalBuyBid, totalSellBid, updatedTime  FROM biddata where symbol in ("+ allSymbol+")  order by dbUpdateTime desc  LIMIT "+count*5+";"
     //console.log( selectSql) ;

        con.query(selectSql, function (err, selectResult) {
          if (err) throw err;
            
          console.log("bidHistoty",selectResult.length);
       //   res.status(200).send({ status: 200, result: { bidResult : selectResult, bidHistoty :  selectResult}  });
            res.status(200).send({ status: 200, result: result, bidHistoty :  selectResult });
            return;
        });

    //res.status(200).send({ status: 200, result: result });
  });
return;

});


app.get("/get_delivery_data", (req, res, next) => {

  console.log("synobl", req.query.symbol); 

  var sql = "SELECT DISTINCT(datetime),symbol, quantityTraded, deliveryQuantity, deliveryToTradedQuantity, datetime, todayChange  FROM `deliveryData` WHERE symbol = '"+req.query.symbol+"' ORDER BY datetime DESC ";
  // con.query(sql, function  (err, result) {
  //   if (err) throw err;
  //   console.log("result",result);
  // });

  pool.getConnection(function(err,connection){

    console.log("err",err);
    if (err) {
      connection.release();
      throw err;
    }   
    connection.query(sql,function(err,rows){
        connection.release();
        if(!err) {
          console.log("rows",rows);
          res.status(200).send({ status: 200, result: rows });

        }           
    });
    connection.on('error', function(err) {      
          throw err;
          return;     
    });
  });

return;

});


app.post('/saveCandleHistory', function (req, res) {

  var sql = "insert into intraday (symbol,ltp, pchange, volume, totalbuybid, totalsellbid, ltt, dtime  ) VALUES ?";
  var data = req.body.symbolList;
  var dtime = req.body.dtime;

  var analysis = req.body.analysis;

  var values = [];

  data.forEach(element => {
    values.push([element.symbol, element.ltp, element.pChange,  element.totalTradedVolume, element.totalBuyQuantity,element.totalSellQuantity, new Date(element.ltt), new Date( dtime) ]);
  });

  con.query(sql, [values], function (err, result) {
    if (err) throw err;
    // res.status(200).send({ status: 200, result: values.length });
  
    if(analysis){

      let formedCandle = []; 

      

      data.length >0 && data.forEach((element1, i) => {

        var selectedSql = "select * from intraday where symbol='"+ element1.symbol +"' order by dtime desc limit 100;";
        console.log( selectedSql);
        con.query(selectedSql, function (err, result) {
          if (err) throw err;
          if (result.length > 0) {
            let data =  formCandleData(result, 15); 
            let formedShare = {
              symbol : element1.symbol, 
              data : data
            }
            formedCandle.push(formedShare)
           // console.log("formedShare", formedShare);

            if( i == data.length-1){
              res.status(200).send({ status: 200, result: values.length, formedCandle: formedCandle });
              return;
            }

          }
        });

      });

     
     
    }else{
      console.log(values.length, " record inserted at", new Date());
      res.status(200).send({ status: 200, result: values.length });
      return;
    }


  });

 
});






function formACandel(chunkdata){
  let candle = {};     
  candle.open =  chunkdata[0].ltp; 
  candle.dtime =  chunkdata[0].dtime ; 
  candle.symbol =  chunkdata[0].symbol; 
   
 // console.log('chnkdata open',  chunkdata[0].ltp )

  let highest = chunkdata[0].ltp, lowest =chunkdata[0].ltp, volumeSum =0; 
    for (let hlIndex = 1; hlIndex < chunkdata.length; hlIndex++) {
      if(highest < chunkdata[hlIndex].ltp){
        highest = chunkdata[hlIndex].ltp
      }
      if(chunkdata[hlIndex].ltp < lowest){
        lowest =chunkdata[hlIndex].ltp
      }
      volumeSum += chunkdata[hlIndex].volume; 
    }
    candle.high = highest; 
    candle.low  = lowest; 
    candle.close = chunkdata[chunkdata.length-1].ltp; 
    candle.volume = volumeSum; 
    return candle; 
}


function formCandleData(data, timeframe){

  let candlelist= []; 
  for (let index = 0; index < data.length; index+=timeframe) {
     let chunkdata = data.slice(index, index+timeframe);
      console.log('chunkdata',chunkdata); 

      candlelist.push(formACandel(chunkdata));  
  }

 // console.log('candlelist',candlelist); 

  return candlelist; 
}


function findHugeVolume(data){
  let correntVolume = data[0].volume, count =0 ; 
  for (let index = 1; index < data.length; index++) {
    const element = data[index];
    if(correntVolume > element.volume){
      count = count +1; 
    }
  }

  if (data.length == count )
  return true; 
  else 
  return false; 
}

app.post('/backupHistoryData', function (req, res) {

  var sql = "insert into history (symbol,token, datetime, open, high, low, close, volume  ) VALUES ?";
  var data = req.body.candleData;
  var symbol = req.body.symbol;
  var token = req.body.token;
  let analysis = req.body.analysis; 

  var values = [];

  data.forEach(element => {
    values.push([symbol,token, element[0],  element[1], element[2],element[3], element[4], element[5] ]);
  });

  //console.log(data)
  con.query(sql, [values], function (err, result) {
    if (err) throw err;

    console.log(values.length, " record inserted at", new Date());

    if(analysis){
      var selectedSql = "select * from history where symbol='"+ symbol +"' order by datetime desc limit 100;";
      //console.log(symbol, selectedSql);
      con.query(selectedSql, function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
       //  let data =  formCandleData(result)
      //   console.log("analysisResult", symbol,   data);
          let hugeVol = findHugeVolume(result); 
          res.status(200).send({ status: 200, result: values.length, hugeVol : hugeVol });
        }
      });
    }else{
      res.status(200).send({ status: 200, result: values.length });
    }

  });

  return;
});


app.get('/saveNSEList/:query', function (req, res) {
  const toplist = req.params.query;
  // console.log("toplist",toplist);
  //res.status(200).send(name) ;
  fs.writeFile('nseTopScan.json', toplist, 'utf8', function callback() {
    console.log("Added", toplist);
    res.status(200).send("Added");
  });

  return;
});

app.post('/getBuiltUp', function (req, res) {
  console.log("builtup",  req.body);

  fs.writeFile('longBuiltUp.json', JSON.stringify(req.body), 'utf8', function callback() {
    console.log("Added", req.body.length);
    res.status(200).send({ data: req.body.length, status :"added"});
  });

  // console.log("toplist",toplist);
  //res.status(200).send(name) ;
  // fs.writeFile('nseTopScan.json', toplist, 'utf8', function callback() {
  //   console.log("Added", toplist);
  //   res.status(200).send("Added");
  // });
  // res.status(200).send("Added");
  // return;
});

// On localhost:8081/welcome
app.get('/getNseTopStocks', function (req, res) {

  //const symbolName = req.params.query.toUpperCase(); 
  var obj, fillertedData = [];

  fs.readFile('longBuiltUp.json', 'utf8', function (err, data) {

    if (err) throw err;
    if (data) {
      obj = JSON.parse(data);
    }

    var response = {
      result: obj,
      message: "SUCCESS",
      status: true
    }

    res.status(200).send(response);

  });
  return;

});




// my selected stocks
app.get('/getSelectedStock', function (req, res) {

  var selectedSql = "SELECT * FROM  mtrade.selected_stock";
  con.query(selectedSql, function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      var response = {
        result: result,
        message: "SUCCESS",
        status: true
      }
      res.status(200).send(response);
    }

  });
  return;
});


// sse event url 
app.get('/getChartInkStockSSE', function (req, res) {

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })
  countdown(res, 10)

  function countdown(res, count) {

    var obj, fillertedData = [];

    fs.readFile('longBuiltUp.json', 'utf8', function (err, data) {
  
      if (err) throw err;
      if (data) {
        obj = JSON.parse(data);
      }
  
      var response = {
        result: obj,
        message: "SUCCESS",
        status: true
      }

      //res.status(200).send(response);
      res.write("data: " + JSON.stringify(response) + "\n\n")
      res.end();
        
    });

    
  }

});


app.get('/saveScanList/:query', function (req, res) {
  const symbolName = req.params.query.toUpperCase();

  fs.readFile('myScan.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
      console.log('err', err);
    } else {
      var scanlist = JSON.parse(data);
      console.log('scanlist', scanlist);
      var flag = true;

      for (let index = 0; index < scanlist.length; index++) {
        if (scanlist[index].symbolName == symbolName) {
          flag = false;
          break;
        }
      }

      if (flag) {
        scanlist.push({ symbolName: symbolName, datetime: new Date().toLocaleString() });
        json = JSON.stringify(scanlist);
        fs.writeFile('myScan.json', json, 'utf8', function callback() {
          console.log(symbolName, "added");
          res.status(200).send(symbolName + " Added");
        }); // write it back 
      } else {
        console.log(symbolName, "Already there");
        res.status(200).send("Already there");
      }

    }
  });



  return;

});


app.get('/saveWatchList/:query', function (req, res) {

  //   var obj = {
  //     table: []
  //  };
  const symbolName = req.params.query.toUpperCase();
  //  obj.table.push({symbolName: symbolName});
  //  var json = JSON.stringify(obj);

  //  fs.writeFile('myWatchListOne.json', json, 'utf8', function callback(){
  //    console.log("added");
  //    res.status(200).send("Added") ;
  //  });


  fs.readFile('myWatchListOne.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
      console.log(err);
    } else {
      obj = JSON.parse(data); //now it an object
      obj.table.push({ symbolName: symbolName }); //add some data
      json = JSON.stringify(obj); //convert it back to json
      fs.writeFile('myWatchListOne.json', json, 'utf8', function callback() {
        console.log("added");
        res.status(200).send("Added");
      }); // write it back 
    }
  });

  return;

});



app.post('/chartinkscan', function (req, res) {
    chartinkAutoOrder(req, function(data){
      res.status(200).send(data);
      return;
    }); 
    
});

process.on('uncaughtException', function (err) {
  console.log('uncaughtException:', err);
  console.log("uncaughtException", err.stack);
  //console.dir(err);
});

module.exports = app;
