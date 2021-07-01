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
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from "@material-ui/core/TextField";

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
  selectStyle:{
    minWidth: '100%',
    marginBottom: '10px'
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

export default function CustomizedDialogs( props ) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button  variant="outlined"  id="showPopup" color="primary" onClick={handleClickOpen}>
        Open dialog
      </Button>
      <Dialog   
        disableBackdropClick={true}
        disableEscapeKeyDown={true} 
        onClose={handleClose} 
        aria-labelledby="customized-dialog-title" 
        open={open}
        
        >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
         
        </DialogTitle>
        
        <DialogContent dividers>
          <Typography gutterBottom>
            Modify
          </Typography>
          <Grid  container spacing={1}  direction="row" alignItems="center" container>


              <Grid item xs={12} sm={4}>
                      <FormControl style={styles.selectStyle}>
                        <InputLabel  htmlFor="gender">Order Type</InputLabel>
                        <Select value={''}  name="producttype" onChange={props.dialogAction.onChange}>
                            <MenuItem value={"INTRADAY"}>INTRADAY</MenuItem>
                            <MenuItem value={"DELIVERY"}>DELIVERY</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={10} sm={1}> 
                    <TextField  id="buyPrice"  label="Buy Price"  value={''}   name="buyPrice" onChange={props.dialogAction.onChange}/>
                </Grid>
                <Grid item xs={10} sm={1}> 
                    <TextField  id="quantity"  label="Qty"  value={''}   name="quantity" onChange={props.dialogAction.onChange}/>
                </Grid>
                <Grid item xs={10} sm={1}> 
                    <TextField  id="stoploss"  label="SL"  value={''}   name="stoploss" onChange={props.dialogAction.onChange}/>
                </Grid>
            
            
                  <Grid item xs={1} sm={2}  > 
                  
                      <Button variant="contained" color="secondary" style={{marginLeft: '20px'}} >Modify</Button> 
                    </Grid>
            </Grid>
         
          
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            Check Other Number
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}