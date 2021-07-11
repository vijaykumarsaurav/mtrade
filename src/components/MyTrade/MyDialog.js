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


  //var indexSymbolData = JSON.parse(localStorage.getItem(props.data.indexSymbol)).data ; 

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        {props.data.indexSymbol}
      </Button>
      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
        {props.data.indexSymbol}  At {props.data.timestamp}
        </DialogTitle>
        <DialogContent dividers>
        <Table stickyHeader aria-label="sticky table"  id="tabledata" size="medium">
        <TableRow variant="head" >
                    
                    <TableCell align="left"><b>Sr.</b></TableCell> 
                    <TableCell align="left"><b>Stock Name</b></TableCell> 
                    <TableCell align="left"><b>Last Price</b></TableCell> 
                    <TableCell align="left"><b>CHNG%</b></TableCell> 
                    <TableCell align="left"><b>Change Points</b></TableCell>

                </TableRow>
                <TableBody>
                    
                        {props.data.indexSymbolData ? props.data.indexSymbolData.map((idata, index) => (
                            <TableRow hover key={index}>

                            {index !== 0 ? <>
                                   <TableCell align="left">{index} </TableCell>
                                    <TableCell align="left">{idata.symbol}</TableCell>
                                    <TableCell align="left" >{idata.lastPrice}</TableCell> 
                                     <TableCell align="left">{idata.pChange > 0 ?  <span style={{ color:'green', fontWeight:'bold' }} >{idata.pChange}%</span>: idata.pChange === 0 ? <span>{idata.pChange}%</span> : <span style={{ color:'red',fontWeight:'bold'}} >{idata.pChange}%</span>} </TableCell>
                                     <TableCell align="left">{idata.change}</TableCell>
                                 
                                </>
                           : "" } 
                                   
                            </TableRow>

                        )):      
                         <> <br/> <Button  variant="outlined" size={'large'}   color="primary">
                            Refresh
                        </Button> </>}

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