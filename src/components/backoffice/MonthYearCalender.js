
import React, { Fragment, useState } from "react";
import DateFnsUtils from '@date-io/date-fns';
import {MuiPickersUtilsProvider , DatePicker} from "@material-ui/pickers";

function BasicDateTimePicker(props) {
 
  const [selectedDate,setSelectedStartDate ] = useState(new Date()); 

  const onChangeHandleDateChange = date => {
    setSelectedStartDate(date);
    props.calParams.myCallback(date);
  };



  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>

   
    <DatePicker
        disablePast="true"
        openTo="month"
        views={["year", "month"]}
        label={'Select Year and Month'}
       // helperText="Start from year selection"
       // inputVariant="outlined"
        value={selectedDate}
        onChange={onChangeHandleDateChange}
      />

    </MuiPickersUtilsProvider>
  );
}

export default BasicDateTimePicker;