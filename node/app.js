// Require express and create an instance of it
var express = require('express');
var fs = require('fs');
var app = express();

// on the request to root (localhost:3000/)
app.get('/', function (req, res) {
    res.send('<b>My</b> first express http server');
});

// On localhost:3000/welcome
app.get('/search/:query', function (req, res) {

    console.log(req.params.query);

    var obj, fillertedData = []; 
    fs.readFile('OpenAPIScripMaster.json', 'utf8', function (err, data) {
      if (err) throw err;
      obj = JSON.parse(data);

      for (let index = 0; index < obj.length; index++) {
        
     //   console.log(obj[index].name); 
        if(obj[index].symbol.endsWith('-EQ')){
            fillertedData.push(obj[index].name)
            console.log(fillertedData); 
        } 
          
      }
      
    });

  
  
   
  
  res.send('<b>Hello</b> welcome to my http server made with express');
  return;
    
});

// Change the 404 message modifing the middleware
app.use(function(req, res, next) {
    res.status(404).send("Sorry, that route doesn't exist. Have a nice day :)");
});

// start the server in the port 3000 !
app.listen(8081, function () {
    console.log('Example app listening on port 3000.');
});
