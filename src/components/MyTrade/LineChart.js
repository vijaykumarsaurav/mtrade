import React from "react";
//import "./styles.css";

import { Line } from "react-chartjs-2";



export default function App( props ) {


  var candleChartData =  props.candleChartData; 
  var closeData = [], timeDate = []; 

  if(candleChartData){
    for (let index = 0; index < candleChartData.length; index++) {
      if(candleChartData[index]){
        closeData.push(candleChartData[index][4]); 
        timeDate.push(candleChartData[index][0].substring(19,11)); 
      }
    
    }
  }

  

  const chartData = {
    labels: timeDate,
    datasets: [
      {
        label: "Line chart",
        data: closeData,
        fill: false,
       // backgroundColor: "rgba(75,192,192,0.2)",
        //borderColor: ""
      },
      // {
      //   label: "Call",
      //   data: callData,
      //   fill: true,
      //   backgroundColor:  "rgba(75,192,192,0.1)",
      //   borderColor: "red",
        
      // },
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
    maintainAspectRatio: false,	// Don't maintain w/h ratio
  } 

  return (
    <div className="App">
      <Line data={chartData} options={options} />
    </div>
  );
}
