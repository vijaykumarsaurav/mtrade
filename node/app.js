var express = require('express');
var fs = require('fs');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');  
var mysql = require('mysql');
app.use(cors());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Minu@1990",
  database: "mtrade"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("DB Connected!");
});


// on the request to root (localhost:3000/)
app.get('/', function (req, res) {
    res.send('Home page: check other route');
});


// On localhost:3000/welcome
app.get('/search/:query', function (req, res) {

    const symbolName = req.params.query.toUpperCase(); 
    var obj, fillertedData = []; 

    fs.readFile('OpenAPIScripMaster.json', 'utf8', function (err, data) {
      if (err) throw err;
      obj = JSON.parse(data);

      for (let index = 0; index < obj.length; index++) {
        
        if(obj[index].name.startsWith(symbolName) &&  obj[index].lotsize == "1"  &&  !obj[index].symbol.endsWith("-BL") ){
            fillertedData.push(obj[index])  
        } 
          
      }
      res.status(200).send(JSON.stringify(fillertedData)) ;
      
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
      result : obj, 
      message : "SUCCESS", 
      status : true
    }

    res.status(200).send(response) ;
    
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
    console.log("stock",stock);
    var path = 'myJsonWatchList.json'
    fs.readFile(path, 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {

            var watchlist = JSON.parse(data) ? JSON.parse(data) : []; 
            var found = watchlist.filter(row => row.token  == stock.token);
            console.log('found',found);

            if(!found.length ){
              watchlist.push({stock}); //add some data
              fs.writeFile(path, JSON.stringify(watchlist), 'utf8', function callback(){
                 
                
                console.log(stock.symbol, 'added');
      
                 // var res = {status : 'added'};
                  // res.setHeader('Content-Type', 'application/json');
      
                  res.status(200).send(" Added") ;
              }); // write it back 
            }
          
  
        }});
  

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
    var path = '/Users/B0208058/Documents/m-trade/public/staticData.json'
    fs.readFile(path, 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {

            var watchlist = JSON.parse(data) ? JSON.parse(data) : {}; 
            // var found = watchlist.filter(row => row.token  == stock.token);
            // console.log('found',found);
            // if(!found.length ){
            // }
            
            watchlist[req.body.listName] = req.body.listItem; 


            fs.writeFile(path, JSON.stringify(watchlist), 'utf8', function callback(){
                   
              console.log(req.body.listName,  " added/updated ", req.body.listItem.length ); 

               var response = {status : 'Added', listName : req.body.listName, count:  req.body.listItem.length};
                res.setHeader('Content-Type', 'application/json');
    
                res.status(200).send(response) ;
            }); // write it back 
          
  
        }});
  

  return;
    
  });

app.post('/saveCandleHistory', function (req, res) {

  var sql = "insert into candle (token,symbol, datetime, open, high,low,close, volume ) VALUES ?";
  var data = req.body.data; 
  var token = req.body.token; 
  var symbol = req.body.symbol; 
  var values = [];    

    data.forEach(element => {
      values.push([ token,symbol,  new Date( element[0] ), element[1],element[2],element[3],element[4],  element[5]]); 
    });

    con.query(sql, [values],  function  (err, result) {
      if (err) throw err;
      res.status(200).send( {status : 200, result: values.length }) ;
      console.log(values.length , " record inserted");
    });

  return;
});





app.get('/saveNSEList/:query', function (req, res) {
    const toplist = req.params.query; 
   // console.log("toplist",toplist);
    //res.status(200).send(name) ;
      fs.writeFile('nseTopScan.json', toplist, 'utf8', function callback(){
        console.log("Added", toplist);
        res.status(200).send("Added") ;
      });

    return;
});

// On localhost:3000/welcome
app.get('/getNseTopStocks', function (req, res) {

  //const symbolName = req.params.query.toUpperCase(); 
  var obj, fillertedData = []; 

  fs.readFile('nseTopScan.json', 'utf8', function (err, data) {

    if (err) throw err;
    if(data){
      obj = JSON.parse(data);
    }

    var response = {
      result : obj, 
      message : "SUCCESS", 
      status : true
    }

    res.status(200).send(response) ;
    
  });
return;
  
});




// my selected stocks
app.get('/getSelectedStock', function (req, res) {

  var selectedSql = "SELECT * FROM  mtrade.selected_stock"; 
    con.query(selectedSql,  function  (err, result) {
      if (err) throw err;
      if(result.length > 0){
        var response = {
          result : result, 
          message : "SUCCESS", 
          status : true
        }
        res.status(200).send(response) ;
      }
      
    });
  return;
});


  app.get('/saveScanList/:query', function (req, res) {
    const symbolName = req.params.query.toUpperCase(); 

    fs.readFile('myScan.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log('err',err );
        } else {
            var scanlist = JSON.parse(data);
          console.log('scanlist',scanlist );
        var flag = true;  
       
        for (let index = 0; index < scanlist.length; index++) {
          if(scanlist[index].symbolName == symbolName){
           flag = false;  
           break; 
          }
        }
        
        if(flag){
          scanlist.push({symbolName: symbolName, datetime : new Date().toLocaleString()}); 
          json = JSON.stringify(scanlist);
          fs.writeFile('myScan.json', json, 'utf8', function callback(){
               console.log( symbolName , "added");
               res.status(200).send(symbolName + " Added") ;
           }); // write it back 
        }else{
          console.log( symbolName , "Already there");
          res.status(200).send("Already there") ;
        }

    }});
  
  
   
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


  fs.readFile('myWatchListOne.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
      obj = JSON.parse(data); //now it an object
      obj.table.push({symbolName: symbolName}); //add some data
      json = JSON.stringify(obj); //convert it back to json
      fs.writeFile('myWatchListOne.json', json, 'utf8', function callback(){
           console.log("added");
           res.status(200).send("Added") ;
       }); // write it back 
  }});


 
return;
  
});

// Change the 404 message modifing the middleware
app.use(function(req, res, next) {
    res.status(404).send("Sorry, that route doesn't exist. pls check again your url");
});

// start the server in the port 3000 !
app.listen(8081, function () {
    console.log('Example app listening on port 8081.');
});


process.on('uncaughtException', function (err) {
  console.log('uncaughtException:', err);
  console.log("uncaughtException", err.stack);
  //console.dir(err);

});