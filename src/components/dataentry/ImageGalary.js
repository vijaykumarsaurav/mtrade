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



  const styles = {
    imgTextStyle : {
      textAlign: 'center',
      position: 'relative',
      marginBottom: '-24px',
      fontSize: 'inherit',
      color:"white",
      fontWeight:"bold"
    }, 
    topImgStyle:{
      width:"100%", 
      height:"390px", 
      cursor:"zoom-in", 
      borderRadius:"3px"
    },
    buttomImgSyle: {
      width:"100%", 
      height:"240px", 
      cursor:"zoom-in", 
      borderRadius:"3px"
    },
    displayBlock:{
      display:'block', 
    },
    displayNone:{
      display:'none', 
    }

  };

    const { photoIndex, isOpen } = this.state;
    const imageDetails = this.props.imageDetails;
    
      var images = []; 
      const topImgItem = []
      const buttomImgItem = []


      // topImg: topImg,
      // bottomImg :bottomImg

      var  topImg = this.props.imageDetails;

      topImg.map((data,i)=>{
        images.push(topImg[i].img); 

        if(data.title == "POI Front Image" || data.title == "POI Back Image"){
          topImgItem.push(
            <Grid item xs={12} sm={12} >
              <div style={styles.imgTextStyle}> {data.title} </div> 
              <img onClick={() => this.openImageGalary(i)} src={data.img}  style={styles.topImgStyle} />
            </Grid>
            ); 
        }else{
          buttomImgItem.push(
            <Grid item xs={12} sm={4} onClick={() => this.openImageGalary(i)}>
             <div style={styles.imgTextStyle}> {data.title} </div>
             <img onClick={() => this.openImageGalary(i)}  src={data.img}  style={styles.buttomImgSyle} />
           </Grid>
            ); 
        }
      })
   

 
    
    return (
       
      <div style={{justifyContent:"center"}}>

            <Grid container  spacing={1}  direction="row" justify="center" alignItems="center">
            {topImgItem}
              {/* <Grid style={images[0] ? styles.displayBlock : styles.displayNone} item xs={12} sm={6}  onClick={() => this.openImageGalary(0)} >
                <div style={styles.imgTextStyle}> {imageDetails[0].title} </div>
                <img onClick={() => this.openImageGalary(0)}  src={images[0]}  style={styles.topImgStyle} />
              </Grid>

              <Grid style={images[1] ? styles.displayBlock : styles.displayNone}  item xs={12} sm={6}  onClick={() => this.openImageGalary(1)} >
                <div style={styles.imgTextStyle}> {imageDetails[1].title} </div>
                <img onClick={() => this.openImageGalary(1)}  src={images[1]}  style={styles.topImgStyle} />
              </Grid> */}

              
            </Grid>

            <Grid container  spacing={1} direction="row" justify="center" alignItems="center">
            {buttomImgItem}
              {/* <Grid style={images[2] ? styles.displayBlock : styles.displayNone}  item xs={12} sm={4} onClick={() => this.openImageGalary(2)}>
                <div style={styles.imgTextStyle}> {imageDetails[2].title} </div>
                <img onClick={() => this.openImageGalary(2)}  src={images[2]}  style={styles.buttomImgSyle} />
              </Grid>

               <Grid style={images[3] ? styles.displayBlock : styles.displayNone}  item xs={12} sm={4} onClick={() => this.openImageGalary(3)}>
                <div style={styles.imgTextStyle}> {imageDetails[3].title} </div>
                <img onClick={() => this.openImageGalary(3)}  src={images[3]}  style={styles.buttomImgSyle} />
              </Grid>

               <Grid style={images[4] ? styles.displayBlock : styles.displayNone}  item xs={12} sm={4} onClick={() => this.openImageGalary(4)}>
                <div style={styles.imgTextStyle}> {imageDetails[4].title} </div>
                <img onClick={() => this.openImageGalary(4)}  src={images[4]}  style={styles.buttomImgSyle} />
              </Grid> */}
            </Grid>

          
            {/* <table cellSpacing="0">
              <tr> 
                <td style={{textAlign:"center"}}><img style={styles.imageFormat} style={{width:"100%", height:"300px", cursor:"zoom-in", borderRadius:"3px"}}   onClick={() => this.openImageGalary(0)}   src={images[0]}/><br />{imageDetails[0].title}  </td> 
                <td  colSpan="2" style={{textAlign:"center"}}><img style={styles.imageFormat}  style={{width:"100%", height:"300px", cursor:"zoom-in", borderRadius:"3px"}}   onClick={() => this.openImageGalary(1)}  src={images[1]} /><br/>{imageDetails[1].title}</td> 
              </tr> 
              <tr> 
                <td style={{textAlign:"center"}}> <img style={styles.imageFormat}  style={{width:"100%", height:"200px", cursor:"zoom-in", borderRadius:"3px"}} onClick={() => this.openImageGalary(2)}  src={images[2]}/><br />{imageDetails[2].title}</td> 
                <td style={{textAlign:"center"}}><img  style={styles.imageFormat}  style={{width:"100%", height:"200px", cursor:"zoom-in", borderRadius:"3px"}}  onClick={() => this.openImageGalary(3)}  src={images[3]}/><br />{imageDetails[3].title} </td> 
                <td style={{textAlign:"center"}}><img  style={styles.imageFormat}  style={{width:"100%", height:"200px", borderRadius:"3px"}} onClick={() => this.openImageGalary(2)}  src={images[3]}/><br />{imageDetails[3].title} </td> 
              </tr> 
            </table>  */}

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