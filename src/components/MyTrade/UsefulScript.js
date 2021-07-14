
//find  top index & top 5 stocks https://www.nseindia.com/market-data/live-market-indices
var findTopIndex = function(key){
    var sortedData = liveIndices.state.rowData.filter(function(data){if(data.key === 'SECTORAL INDICES'){return data;}}); 
    var softedData = sortedData.sort(function(a, b){return b.percentChange - a.percentChange}); 
    var topIndex =  softedData[0].indexSymbol; 
    
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
       var list = [];
         var data = JSON.parse(this.responseText).data; 
         for(var i=1; i<6; i++){
           list.push({ symbolName: data[i].symbol} );
         }
        console.log(list); 
        if(list.length){
          fetch('http://localhost:8081/saveNSEList/'+JSON.stringify(list)).then(response => console.log(response.statusText)); 
        }
    }
    xhttp.open("GET", "https://www.nseindia.com/api/equity-stockIndices?index="+topIndex);
    xhttp.send();
}
var sectorInterval = setInterval(() => {

   if(new Date().getHours() >= 9){
    refreshApi('loadLiveMarketIndices'); 
    setTimeout(() => {
        findTopIndex('SECTORAL INDICES');  
    }, 1000);
   }else{
       clearInterval(sectorInterval)
   }  
   
}, 60000 * 5);

       