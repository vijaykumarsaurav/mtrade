import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function ColorToggleButton( {switchOrderType}) {
  const [alignment, setAlignment] = React.useState();

  console.log(switchOrderType)

  const handleChange = (event, newAlignment) => {
    setAlignment(newAlignment);

    console.log('alignment', alignment)
  };

  return (
    <ToggleButtonGroup
      color="primary"
      value={alignment}
      exclusive
      onChange={handleChange}
    >
      <ToggleButton value="Above">{switchOrderType ? 'SELL' : 'BUY' }  Above</ToggleButton>
      <ToggleButton value="Below">{switchOrderType ? 'SELL' : 'BUY' } Below</ToggleButton>
    </ToggleButtonGroup>
  );
}
