import React, { Component } from "react";
import { Fade,Slide,Zoom } from 'react-slideshow-image';
import Grid from '@material-ui/core/Grid';
import $ from 'jquery';
import ReactPanZoom from "react-image-pan-zoom-rotate";


const fadeProperties = {
  defaultIndex:0,
  duration: 1000,
  transitionDuration: 100,
  infinite: false,
  indicators: true,
  arrows: true,
  scale: 0.5,
  autoplay:false,
  onChange: (oldIndex, newIndex) => {
    console.log(`fade transition from ${oldIndex} to ${newIndex}`);
  }
}


var degree = 90, scale=1;
function rotate(){
   
   $("#imageCon").css({'transform': 'rotate('+degree+'deg)'});
 degree += 90; 
 console.log("rotete called "); 
}

function zoomIn(){
   scale += 0.25;
 $("#imageCon").css({'transform': 'scale('+scale+')'});
 console.log("zoom in"); 

}


function zoomOut(){
   scale -= 0.25;
 $("#imageCon").css({'transform': 'scale('+scale+')'});
 console.log("zoom out"); 

}



class SlideSlowGalary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      photoIndex: 0,
      isOpen: false,
      scale:0
    };

    this.openImageGalary = this.openImageGalary.bind(this);

  }


  componentDidMount() {
    // document.addEventListener("keypress", function(t) {
    //   console.log("t.keyCode",t.keyCode)
    //   if(43 === t.keyCode || 61 === t.keyCode){
    //     zoomIn();
    //   }else if(45 === t.keyCode){
    //     zoomOut();
    //   }else if(17 == t.keyCode ){
    //     rotate();
    //   }
    // });
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
      // marginBottom: '-24px',
      fontSize: 'inherit',
      color:"white",
      fontWeight:"bold"
    }, 
    topImgStyle:{
    //  width:"100%", 
    //  height:"525px", 
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
    var  topImg = this.props.imageDetails.imageDetails;
    
    console.log(this.props.imageDetails,"vk" )
        
      var images = []; 
      const topImgItem = []
          topImg && topImg.map((data,i)=>{
            images.push(topImg[i].img); 
              topImgItem.push(

                <Grid item xs={12} sm={12} >  
                  <div className="each-fade" style={{verticalAlign:"middle !important"}}>
                        <div className="image-container"  style={{height:'70vh'}}> 
                        <div style={{textAlign:"center"}}> {data.title} </div> 

                          {/* <img  id="imageCon" src={data.img} /> */}
                          <ReactPanZoom image={data.img} alt={data.title}/>
                        </div>
                        
                      </div>
                </Grid>
                ); 

          })
      
 
    
    return (
       
      <div style={{justifyContent:"center"}}>


          <div className="slide-container">
                {/* <Fade {...fadeProperties}>
                 {topImgItem}
              </Fade> */}

               <Slide ref={this.props.imageDetails.slideRef} {...fadeProperties}>
                  {topImgItem}
               </Slide>

              {/* <Zoom {...fadeProperties}>
                 {topImgItem}
              </Zoom> */}
              
         </div>

        {/* {isOpen && (
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
        )} */}
      </div>
    );
  }
}


export default SlideSlowGalary;



//functional style 
// class SimpleAction extends React.Component {

//   render() {
//     return (
//       <div style={{height:"400px"}}>
//           <Slideshow />
//       </div>
     
//     )
//   }
// }

// const style={
//   setWH :{
//   height:"300px", 
//   width:"500px"
  

//   }
// }

// const Slideshow = (props) => {

//   console.log("props", props); 
//   var  topImg = props.imageDetails;

//   var images = []; 
//   const topImgItem = []
//   const buttomImgItem = []
//       topImg.map((data,i)=>{
//         images.push(topImg[i].img); 
//           topImgItem.push(
//             <Grid item xs={12} sm={12} >
//               <div className="each-fade">
//                     <div className="image-container">
//                     <img onClick={() => this.openImageGalary(i)} src={data.img}  style={styles.topImgStyle} />
//                     </div>
//                     <div style={styles.imgTextStyle}> {data.title} </div> 
//                   </div>
//             </Grid>
//             ); 

//       })
   

//   console.log("props", props); 
//   return (
//     <div className="slide-container">
//       <Fade {...fadeProperties}>
//         {topImgItem}
//       </Fade>
//     </div>
//   )
// }

// const styles = {
//   imgTextStyle : {
//     textAlign: 'center',
//     position: 'relative',
//     marginBottom: '-24px',
//     fontSize: 'inherit',
//     color:"white",
//     fontWeight:"bold"
//   }, 
//   topImgStyle:{
//     width:"100%", 
//     height:"390px", 
//     cursor:"zoom-in", 
//     borderRadius:"3px"
//   },
//   buttomImgSyle: {
//     width:"100%", 
//     height:"240px", 
//     cursor:"zoom-in", 
//     borderRadius:"3px"
//   },
//   displayBlock:{
//     display:'block', 
//   },
//   displayNone:{
//     display:'none', 
//   }

// };

// export default Slideshow;
