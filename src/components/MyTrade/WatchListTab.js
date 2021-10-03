import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Paper from '@material-ui/core/Paper';
import TextField from "@material-ui/core/TextField";
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import "./ViewStyle.css";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs(props) {

  console.log("props.data;", props.data)
  const { cursor, onSelectItem, autoSearchList, LoadSymbolDetails, symbolList, onChange, onChangeWatchlist, search, handleKeyDown, selectedWatchlist, totalWatchlist } = props.data;
  const [value, setValue] = React.useState(0);

  var [values, setValues] = React.useState({
    searchedSymbolList: symbolList, 
    gainerList : localStorage.getItem('gainerList') && JSON.parse(localStorage.getItem('gainerList')) || [],
    looserList : localStorage.getItem('looserList') && JSON.parse(localStorage.getItem('looserList')) || [],    
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const filterWatchlistBySearch = (e) => {

    console.log("e.target.value", e.target.value);
    if (!e.target.value) {
      setValue({ searchedSymbolList: symbolList });
    } else {

      // var foundLive = this.state.listofItem.filter(row => row == e.target.value );
      // this.setState({ [e.target.name]: e.target.value }); 
      // this.setState({searchedList: foundLive})        

      let matchList = [];
      for (let i = 0; i < symbolList.length; i++) {
        let stock = symbolList[i];
        if (stock && stock.name.includes(e.target.value)) {
          matchList.push(stock);
        }
      }
      setValue({ searchedSymbolList: matchList });
    }
  }

  //var gainerList = localStorage.getItem('gainerList') && JSON.parse(localStorage.getItem('gainerList')) || []; 

  
  return (
    <Box sx={{ width: '100%'}}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" style={{overflowY: 'scroll'}}>
          <Tab label="My WL" {...a11yProps(0)} />
          <Tab label={values.gainerList && values.gainerList.length + " Gainner"} {...a11yProps(1)} />
          <Tab  label={values.looserList && values.looserList.length + " Looser"} {...a11yProps(2)} />
          <Tab label="Fevrate" {...a11yProps(3)} />
          
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>


        <div style={{ marginLeft: '5px' }}>
          <FormControl style={{ width: "100%" }} >
            <InputLabel htmlFor="gender">Select Watchlist</InputLabel>
            <Select value={selectedWatchlist} name="selectedWatchlist" onChange={onChangeWatchlist}>
              <MenuItem value={"selectall"}>{"Select All"}</MenuItem>

              {totalWatchlist && totalWatchlist.map(element => (
                <MenuItem value={element}>{element}</MenuItem>
              ))
              }

            </Select>
          </FormControl>


          <TextField
            style={{ width: "100%" }}
           // onChange={filterWatchlistBySearch}
            label={"Filter Symbol"}
            margin="normal"
            variant="standard"
            name="search"
            onKeyDown={handleKeyDown}
            value={search}
          />


        </div>


        <div style={{ overflowY: 'scroll', height: "75vh" }} >

          {symbolList && symbolList.length ? symbolList.map((row, i) => (
            <>
              <ListItem onKeyDown={handleKeyDown} button selected={cursor === i ? 'active' : null}

                style={{ fontSize: '12px', padding: '0px', paddingLeft: '5px', paddingRight: '5px' }} >

                {cursor === i ? localStorage.setItem("selectedKeyRow", JSON.stringify(row)) : ""}

                <ListItemText style={{ color: !row.nc || row.nc == 0 ? "" : row.nc > 0 ? '#20d020' : "#e66e6e" }} onClick={() => LoadSymbolDetails(row.symbol, i)} primary={row.name} /> {row.ltp} ({row.nc}%)


              </ListItem>

            </>
          )) : ''}
        </div>

      </TabPanel>
      <TabPanel value={value} index={1}>
      <div style={{ overflowY: 'scroll', height: "75vh" }} >

        {values.gainerList && values.gainerList.length ? values.gainerList.map((row, i) => (
          <>
            <ListItem onKeyDown={handleKeyDown} button selected={cursor === i ? 'active' : null}

              style={{ fontSize: '12px', padding: '0px', paddingLeft: '5px', paddingRight: '5px' }} >

              {cursor === i ? localStorage.setItem("selectedKeyRow", JSON.stringify(row)) : ""}

              <ListItemText title={"Found At: " + row.foundAt}  style={{ color: !row.nc || row.nc == 0 ? "" : row.nc > 0 ? '#20d020' : "#e66e6e" }} onClick={() => LoadSymbolDetails(row.name, i)} primary={row.name} />  {row.ltp} ({row.nc}%) {row.sector.split(' ')[1]}


            </ListItem>

          </>
        )) : ''}
        </div>
      </TabPanel>
      <TabPanel value={value} index={2}> 
        <div style={{ overflowY: 'scroll', height: "75vh" }} >

          {values.looserList && values.looserList.length ? values.looserList.map((row, i) => (
            <>
              <ListItem onKeyDown={handleKeyDown} button selected={cursor === i ? 'active' : null}

                style={{ fontSize: '12px', padding: '0px', paddingLeft: '5px', paddingRight: '5px' }} >

                {cursor === i ? localStorage.setItem("selectedKeyRow", JSON.stringify(row)) : ""}

                <ListItemText title={"Found At: " + row.foundAt} style={{ color: !row.nc || row.nc == 0 ? "" : row.nc > 0 ? '#20d020' : "#e66e6e" }} onClick={() => LoadSymbolDetails(row.name, i)} primary={row.name} />  {row.ltp} ({row.nc}%) {row.sector.split(' ')[1]}


              </ListItem>

            </>
          )) : ''}
          </div>
      </TabPanel>
      <TabPanel value={value} index={3}>
        Fevrate list
      </TabPanel>
    </Box>
  );
}