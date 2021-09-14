import React from "react";
import { createChart } from 'lightweight-charts';


export default function App( props ) {

  const domElement = document.getElementById('tvchart');
  const chart = createChart(domElement, { width: 1000, height: 400,  timeVisible:true ,  secondsVisible:true,});
  const candleSeries = chart.addCandlestickSeries();
 
  const cdata = props.candleData.map(d => {
      return {time: new Date(d[0]).getTime(),open:parseFloat(d[1]),high:parseFloat(d[2]),low:parseFloat(d[3]),close:parseFloat(d[4])}
  });
  candleSeries.setData(cdata); 


  return (
    <div id={'tvchart'}>  </div>
  );
}
