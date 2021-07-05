// Require express and create an instance of it
var express = require('express');
var fs = require('fs');
var cors = require('cors');
var app = express();
app.use(cors());
// on the request to root (localhost:3000/)
app.get('/', function (req, res) {
    res.send('<b>My</b> first express http server');
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
    res.status(404).send("Sorry, that route doesn't exist. Have a nice day :)");
});

// start the server in the port 3000 !
app.listen(8081, function () {
    console.log('Example app listening on port 8081.');
});
