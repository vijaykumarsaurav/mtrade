import React, { useEffect } from 'react';
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

import LineChart from "./LineChart";
import LightChartCom from './LightChartCom';

import Test from './Test';

import TextField from "@material-ui/core/TextField";
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
    data: [],
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
      <Button variant="outlined" id="showLightCandleChart" color="primary" style={{ display: "none" }} onClick={handleClickOpen}>
        Chart
      </Button>
      <Dialog maxWidth={'lg'} onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose} style={{color : props.LightChartData.InstrumentLTP  && props.LightChartData.InstrumentLTP.change > 0 ? "green" : "red" }}>
          {props.LightChartData.selectedSymbol}  {props.LightChartData.InstrumentLTP && props.LightChartData.InstrumentLTP.ltp}    ({props.LightChartData.InstrumentLTP  && props.LightChartData.InstrumentLTP.change.toFixed(2)}%) 
          <br />


        </DialogTitle>
        <DialogContent dividers id="chart">

        <Grid style={{ display: "visible" }} spacing={1} direction="row" alignItems="center" container>

          <br />

          {props.LightChartData && props.LightChartData.InstrumentLTP ?
            <Grid item xs={12} sm={3} style={{ background: "#00000014" }} >

              <div style={{ background: '#bdbdbd' }}>
                <b>  Daily: {props.LightChartData.selectedSymbol}</b> <br />

                <span title="20SMA" item xs={12} sm={12} style={{ color: props.LightChartData.InstrumentLTP.ltp > props.LightChartData.DailyBulishStatus ? "green" : "red", fontWeight: "bold" }}>
                  Daily Avg Price: {props.LightChartData.DailyBulishStatus && props.LightChartData.DailyBulishStatus.toFixed(0)} {props.LightChartData.DailyBulishStatus ? props.LightChartData.InstrumentLTP.ltp > props.LightChartData.DailyBulishStatus ? "BUY" : "SELL" : ""}
                </span><br />


                <span title="averge of showed candle volume" item xs={12} sm={12}>
                  <b>Daily Avg Volume:</b>  {(props.LightChartData.dailyAvgValume / 100000).toFixed(2)}L
                </span><br />
                <span title="averge of showed candle volume" item xs={12} sm={12}>
                  {props.LightChartData.todayCurrentVolume > props.LightChartData.dailyAvgValume ? <b title="if cossed avg volume then its green" style={{ color: "green" }}>Today Volume: {(props.LightChartData.todayCurrentVolume / 100000).toFixed(2)}L </b> : "Today Volume:" + (props.LightChartData.todayCurrentVolume / 100000).toFixed(2) + "L"}
                </span>
              </div>
              <br />



              <b>  Intraday: {props.LightChartData.timeFrame} : {props.LightChartData.tradingsymbol}</b> <br />
              {props.LightChartData.bblastValue ? <span item xs={12} sm={12} >

                <span title="Green color mean price running above upper bb band" style={{ color: props.LightChartData.InstrumentLTP.ltp >= props.LightChartData.bblastValue.upper ? "green" : "", fontWeight: "bold" }}>BB Upper: {props.LightChartData.bblastValue.upper.toFixed(2)}</span><br />
                BB Middle(20 SMA): {props.LightChartData.bblastValue.middle.toFixed(2)}<br />
                <span title="Green red mean price running below lower bb band" style={{ color: props.LightChartData.InstrumentLTP.ltp <= props.LightChartData.bblastValue.lower ? "red" : "", fontWeight: "bold" }}>BB Lower: {props.LightChartData.bblastValue.lower.toFixed(2)}</span><br />
              </span> : ""}

              <span item xs={12} sm={12} style={{ color: props.LightChartData.InstrumentLTP.ltp > props.LightChartData.vwapvalue ? "green" : "red", fontWeight: "bold" }}>
                VWAP:  {props.LightChartData.vwapvalue && props.LightChartData.vwapvalue.toFixed(2)}
              </span>
              <br />
              <b> RSI: </b>{props.LightChartData.rsiValues && props.LightChartData.rsiValues.map((item, j) => (
                item >= 60 ? <span style={{ color: 'green', fontWeight: "bold" }}> {item} &nbsp;</span> : <span style={{ color: item <= 40 ? 'red' : "", fontWeight: "bold" }}> {item} &nbsp;</span>
              ))}


              <br />
              <b>Vol:</b> {props.LightChartData.valumeData && props.LightChartData.valumeData.map((item, j) => (
                <span style={{ color: item > props.LightChartData.dailyAvgValume ? "green" : "", fontWeight: item > props.LightChartData.dailyAvgValume ? "bold" : "" }}> {(item / 100000).toFixed(2)}L &nbsp;</span>
              ))}

              <br />  <br />

            </Grid>
            : ""}



          {/* <Grid item xs={12} sm={9}  >
            <div id="showChartTitle">
            </div>
            <div id="tvchart"></div>
          </Grid> */}


            <Grid item xs={12} sm={9}  >
            {localStorage.getItem('candleChartData') ? <ReactApexChart
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
              data: props.LightChartData.chartStaticData

            }]}
            type="candlestick"
            width={500}
            height={350}
          /> : ""}



            </Grid>


          </Grid>



          {/* <Grid direction="row" style={{ padding: '5px' }} container className="flexGrow" justify="space-between" >
          <Grid item>
             <Button size="small" variant="contained" color="primary" onClick={() => this.handleClick(row, 'BUY', 'buyButtonClicked' )}>BUY</Button> 
          </Grid>

          <Grid item>
            <TextField label="Qty" type="number" name="qtyToTake" value={props.LightChartData.qtyToTake} onChange={this.onChangeQty} />
          </Grid>

          <Grid item >
            <Button size="small" variant="contained" color="Secondary" onClick={() => this.handleClick(row, 'SELL', 'sellButtonClicked')}>SELL</Button> 
          </Grid>
          </Grid> */}

          {/* body data
        <ReactApexChart
              options={props.data && props.data.options}
              series={props.data && props.data.series}
              type="bar"
              width="500"
            /> */}

         


          {/* below line chart 
          {localStorage.getItem('candleChartData') && localStorage.getItem('vwapDataChart') ? <LineChart candleChartData={JSON.parse(localStorage.getItem('candleChartData'))} percentChange={localStorage.getItem('candleChangeShow')} vwapDataChart={JSON.parse(localStorage.getItem('vwapDataChart'))}/>: ""}
          */}
          {/* {props.LightChartData.chartStaticData ? <Test ChartData={props.LightChartData} /> : ""} */}


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