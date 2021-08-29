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


 
  const [open, setOpen] = React.useState(false);
 
  var [values, setValues] = React.useState({
    data : [],
    candledata: {}
})


 

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

   
  
  return (
    <div>
      <Button variant="outlined" id="showCandleChart" color="primary" style={{display:"visible"}} onClick={handleClickOpen}>
        Chart 
      </Button>
      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
        {localStorage.getItem('cadleChartSymbol')}   {localStorage.getItem('candlePriceShow')}  ({localStorage.getItem('candleChangeShow')}%)
        <br />

        {localStorage.getItem('chartInfoDetails') ? <span style={{fontSize:'12px'}}>  
        <b>FoundAt:</b>  {localStorage.getItem('chartInfoDetails') && JSON.parse(localStorage.getItem('chartInfoDetails')).foundAt.substr(0, 16)} &nbsp;&nbsp;
        <b>Buy: </b>{localStorage.getItem('chartInfoDetails') && JSON.parse(localStorage.getItem('chartInfoDetails')).buyExitPrice} &nbsp;&nbsp;
        <b>Sell: </b>{localStorage.getItem('chartInfoDetails') && JSON.parse(localStorage.getItem('chartInfoDetails')).sellEntyPrice} &nbsp;&nbsp;
        <b>Change %: </b>  {localStorage.getItem('chartInfoDetails') && JSON.parse(localStorage.getItem('chartInfoDetails')).perChange} &nbsp;&nbsp;    <br />
        <b>Change on High/Low %: </b>{localStorage.getItem('chartInfoDetails') && JSON.parse(localStorage.getItem('chartInfoDetails')).perChange} &nbsp;&nbsp;
        <b>SquareOffAt:</b>{localStorage.getItem('chartInfoDetails') && JSON.parse(localStorage.getItem('chartInfoDetails')).squareOffAt}
        </span> : ""}
        
      
        </DialogTitle>
        <DialogContent dividers id="chart">

        {/* body data
        <ReactApexChart
              options={props.data && props.data.options}
              series={props.data && props.data.series}
              type="bar"
              width="500"
            /> */}

        <ReactApexChart 
            options={{
                      chart: {
                        type: 'candlestick',
                        height: 350
                      },
                      title: {
                          text: '',
                          align: 'left'
                      },
                      xaxis: {
                          type: 'datetime',
                      },
                      yaxis: {
                          tooltip: {
                          enabled: true
                          }
                      }
                  }}
                  series={[{
                    data:  localStorage.getItem('candleChartData') && JSON.parse(localStorage.getItem('candleChartData'))
                      
                  }]} 
                  type="candlestick" 
                  width={500}
                  height={350} 
          />


                  { localStorage.getItem('candleChartDataInside') ? <ReactApexChart 
                    options={{
                              chart: {
                                type: 'candlestick',
                                height: 350
                              },
                              title: {
                                  text: '',
                                  align: 'left'
                              },
                              xaxis: {
                                  type: 'datetime',
                              },
                              yaxis: {
                                  tooltip: {
                                  enabled: true
                                  }
                              }
                          }}
                          series={[{
                            data:  localStorage.getItem('candleChartDataInside') && JSON.parse(localStorage.getItem('candleChartDataInside'))
                              
                          }]} 
                  type="candlestick" 
                  width={500}
                  height={350} 
          />: ""}
          



    
         
         
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