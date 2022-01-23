import * as moment from 'moment';


const workercode = () => {

        onmessage = function(e) {
        console.log('message received', e.data);

        var data = e.data;

        let histdata = data.chunkCandleData; 
        let stockInfo = data.stock; 
        let stock = {}; 
        if (histdata.length > 0) {

            var candleData = histdata;
            stock.name = stockInfo.name;
            stock.symbol = stockInfo.symbol;
            stock.token = stockInfo.token;
            stock.entryPrice = candleData[0][4];
            stock.foundAt = moment(candleData[0][0]).format('YYYY-MM-DD HH:mm')

            let priceChangeList = [];
            for (let index2 = 1; index2 < candleData.length; index2++) {
                let perChange = (candleData[index2][4] - stock.entryPrice) * 100 / stock.entryPrice;
                let datetime = moment(candleData[index2][0]).format('h:mma')
               
                priceChangeList.push({ perChange: perChange.toFixed(2), close: candleData[index2][4], datetime: datetime });
            }
            stock.candleData = priceChangeList;
            
        }

        console.log('message prepared ', stock);

        postMessage(stock);


    }
};

let code = workercode.toString();
code = code.substring(code.indexOf("{")+1, code.lastIndexOf("}"));

const blob = new Blob([code], {type: "application/javascript"});
const worker_script = URL.createObjectURL(blob);

//module.exports = worker_script;
export default worker_script