import React from 'react';
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
import ChartDialog from './ChartDialog'; 
import EqualizerIcon from '@material-ui/icons/Equalizer';


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


  var foundPatternList = localStorage.getItem('foundPatternList') && JSON.parse(localStorage.getItem('foundPatternList')).reverse(); 
  
  const showCandleChart = (candleData, symbol) => {
    candleData  = candleData && candleData.reverse();
    localStorage.setItem('candleChartData', JSON.stringify(candleData))
    localStorage.setItem('cadleChartSymbol', symbol)
    document.getElementById('showCandleChart').click();
  }

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Patterns ({foundPatternList && foundPatternList.length})
      </Button>
      <ChartDialog />
      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
        Found Patterns
        </DialogTitle>
        <DialogContent dividers>
        <Table stickyHeader aria-label="sticky table"  id="tabledata" size="medium">
        <TableRow variant="head" >
                    
                    <TableCell align="left"><b>Sr.</b></TableCell> 
                    <TableCell align="left"><b>Stock Name</b></TableCell> 
                    <TableCell align="left"><b>Pattern Name</b></TableCell> 
                    <TableCell align="left"><b>Time</b></TableCell> 
                    <TableCell align="left"><b>BuyAt</b></TableCell>
                    <TableCell align="left"><b>SellAt</b></TableCell>

                </TableRow>
                <TableBody>
                    
                        {foundPatternList ? foundPatternList.map((idata, index) => (
                            <TableRow hover key={index}>

                                    <TableCell align="left">{index} </TableCell>
                                    <TableCell align="left"> <Button  variant="contained" style={{ marginLeft: '20px' }} onClick={() => showCandleChart(idata.candleChartData, idata.symbol)}>{idata.symbol} <EqualizerIcon /> </Button></TableCell>
                                    <TableCell align="left" >{idata.pattenName}</TableCell> 
                                    <TableCell align="left" >{idata.time}</TableCell> 
                                    
                                     <TableCell align="left">{idata.BuyAt} </TableCell>
                                     <TableCell align="left">{idata.SellAt}</TableCell>
                                   
                            </TableRow>

                        )):  ""  }

                    </TableBody>


                </Table>    



         
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