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
import CommonOrderMethod from "../../utils/CommonMethods";
import * as moment from 'moment';
import Notify from "../../utils/Notify";
import ShowChartIcon from '@material-ui/icons/ShowChart';
import ClearIcon from '@material-ui/icons/Clear';

const BNOptionBuyAtLevel = ({
    LiveLtp,
}) => {
  
  const [buyAt, setBuyAt] = useState('');
  const [buyAtBelow, setBuyAtBelow] = useState('');
  const [sellAt, setSellAt] = useState('');
  const [sellAtAbove, setSellAtAbove] = useState('');
  const [orderOptionList, setOrderOptionList ] = useState(localStorage.getItem('orderOptionList') && JSON.parse(localStorage.getItem('orderOptionList')) || []);
  const [deleteId, setDeleteId] = useState('');
  const [edited, setEdited] = useState(false);


  const deleteInOrderList =(id)=> {
    let delitem =''; 
    let orderOptionList =  localStorage.getItem('orderOptionList') && JSON.parse( localStorage.getItem('orderOptionList')); 
    let foundIndex = orderOptionList.findIndex(x => x.id === id);
    orderOptionList.splice(foundIndex, 1); 
    localStorage.setItem('orderOptionList', JSON.stringify(orderOptionList)); 

    // console.log("del", delitem)
    // if(delitem && delitem[0].id == row.id){
    //   return true;
    // }else {
    //   return false;
    // }
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

console.log(orderOptionList);

  const addInOrderPenidngList = () => {
      if(buyAt || buyAtBelow || sellAt || sellAtAbove ){
          const orderInput = {
              createdAt : new Date().toLocaleTimeString(), 
              buyAt: buyAt,
              buyAtBelow: buyAtBelow,
              sellAt: sellAt,  
              sellAtAbove: sellAtAbove,  
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
    setBuyAtBelow("")
    setSellAt("")
    setSellAtAbove(""); 
  }

  return (
    <React.Fragment>
      <Paper
        style={{ overflow: "auto", padding: "5px", background: "#f500570a" }}
      >
        <Typography color="primary" gutterBottom>
          <button onClick={() => resetInput()}>Reset all</button>
          Nifty Bank Option buy on Level {LiveLtp.iv}
        </Typography>

        <Grid justify="space-between" container>
          <Grid item>
            <ButtonGroup size="small" aria-label="small button group">
              <TextField
                label="BuyAt(Above)"
                type="number"
                name="buyAt"
                value={buyAt}
                onChange={(event) => setBuyAt(event.target.value)}
              />
              <Button variant="contained" onClick={() => setBuyAt("")}>
                <ClearIcon color="error" />
              </Button>
            </ButtonGroup>
            <br />
            <button onClick={() => setBuyAt(LiveLtp.iv)}>
              Copy {LiveLtp.iv}
            </button>
          </Grid>
          <Grid item>
            <ButtonGroup size="small" aria-label="small button group">
              <TextField
                label="BuyAt(Below)"
                type="number"
                name="buyAtBelow"
                value={buyAtBelow}
                onChange={(event) => setBuyAtBelow(event.target.value)}
              />
              <Button variant="contained" onClick={() => setBuyAtBelow("")}>
                <ClearIcon color="error" />
              </Button>
            </ButtonGroup>
            <br />
            <button onClick={() => setBuyAtBelow(LiveLtp.iv)}>
              Copy {LiveLtp.iv}
            </button>
          </Grid>

          <Grid item>
            <ButtonGroup size="small" aria-label="small button group">
              <TextField
                label="SellAt(Below)"
                type="number"
                name="sellAt"
                value={sellAt}
                onChange={(event) => setSellAt(event.target.value)}
              />
              <Button variant="contained" onClick={() => setSellAt("")}>
                <ClearIcon color="error" />
              </Button>
            </ButtonGroup>

            <br />
            <button onClick={() => setSellAt(LiveLtp.iv)}>
              Copy {LiveLtp.iv}
            </button>
          </Grid>

          <Grid item>
            <ButtonGroup size="small" aria-label="small button group">
              <TextField
                label="SellAt(Above)"
                type="number"
                name="sellAtAbove"
                value={sellAtAbove}
                onChange={(event) => setSellAtAbove(event.target.value)}
              />
              <Button variant="contained" onClick={() => setSellAtAbove("")}>
                <ClearIcon color="error" />
              </Button>
            </ButtonGroup>
            <br />
            <button onClick={() => setSellAtAbove(LiveLtp.iv)}>
              Copy {LiveLtp.iv}
            </button>
          </Grid>

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

        <Table size="small" aria-label="sticky table">
          <TableHead style={{ whiteSpace: "nowrap" }} variant="head">
            <TableRow key="1" variant="head" style={{ fontWeight: "bold" }}>
              <TableCell className="TableHeadFormat" align="left">
                CreatetAt ({orderOptionList.length})
              </TableCell>

              <TableCell className="TableHeadFormat" align="left">
                BuyAt(Above)
              </TableCell>
              <TableCell className="TableHeadFormat" align="left">
                BuyAt(Below)
              </TableCell>

              <TableCell className="TableHeadFormat" align="left">
                SellAt(Below)
              </TableCell>
              <TableCell className="TableHeadFormat" align="left">
                SellAt(Above)
              </TableCell>

              <TableCell className="TableHeadFormat" align="left">
                Delete
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody id="tableAdd" style={{ width: "", whiteSpace: "nowrap" }}>
            {orderOptionList.length &&
              orderOptionList.map((row, i) => (
                <TableRow hover>
                  <TableCell align="left">{row.createdAt}</TableCell>

                  <TableCell align="left">
                    {row.buyAt ? (
                      <input
                        step="1"
                        style={{ width: "40%", textAlign: "center" }}
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
                    {row.buyAtBelow ? (
                      <input
                        step="1"
                        value={row.buyAtBelow}
                        style={{ width: "40%", textAlign: "center" }}
                        type="number"
                        name={`buyAtBelow-${row.id}`}
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
                        style={{ width: "40%", textAlign: "center" }}
                        type="number"
                        name={`sellAt-${row.id}`}
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
                        style={{ width: "40%", textAlign: "center" }}
                        type="number"
                        name={`sellAtAbove-${row.id}`}
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
              ))}
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
