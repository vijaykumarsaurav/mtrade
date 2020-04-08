import React, { Component } from "react";
import { render } from "react-dom";
//import Lightbox from "react-image-lightbox";
//import Lightbox from "react-image-lightbox-rotate-fixed";

import Lightbox from "rhino-react-image-lightbox-rotate";
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import $ from 'jquery';

import "react-image-lightbox/style.css";

import RecipeReviewCard from './RecipeReviewCard'; 

// const images = [
//   "https://www.motoroids.com/wp-content/uploads/2019/03/Current-Driver-license-front-side-1200x675.jpg",
//   "https://cdn.hpm.io/wp-content/uploads/2015/01/04114540/texas-roadside-assistance2-1000x750.jpg", 
//   "https://www.graphic.com.gh/images/2017/july/july18/signature.png",
//   "https://pbs.twimg.com/media/Bpbm1DXCAAA5vk4?format=jpg&name=900x900"
// ];

class ImageGalary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      photoIndex: 0,
      isOpen: false
    };

    this.openImageGalary = this.openImageGalary.bind(this);

  }



  openImageGalary = (index) => {


    console.log("index", index); 
    this.setState({
      isOpen: true,
      photoIndex:index
      // mainSrc:'https://pbs.twimg.com/media/Bpbm1DXCAAA5vk4?format=jpg&name=900x900'
    });




    
    $('.MuiToolbar-root').hide();
   
  }


  render() {
    const { photoIndex, isOpen } = this.state;

    const imageDetails = this.props.imageDetails; 

    
    
      var images = []; 
      const imageItems = []

     if(this.props.imageDetails){
        for(var i=0; i<imageDetails.length; i++){
          images.push(imageDetails[i].img); 
          imageItems.push(<Grid item xs={4}><RecipeReviewCard onClick={() => this.openImageGalary(i)}   imageDetails={imageDetails[i] }  /> </Grid>)
        }
     }

     


      const styles = {
        imageFormat : {
            cursor: 'zoom-in',
            borderRadius: 5
        },
      };

      // const elements = ['one', 'two', 'three'];

      // const items = []

      // for (const [index, value] of elements.entries()) {
      //   items.push(<RecipeReviewCard imageDetails={imageDetails[0]}/>)
      // }

   
    
    return (
      <div style={{justifyContent:"center"}}>


           {/* <Grid container  spacing={24} 
                            direction="row"
                            justify="center"
                            alignItems="center">
          <div style={{padding:"20px"}}>
          {imageItems}

          </div>

            </Grid>
 */}

         {/* <table cellSpacing="20"> 
          <tr> 
            <td> <RecipeReviewCard imageDetails={imageDetails[0]}/>  </td> 
            <td> <RecipeReviewCard imageDetails={imageDetails[1]} /> </td> 
          </tr> 
        </table> */}

        {/* <Grid container  spacing={24}  direction="row" justify="center" alignItems="center">
          {imageItems}
        </Grid> */}


        <table cellSpacing="20"> 
          <tr> 
            <td style={{textAlign:"center"}}> {imageDetails[0].title} <img style={styles.imageFormat} width="250" height="200"  onClick={() => this.openImageGalary(0)}   src={images[0]}/>  </td> 
          </tr> 
          
        </table>


        {/* <Button size="small" variant="contained" color="default"  onClick={() => {this.setState({ isOpen: true }); $('.MuiToolbar-root').hide();} }>
          Open in Galary
        </Button> */}

          {/* <Button size="small" variant="contained" color="default" onClick={this.openImageGalary }>
          Open in Galary
        
          </Button> */}

        {isOpen && (
          <Lightbox
            mainSrc={images[photoIndex]}
            nextSrc={images[(photoIndex + 1) % images.length]}
            prevSrc={images[(photoIndex + images.length - 1) % images.length]}
            onCloseRequest={() => {this.setState({ isOpen: false }); $('.MuiToolbar-root').show(); }}
            onMovePrevRequest={() =>{
              this.setState({
                photoIndex: (photoIndex + images.length - 1) % images.length
              })
             
            }
              
            }
            onMoveNextRequest={() =>
              this.setState({
                photoIndex: (photoIndex + 1) % images.length
              })
            }
          />
        )}
      </div>
    );
  }
}

export default ImageGalary; 


// render(<App />, document.getElementById("root"));
