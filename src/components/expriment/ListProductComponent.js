import React, { useState }  from "react";
import productService from "../service/ProductService";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import VisibilityIcon from '@material-ui/icons/Visibility';
import CreateIcon from '@material-ui/icons/Create';
import PostLoginNavBar from "../PostLoginNavbar";
import {Container} from "@material-ui/core";
import {resolveResponse} from "../../utils/ResponseHandler";

class ListProductComponent extends React.Component{




    constructor(props) {
        super(props);
        this.state ={
            products: []
        };
        this.loadProductList = this.loadProductList.bind(this);
        this.addProduct = this.addProduct.bind(this);
        this.editProduct = this.editProduct.bind(this);
        this.convertBool = this.convertBool.bind(this);
    }

    componentDidMount() {
        this.loadProductList();
    }

    loadProductList() {
        productService.listProduct()
            .then((res) => {
                let data = resolveResponse(res);
               // this.setState({products: data.result.elements})

                data = [{
                    productName: "Vijay",
                    active:"yes",

                },{
                    productName: "Vijay",
                    active:"yes",

                },{
                    productName: "Vijay",
                    active:"yes",

                }]

               this.setState({products: data})
            });
    }

    addProduct() {
        this.props.history.push('/add-product');
    }

    editProduct(productId) {
        window.localStorage.setItem("selectedProductId", productId);
        this.props.history.push('/edit-product');
    }

    convertBool(flag) {
        return flag ? 'Yes' : 'No';
    }


  

    render(){
        return(
           <>
            <Typography variant="h5" >Verify Docs</Typography>
                    {/* <Button variant="contained" color="primary" onClick={() => this.addProduct()}>
                        Add Product
                    </Button> */}
            <Table >
                <TableHead style={{wordWrap: 'normal'}}>
                    <TableRow>
                        <TableCell align="center">Product Name</TableCell>
                        <TableCell align="center">Display Name</TableCell>
                        <TableCell align="center">Active</TableCell>
                        <TableCell align="center">Serving Time (in Mins)</TableCell>
                        <TableCell align="center">Priority</TableCell>
                        <TableCell align="center">Icon Url</TableCell>
                        <TableCell align="center">Online Booking</TableCell>
                        <TableCell align="center">Show Recent</TableCell>
                        <TableCell align="center">Help Text</TableCell>
                        <TableCell align="center">Help Text Image</TableCell>
                        <TableCell align="center">Actions</TableCell>

                    </TableRow>
                </TableHead>
                <TableBody>
                    {this.state.products.map(row => (
                        <TableRow key={row.productName}>
                            <TableCell component="th" scope="row" className="hidden">
                                {row.productName}
                            </TableCell>
                            <TableCell align="center">{row.displayName}</TableCell>
                            <TableCell align="center">{row.active ? 'Yes' : 'No'}</TableCell>
                            <TableCell align="center">{row.servingTimeInMins}</TableCell>
                            <TableCell align="center">{row.priority}</TableCell>
                            <TableCell align="center">{row.iconUrl}</TableCell>
                            <TableCell align="center">{this.convertBool(row.onlineBooking)}</TableCell>
                            <TableCell align="center">{this.convertBool(row.showRecent)}</TableCell>
                            {/* <TableCell align="right">{row.tagUrl}</TableCell>*/}
                            <TableCell align="center">{row.helpText}</TableCell>
                            <TableCell align="center">{row.helpTextImage}</TableCell>
                            <TableCell align="center" onClick={() => this.editProduct(row.id)}><CreateIcon /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
           </>
        )
    }

}

const styles = {
    tableStyle : {
        display: 'flex',
        justifyContent: 'center'
    }
}


export default ListProductComponent;