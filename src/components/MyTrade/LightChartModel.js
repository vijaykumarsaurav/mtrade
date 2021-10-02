import React, {useEffect} from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import ReactApexChart from "react-apexcharts";
import { data } from 'jquery';

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import LineChart from "./LineChart";
import LightChartCom from "./LightChartCom";



const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

export default function CustomizedDialogs(props) {

  var lightChartData = props.chartData.chartStaticData; //localStorage.getItem('lightChartData') && JSON.parse(localStorage.getItem('lightChartData'));
 
  console.log('lightChartData', lightChartData); 

  const [open, setOpen] = React.useState(false);
 
  var [values, setValues] = React.useState({
    data : [],
    candledata: {},
    timeFrame: "FIVE_MINUTE"
})


  const handleTimeFrame = (e) => {
    console.log(e.target.value);
    props.chartData.updateTimeFrameChart(lightChartData.token,e.target.value );

    setValues({timeFrame: e.target.value}); 
  };
 

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };


  return (
    <div>
      <Button variant="outlined" id="showLightChart" color="primary" style={{display:"none"}} onClick={handleClickOpen}>
        Chart 
      </Button>
      <Dialog maxWidth={'lg'} onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
      

{/* 
        <FormControl style={{minWidth: '10%', }} >
            <Select value={values.timeFrame} name="timeFrame" onChange={handleTimeFrame}>
                <MenuItem value={'ONE_MINUTE'}>{'1M'}</MenuItem>
                <MenuItem value={'FIVE_MINUTE'}>{'5M'}</MenuItem>
                <MenuItem value={'TEN_MINUTE'}>{'10M'}</MenuItem>
                <MenuItem value={'FIFTEEN_MINUTE'}>{'15M'}</MenuItem>
                <MenuItem value={'THIRTY_MINUTE'}>{'30M'}</MenuItem>
                <MenuItem value={'ONE_HOUR'}>{'1H'}</MenuItem>
                <MenuItem value={'ONE_DAY'}>{'1D'}</MenuItem>
            </Select>
        </FormControl> */}

        &nbsp;
         
        {lightChartData.name}   {lightChartData.ltp}  ({lightChartData.change}%)

        
        </DialogTitle>
        <DialogContent dividers id="chart">

         

        <LightChartCom chartData={{candleSeries:lightChartData.lightChartData, volumeSeries: lightChartData.volumeSeriesData}}/>
       


        </DialogContent>
        <DialogActions>


       

          <Button autoFocus onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}