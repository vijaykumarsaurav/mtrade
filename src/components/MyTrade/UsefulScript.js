//find  top index & top 5 stocks https://www.nseindia.com/market-data/live-market-indices
var findTopIndex = function(key){
    var sortedData = liveIndices.state.rowData.filter(function(data){if(data.key === key){return data;}}); 
    var softedData = sortedData.sort(function(a, b){return b.percentChange - a.percentChange}); 
    var topIndex =  softedData[0].indexSymbol; 
    var indexPercentChange =  softedData[0].percentChange; 
   
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
       var list = [];
         var data = JSON.parse(this.responseText).data; 
         for(var i=1; i<5; i++){
           list.push({ symbolName: data[i].symbol} );
         }
       
        if(list.length){
          console.log("Sending data", list); 
          fetch('http://localhost:8081/saveNSEList/'+JSON.stringify(list))
          .then(response => {
              console.log(topIndex+ +softedData[0].percentChange+ '%'+ response.statusText +" "+ new Date() )
            })
        }
    }

    if(indexPercentChange > 0.25)
    xhttp.open("GET", "https://www.nseindia.com/api/equity-stockIndices?index="+topIndex);
    xhttp.send();
}
var sectorInterval = setInterval(() => {

   if(new Date().getHours() >= 9 && new Date().getHours() <16){
    refreshApi('loadLiveMarketIndices'); 
    setTimeout(() => {
        findTopIndex('SECTORAL INDICES');  
    }, 1000);
   }else{
       clearInterval(sectorInterval)
   }  
   
}, 60000 * 5);



//sector wise top search
async function searchSectorWise(){
    console.log("start") //data.key === 'BROAD MARKET INDICES'
    var sortedData = liveIndices.state.rowData.filter(function(data){if(data.key === 'SECTORAL INDICES' || data.key === 'BROAD MARKET INDICES'){return data;}}); 
    var softedData = sortedData.sort(function(a, b){return b.percentChange - a.percentChange}); 
    
    for(var i=0; i < softedData.length; i++){

          if(softedData[i].indexSymbol !== 'INDIA VIX' && softedData[i].percentChange >= 0.50 || (softedData[i].indexSymbol === 'NIFTY 50' && softedData[i].percentChange >= 0.25) ){
            // console.log("index", softedData[i]); 
                var xhttp = new XMLHttpRequest();
                xhttp.open("GET", "https://www.nseindia.com/api/equity-stockIndices?index="+ softedData[i].indexSymbol );
                xhttp.send();

                xhttp.onload = function() {
                   var list = [];
                     var data = JSON.parse(this.responseText).data; 
                     for(var j=1; j<3; j++){
                       if(data[j].lastPrice < 2000)
                        list.push({ symbolName: data[j].symbol} );
                     }
                    console.log(softedData[i].indexSymbol+ ' ' + softedData[i].percentChange + "%  Top stocks : ", JSON.stringify( list)); 
                    if(list.length){
                     // fetch('http://localhost:8081/saveNSEList/'+JSON.stringify(list)).then(response => console.log(response.statusText)); 
                    }
                }
             
          }
          await new Promise(r => setTimeout(r, 2000));   
    }
    console.log("finish")
}

var sectorInterval = setInterval(() => {
    if(new Date().toLocaleTimeString() < "15:10:00"){
     refreshApi('loadLiveMarketIndices'); 
     setTimeout(() => {
         searchSectorWise(); 
     }, 1000);
    }else{
        clearInterval(sectorInterval)
    }  
    
 }, 60000 * 5);