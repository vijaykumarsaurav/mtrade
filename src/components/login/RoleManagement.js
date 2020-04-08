import React, { useState } from "react";
import ActivationService from "../service/ActivationService";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Paper from "@material-ui/core/Paper";
import TextField from '@material-ui/core/TextField';
import Notify from "../../utils/Notify";

import Divider from '@material-ui/core/Divider';

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from "@material-ui/core/Input";

import Grid from '@material-ui/core/Grid';

import VisibilityIcon from '@material-ui/icons/Visibility';
import PostLoginNavBar from "../PostLoginNavbar";
import { Container } from "@material-ui/core";
import { resolveResponse } from "../../utils/ResponseHandler";

import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

const handleChangePage = (event, newPage) => {
    //  this.setPage(newPage);
};

const handleChangeRowsPerPage = event => {

    // this.setRowsPerPage(parseInt(event.target.value, 10));
    // this.setPage(0);
};



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

class RoleManagement extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            products: [],
            searchedproducts: '',
            searchby: '',
            listofzones: [],
            selectedZone: [],
            zone: '',
            addNewEnable:false,
            roleName:"",
            rejectedReasons: ["Pack Activation", "Offer Upload", "Banner Upload", "Onboarding Agents", "Data Entry", "Verification", "Document Upload", "Agent Status Report", "Agent Audit Report", "Rejected Data"]
        };
        this.loadProductList = this.loadProductList.bind(this);
        this.editProduct = this.editProduct.bind(this);
        this.convertBool = this.convertBool.bind(this);
        this.onChange = this.onChange.bind(this);
        this.zoneChange = this.zoneChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.addRole = this.addRole.bind(this);

        this.deleteNewRole = this.deleteNewRole.bind(this);
        this.deleteRole = this.deleteRole.bind(this);

        


    }

    componentDidMount() {
      //  this.loadProductList("");
        localStorage.setItem("lastUrl", "role");

        var roles = ["Data Entry", "BO Agent", "Distributor", "FSE"];

        this.setState({ searchedproducts: roles })
    }

    searchOnDB(mobileNumber) {

     //   this.loadProductList(mobileNumber);

        // ActivationService.searchMobileNo(mobileNumber).then(res => {
        //     let data = resolveResponse(res);
        //     const selectedProduct = data.result;            

        //     if(selectedProduct && selectedProduct.transactionId){
        //         window.localStorage.setItem("selectedProductId", selectedProduct.transactionId);
        //         //window.localStorage.setItem("selectedSim", '');

        //         this.props.history.push('/verify-edit');
        //         // this.setState({
        //         //     });
        //     }
        //     // else{
        //     //     Notify.showError("Not Found or already processed");
        //     // }

        // })
    }


    loadProductList(mobileNumber) {


        var d = new Date();
        var endTime = d.getTime();

        var startTime = endTime - 172800000;

        var data = {
            "endDate": endTime,
            "mobileNumber": mobileNumber ? mobileNumber : null,
            "noOfRecords": 20,
            "role": "BOA",
            "startDate": 0,
            "txnId": 0,
            "type": "next",
            "zones": this.state.selectedZone.length ? this.state.selectedZone : null
        }

        document.getElementById('showMessage').innerHTML = "Please Wait Loading...";

        ActivationService.listDocs(data)
            .then((res) => {
                let data = resolveResponse(res);
                var activationList = data && data.result && data.result.activationList;
                this.setState({ products: activationList })



                //this.setState({searchedproducts: activationList})
                var roles = ["Data Entry", "BO Agent", "Distributor", "FSE"];

                this.setState({ searchedproducts: roles })

                var listingIds = activationList && activationList.map(function (val, index) {
                    return val.txnId
                });

                if (document.getElementById('showMessage')) {
                    if (activationList == null) {
                        document.getElementById('showMessage').innerHTML = "No new documents for verification";
                    } else {
                        document.getElementById('showMessage').innerHTML = "";
                    }
                }

                localStorage.setItem("verifyListingTxn", listingIds);
            });

        setTimeout(() => {
            if (this.state.searchedproducts && this.state.searchedproducts.length == 0) {
                document.getElementById('showMessage').innerHTML = "Server taking time to response please reload again and check";
            }
        }, 7000);


        ActivationService.getStaticData('BOA').then(res => {
            let data = resolveResponse(res);
            this.setState({ listofzones: data && data.result && data.result.zones })
        })



        // ActivationService.testApi('BOA').then(res => {
        //     let data = resolveResponse(res);
        //     this.setState({listofzones: data.result && data.result.zones}) 
        // })

    }

    onChange = (e) => {

    this.setState({ [e.target.name]: e.target.value })

        // const re = /^[0-9\b]+$/;
        // if (e.target.value === '' || re.test(e.target.value) && e.target.value.length <= 10) {
        //     this.setState({ searchby: e.target.value })
        // }

    }

    zoneChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

    addRole() {
        this.setState({ addNewEnable: true }) 
    }

    deleteNewRole(){
        this.setState({ addNewEnable: false }) 
        this.setState({ roleName: "" }) 


    }

    deleteRole(){

        window.confirm("Please confirm if you want to delete the role?"); 
        return;
    }

    someAction() {
        alert("action happed in other commpornt");
    }




    editProduct(productId, sim) {
        console.log("productid, row.sim", productId, sim)

        window.localStorage.setItem("selectedProductId", productId);
        window.localStorage.setItem("selectedSim", sim);

        this.props.history.push('/verify-edit');

        // this.props.history.push({
        //     pathname: '/edit-doc',
        //     search: '?query=abc',
        //     state: { rowdata: productId }
        //   })
    }

    convertBool(flag) {
        return flag ? 'Yes' : 'No';
    }


    handleChange = name => event => {
        this.setState({ ...this.state, selectedReasons: { ...this.state.selectedReasons, [name]: event.target.checked } });
    };



    render() {

        var rejectedReasons = this.state.rejectedReasons;
        var reasonList = [];
        for (var i = 0; i < rejectedReasons.length; i++) {
            if (rejectedReasons[i] == "Verification") {
                reasonList.push(<div> <label> <input selected type="checkbox" checked={true} /> {rejectedReasons[i]} </label></div>)

            } else {
                reasonList.push(<div> <label> <input selected type="checkbox" checked={false} /> {rejectedReasons[i]} </label></div>)

            }

        }



        return (

            <React.Fragment>
                <PostLoginNavBar />

                <Paper style={{ padding: "10px", overflow: "auto" }} >

                    <Grid container spacing={3} direction="row" alignItems="center" container>

                        <Grid item xs={12} sm={9} >
                            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                Role Management
                                </Typography>
                        </Grid>
                        {/* <Grid item xs={10} sm={3}> 
                                <FormControl style={styles.selectStyle}>
                                        <InputLabel id="demo-mutiple-name-label">Select Zone</InputLabel>
                                        <Select
                                        labelId="demo-mutiple-name-label"
                                        id="demo-mutiple-name"
                                        multiple
                                        name="selectedZone"
                                        value={this.state.selectedZone}
                                        onChange={this.zoneChange}
                                        input={<Input />}
                                        MenuProps={MenuProps}
                                        >
                                        {this.state.listofzones ? this.state.listofzones.map(name => (
                                            <MenuItem key={name} value={name} >
                                                {name}
                                            </MenuItem>
                                        )): ""}
                                        </Select>
                                    </FormControl>
                            </Grid> */}

                        {/* <Grid item xs={2} sm={2}  > 
                                <TextField  value={this.state.searchby}  label="Search by Mobile No."  style={{width:"100%"}} name="Search by Mobile No." name="searchby" onChange={this.onChange} />
                            </Grid> */}
                        {/* <Grid item xs={3} sm={3} alignItems="left">
                            <Button type="submit" onClick={() => this.searchOnDB(this.state.searchby)} variant="contained" style={{ marginLeft: '20px' }} >Add New</Button>
                        </Grid> */}

                    </Grid>






                    <div style={{ padding: "10px", overflow: "auto", height: "550px" }} >



                        {/* <Container  > */}
                        {/* <EnhancedTable products={this.state.products}/> */}

                        {/* <StickyHeadTable products={this.state.products} someAction={this.someAction}/>
                     */}


                        {/* <Typography variant="h5" style={styles.tableStyle}>&nbsp;Document Verification</Typography> */}
                        {/* <Button variant="contained" color="primary" onClick={() => this.addProduct()}>
                        Add Product
                    </Button> */}

                        {/* style={{whiteSpace: "nowrap"}}   stickyHeader aria-label="sticky table"*/}
                        <Paper style={{ padding: "10px", overflow: "auto" }} >

                            <Grid container spacing={3} direction="row" alignItems="center" container>


                                <Grid item xs={12} sm={6} >

                                    <Table size="small" aria-label="sticky table">
                                        <TableHead >
                                            <TableRow style={{ width: "170px", whiteSpace: "nowrap" }}>
                                                {/* <TableCell align="">View</TableCell> */}
                                                <TableCell> 
                                                    <Typography color="primary" gutterBottom>
                                                        Role Name
                                                    </Typography>
                                                </TableCell>

                                                <TableCell> 
                                                    <Typography color="primary" gutterBottom>
                                                        Delete
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody style={{ whiteSpace: "nowrap" }}>
                                            {this.state.searchedproducts ? this.state.searchedproducts.map(row => (
                                                <TableRow hover key={row.txnId} >
                                                    {/* <TableCell  align="center" onClick={() => this.editProduct(row.txnId,row.sim)}><VisibilityIcon style={{cursor:"hand"}} /></TableCell> */}

                                                    {row == "BO Agent" ?
                                                        <><TableCell component="th" scope="row" className="hidden">
                                                            <b> {row} </b> 
                                                        </TableCell>
                                                        <TableCell component="th" scope="row" className="hidden">
                                                        
                                                        <Button onClick={() => this.deleteRole()} variant="contained" style={{marginTop: "12px", marginLeft: "5px"}} size="small" color="secondary"> <DeleteForeverIcon/></Button> 
                                                   </TableCell> </>
                                                        :
                                                        <><TableCell component="th" scope="row" className="hidden">
                                                            {row}  
                                                        </TableCell>
                                                        <TableCell component="th" scope="row" className="hidden">
                                                         <Button onClick={() => this.deleteRole()} variant="contained" style={{marginTop: "12px", marginLeft: "5px"}} size="small" color="secondary"> <DeleteForeverIcon/></Button> 
                                                    </TableCell></>}




                                                </TableRow>
                                            )) : ""}
                                        </TableBody>
                                    </Table>
                                    {this.state.addNewEnable ? 
                                    <>
                                    <TextField label="Add New Role" style={{width: "525px"}}  name="roleName" value={this.state.roleName} onChange={this.onChange}/>
                                    <Button onClick={() => this.deleteNewRole()} variant="contained" style={{marginTop: "12px", marginLeft: "5px"}} size="small" color="secondary">Delete</Button> </>
                                    : ""}
                                    
                                </Grid>

                                <Grid item xs={12} sm={6} >
                                    <Typography color="primary" gutterBottom>
                                        Privileges
                            </Typography>
                                    {reasonList}
                                </Grid>


                            </Grid>

                            
                        {/* <br />
                            <Divider /> <br /> */}
                            <Grid container spacing={3} direction="row" alignItems="center" container>
                           

                                <Grid item xs={12} sm={6} >

                                    <Button onClick={() => this.addRole()} variant="contained" color="default"  style={{ marginLeft: '20px' }} >Add New Role</Button>

                                </Grid>

                                <Grid item xs={12} sm={6} >
                                    <Button variant="contained" color="primary" style={{ marginLeft: '20px' }} >Update</Button>


                                </Grid>
                            </Grid>




                        </Paper>




                        <div style={{ color: "gray", fontSize: "15px", textAlign: "center" }}> <br /> <span id="showMessage"> </span></div>

                        {/* </Container> */}

                    </div>

                </Paper>
            </React.Fragment>
        )
    }

}

const styles = {
    tableStyle: {
        display: 'flex',
        justifyContent: 'left'
    },
    tableRow: {
        hover: {
            "&:hover": {
                background: 'green !important',
            },
        },

    },

    selectStyle: {
        // minWidth: '100%',
        marginBottom: '0px',
        minWidth: 340,
        maxWidth: 340,
    }
}



export default RoleManagement;