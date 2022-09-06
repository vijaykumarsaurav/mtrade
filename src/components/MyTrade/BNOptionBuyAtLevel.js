import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import AdminService from "../service/AdminService";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

import ButtonGroup from "@material-ui/core/ButtonGroup";

import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import PostLoginNavBar from "../PostLoginNavbar";
import {resolveResponse} from "../../utils/ResponseHandler";
import Spinner from "react-spinner-material";
import TextField from "@material-ui/core/TextField";
import Autocomplete from '@material-ui/lab/Autocomplete';
import DeleteIcon from '@material-ui/icons/Delete';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import CommonMethods from '../../utils/CommonMethods';
import * as moment from 'moment';
import Notify from "../../utils/Notify";
import ShowChartIcon from '@material-ui/icons/ShowChart';
import ClearIcon from '@material-ui/icons/Clear';

const BNOptionBuyAtLevel = ({
    LiveLtp,
}) => {
  
  const [buyAt, setBuyAt] = useState('');
  const [buyAtStoploss, setBuyAtStoploss] = useState('');
  const [buyAtTarget, setBuyAtTarget] = useState('');

  const [buyAtBelow, setBuyAtBelow] = useState('');
  const [buyAtBelowStoploss, setBuyAtBelowStoploss] = useState('');
  const [buyAtBelowTarget, setBuyAtBelowTarget] = useState('');

  const [sellAt, setSellAt] = useState('');
  const [sellAtStoploss, setSellAtStoploss] = useState('');
  const [sellAtTarget, setSellAtTarget] = useState('');

  const [sellAtAbove, setSellAtAbove] = useState('');
  const [sellAtAboveStoploss, setSellAtAboveStoploss] = useState('');
  const [sellAtAboveTarget, setSellAtAboveTarget] = useState('');

  const [orderOptionList, setOrderOptionList ] = useState(localStorage.getItem('orderOptionList') && JSON.parse(localStorage.getItem('orderOptionList')) || []);
  const [deleteId, setDeleteId] = useState('');
  const [edited, setEdited] = useState(false);
  const [strikeLeg, setStrikeLeg] = useState(2);

  const placeOptionSPLevelOver= (spotPrice, optionType, id, spottype, elementInfo)=>{
      let strikePrice = getStrikePrice(spotPrice, optionType);
      let nextExpiryOption = getNextExpiryOption(strikePrice, optionType);
      console.log(strikePrice, nextExpiryOption);

      if(nextExpiryOption){
        let optionInput = {
          "transactiontype": 'BUY',
          "tradingsymbol": nextExpiryOption.symbol,
          "symboltoken": nextExpiryOption.token,
          "quantity": 25,
          "ordertype": "MARKET",
          "price": 0,
          "producttype": 'CARRYFORWARD',
          "duration": "DAY",
          "squareoff": "0",
          "stoploss": "0",
          "exchange": nextExpiryOption.exch_seg,
          "variety": "NORMAL"
      }

      let spotDetails = CommonMethods.getStockTokenDetails('BANKNIFTY');
      spotDetails.tradingsymbol = nextExpiryOption.symbol;
      spotDetails.optiontype = optionType;

      if(spottype == 'buyAt'){
        spotDetails.optionStockStoploss = elementInfo.buyAtStoploss;
        spotDetails.optionStockTarget =  elementInfo.buyAtTarget;
      }

      if(spottype == 'buyAtBelow'){
        spotDetails.optionStockStoploss = elementInfo.buyAtBelowStoploss;
        spotDetails.optionStockTarget =  elementInfo.buyAtBelowTarget;
      }
      
      if(spottype == 'sellAt'){
        spotDetails.optionStockStoploss = elementInfo.sellAtStoploss;
        spotDetails.optionStockTarget =  elementInfo.sellAtTarget;
      }
      if(spottype == 'sellAtAbove'){
        spotDetails.optionStockStoploss = elementInfo.sellAtAboveStoploss;
        spotDetails.optionStockTarget =  elementInfo.sellAtAboveTarget;
      }
      

      const activeStockOptions =  localStorage.getItem('activeStockOptions') && JSON.parse(localStorage.getItem('activeStockOptions')) || []; 
      activeStockOptions.push(spotDetails);
      localStorage.setItem("activeStockOptions", JSON.stringify(activeStockOptions));
      setDeleteId(id); 

      AdminService.placeOrder(optionInput).then(res => {
          let data = resolveResponse(res);
          console.log(data);   
          if (data.status && data.message === 'SUCCESS') {
              //setDeleteId(id); 
              speckIt(`${strikePrice} ${optionType} +" order placed"`);
          }
      })
  
      }else{
        Notify.showError("Option token not found for " +strikePrice + " update latest tokens")
      }
      
  }

  const speckIt = (text) => {
      var msg = new SpeechSynthesisUtterance();
      msg.text = text.toString();
      window.speechSynthesis.speak(msg);
  }
  const getNextExpiryOption = (strikePrice, optionType) => {
    let optionList = localStorage.getItem('staticData') && JSON.parse(localStorage.getItem('staticData')).NIFTYBANK_LATEST_OPTIONS || [];
    let filteredOptions = optionList.filter(item => item.strike/100 === strikePrice && item.symbol.endsWith(optionType));
    let nextDate = moment(new Date()).add(8, 'days');
    let found = filteredOptions.filter(element => moment(element.expiry) <= nextDate);  
    return found && found[0];
  }

  const getStrikePrice = (spotPrice, optionType) => {
      let today = moment().isoWeekday();
      let strikePrice = 0; 
      if(optionType === 'CE'){
        if(today === 5 || today === 1){
            strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100)  + (400 * strikeLeg)
        }
        else  if(today === 2){
            strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100)  +  (300 * strikeLeg) 
        }
        else  if(today === 3){
            strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100)  + (200 * strikeLeg) 
        }else {
            strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100) 
        }
      }else if(optionType === 'PE'){
        if(today === 5 || today === 1){
            strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100)  -  (400 * strikeLeg) 
        }
        else  if(today === 2){
            strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100)  -  (300 * strikeLeg)
        }
        else  if(today === 3){
            strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100)  -  (200 * strikeLeg)
        }else {
            strikePrice = (Math.round(spotPrice) - Math.round(spotPrice) % 100) 
        }
    }
    return strikePrice;
  }

  useEffect(() => {
    if(deleteId){
      let foundIndex = orderOptionList.findIndex(x => x.id === deleteId);
      orderOptionList.splice(foundIndex, 1); 
      setDeleteId('');
      setOrderOptionList(orderOptionList)
      localStorage.setItem('orderOptionList', JSON.stringify(orderOptionList)); 
    }
    
  }, [deleteId, orderOptionList, setDeleteId]);

  useEffect(() => {
    if(orderOptionList || edited){
      setOrderOptionList(orderOptionList)
      localStorage.setItem('orderOptionList', JSON.stringify(orderOptionList)); 
      setEdited(false);
    }
  }, [orderOptionList, edited]);

  useEffect(()=> {
    if(LiveLtp && LiveLtp.iv) {
      orderOptionList.forEach(element => {
        if(element.buyAt && LiveLtp.iv >= parseFloat(element.buyAt)){
          placeOptionSPLevelOver(LiveLtp.iv, 'CE', element.id, 'buyAt', element ); 
        }else if(element.buyAtBelow && LiveLtp.iv <= parseFloat(element.buyAtBelow)){
          placeOptionSPLevelOver(LiveLtp.iv, 'CE', element.id, 'buyAtBelow', element ); 
        }else if(element.sellAt && LiveLtp.iv <= parseFloat(element.sellAt)){
          placeOptionSPLevelOver(LiveLtp.iv, 'PE', element.id, 'sellAt', element); 
        }else if(element.sellAtAbove && LiveLtp.iv >= parseFloat(element.sellAtAbove) ){
          placeOptionSPLevelOver(LiveLtp.iv, 'PE', element.id, 'sellAtAbove', element); 
        }
      });
  }
  }, [LiveLtp, orderOptionList, placeOptionSPLevelOver])

  const addInOrderPenidngList = () => { 
      if(buyAt || buyAtBelow || sellAt || sellAtAbove ){
          const orderInput = {
              createdAt : new Date().toLocaleTimeString(), 
              buyAt: buyAt,
              buyAtStoploss: buyAtStoploss, 
              buyAtTarget: buyAtTarget, 

              buyAtBelow: buyAtBelow,
              buyAtBelowStoploss: buyAtBelowStoploss, 
              buyAtBelowTarget: buyAtBelowTarget, 
              
              sellAt: sellAt,  
              sellAtStoploss: sellAtStoploss,  
              sellAtTarget: sellAtTarget, 

              sellAtAbove: sellAtAbove,  
              sellAtAboveStoploss: sellAtAboveStoploss,  
              sellAtAboveTarget: sellAtAboveTarget,  

              id: new Date().getTime()
          }
          setOrderOptionList([...orderOptionList, orderInput]);
          resetInput();
      }
  }

  const orderValueChange = (e ) => {
    const nameId =  e.target.name.split('-'); 
    var foundIndex = orderOptionList.findIndex(x => x.id === parseInt(nameId[1]));
    orderOptionList[foundIndex][nameId[0]] = e.target.value;
    setEdited(true)
  }

  const resetInput = () => {
    setBuyAt("")
    setBuyAtStoploss("")
    setBuyAtTarget("")

    setBuyAtBelow("")
    setBuyAtBelowStoploss("")
    setBuyAtBelowTarget("")

    setSellAt("")
    setSellAtStoploss("")
    setSellAtTarget("")
    
    setSellAtAbove(""); 
    setSellAtAboveStoploss("")
    setSellAtAboveTarget("")
  }

  return (
    <React.Fragment>
      <Paper
        style={{ overflow: "auto", padding: "5px"}}
      >
        <Typography color="primary" gutterBottom>
          <button onClick={() => resetInput()}>Reset all</button> Nifty Bank Option buy on Level {LiveLtp.iv}
        </Typography>
        <br />
        <Grid justify="space-between" container>
        <Paper style={{ overflow: "auto", padding: "15px", background: "whitesmoke" }}>
            <Typography color="primary" gutterBottom>
                Call Buy
            </Typography>
            <Grid item>
              <ButtonGroup size="small" aria-label="small button group">
                <TextField
                  label="Buy Above"
                  type="number"
                  name="buyAt"
                  style={{width: '125px'}}
                  value={buyAt}
                  onChange={(event) => setBuyAt(event.target.value)}
                />
                <TextField
                  label="Stoploss"
                  type="number"
                  name="buyAtStoploss"
                  style={{width: '100px'}}
                  value={buyAtStoploss}
                  onChange={(event) => setBuyAtStoploss(event.target.value)}
                />
                  <TextField
                  label="Target"
                  type="number"
                  name="buyAtTarget"
                  style={{width: '100px'}}
                  value={buyAtTarget}
                  onChange={(event) => setBuyAtTarget(event.target.value)}
                />
                <Button variant="contained" onClick={() => {
                  setBuyAt("")
                  setBuyAtStoploss("")
                  setBuyAtTarget("")
                }}>
                  <ClearIcon color="error" />
                </Button>
              </ButtonGroup>
              <br />
              <button onClick={() => setBuyAt(LiveLtp.iv)}>
                Copy {LiveLtp.iv}
              </button> LiveLtp >= buyAt
            </Grid>
            <br />
            <Grid item>
              <ButtonGroup size="small" aria-label="small button group">
                <TextField
                  label="Buy Below"
                  type="number"
                  style={{width: '125px'}}
                  name="buyAtBelow"
                  value={buyAtBelow}
                  onChange={(event) => setBuyAtBelow(event.target.value)}
                />
                  <TextField
                  label="Stoploss"
                  type="number"
                  name="buyAtBelowStoploss"
                  style={{width: '100px'}}
                  value={buyAtBelowStoploss}
                  onChange={(event) => setBuyAtBelowStoploss(event.target.value)}
                />
                  <TextField
                  label="Target"
                  type="number"
                  name="buyAtBelowTarget"
                  style={{width: '100px'}}
                  value={buyAtBelowTarget}
                  onChange={(event) => setBuyAtBelowTarget(event.target.value)}
                />
                <Button variant="contained" onClick={() => {
                setBuyAtBelow("")
                setBuyAtBelowStoploss("")
                setBuyAtBelowTarget("")
                }}>
                  <ClearIcon color="error" />
                </Button>
              </ButtonGroup>
              <br />
              <button onClick={() => setBuyAtBelow(LiveLtp.iv)}>
                Copy {LiveLtp.iv} 
              </button>  LiveLtp &lt;= buyAtBelow
              
            </Grid>
        </Paper>
        <Paper style={{ overflow: "auto", padding: "15px", background: "#f500570a" }}>
        <Typography color="primary" gutterBottom>
                Put Buy
            </Typography>
          <Grid item>
            <ButtonGroup size="small" aria-label="small button group">
              <TextField
                label="Sell Below"
                type="number"
                style={{width: '125px'}}
                name="sellAt"
                value={sellAt}
                onChange={(event) => setSellAt(event.target.value)}
              />
               <TextField
                label="Stoploss"
                type="number"
                name="sellAtStoploss"
                style={{width: '100px'}}
                value={sellAtStoploss}
                onChange={(event) => setSellAtStoploss(event.target.value)}
              />
                <TextField
                label="Target"
                type="number"
                name="sellAtTarget"
                style={{width: '100px'}}
                value={sellAtTarget}
                onChange={(event) => setSellAtTarget(event.target.value)}
              />
              <Button variant="contained" onClick={() => {
                  setSellAt("")
                  setSellAtStoploss("")
                  setSellAtTarget("")
              }}>
                <ClearIcon color="error" />
              </Button>
            </ButtonGroup>

            <br />
            <button onClick={() => setSellAt(LiveLtp.iv)}>
              Copy {LiveLtp.iv}
            </button>  LiveLtp &lt;= sellAt
          </Grid>
          <br />

          <Grid item>
            <ButtonGroup size="small" aria-label="small button group">
              <TextField
                label="Sell Above"
                type="number"
                style={{width: '125px'}}
                name="sellAtAbove"
                value={sellAtAbove}
                onChange={(event) => setSellAtAbove(event.target.value)}
              />
                <TextField
                label="Stoploss"
                type="number"
                name="sellAtAboveStoploss"
                style={{width: '100px'}}
                value={sellAtAboveStoploss}
                onChange={(event) => setSellAtAboveStoploss(event.target.value)}
              />
                <TextField
                label="Target"
                type="number"
                name="sellAtAboveTarget"
                style={{width: '100px'}}
                value={sellAtAboveTarget}
                onChange={(event) => setSellAtAboveTarget(event.target.value)}
              />
              <Button variant="contained" onClick={() => {
                    setSellAtAbove(""); 
                    setSellAtAboveStoploss("")
                    setSellAtAboveTarget("")
              }}>
                <ClearIcon color="error" />
              </Button>
            </ButtonGroup>
            <br />
            <button onClick={() => setSellAtAbove(LiveLtp.iv)}>
              Copy {LiveLtp.iv}
            </button>  LiveLtp >= sellAtAbove
          </Grid>
        </Paper>
          <Grid item>
            <Button
              variant="contained"
              style={{ marginLeft: "20px", marginTop: "10px" }}
              onClick={() => addInOrderPenidngList()}
            >
              Add to Order
            </Button>
          </Grid>
        </Grid>
        <br />
        <Table size="small" aria-label="sticky table">
          <TableHead style={{ whiteSpace: "nowrap" }} variant="head">
            <TableRow key="1" variant="head" style={{ fontWeight: "bold" }}>
              <TableCell className="TableHeadFormat" align="left">
                Time ({orderOptionList.length})
              </TableCell>

              <TableCell className="TableHeadFormat" align="left">
               Buy Above
              </TableCell>
              <TableCell className="TableHeadFormat" align="left">
                Buy Above SL
              </TableCell>
              <TableCell className="TableHeadFormat" align="left">
                Buy Above T.
              </TableCell>
              
              <TableCell className="TableHeadFormat" align="left">
                Buy Below
              </TableCell>
              <TableCell className="TableHeadFormat" align="left">
                Buy Below SL
              </TableCell> <TableCell className="TableHeadFormat" align="left">
                Buy Below T.
              </TableCell>

              <TableCell className="TableHeadFormat" align="left">
              Sell Below
              </TableCell>
              <TableCell className="TableHeadFormat" align="left">
                Sell Below SL
              </TableCell> <TableCell className="TableHeadFormat" align="left">
                Sell Below T.
              </TableCell>
              <TableCell className="TableHeadFormat" align="left">
                Sell Above
              </TableCell>
              <TableCell className="TableHeadFormat" align="left">
                Sell Above SL
              </TableCell><TableCell className="TableHeadFormat" align="left">
                Sell Above T.
              </TableCell>

              <TableCell className="TableHeadFormat" align="left">
                Delete
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody id="tableAdd" style={{ width: "", whiteSpace: "nowrap" }}>
            {orderOptionList.length ?
              orderOptionList.map((row, i) => (
                <TableRow hover>
                  <TableCell align="left">{row.createdAt}</TableCell>

                  <TableCell align="left">
                    {row.buyAt ? (
                      <input
                        step="1"
                        style={{ width: "75px", textAlign: "center" }}
                        type="number"
                        value={row.buyAt}
                        name={`buyAt-${row.id}`}
                        onChange={orderValueChange}
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="left">
                    {row.buyAtStoploss ? (
                      <input
                        step="1"
                        style={{ width: "75px", textAlign: "center" }}
                        type="number"
                        value={row.buyAtStoploss}
                        name={`buyAtStoploss-${row.id}`}
                        onChange={orderValueChange}
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell> <TableCell align="left">
                    {row.buyAtTarget ? (
                      <input
                        step="1"
                        style={{ width: "75px", textAlign: "center" }}
                        type="number"
                        value={row.buyAtTarget}
                        name={`buyAtTarget-${row.id}`}
                        onChange={orderValueChange}
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="left">
                    {row.buyAtBelow ? (
                      <input
                        step="1"
                        value={row.buyAtBelow}
                        style={{ width: "75px", textAlign: "center" }}
                        type="number"
                        name={`buyAtBelow-${row.id}`}
                        onChange={orderValueChange}
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="left">
                    {row.buyAtBelowStoploss ? (
                      <input
                        step="1"
                        value={row.buyAtBelowStoploss}
                        style={{ width: "75px", textAlign: "center" }}
                        type="number"
                        name={`buyAtBelowStoploss-${row.id}`}
                        onChange={orderValueChange}
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell><TableCell align="left">
                    {row.buyAtBelowTarget ? (
                      <input
                        step="1"
                        value={row.buyAtBelowTarget}
                        style={{ width: "75px", textAlign: "center" }}
                        type="number"
                        name={`buyAtBelowTarget-${row.id}`}
                        onChange={orderValueChange}
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>

                  <TableCell align="left">
                    {row.sellAt ? (
                      <input
                        step="1"
                        value={row.sellAt}
                        style={{ width: "75px", textAlign: "center" }}
                        type="number"
                        name={`sellAt-${row.id}`}
                        onChange={orderValueChange}
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="left">
                    {row.sellAtStoploss ? (
                      <input
                        step="1"
                        value={row.sellAtStoploss}
                        style={{ width: "75px", textAlign: "center" }}
                        type="number"
                        name={`sellAtStoploss-${row.id}`}
                        onChange={orderValueChange}
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>  <TableCell align="left">
                    {row.sellAtTarget ? (
                      <input
                        step="1"
                        value={row.sellAtTarget}
                        style={{ width: "75px", textAlign: "center" }}
                        type="number"
                        name={`sellAtTarget-${row.id}`}
                        onChange={orderValueChange}
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="left">
                    {row.sellAtAbove ? (
                      <input
                        value={row.sellAtAbove}
                        step="1"
                        style={{ width: "75px", textAlign: "center" }}
                        type="number"
                        name={`sellAtAbove-${row.id}`}
                        onChange={orderValueChange}
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="left">
                    {row.sellAtAboveStoploss ? (
                      <input
                        value={row.sellAtAboveStoploss}
                        step="1"
                        style={{ width: "75px", textAlign: "center" }}
                        type="number"
                        name={`sellAtAboveStoploss-${row.id}`}
                        onChange={orderValueChange}
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="left">
                    {row.sellAtAboveTarget ? (
                      <input
                        value={row.sellAtAboveTarget}
                        step="1"
                        style={{ width: "75px", textAlign: "center" }}
                        type="number"
                        name={`sellAtAboveTarget-${row.id}`}
                        onChange={orderValueChange}
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>

                  <TableCell align="left">
                    <DeleteIcon
                      style={{ cursor: "pointer" }}
                      onClick={() => setDeleteId(row.id)}
                    />
                  </TableCell>
                </TableRow>
              )) : ""}
          </TableBody>
        </Table>
      </Paper>
    </React.Fragment>
  );
};

BNOptionBuyAtLevel.propTypes = {
  LiveLtp: PropTypes.string.isRequired,
};

export default BNOptionBuyAtLevel;
