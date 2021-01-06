import React from "react";
import AdminService from "../service/AdminService";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import CreateIcon from '@material-ui/icons/Create';
import PostLoginNavBar from "../PostLoginNavbar";
import {resolveResponse} from "../../utils/ResponseHandler";
import {connect} from "react-redux";
import {setPackLoaded} from "../../action";
import Spinner from "react-spinner-material";
import * as moment from 'moment';
import  {IMAGE_VALIDATION_TOKEN} from "../../utils/config";


import ActivationService from "../service/ActivationService";

class RechargePack extends React.Component{

    constructor(props) {
        super(props);
        this.addProduct = this.addProduct.bind(this);
        this.editProduct = this.editProduct.bind(this);
        this.convertBool = this.convertBool.bind(this);
        this.state = {
            products: [],
        }
    }


    componentDidMount() {
        this.loadPackList();
     //  this.props.setPackLoaded(); 
        localStorage.setItem("lastUrl","packs");

    }

    loadPackList() {
        var data = { allPacks:true, portal: true};
        AdminService.listPack(data)
            .then((res) => {
                let data = resolveResponse(res);
              console.log(data);
                if(data && data.result){
                    this.setState({products: data.result.data})
                }
            });
    }

    addProduct=(e)=> {
        console.log(this.props)
        this.props.history.push('/pack-add');
    }

    editProduct(productId) {
        window.localStorage.removeItem("selectedProductId");
        window.localStorage.setItem("selectedProductId", productId);
        this.props.history.push('/pack-edit');
    }

    convertBool(flag) {
        return flag ? 'Yes' : 'No';
    }

    dateFormat(date){ 
        return moment.utc(date).format('DD-MM-YYYY HH:mm:ss A');
    }
  

    render(){
        console.log(this.props,"PROPS")
      return(
        <React.Fragment>
            <PostLoginNavBar/>



            <Paper style={{padding:"10px", overflow:"auto"}} >
            <Typography variant="h5" style={{ flex: 0 }} >Recharge Pack</Typography>
                <Grid  container spacing={24} container
                direction="row"
                justify="flex-end"
                >
                <Button variant="contained" color="secondry" onClick={() => this.addProduct()}>
                    Add Pack
                </Button>      
                </Grid>

            <Table  size="small"   aria-label="sticky table" >
                <TableHead style={{width:"",whiteSpace: "nowrap"}} variant="head">
                    <TableRow variant="head">
                          {/* <TableCell align="center">Edit</TableCell> */}

                          <TableCell align="center">Icon</TableCell>

                        {/* <TableCell align="center">ProductId</TableCell> */}
                        <TableCell align="center">Connection Type</TableCell>
                        <TableCell align="center">Pack</TableCell>
                        <TableCell align="center">Amount</TableCell>

                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Validity Days</TableCell>
                        <TableCell align="center">Validity Type</TableCell>
                        <TableCell align="center">Description</TableCell>
                        <TableCell align="center">Comment</TableCell>

                        <TableCell align="center">Start Date/Time</TableCell>
                        <TableCell align="center">End Date/Time</TableCell>

                        <TableCell align="center">Display Type</TableCell>
                      

                    </TableRow>
                </TableHead>
                <TableBody style={{width:"",whiteSpace: "nowrap"}}>
                
                    { this.state.products ? this.state.products.map(row => (
                        <TableRow key={row.productId} onClick={() => this.editProduct(row.productId)}>
                           {/* <TableCell align="center" onClick={() => this.editProduct(row.productId)}><CreateIcon /></TableCell> */}

                           <TableCell align="center"> <img style={{width:"80px", height:"40px"}} src={row.imageURL+"?token="+IMAGE_VALIDATION_TOKEN} /> </TableCell>

                           {/* <TableCell align="center">{row.productId}</TableCell> */}
                            <TableCell component="th" scope="row" className="hidden">
                                {row.connectionType}
                            </TableCell>
                            
                            <TableCell align="center">{row.pack}</TableCell>
                            <TableCell align="center">{row.amount}</TableCell>

                            <TableCell align="center">{row.active ? 'Active' : 'Inactive'}</TableCell>
                            <TableCell align="center">{row.validityDays}</TableCell>
                            <TableCell align="center">{row.validityType}</TableCell>
                            <TableCell align="center">{row.description}</TableCell>
                            <TableCell align="center">{row.comment}</TableCell>

                            {/* {row.startDate.substring(0, 10)} */}
                            <TableCell align="center">{this.dateFormat(row.startDate)}</TableCell>
                            {/* <TableCell align="center">{row.endDate.substring(0, 10)}</TableCell> */}

                            <TableCell align="center">{this.dateFormat(row.endDate)}</TableCell>

                            <TableCell align="center">{row.displayType}</TableCell>
                            
                        </TableRow>
                    )):<Spinner/>}
                </TableBody>
            </Table>

            </Paper>
            </React.Fragment> 
        )
    }

}

const styles = {
    tableStyle : {
        display: 'flex',
        justifyContent: 'center'
    }
}

const mapStateToProps=(state)=>{
    return {packs:state.packs.packs.data};
}
export default connect(mapStateToProps,{setPackLoaded})(RechargePack);
