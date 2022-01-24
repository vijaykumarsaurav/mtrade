import React from "react";
//import "./styles.css";

import { Line } from "react-chartjs-2";



export default function App( props ) {

 

  // dateTime: "23-06-2021 4:43:02 PM"
  // diff: -298523
  // isDuplicate: true
  // totCEOI: 902038
  // totCEOIChange: "0.000"
  // totCEVol: 15312564
  // totChangeINOICall: 127897
  // totChangeINOIDiff: -107353
  // totChangeINOIPut: 20544
  // totDiffChange: "0.000"
  // totPEOI: 603515
  // totPEOIChange: "0.000"
  // totPEVol: 15418605
  var data =  props.diffData && props.diffData.data;
  var putData = [], callData = [],  timeDate = [],  diffData = []; 

  // var scpage =   Math.floor( props.diffData.scrollcount/10 ) ? Math.floor( props.diffData.scrollcount/10 ) : 1; 

  // var startpage = 0  
  // if(scpage * 10 <  data.length) {
  //   startpage =  scpage * 10;  
  // }   
  // else if (props.diffData.scrollcount > data.length){
  //   startpage =  0; 
  // }



  // console.log('scrollcount', props.diffData.scrollcount); 
  // console.log('startpage', startpage);

  // console.log('charrt data', data);

  //for (let index = startpage; index <  startpage + 10; index++) {
  

  data.reverse();

  for (let index = data.length - 20; index <  data.length; index++) {
    if(data[index]){
      putData.push(data[index].totPEOI); 
      callData.push(data[index].totCEOI); 
      diffData.push(data[index].diff); 
      timeDate.push( data[index].dateTime.substring(19,11)); 
    }
  
  }



  const chartData = {
    labels: timeDate,
    datasets: [
      {
        label: "Put",
        data: putData,
        fill: true,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "green"
      },
      {
        label: "Call",
        data: callData,
        fill: true,
        backgroundColor:  "rgba(75,192,192,0.1)",
        borderColor: "red",
        
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
    maintainAspectRatio: true,	// Don't maintain w/h ratio
  } 

  return (
    <div >
      <Line data={chartData} options={options} />
    </div>
  );
}
