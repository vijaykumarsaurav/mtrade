var mysql = require('mysql');

// const timeoutObj = setTimeout(() => {
//   console.log('timeout beyond time');
// }, 1500);

// const immediateObj = setImmediate(() => {
//   console.log('immediately executing immediate');
// });


var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Minu@1990",
  database: "stockhistory"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("DB Connected!");
});


function getdata(){

  var sql = "SELECT distinct token from candledata";
  con.query(sql, function  (err, result) {
    if (err) throw err;


    for (let index = 0; index < result.length; index++) {
      const token = result[index].token;

        var sql1 = "SELECT * from candledata where token = "+ token + "   ORDER BY  `datetime`  DESC limit 10";
        con.query(sql1, function  (err, tokenresult) {
        if (err) throw err;
        //console.log(token ,c);

        // tokenresult[0].high
        // tokenresult[9].high

          for (let index = 0; index < tokenresult.length; index++) {
            const datetime = tokenresult[index].datetime;
            console.log(token, "datetime", new Date( datetime).toLocaleString(), 'high', tokenresult[index].high);
          }
       //  console.log(token, "datetime", new Date( datetime).toLocaleString(), 'high', tokenresult[index].high);


          // var lastTrendCandleLow = tokenresult[9][3]; 
          // var firstTrendCandleHigh = candleHist[2][2]; 

          // var firstCandle = {
          //     open: candleHist[0][1],
          //     high: candleHist[0][2],
          //     low: candleHist[0][3],
          //     close: candleHist[0][4]
          // }
          
          // var secondCandle = {
          //     open: candleHist[1][1],
          //     high: candleHist[1][2],
          //     low: candleHist[1][3],
          //     close: candleHist[1][4]
          // }

          // var diffPer = (firstTrendCandleHigh - lastTrendCandleLow)*100/lastTrendCandleLow;
          // console.log("last 8th candle diff% ",  diffPer, "8th Low", lastTrendCandleLow,"3rd high", firstTrendCandleHigh);
          // //uptrend movement 1.5% 
          // if(diffPer >= 1.5){
          // }

          console.log("\n\n");
      


        
      });

    }


   
    
  });
}


getdata(); 


// const intervalObj = setInterval(() => {

// }, 500);

// clearTimeout(timeoutObj);
// clearImmediate(immediateObj);
// clearInterval(intervalObj);


  