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



 // console.log('props.rejectionReasons', props);

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


  };

   var verifyreasons = ["Customer - Rejection reason 1","Customer - Rejection reason 2","Customer - Rejection reason 3","Customer - Rejection reason 4","Customer - Rejection reason 5"]
  // const userDetails = JSON.parse(localStorage.getItem("userDetails")); 
  // console.log("Role", userDetails.roleCode);
  // ActivationService.getStaticData(userDetails.roleCode).then(res => {
  //     let data = resolveResponse(res);
  //     console.log("Static Data vks", data.result.rejectionReasons);
  //     verifyreasons  =  data.result.rejectionReasons; 
  // })
  
  return (
    <>
   
    <List className={classes.root}>
      {  verifyreasons.map(value => {
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
      })}
    </List>
    </>
  );
}
