import React from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
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
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AdminService from "../service/AdminService";
import {resolveResponse} from "../../utils/ResponseHandler";

import Chart from "./Chart";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

class MyView extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            products: [],
            stopnview:'', 
            curnewdata:'', 
            underlyingValue : '', 
            timestamp:'',
            totalCOI : 0,
            expiry: '', 
            strike:'',
            FilteredBY: '',
            AllspTotalOI:[],
            PEoi:0,
            CEoi:0,
            scrollcount : 0,
            
            //JSON.parse(localStorage.getItem('optionChainDataBN')).records.data



        }
//          this.findSupportResistence = this.findSupportResistence.bind(this);
            
    }

    onChange = (e) =>{
      this.setState({[e.target.name]: e.target.value}); 
      this.filterOptionChain(e.target.name,  e.target.value); 

    }
   
  
  
    componentDidMount() {

        // AdminService.scanStocks().then(fundsRes => {
        //     // console.log('profiledata', profileRes); 
        //      //  let fundsResData = resolveResponse(fundsRes);
        //      //  var fundsResData =  fundsRes && fundsRes.data; 
        //        if(fundsResData.status & fundsResData.message == 'SUCCESS'){
               
        //         this.setState({  fundData :fundsResData.data })
        //        }
        //    })

    }
   
  


    render(){

      return(
        <React.Fragment>
            
            <PostLoginNavBar />

            Add To Watchlist
       
            <br/><br/><br/>
            
            <Grid   direction="row" container className="flexGrow" spacing={2}  style={{paddingLeft:"5px",paddingRight:"5px", justifyContent:'center'}}>
              
              
         
                         
           

              

                <Grid id="tabledatachart"  item xs={4} sm={4}>
                <Paper style={{padding:"25px" }}>   
               
                    <Typography variant="h6">
                          Test
                      </Typography>
                    
                    
                    <Typography variant="h6">
                    Test                  
                    
                      </Typography>

                  
                    </Paper>

                </Grid>

                <Grid id="tabledatachart"  item xs={8} sm={8}>
                Test
                </Grid>
               

               
              
                </Grid>
                   

                
           
          

            </React.Fragment> 
        )
    }

}

const styles = {
    tableStyle : {
        display: 'flex',
        justifyContent: 'center'
    }, 
    selectStyle:{
        marginBottom: '0px',
        minWidth: 240,
        maxWidth: 240

    }
  
}

const mapStateToProps=(state)=>{
    return {packs:state.packs.packs.data};
}
export default connect(mapStateToProps,{setPackLoaded})(MyView);
