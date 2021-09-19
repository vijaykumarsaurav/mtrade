import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
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

  var data = props.data; 

  console.log("props", props); 


  return (
    <div className={classes.root}>
      <ExpansionPanel defaultExpanded={data.title == "Average Volume Crossed" ? true : false} >
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography> {data.title} ({data.list.length})</Typography>

        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
        

          <div style={{ overflowY: 'scroll', width:"100%", height: "50vh" }}>
              {data && data.list.length ? data.list.map((row, i)  => (
                  <>
                      {row ? <ListItem  button style={{ fontSize: '12px', padding: '0px', paddingLeft: '5px', paddingRight: '5px' }}  >
                          <ListItemText style={{ color: !row.nc || row.nc == 0 ? "" : row.nc > 0 ? '#20d020' : "#e66e6e"}} onClick={() => data.LoadSymbolDetails(row.symbol)} primary={row.symbol} /> {row.ltp} ({row.nc}%)
                      </ListItem> : ""}
                      
                  </>
              )) : ''}
          </div>

         
        </ExpansionPanelDetails>
      </ExpansionPanel>
     
    </div>
  );
}
