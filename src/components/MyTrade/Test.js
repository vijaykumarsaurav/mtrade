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

import Chart from "./Chart";

export default class Example extends React.Component {
  constructor(props) {
    super(props)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.state = {
      cursor: 0,
      result: [{_id: 1, title: "SBIN" }, {_id: 1, title: "TCS" }
      
      ,{_id: 1, title: "INFY" }
      ,{_id: 1, title: "INFY" }
      ,{_id: 1, title: "INFY2" }
      ,{_id: 1, title: "INFY3" }
      ,{_id: 1, title: "INFY3" }
      ,{_id: 1, title: "INFY4" }
      ,{_id: 1, title: "INFY5" }
      ,{_id: 1, title: "INFY6" }
    
    
    ]
    }
  }

  handleKeyDown(e) {
    
    console.log("tet");

    const { cursor, result } = this.state
    // arrow up/down button should select next/previous list element
    if (e.keyCode === 38 && cursor > 0) {
      this.setState( prevState => ({
        cursor: prevState.cursor - 1
      }))
    } else if (e.keyCode === 40 && cursor < result.length - 1) {
      this.setState( prevState => ({
        cursor: prevState.cursor + 1
      }))
    }
  }

  render() {
    const { cursor } = this.state

    return (
      <Container>
        <div  style={{border: "1px solid red"}}> 

        <Input  onKeyDown={ this.handleKeyDown } > </Input>

        <List>
          {
            this.state.result && this.state.result.map((item, i) => (
              <ListItem
                selected={cursor === i ? 'active' : null}
                key={ item._id }
              >
                <span>{ item.title }</span>
              </ListItem>
            ))
          }
        </List>

       
        
        </div>
       
      </Container>
    )
  }
}