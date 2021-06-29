import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import { PRODUCT_API_BASE_URL } from '../../utils/config';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tooltip from "@material-ui/core/Tooltip";
import TextField from '@material-ui/core/TextField';


// import TabPannel from "./TabPannel";


import $ from "jquery";

import Divider from '@material-ui/core/Divider';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AlertDialogSlide( props) {
  const [open, setOpen] = React.useState(false);


  //var followupsData = props.followupsData; 

  const [values, setValues] = React.useState({
    followupsDataSubmit : '', 
    followupsData : "",
    followupsDataAll: ""
  });

  
  var deskNumber = ''; 

  const handleChange = (e) => {
    deskNumber = e.target.value ; 
  };


  const handleClickOpen = () => {
    
    window.localStorage.setItem("todayFollowFirstTime", 'yes'); 
    window.localStorage.setItem("allFollowFirstTime", 'yes'); 

    setOpen(true);

    $('#full-width-tab-0').click();

  };


  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>

      {/* <a id="storePopId" variant="default" alt="click to show more details" color="primary" onClick={handleClickOpen}></a> */}

      <Button variant="contained" onClick={handleClickOpen}>New Order</Button> 
    
      <Dialog
     //  ref={props.dialogRef.DialogStoreRef} {...setOpen}
        open={open}
      //  TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
      //  disableBackdropClick={true}
     //   disableEscapeKeyDown={true}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
     //   maxWidth="md"
        fullWidth={true}
      >
       
        <DialogTitle id="alert-dialog-slide-title" style={{background: "lightgray", padding:"0px"}}> 

            <Grid
                  justify="space-between"
                  container 
                 >
                <Grid item>
                    <div style={{padding: "14px"}}> 
                        <Typography>New Order</Typography> 
                    </div>
                </Grid>
                <Grid item>
                  <div style={{padding: "14px"}}> 
                      <Button variant="contained" style={{background:"#c5809f"}} size={"small"} onClick={handleClose} >Close</Button>
                  </div>
                </Grid>
            </Grid>
        
        </DialogTitle>

        <DialogContent style={{padding:"0px"}}>

        {/* <TabPannel followupsData={values.followupsData} followupsDataAll={values.followupsDataAll}   /> */}

        <div id="testfollow" > 
        
        {/* {values.followupsData && values.followupsData.length == 0 ?  <Typography> No followups found as of now!!!</Typography>  : ""} */}

        {/* {values.followupsData ? values.followupsData.map(followData => (
           <AccordionFollowups followData={followData} /> 
        )):  ""} */}


          </div>
        </DialogContent>
        <DialogActions>
        
          
        </DialogActions>
      </Dialog>
    </div>
  );
}
