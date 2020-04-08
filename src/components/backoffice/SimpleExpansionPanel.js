import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';


const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

export default function SimpleExpansionPanel(props) {
  const classes = useStyles();

  var message = props.message; 

  console.log(message);
  // var list =[]; 
   

  // for(var i=0; i < message.length; i++){
  //   list.push( <p> <ListItem component='a'><ListItemText primary={message[i].laId +' | '+ message[i].reason} /></ListItem></p> );

  // }


  return (
    <div className={classes.root}>
      <ExpansionPanel>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography className={classes.heading}>Response</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
        

        <table style={{width: "none"}}>
        <TableHead>
          <TableRow>
            <TableCell>LaId</TableCell>
            <TableCell>Reason</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {message && message.map(row => (
            <TableRow key={row.name}>
              <TableCell align="right">{row.laId}</TableCell>
              <TableCell align="right">{row.reason}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </table>
           
           {/* {list} */}
           {/* <ListItem button component='a' href={"/#/offerupload"} >
            <ListItemText primary="Offer Upload" />
          </ListItem> */}

         
         
        </ExpansionPanelDetails>
      </ExpansionPanel>
     
    </div>
  );
}
