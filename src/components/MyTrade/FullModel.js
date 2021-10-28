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

import LineChart from "./LineChart";
import LightChartCom from "./LightChartCom";
import DeliveryData from "./DeliveryData";
import IndexCharts from "./IndexCharts";



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


  //console.log('props.indexName',props)
 

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };


  return (
    <div>
      <Button variant="outlined" id="fullModelId" color="primary" style={{display:"none"}} onClick={handleClickOpen}>
        Chart 
      </Button>
      <Dialog fullScreen onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose} onClick={handleClose}>
        <Button fullWidth={true} autoFocus onClick={handleClose} color="primary">
            {localStorage.getItem('clickedIndexName') } {localStorage.getItem('clickedIndexType')}
         </Button>
        
         
        </DialogTitle>
        <DialogContent dividers id="chart">

            {localStorage.getItem('clickedIndexType') == 'Charts' ?  <IndexCharts /> : <DeliveryData /> }
            
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