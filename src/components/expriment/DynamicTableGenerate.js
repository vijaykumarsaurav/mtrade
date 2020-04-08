import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';



const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  tableWrapper: {
    maxHeight: 440,
    overflow: 'auto',
  },
});

export default class Table extends React.Component {
 
  constructor(props){
  super(props);
  this.getHeader = this.getHeader.bind(this);
  this.getRowsData = this.getRowsData.bind(this);
  this.getKeys = this.getKeys.bind(this);
  }
  
  getKeys = function(){
    return Object.keys(this.props.data[0]);
    }


  getHeader = function(){
 var keys = this.getKeys();
 return keys.map((key, index)=>{
 return <th key={key}>{key.toUpperCase()}</th>
 })
 }
  
 getRowsData = function(){
  var items = this.props.data;
  var keys = this.getKeys();
  return items.map((row, index)=>{
  return <tr key={index}><RenderRow key={index} data={row} keys={keys}/></tr>
  })
  }
  
  render() {
  return (
  <div>
  <table>
  <thead>
  <tr>{this.getHeader()}</tr>
  </thead>
  <tbody>
  {this.getRowsData()}
  </tbody>
  </table>
  </div>
  
  );
  }
 }
