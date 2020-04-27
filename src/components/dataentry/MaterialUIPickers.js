import 'date-fns';
import React from 'react';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
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
  //console.log("startDatestartDate,",props ); 
  var requiredDate ='';
  // The first commit of Material-UI
  var [selectedStartDate, setSelectedStartDate] = React.useState(new Date());
  var [selectedEndDate, setSelectedEndDate] = React.useState(new Date());
  const handleStartDateChange = date => {
     
     setSelectedStartDate(date);
    props.callbackFromParent.myCallback(date,"START_DATE");

  };
  const handleEndDateChange = date => {
   // console.log(date,"SELECTED_DATE")
    setSelectedEndDate(date);
    props.callbackFromParent.myCallback(date,"END_DATE");
  };

  //console.log(props)

  // var date = new Date(); 
  // date.getMonth() - 6; 

  
  //  var dateObj = new Date(selectedStartDate);

  

  //  var requiredDate = dateObj.setMonth(dateObj.getMonth() + 6);


  // var currDate = new Date();
  // var back18Month= currDate.setMonth(currDate.getMonth() - 18);
  // console.log(new Date(back18Month),"back18Month");

  // if(selectedStartDate <  back18Month){
  //   selectedStartDate = back18Month;
  // }

  // if(selectedEndDate <  selectedStartDate){
  //   selectedEndDate = requiredDate;
  // }

  // if(requiredDate > new Date() ) {
  //   requiredDate = new Date();
  // }
  var date15Years = new Date(); 
      date15Years.setFullYear( date15Years.getFullYear() - 15 );
    //  selectedStartDate =  date;
 // var requiredDate = selectedStartDate.setMonth(selectedStartDate.getMonth() + 6)

//  console.log("selectedStartDate",selectedStartDate, new Date()); 
//  if(selectedStartDate != new Date()){
//   selectedStartDate = null; 
//  }


var today = new Date();
if(selectedStartDate && selectedStartDate.getDate() == today.getDate() && selectedStartDate.getFullYear() == today.getFullYear() && selectedStartDate.getMonth() == today.getMonth()){
  setSelectedStartDate(null);
}

if(!props.callbackFromParent.startDate){
  selectedStartDate = null;
}


 return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Grid container justify="space-around">
     
        <KeyboardDatePicker
        required={true}
        //  emptyLabel=""
          margin="normal"
          //readOnly="true"
          // disabled="true"
          disableFuture="true"
         // autoOk={false}
          allowKeyboardControl="true"
          maxDate={date15Years}
         // minDate={back18Month}
         // minDateMessage="Only 18 months back report can be fatch."
          id="date-picker-dialog"
          label="Date of Birth"
          format="dd/MM/yyyy"
          value={ selectedStartDate }
         // value={selectedStartDate}
          onChange={handleStartDateChange}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
        {/* <KeyboardDatePicker
      
          disableFuture="true"
          maxDateMessage="Max allowed date range is 6 months."
          minDateMessage="End date can't be less than start date."
          minDate={selectedStartDate}
          maxDate={requiredDate}
          margin="normal"
          id="date-picker-dialog"
          label="End Date"
          format="dd/MM/yyyy"
          value={selectedEndDate}
          onChange={handleEndDateChange}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        /> */}
       
      </Grid>
    </MuiPickersUtilsProvider>
  );
}
