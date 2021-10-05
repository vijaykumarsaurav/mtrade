import React from "react";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import {connect} from "react-redux";
import {setPackLoaded} from "../../action";
import Spinner from "react-spinner-material";
import * as moment from 'moment';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from "@material-ui/core/Input";
import "./ViewStyle.css";
import PostLoginNavBar from "../PostLoginNavbar";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import AdminService from "../service/AdminService";
import {resolveResponse} from "../../utils/ResponseHandler";

import LightChartCom from "./LightChartCom";

import Chart from "./Chart";


export default class Example extends React.Component {
  constructor(props) {
    super(props)
  //  this.handleKeyDown = this.handleKeyDown.bind(this)
    this.state = {
      cursor: 0,
      areaData: [
        { time: '2018-10-19', value: 54.90 },
        { time: '2018-10-22', value: 54.98 },
        { time: '2018-10-23', value: 57.21 },
        { time: '2018-10-24', value: 57.42 },
        { time: '2018-10-25', value: 56.43 },
        { time: '2018-10-26', value: 55.51 },
        { time: '2018-10-29', value: 56.48 },
        { time: '2018-10-30', value: 58.18 },
        { time: '2018-10-31', value: 57.09 },
        { time: '2018-11-01', value: 56.05 },
        { time: '2018-11-02', value: 56.63 },
        { time: '2018-11-05', value: 57.21 },
        { time: '2018-11-06', value: 57.21 },
        { time: '2018-11-07', value: 57.65 },
        { time: '2018-11-08', value: 58.27 },
        { time: '2018-11-09', value: 58.46 },
        { time: '2018-11-12', value: 58.72 },
        { time: '2018-11-13', value: 58.66 },
        { time: '2018-11-14', value: 58.94 },
        { time: '2018-11-15', value: 59.08 },
        { time: '2018-11-16', value: 60.21 },
        { time: '2018-11-19', value: 60.62 },
        { time: '2018-11-20', value: 59.46 },
        { time: '2018-11-21', value: 59.16 },
        { time: '2018-11-23', value: 58.64 },
        { time: '2018-11-26', value: 59.17 },
        { time: '2018-11-27', value: 60.65 },
        { time: '2018-11-28', value: 60.06 },
        { time: '2018-11-29', value: 59.45 },
        { time: '2018-11-30', value: 60.30 },
        { time: '2018-12-03', value: 58.16 },
        { time: '2018-12-04', value: 58.09 },
        { time: '2018-12-06', value: 58.08 },
        { time: '2018-12-07', value: 57.68 },
        { time: '2018-12-10', value: 58.27 },
        { time: '2018-12-11', value: 58.85 },
        { time: '2018-12-12', value: 57.25 },
        { time: '2018-12-13', value: 57.09 },
        { time: '2018-12-14', value: 57.08 },
        { time: '2018-12-17', value: 55.95 },
        { time: '2018-12-18', value: 55.65 },
        { time: '2018-12-19', value: 55.86 },
        { time: '2018-12-20', value: 55.07 },
        { time: '2018-12-21', value: 54.92 },
        { time: '2018-12-24', value: 53.05 },
        { time: '2018-12-26', value: 54.44 },
        { time: '2018-12-27', value: 55.15 },
        { time: '2018-12-28', value: 55.27 },
        { time: '2018-12-31', value: 56.22 },
        { time: '2019-01-02', value: 56.02 },
        { time: '2019-01-03', value: 56.22 },
        { time: '2019-01-04', value: 56.36 },
        { time: '2019-01-07', value: 56.72 },
        { time: '2019-01-08', value: 58.38 },
        { time: '2019-01-09', value: 57.05 },
        { time: '2019-01-10', value: 57.60 },
        { time: '2019-01-11', value: 58.02 },
        { time: '2019-01-14', value: 58.03 },
        { time: '2019-01-15', value: 58.10 },
        { time: '2019-01-16', value: 57.08 },
        { time: '2019-01-17', value: 56.83 },
        { time: '2019-01-18', value: 57.09 },
        { time: '2019-01-22', value: 56.99 },
        { time: '2019-01-23', value: 57.76 },
        { time: '2019-01-24', value: 57.07 },
        { time: '2019-01-25', value: 56.40 },
        { time: '2019-01-28', value: 55.07 },
        { time: '2019-01-29', value: 53.28 },
        { time: '2019-01-30', value: 54.00 },
        { time: '2019-01-31', value: 55.06 },
        { time: '2019-02-01', value: 54.55 },
        { time: '2019-02-04', value: 54.04 },
        { time: '2019-02-05', value: 54.14 },
        { time: '2019-02-06', value: 53.79 },
        { time: '2019-02-07', value: 53.57 },
        { time: '2019-02-08', value: 53.95 },
        { time: '2019-02-11', value: 54.05 },
        { time: '2019-02-12', value: 54.42 },
        { time: '2019-02-13', value: 54.48 },
        { time: '2019-02-14', value: 54.03 },
        { time: '2019-02-15', value: 55.16 },
        { time: '2019-02-19', value: 55.44 },
        { time: '2019-02-20', value: 55.76 },
        { time: '2019-02-21', value: 56.15 },
        { time: '2019-02-22', value: 56.92 },
        { time: '2019-02-25', value: 56.78 },
        { time: '2019-02-26', value: 56.64 },
        { time: '2019-02-27', value: 56.72 },
        { time: '2019-02-28', value: 56.92 },
        { time: '2019-03-01', value: 56.96 },
        { time: '2019-03-04', value: 56.24 },
        { time: '2019-03-05', value: 56.08 },
        { time: '2019-03-06', value: 55.68 },
        { time: '2019-03-07', value: 56.30 },
        { time: '2019-03-08', value: 56.53 },
        { time: '2019-03-11', value: 57.58 },
        { time: '2019-03-12', value: 57.43 },
        { time: '2019-03-13', value: 57.66 },
        { time: '2019-03-14', value: 57.95 },
        { time: '2019-03-15', value: 58.39 },
        { time: '2019-03-18', value: 58.07 },
        { time: '2019-03-19', value: 57.50 },
        { time: '2019-03-20', value: 57.67 },
        { time: '2019-03-21', value: 58.29 },
        { time: '2019-03-22', value: 59.76 },
        { time: '2019-03-25', value: 60.08 },
        { time: '2019-03-26', value: 60.63 },
        { time: '2019-03-27', value: 60.88 },
        { time: '2019-03-28', value: 59.08 },
        { time: '2019-03-29', value: 59.13 },
        { time: '2019-04-01', value: 59.09 },
        { time: '2019-04-02', value: 58.53 },
        { time: '2019-04-03', value: 58.87 },
        { time: '2019-04-04', value: 58.99 },
        { time: '2019-04-05', value: 59.09 },
        { time: '2019-04-08', value: 59.13 },
        { time: '2019-04-09', value: 58.40 },
        { time: '2019-04-10', value: 58.61 },
        { time: '2019-04-11', value: 58.56 },
        { time: '2019-04-12', value: 58.74 },
        { time: '2019-04-15', value: 58.71 },
        { time: '2019-04-16', value: 58.79 },
        { time: '2019-04-17', value: 57.78 },
        { time: '2019-04-18', value: 58.04 },
        { time: '2019-04-22', value: 58.37 },
        { time: '2019-04-23', value: 57.15 },
        { time: '2019-04-24', value: 57.08 },
        { time: '2019-04-25', value: 55.85 },
        { time: '2019-04-26', value: 56.58 },
        { time: '2019-04-29', value: 56.84 },
        { time: '2019-04-30', value: 57.19 },
        { time: '2019-05-01', value: 56.52 },
        { time: '2019-05-02', value: 56.99 },
        { time: '2019-05-03', value: 57.24 },
        { time: '2019-05-06', value: 56.91 },
        { time: '2019-05-07', value: 56.63 },
        { time: '2019-05-08', value: 56.38 },
        { time: '2019-05-09', value: 56.48 },
        { time: '2019-05-10', value: 56.91 },
        { time: '2019-05-13', value: 56.75 },
        { time: '2019-05-14', value: 56.55 },
        { time: '2019-05-15', value: 56.81 },
        { time: '2019-05-16', value: 57.38 },
        { time: '2019-05-17', value: 58.09 },
        { time: '2019-05-20', value: 59.01 },
        { time: '2019-05-21', value: 59.50 },
        { time: '2019-05-22', value: 59.25 },
        { time: '2019-05-23', value: 58.87 },
        { time: '2019-05-24', value: 59.32 },
        { time: '2019-05-28', value: 59.57 },
      ],
      volumeData: [
        { time: '2018-10-19', value: 19103293.00, color: 'rgba(0, 150, 136, 0.8)' },
        { time: '2018-10-22', value: 21737523.00, color: 'rgba(0, 150, 136, 0.8)' },
        { time: '2018-10-23', value: 29328713.00, color: 'rgba(0, 150, 136, 0.8)' },
        { time: '2019-05-23', value: 11707083.00, color: 'rgba(255,82,82, 0.8)' },
        { time: '2019-05-24', value: 8755506.00, color: 'rgba(0, 150, 136, 0.8)' },
      ]
    }
  }


  render() {
    const { cursor } = this.state

    return (
      <Container>
          
          <LightChartCom ChartData={{areaSeries: this.state.areaData, volumeData : this.state.volumeData}}/>
       

      </Container>
    )
  }
}



