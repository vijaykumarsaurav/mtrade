import React from "react";
//import "./styles.css";

import { Line } from "react-chartjs-2";



export default function App( props ) {


  var candleChartData =  props.candleChartData; 
  var vwapDataChart =  props.vwapDataChart; 

  var closeData = [], timeDate = []; 

  if(candleChartData){
    for (let index = 0; index < candleChartData.length; index++) {
      if(candleChartData[index]){
        closeData.push(candleChartData[index][4]); 
        timeDate.push(new Date(candleChartData[index][0]).getHours() + ":" +new Date(candleChartData[index][0]).getMinutes() ); 
      }
    
    }
  }


  const chartData = {
    
    labels: timeDate,
    datasets: [
      {
        label: "Close",
        data: closeData,
        fill: true,
        borderColor:  props.percentChange > 0 ? "green" : "red",
       // backgroundColor: "rgba(75,192,192,0.2)",
        //borderColor: ""
      },
      {
        label: "Vwap",
        data: vwapDataChart,
        fill: true,
      //  backgroundColor:  "blue",
        borderColor: "blue",
      },
      // {
      //   label: "Diff",
      //   data: diffData,
      //   fill: true,
      //   onoffline : true,
      //   backgroundColor:  "rgba(75,192,192,0.1)",
      //   borderColor: "blue",
        
      // }
     
    ]
  };
  const options = {
    maintainAspectRatio: false,
    legend: {
      display: false
    }
  } 

  return (
    <div className="App">
      <Line data={chartData} options={options} />
      
    </div>
  );
}
