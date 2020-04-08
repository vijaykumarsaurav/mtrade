import 'date-fns';
import React from 'react';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
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
    console.log(date,"SELECTED_DATE")
    setSelectedStartDate(date);
    props.callbackFromParent.myCallback(date,"START_DATE");
  };
  const handleEndDateChange = date => {
    console.log(date,"SELECTED_DATE")
    setSelectedEndDate(date);
    props.callbackFromParent.myCallback(date,"END_DATE");
  };

  console.log(props)
 return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Grid container justify="space-around">
     
        <KeyboardDatePicker
          margin="normal"
          id="date-picker-dialog"
          label="Start Date"
          format="dd/MM/yyyy"
          value={props.callbackFromParent.startDate? props.callbackFromParent.startDate : selectedStartDate}
          onChange={handleStartDateChange}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
        <KeyboardDatePicker
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
