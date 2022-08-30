import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function MenuAppBar() {
  const classes = useStyles();
  const [isTrailing, setIsTrailing] = React.useState(localStorage.getItem('isTrailing') == 'true' ? true : false);

  const handleChange = (event) => {
    setIsTrailing(event.target.checked);
    localStorage.setItem('isTrailing', event.target.checked);
  };


  return (
    <div className={classes.root}>
      <FormGroup>
        <FormControlLabel
          control={<Switch checked={isTrailing} onChange={handleChange} aria-label="Trailing switch" />}
          label={localStorage.getItem('isTrailing') == 'true' ? 'Trailing ON ' + localStorage.getItem('isTrailing')  : 'Trailing OFF '+ localStorage.getItem('isTrailing')} 
        /> 
      </FormGroup>
   
    </div>
  );
}
