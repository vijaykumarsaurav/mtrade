import 'date-fns';
import React from 'react';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import $ from 'jquery';

import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

function addMonths(date, months) {
  var d = date.getDate();
  date.setMonth(date.getMonth() + +months);
  if (date.getDate() != d) {
    date.setDate(0);
  }
  return date;
}

export default function MaterialUIPickers(props) {
  var maxAllowedDate ='';
  var startd = new Date(); 
  startd.setHours(0,0,0,0);
  var endd = new Date(); 
  endd.setHours(23,59,59,59);

  // The first commit of Material-UI
  var [selectedStartDate, setSelectedStartDate] = React.useState(startd);
  var [selectedEndDate, setSelectedEndDate] = React.useState(endd);
  const handleStartDateChange = date => {
    setSelectedStartDate(date);
    props.callbackFromParent.myCallback(date,"START_DATE");
  };
  const handleEndDateChange = date => {
    setSelectedEndDate(date);
    props.callbackFromParent.myCallback(date,"END_DATE");
  };

  const showSingleDate =  props.callbackFromParent && props.callbackFromParent.showSingleDate; 
  const d1DateRangeFlag =  props.callbackFromParent && props.callbackFromParent.d1DateRangeFlag; 


  if(!selectedStartDate){
    selectedStartDate = new Date().getTime();
  }
  

  var dateObj = new Date(selectedStartDate);
  dateObj.setMonth(dateObj.getMonth() + 6);

  var maxAllowedDate = dateObj.setDate(dateObj.getDate() - 1);


  var currDate = new Date();
  var back18Month= currDate.setMonth(currDate.getMonth() - 18);


  if(selectedStartDate <  back18Month){
    selectedStartDate = back18Month;
  }

  if(selectedStartDate >  selectedEndDate){
    selectedEndDate = new Date().getTime();
  }


  var d = new Date();
  if(showSingleDate){
    maxAllowedDate = d.setDate(d.getDate()-1);
  }

  if(d1DateRangeFlag){
    maxAllowedDate = d.setDate(d.getDate()-1);
  }

  if(showSingleDate && selectedStartDate.getDate() == new Date().getDate()){
    selectedStartDate = d;
  }


  if(d1DateRangeFlag && selectedStartDate.getDate() == new Date().getDate()){
    selectedStartDate = d;
  }

  if(d1DateRangeFlag && selectedEndDate.getDate() == new Date().getDate()){
    selectedEndDate = d;
  }

 $('.MuiInputBase-inputAdornedEnd').prop('readonly', true);

 return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Grid container justify="space-around">
     
        <KeyboardDatePicker
          disabled={props.callbackFromParent && props.callbackFromParent.generateReportLoader}
          margin="normal"
          //readOnly="true"
          // disabled="true"
          disableFuture="true"
          allowKeyboardControl="true"
          minDate={back18Month}
          minDateMessage="Only 18 months back report can be fatch."
          maxDate={maxAllowedDate}
          maxDateMessage="Current date report won't be available"
          id="date-picker-dialog"
          label={ showSingleDate ? "Select Verification Date" :  "Start Date" }
          format="dd/MM/yyyy"
          value={selectedStartDate ? selectedStartDate : maxAllowedDate}
          onChange={handleStartDateChange}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
        { !showSingleDate ? <KeyboardDatePicker
          disableFuture="true"
          disabled={props.callbackFromParent && props.callbackFromParent.generateReportLoader}
          maxDateMessage="Max allowed date range is 6 months."
      //    minDateMessage="End date can't be less than start date."
          minDate={selectedStartDate}
          maxDate={maxAllowedDate}
          margin="normal"
          id="date-picker-dialog"
          label="End Date"
          format="dd/MM/yyyy"
          value={selectedEndDate ? selectedEndDate : maxAllowedDate}
          onChange={handleEndDateChange}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }} 
        />: ""}
          
       
      </Grid>
    </MuiPickersUtilsProvider>
  );
}
