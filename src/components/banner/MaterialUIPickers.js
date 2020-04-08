import 'date-fns';
import React from 'react';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import Notify from "../../utils/Notify";

import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

export default function MaterialUIPickers(props) {

  console.log("startDatestartDate,",props ); 

  // The first commit of Material-UI
  const [selectedStartDate, setSelectedStartDate] = React.useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = React.useState(new Date());
  const handleStartDateChange = date => {
    setSelectedStartDate(date);
    props.callbackFromParent.myCallback(date,"START_DATE");

    var startDateMili = new Date(date).getTime(); 
    document.getElementById("startDateMili").value = startDateMili; 
    var endDateMili = document.getElementById("endDateMili").value; 

    if(startDateMili > endDateMili  ){
      Notify.showError("Start Date can't be grater than end date.");
    }


  };
  const handleEndDateChange = date => {
    setSelectedEndDate(date);
    props.callbackFromParent.myCallback(date,"END_DATE");
    var endDateMili = new Date(date).getTime(); 
    document.getElementById("endDateMili").value = endDateMili; 

   var startDateMili = document.getElementById("startDateMili").value; 
   if(endDateMili  < startDateMili){
      Notify.showError("End Date can't be less than start date.");
    }
   
  };


  console.log(props)
 return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Grid container justify="space-around">
     
        <KeyboardDatePicker
          disablePast="true"
          margin="normal"
          id="date-picker-dialog"
          label="Publish Date"
          format="dd/MM/yyyy"
          value={props.callbackFromParent.startDate? props.callbackFromParent.startDate : selectedStartDate}
          onChange={handleStartDateChange}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
        <KeyboardDatePicker
          disablePast="true"
          margin="normal"
          id="date-picker-dialog"
          label="End Date"
          format="dd/MM/yyyy"
          value={props.callbackFromParent.endDate?props.callbackFromParent.endDate:selectedEndDate}
          onChange={handleEndDateChange}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
       
      </Grid>
    </MuiPickersUtilsProvider>
  );
}
