// var API = require('indian-stock-exchange');
var express = require("express");
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');  
var mysql = require('mysql');
app.use(cors());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
var fs = require('fs');

var API = require('./index');
var BSEAPI = API.BSE;
var NSEAPI = API.NSE;



app.listen(8081, () => {
  console.log("Server running on port 8081");
});

// National Stock Exchange (NSE) APIS

// Get the stock market status (open/closed) - JSON
// Example: http://localhost:3000/get_market_status
app.get("/get_market_status", (req, res, next) => {
  NSEAPI.getMarketStatus()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the NSE indexes information (last updated, name, previous close, open, low, high, last, percent change, year high and low, index order) - JSON
// Example: http://localhost:3000/nse/get_indices
app.get("/nse/get_indices", (req, res, next) => {
  NSEAPI.getIndices()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the quotes of all indexes in NSE - HTML
// Example: http://localhost:3000/nse/get_quotes
app.get("/nse/get_quotes", (req, res, next) => {
  NSEAPI.getQuotes()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the quotation data of the symbol (companyName) from NSE - JSON
// Example: http://localhost:3000/nse/get_quote_info?companyName=TCS
app.get("/nse/get_quote_info", (req, res, next) => {
  NSEAPI.getQuoteInfo(req.query.companyName)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the top 10 gainers of NSE - JSON
// Example: http://localhost:3000/nse/get_gainers
app.get("/nse/get_gainers", (req, res, next) => {
  NSEAPI.getGainers()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the top 10 losers of NSE - JSON
// Example: http://localhost:3000/nse/get_losers
app.get("/nse/get_losers", (req, res, next) => {
  NSEAPI.getLosers()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get advances/declines of individual index, and the value if its changed or not - JSON
// Example: http://localhost:3000/nse/get_incline_decline
app.get("/nse/get_incline_decline", (req, res, next) => {
  NSEAPI.getInclineDecline()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the information of all the companies in a single NSE index (slug) JSON
// Example: http://localhost:3000/nse/get_index_stocks?symbol=nifty
app.get("/nse/get_index_stocks", (req, res, next) => {

  NSEAPI.getIndexStocks(req.query.symbol)
    .then(function (response) {
      console.log(req.query.symbol, 'sector api called at ' + new Date().toLocaleTimeString(), response.data)

      res.json(response.data);
    });
});

// Get the list of companies in provided NSE index with matching keyword data - JSON
// Example: http://localhost:3000/nse/search_stocks?keyword=AXIS
app.get("/nse/search_stocks", (req, res, next) => {
  NSEAPI.searchStocks(req.query.keyword)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the intra day data of company in NSE - XML
// Example: http://localhost:3000/nse/get_intra_day_data?companyName=TCS&time=1
// Example: http://localhost:3000/nse/get_intra_day_data?companyName=TCS&time=month
app.get("/nse/get_intra_day_data", (req, res, next) => {
  NSEAPI.getIntraDayData(req.query.companyName, req.query.time)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get 52 weeks all high stocks in NSE - JSON
// Example: http://localhost:3000/nse/get_52_week_high
app.get("/nse/get_52_week_high", (req, res, next) => {
  NSEAPI.get52WeekHigh()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get 52 weeks all low stocks in NSE - JSON
// Example: http://localhost:3000/nse/get_52_week_low
app.get("/nse/get_52_week_low", (req, res, next) => {
  NSEAPI.get52WeekLow()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the NSE stocks whose values are highest - JSON
// Example: http://localhost:3000/nse/get_top_value_stocks
app.get("/nse/get_top_value_stocks", (req, res, next) => {
  NSEAPI.getTopValueStocks()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the NSE stocks whose volumes sold are highest - JSON
// Example: http://localhost:3000/nse/get_top_volume_stocks
app.get("/nse/get_top_volume_stocks", (req, res, next) => {
  NSEAPI.getTopVolumeStocks()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the futures data for a company stock (symbol) and time - JSON
// Example: http://localhost:3000/nse/get_stock_futures_data?companyName=TCS&time=15
// Example: http://localhost:3000/nse/get_stock_futures_data?companyName=VEDL&time=month
app.get("/nse/get_stock_futures_data", (req, res, next) => {
  NSEAPI.getStockFuturesData(req.query.companyName, req.query.time)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get chart data of a companyName(symbol) depending on time in NSE - CSV Format (delimiter - |)
// Example: http://localhost:3000/nse/get_chart_data_new?companyName=VEDL&time=5
// Example: http://localhost:3000/nse/get_chart_data_new?companyName=VEDL&time=year
app.get("/nse/get_chart_data_new", (req, res, next) => {
  NSEAPI.getChartDataNew(req.query.companyName, req.query.time)
    .then(function (response) {
      res.json(response.data);
    });
});

// Bombay Stock Exchange (NSE) APIS

// Get details of all index in BSE Stock exchange - JSON
// Example: http://localhost:3000/bse/get_indices
app.get("/bse/get_indices", (req, res, next) => {
  BSEAPI.getIndices()
    .then(function (response) {
      console.log(req.query.symbol, 'sector api called at ' + new Date().toLocaleTimeString(), response.data)

      res.json(response.data);
    });
});

// Get the information of only a single index eg. SENSEX (16) - JSON
// Example: http://localhost:3000/bse/getIndexInfo?indexId=16
app.get("/bse/getIndexInfo", (req, res, next) => {
  BSEAPI.getIndexInfo(req.query.indexId)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get todays closing data and daily data of past time using IndexId and time from BSE  - JSON
// Example: http://localhost:3000/bse/get_index_chart_data?indexId=16
app.get("/bse/get_index_chart_data", (req, res, next) => {
  BSEAPI.getIndexChartData(req.query.indexId, req.query.time)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get details of all the stocks in an index - JSON
// Example: http://localhost:3000/bse/get_index_stocks?indexId=16
app.get("/bse/get_index_stocks", (req, res, next) => {
  BSEAPI.getIndexStocks(req.query.indexId)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get details of company (stock) using securityCode - JSON
// 500112 - symbol (securityCode) of SBIN stock BSE
// Example: http://localhost:3000/bse/get_company_info?companyKey=500325
app.get("/bse/get_company_info", (req, res, next) => {
  BSEAPI.getCompanyInfo(req.query.companyKey)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get chart type details of stocks in BSE using companyKey and time - JSON
// returns(StockValue, Volume) for company in specified past time
// Example: http://localhost:3000/bse/get_stocks_chart_data?companyKey=500325&time=5
// Example: http://localhost:3000/bse/get_stocks_chart_data?companyKey=500325&time=month
app.get("/bse/get_stocks_chart_data", (req, res, next) => {
  BSEAPI.getStocksChartData(req.query.companyKey, req.query.time)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get BSE stock data of stock info and day chart - HTML
// Example: http://localhost:3000/bse/get_stock_info_and_day_chart_data?companyKey=500325
app.get("/bse/get_stock_info_and_day_chart_data", (req, res, next) => {
  BSEAPI.getStockInfoAndDayChartData(req.query.companyKey)
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the top gainers of BSE stock exchange - JSON
// Example: http://localhost:3000/bse/get_gainers
app.get("/bse/get_gainers", (req, res, next) => {
  BSEAPI.getGainers()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the top losers of BSE stock exchange - JSON
// Example: http://localhost:3000/bse/get_losers
app.get("/bse/get_losers", (req, res, next) => {
  BSEAPI.getLosers()
    .then(function (response) {
      res.json(response.data);
    });
});

// Get the top turnovers of BSE stock exchange - JSON
// Example: http://localhost:3000/bse/getTopTurnOvers
app.get("/bse/getTopTurnOvers", (req, res, next) => {
  BSEAPI.getTopTurnOvers()
    .then(function (response) {
      res.json(response.data);
    });
});


// Example: http://localhost:3000/nse/get_quote_info?companyName=TCS
app.get("/nse/getOptionChain", (req, res, next) => {
  console.log("req.query.symbol",req.query.symbol);
  NSEAPI.getQuoteInfo(req.query.symbol)
    .then(function (response) {
      res.json(response.data);
    });
});


// On localhost:3000/welcome
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
// On localhost:3000/welcome
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

app.post('/saveCandleHistory', function (req, res) {

  var sql = "insert into candle (token,symbol, datetime, open, high,low,close, volume ) VALUES ?";
  var data = req.body.data;
  var token = req.body.token;
  var symbol = req.body.symbol;
  var values = [];

  data.forEach(element => {
    values.push([token, symbol, new Date(element[0]), element[1], element[2], element[3], element[4], element[5]]);
  });

  con.query(sql, [values], function (err, result) {
    if (err) throw err;
    res.status(200).send({ status: 200, result: values.length });
    console.log(values.length, " record inserted");
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

// On localhost:3000/welcome
app.get('/getNseTopStocks', function (req, res) {

  //const symbolName = req.params.query.toUpperCase(); 
  var obj, fillertedData = [];

  fs.readFile('nseTopScan.json', 'utf8', function (err, data) {

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


process.on('uncaughtException', function (err) {
  console.log('uncaughtException:', err);
  console.log("uncaughtException", err.stack);
  //console.dir(err);

});

module.exports = app;
