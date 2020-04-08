/* eslint-disable no-script-url */

import React from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Title from './Title';

// Generate Order Data
function createData(id, date, name, shipTo, paymentMethod, amount) {
  return { id, date, name, shipTo, paymentMethod, amount };
}

const rows = [
  createData(0, 'Vijay Kumar', '7204563432', '#899900', 'Verified', 399),
  createData(0, 'Vijay Kumar', '7204563432', '#899900', 'Verified', 399),
  createData(0, 'Vijay Kumar', '7204563432', '#899900', 'Verified', 399),
  createData(0, 'Vijay Kumar', '7204563432', '#899900', 'Verified', 399),
  createData(0, 'Vijay Kumar', '7204563432', '#899900', 'Verified', 399),
  createData(0, 'Vijay Kumar', '7204563432', '#899900', 'Verified', 399),
  createData(0, 'Vijay Kumar', '7204563432', '#899900', 'Verified', 399),
  createData(0, 'Vijay Kumar', '7204563432', '#899900', 'Verified', 399),
  createData(0, 'Vijay Kumar', '7204563432', '#899900', 'Verified', 399),
  createData(0, 'Vijay Kumar', '7204563432', '#899900', 'Verified', 399),
  createData(0, 'Vijay Kumar', '7204563432', '#899900', 'Verified', 399),

];

const useStyles = makeStyles(theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function Orders() {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Title>Recent Activation</Title>
      
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Mobile</TableCell>
            <TableCell>NIC</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">FTR</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.id}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.shipTo}</TableCell>
              <TableCell>{row.paymentMethod}</TableCell>
              <TableCell align="right">{row.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className={classes.seeMore}>
        <Link color="primary" href="javascript:;">
          See more orders
        </Link>

         <Link color="primary" href="javascript:;">
        &nbsp;&nbsp;&nbsp;&nbsp;  Download 
        </Link>
      </div>
    </React.Fragment>
  );
}
