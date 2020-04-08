import React, { useState }  from "react";
import RetailerAdminService from "../service/RetailerAdminService";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";


import VisibilityIcon from '@material-ui/icons/Visibility';
import CreateIcon from '@material-ui/icons/Create';
import PostLoginNavBar from "../PostLoginNavbar";
import {Container} from "@material-ui/core";
import {resolveResponse} from "../../utils/ResponseHandler";
import { withStyles, makeStyles } from '@material-ui/core/styles';


class BaneerList extends React.Component{

    constructor(props) {
        super(props);
        this.state ={
            products: []
        };
        this.loadPackList = this.loadPackList.bind(this);
        this.addProduct = this.addProduct.bind(this);
        this.editProduct = this.editProduct.bind(this);
        this.convertBool = this.convertBool.bind(this);
    }

    componentDidMount() {
        this.loadPackList();
    }

    loadPackList() {
        RetailerAdminService.getAllBanner()
            .then((res) => {
                let data = resolveResponse(res);
                console.log("rechage pack",data); 
               // this.setState({products: data.result.elements})

                data = 
                {
                    "status": 200,
                    "message": "ok",
                    "data": [
                        {
                            "title": "title2",
                            "active": true,
                            "order": 1,
                            "bannerType": "type1",
                            "lob": "prepaid",
                            "section": "one",
                            "categoryType": "Recharhe",
                            "category": "bonus",
                            "forAndroid": "true",
                            "forIos": "true",
                            "forWindows": "true",
                            "publishDay": 12345678,
                            "expireDay": 1234566,
                            "updateTime": "1234567",
                            "updateBy": "mansi",
                            "imageURL": "https://4.bp.blogspot.com/-uPKBsk8Y0y0/WNyMLHTt9JI/AAAAAAAAAj0/V7RMPY-36o0DjUa-yVIT_VkYetGZ6MWBwCLcB/s1600/Airtel%2Bme%2Bfree%2Binternet%2Bki%2Btrick.jpg",
                            "createdOn": null,
                            "lastModifiedOn": null
                        },
                        {
                            "title": "title3",
                            "active": true,
                            "order": 1,
                            "bannerType": "type1",
                            "lob": "prepaid",
                            "section": "one",
                            "categoryType": "Recharhe",
                            "category": "bonus",
                            "forAndroid": "true",
                            "forIos": "true",
                            "forWindows": "true",
                            "publishDay": 12345678,
                            "expireDay": 1234566,
                            "updateTime": "1234567",
                            "updateBy": "mansi",
                            "imageURL": "https://www.earticleblog.com/wp-content/uploads/2014/07/freePromoBanner.jpg",
                            "createdOn": null,
                            "lastModifiedOn": null
                        },
                        {
                            "title": "title1",
                            "active": true,
                            "order": 1,
                            "bannerType": "type1",
                            "lob": "prepaid",
                            "section": "one",
                            "categoryType": "Recharhe",
                            "category": "bonus",
                            "forAndroid": "true",
                            "forIos": "true",
                            "forWindows": "true",
                            "publishDay": 12345678,
                            "expireDay": 1234566,
                            "updateTime": "1234567",
                            "updateBy": "mansi",
                            "imageURL": "https://i.ytimg.com/vi/T67CdTaHyaY/maxresdefault.jpg",
                            "createdOn": null,
                            "lastModifiedOn": null
                        }
                    ]
                };


                if(data.data){
                    this.setState({products: data.data})
                }
            });
    }

    addProduct=(e)=> {
        this.props.history.push('/banner-edit');
    }

    editProduct(productId) {
        window.localStorage.setItem("selectedProductId", productId);
        this.props.history.push('/banner-edit');
    }

    convertBool(flag) {
        return flag ? 'Yes' : 'No';
    }


  

    render(){

          
        return(
        <React.Fragment>
            <PostLoginNavBar/>

               
               <Typography variant="h5" style={{ flex: 1 }}>Banner Upload</Typography>

                <Grid  container spacing={24} container
                direction="row"
                justify="flex-end"
                >

                {/* <Grid item xs={12} sm={6}>
                    <Typography variant="h5" style={{ flex: 0 }}> Banner Upload</Typography>
                </Grid>

                <Grid item xs={12} sm={6} alignContent="flex-end" alignItems="flex-end" >
                    <Button  variant="contained" color="primary" onClick={() => this.addProduct()}>
                        Add Pack
                    </Button>
                </Grid> */}

                 <Button  variant="contained" color="primary" onClick={() => this.addProduct()}>
                        Add Banner
                    </Button>
 
                </Grid>

            <Paper> 

            
            <Table >
                <TableHead style={{wordWrap: 'normal', background:"lightgrey",  wordWrap:"break-word"}} variant="head">
                    <TableRow variant="head">
                        <TableCell align="center">Image</TableCell>
                        <TableCell align="center">Title</TableCell>
                        <TableCell align="center">Banner Type</TableCell>
                        <TableCell align="center">Active</TableCell>
                        <TableCell align="center">Lob</TableCell>
                        <TableCell align="center">Section</TableCell>
                        <TableCell align="center">Category Type</TableCell>
                        <TableCell align="center">Category</TableCell>
                        <TableCell align="center">Expire Days</TableCell>
                        <TableCell align="center">Edit</TableCell>

                    </TableRow>
                </TableHead>
                <TableBody>



                    {this.state.products.map(row => (
                        <TableRow key={row.productId}>
                           
                            <TableCell align="center"> <img style={{width:"100px", height:"50px"}} src={row.imageURL} /> </TableCell>
                            <TableCell align="center">{row.title}</TableCell>
                            <TableCell align="center">{row.bannerType}</TableCell>
                            <TableCell align="center">{row.active ? 'Active' : 'Inactive'}</TableCell>
                            <TableCell align="center">{row.lob}</TableCell>
                            <TableCell align="center">{row.section}</TableCell>
                            <TableCell align="center">{row.categoryType}</TableCell>
                            <TableCell align="center">{row.category}</TableCell>
                            <TableCell align="center">{row.expireDay}</TableCell>
                            <TableCell align="center" onClick={() => this.editProduct(row.id)}><CreateIcon /></TableCell>
                        </TableRow>
                    ))}
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


export default BaneerList;