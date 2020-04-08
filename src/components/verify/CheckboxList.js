import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import CommentIcon from '@material-ui/icons/Comment';
import ActivationService from "../service/ActivationService";
import {resolveResponse} from "../../utils/ResponseHandler";


const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function CheckboxList(props) {
  const classes = useStyles();
  const [checked, setChecked] = React.useState([0]);


  // const verifyreasons = props.rejectionReasons; 

  //console.log('rejectionReasons', verifyreasons );

  const handleToggle = value => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    alert(newChecked);
    setChecked(newChecked);
    console.log(newChecked )

  //   props.newcheckbox = newChecked; 
   // this.setState({ newChecked: newChecked });

    //props.selectedReasons =  newChecked; 

  };

  
  return (
    <>
   
    <List className={classes.root}>
      {  props.ListOfRejectReasons ? props.ListOfRejectReasons.map(value => {
        const labelId = `checkbox-list-label-${value}`;
        return (
          <ListItem key={value} role={undefined} dense button onClick={handleToggle(value)}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={checked.indexOf(value) !== -1}
                tabIndex={-1}
                disableRipple
                inputProps={{ 'aria-labelledby': labelId }}
               
              />
            </ListItemIcon>
            <ListItemText id={labelId} primary={`${value}`} />
             
          </ListItem>
        );
      }):null}
    </List>
    </>
  );
}
