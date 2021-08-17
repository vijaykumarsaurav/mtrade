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
import Grid from '@material-ui/core/Grid';


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


  
  var multipleChartData = localStorage.getItem("multipleChartData") && JSON.parse(localStorage.getItem("multipleChartData")); 
  
  var longs = multipleChartData && multipleChartData.longCandles; 
  var shorts = multipleChartData && multipleChartData.shortCandles; 

   
  
  return (
    <div>
      <Button variant="outlined" id="showMultipleChart" color="primary" style={{display:"none"}} onClick={handleClickOpen}>
        Chart 
      </Button>
      <Dialog maxWidth="lg" onClose={handleClose} aria-labelledby="customized-dialog-title" open={open} >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
        {multipleChartData && multipleChartData.symbol} 
      {/*   <br />

        <span style={{fontSize:'12px'}}>  
        <b>FoundAt:</b>  {localStorage.getItem('chartInfoDetails') && JSON.parse(localStorage.getItem('chartInfoDetails')).foundAt.substr(0, 16)} &nbsp;&nbsp;
        <b>Buy: </b>{localStorage.getItem('chartInfoDetails') && JSON.parse(localStorage.getItem('chartInfoDetails')).buyExitPrice} &nbsp;&nbsp;
        <b>Sell: </b>{localStorage.getItem('chartInfoDetails') && JSON.parse(localStorage.getItem('chartInfoDetails')).sellEntyPrice} &nbsp;&nbsp;
        <b>Change %: </b>  {localStorage.getItem('chartInfoDetails') && JSON.parse(localStorage.getItem('chartInfoDetails')).perChange} &nbsp;&nbsp;    <br />
        <b>Change on High/Low %: </b>{localStorage.getItem('chartInfoDetails') && JSON.parse(localStorage.getItem('chartInfoDetails')).perChange} &nbsp;&nbsp;
        <b>SquareOffAt:</b>{localStorage.getItem('chartInfoDetails') && JSON.parse(localStorage.getItem('chartInfoDetails')).squareOffAt}
        </span> */}
      
        </DialogTitle>
        <DialogContent dividers>

        {/* body data
        <ReactApexChart
              options={props.data && props.data.options}
              series={props.data && props.data.series}
              type="bar"
              width="500"
            /> */}

              <Typography component="h3" variant="h6" color="primary" gutterBottom>
                      Longs ({longs && longs.length}) 
              </Typography> 

              <Grid justify="space-between" container direction="row">

                {longs ? longs.map((row, i) => (
                        <Grid item  >
                        <ReactApexChart 
                              options={{
                                        chart: {
                                          type: 'candlestick',
                                          height: 250
                                        },
                                        title: {
                                            text: row.foundAt.substr(6, 10),
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
                                      data:  row.candleChartData.reverse()
                                        
                                    }]} 
                                    type="candlestick" 
                                    width={250}
                                    height={250} 
                            />

                        </Grid>

                )) : ""}
                             
                              
                              
                </Grid>


                <Typography component="h3" variant="h6" color="primary" gutterBottom>
                      Shorts ({shorts && shorts.length}) 
              </Typography> 

              <Grid justify="space-between" container direction="row">

                {shorts ? shorts.map((row, i) => (
                        <Grid item  >
                        <ReactApexChart 
                              options={{
                                        chart: {
                                          type: 'candlestick',
                                          height: 250
                                        },
                                        title: {
                                            text: row.foundAt.substr(6, 10),
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
                                      data:  row.candleChartData.reverse()
                                        
                                    }]} 
                                    type="candlestick" 
                                    width={250}
                                    height={250} 
                            />

                        </Grid>

                )) : ""}
                             
                              
                              
                </Grid>

       
          

    
         
         
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