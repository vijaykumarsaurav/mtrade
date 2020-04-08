import React from 'react';
import MaterialTable from 'material-table';
import productService from "../service/ProductService";
import {resolveResponse} from "../../utils/ResponseHandler";


class SimpleAction extends React.Component {

    loadVerifyDocsList() {
        productService.listDocs()
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
 
  render() {
    return (
    
      <MaterialTable
        title="Document Verify"
        columns={[
          { title: 'Name', field: 'name' },
          { title: 'Surname', field: 'surname' },
          { title: 'Birth Year', field: 'birthYear', type: 'numeric' },
          {
            title: 'Birth Place',
            field: 'birthCity',
            lookup: { 34: 'İstanbul', 63: 'Şanlıurfa' },
          },
          { title: 'Name', field: 'name' },
          { title: 'Surname', field: 'surname' },
          { title: 'Birth Year', field: 'birthYear', type: 'numeric' },
          {
            title: 'Birth Place',
            field: 'birthCity',
            lookup: { 34: 'İstanbul', 63: 'Şanlıurfa' },
          },{ title: 'Name', field: 'name' },
          { title: 'Surname', field: 'surname' },
          { title: 'Birth Year', field: 'birthYear', type: 'numeric' },
          {
            title: 'Birth Place',
            field: 'birthCity',
            lookup: { 34: 'İstanbul', 63: 'Şanlıurfa' },
          },
        ]}
        data={[
          { name: 'Mehmet', surname: 'Baran', birthYear: 1987, birthCity: 63 },
          { name: 'Zerya Betül', surname: 'Baran', birthYear: 2017, birthCity: 34 },
          { name: 'Zerya Betül', surname: 'Baran', birthYear: 2017, birthCity: 34 },
          { name: 'Mehmet', surname: 'Baran', birthYear: 1987, birthCity: 63 },
          { name: 'Zerya Betül', surname: 'Baran', birthYear: 2017, birthCity: 34 },
          { name: 'Zerya Betül', surname: 'Baran', birthYear: 2017, birthCity: 34 },
          { name: 'Mehmet', surname: 'Baran', birthYear: 1987, birthCity: 63 },
          { name: 'Zerya Betül', surname: 'Baran', birthYear: 2017, birthCity: 34 },
          { name: 'Zerya Betül', surname: 'Baran', birthYear: 2017, birthCity: 34 },
          { name: 'Mehmet', surname: 'Baran', birthYear: 1987, birthCity: 63 },
          { name: 'Zerya Betül', surname: 'Baran', birthYear: 2017, birthCity: 34 },
          { name: 'Zerya Betül', surname: 'Baran', birthYear: 2017, birthCity: 34 },
          { name: 'Mehmet', surname: 'Baran', birthYear: 1987, birthCity: 63 },
          { name: 'Vijay', surname: 'Baran', birthYear: 2017, birthCity: 34 },
          { name: 'Zerya Betül', surname: 'Baran', birthYear: 2017, birthCity: 34 },

        ]}        
        actions={[
          {
            icon: 'save',
            tooltip: 'Save User',
            onClick: (event, rowData) => alert("You saved " + rowData.name)
          }
        ]}
      />
    )
  }
}



export default SimpleAction;
