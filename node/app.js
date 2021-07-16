var express = require('express');
var fs = require('fs');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');  

app.use(cors());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

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


// app.post('/saveScanList', function (req, res) {

//   var name = req.body.name; 
//   console.log("name",name);
//   //res.status(200).send(name) ;
//     var obj = {
//       table: []
//    };
   
//    const symbolName = name.toUpperCase(); 

//   //  obj.table.push({symbolName: symbolName});
//   //  var json = JSON.stringify(obj);
//   //  fs.writeFile('myScan.json', json, 'utf8', function callback(){
//   //    console.log("added");
//   //    res.status(200).send(symbolName + "Added") ;
//   //  });
  
  
//     fs.readFile('myScan.json', 'utf8', function readFileCallback(err, data){
//         if (err){
//             console.log(err);
//         } else {

//         obj = JSON.parse(data); 
        
//         obj.table.push({symbolName: symbolName}); //add some data
//         json = JSON.stringify(obj); //convert it back to json
//         fs.writeFile('myScan.json', json, 'utf8', function callback(){
//              console.log("added");

//              var res = {status : 'added'};
//             // res.setHeader('Content-Type', 'application/json');

//              res.status(200).send(symbolName + "Added") ;
//          }); // write it back 
//     }});
  
  
   
//   return;
    
//   });

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
