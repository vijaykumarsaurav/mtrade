var mysql = require('mysql');
var moment = require('moment');
var TradeConfig = require('./TradeConfig.json');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Minu@1990",
  database: "mtrade"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("DB Connected 11!");
});

getMinPriceAllowTick = (minPrice) => {

  console.log(minPrice)

  //minPrice =  minPrice.toFixed(2); 
 // console.log("minPrice",minPrice); 
  var wholenumber = parseInt( minPrice.split('.')[0]);
//  console.log("wholenumber",wholenumber); 
  var decimal =  parseFloat( minPrice.split('.')[1]);
 // console.log("decimal",decimal); 
  var tickedecimal =  decimal-decimal%5; 
  minPrice = parseFloat( wholenumber + '.'+tickedecimal); 
//   console.log("minPricexxxx",minPrice); 
  return minPrice; 
}

function findTweezerTopPattern(){

  var sql = "SELECT distinct token, symbol from candle";
  con.query(sql, function  (err, result) {
    if (err) throw err;


    for (let index = 0; index < result.length; index++) {
      const token = result[index].token;

      const symbol = result[index].symbol;

      

      //(date_field BETWEEN '2010-01-30 14:15:55' AND '2010-09-29 10:15:55')   7/22/2021, 3:25:00
       // var sql1 = "SELECT * from candledata where token = "+ token + "   ORDER BY  `datetime`  DESC limit 10";
       
       const format1 = "YYYY-MM-DD HH:mm:ss";
      // var time = moment.duration("00:50:00");
       var time = moment.duration("08:50:00");
       var startdate = moment(new Date()).subtract(time);
     
       var startTime = moment(startdate).format(format1);
       var endTime = moment(new Date()).format(format1);

       var sql1 = "SELECT distinct datetime, open, high, low, close,  token, symbol from candle where token = "+ token + " and `datetime` BETWEEN '"+startTime+"' AND '"+endTime+"' ORDER BY `datetime`  DESC ";
        
      con.query(sql1, function  (err, tokenresult) {
        if (err) throw err;

      
        //console.log(symbol,tokenresult.length);   
          
        // for (let index = 0; index < tokenresult.length; index++) {
          //   const datetime = tokenresult[index].datetime;
          //   console.log(tokenresult[index].symbol , token, "datetime1", new Date( datetime).toLocaleString(), 'low', tokenresult[index].low , 'high' , tokenresult[index].high, 'low' , tokenresult[index].low , 'close' , tokenresult[index].close);
          // }


        //  console.log(tokenresult.length, token)
          
          if(tokenresult.length > 0){

            var lastTrendCandleLow = tokenresult[tokenresult.length-1].low; 
            var firstTrendCandleHigh = tokenresult[2].high; 
  
           // console.log(symbol , token, '9thlow', lastTrendCandleLow , '2ndhigh', firstTrendCandleHigh);
  
            var firstCandle = {
                open: tokenresult[0].open,
                high: tokenresult[0].high,
                low: tokenresult[0].log,
                close: tokenresult[0].close
            }
            
            var secondCandle = {
              open: tokenresult[1].open,
              high: tokenresult[1].high,
              low: tokenresult[1].log,
              close: tokenresult[1].close
            }
  
             var diffPer = (symbol, firstTrendCandleHigh - lastTrendCandleLow)*100/lastTrendCandleLow;
             console.log(symbol, "last 8th candle diff% ",  diffPer, "8th Low", lastTrendCandleLow,"3rd high", firstTrendCandleHigh);
       
            //upside movement 1.5% 
            if(diffPer >= 1.5){

              console.log('last candle updated time ',new Date(  tokenresult[0].datetime).toLocaleString() )

              console.log(symbol,  " diff %", diffPer );

  
              //1st candle green & 2nd candle is red check
              if(secondCandle.close > secondCandle.open && firstCandle.close < firstCandle.open){ 
                console.log(symbol, "1st candle green and 2nd candle is red check", 'firstcandle' ,firstCandle, 'secondCandle' ,secondCandle  );
                
                if(Math.round(secondCandle.close) ==  Math.round(firstCandle.open) || Math.round(secondCandle.open) ==  Math.round(firstCandle.close)){
                    console.log(symbol, 'making twisser top close=open || open=close', new Date().toLocaleString());


                    var lowestOfBoth = secondCandle.low < firstCandle.low ? secondCandle.low : firstCandle.low;
                    var highestOfBoth = secondCandle.high < firstCandle.high ? secondCandle.high : firstCandle.high;

                    highestOfBoth = highestOfBoth + (highestOfBoth*0.16/100); //SL calculation


                    var stopLossPrice = highestOfBoth && getMinPriceAllowTick(highestOfBoth); 
                    let perTradeExposureAmt =  TradeConfig.totalCapital * TradeConfig.perTradeExposurePer/100; 
                    let quantity = Math.floor(perTradeExposureAmt/lowestOfBoth); 

                    quantity = quantity>0 ? 1 : 0; 

                    if(!quantity){
                      const format1 = "YYYY-MM-DD HH:mm:ss";
                      var time = moment.duration("00:15:00");
                      var expireAt = moment(new Date()).add(time);

                      expireAt = moment(expireAt).format(format1);
  

                      var selectedSql = "SELECT COUNT(*) as recordPresent FROM  mtrade.selected_stock where token= "+token; 
                      con.query(selectedSql,  function  (err, result) {
                        if (err) throw err;
                       
                        console.log('recordPresent' , result[0].recordPresent); 

                        if(result[0].recordPresent == 0){
                          
                          var selectedSql = "INSERT INTO mtrade.selected_stock (token, symbol, `action`, stoploss, quantity, expireAt, status, createdAt) VALUES('"+token+"', '"+symbol+"', 'SELL', "+stopLossPrice+"," +quantity+ ",'"+expireAt+"'," + 1 +',' + 'NOW()' + ")" ; 
                          con.query(selectedSql,  function  (err, result) {
                            if (err) throw err;
                          
                            console.log(symbol , " Tweezer Top found and inserted into selected stock  expireAt", expireAt);
                          });
                        }

                      
                        
                      });

                    }

                }   
              }
            }
          }
      });

    }
  });
}



const intervalObj = setInterval(() => {
  console.log("scanning... at", new Date().toLocaleTimeString());
  findTweezerTopPattern(); 
}, 5000);

// clearTimeout(timeoutObj);
// clearImmediate(immediateObj);
// clearInterval(intervalObj);

  