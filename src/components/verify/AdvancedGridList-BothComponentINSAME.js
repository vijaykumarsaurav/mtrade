import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import IconButton from '@material-ui/core/IconButton';
import StarBorderIcon from '@material-ui/icons/StarBorder';
//import tileData from './tileData';
//import ImageGalary from './ImageGalary'
//import Lightbox from 'react-image-lightbox';


import Lightbox from "rhino-react-image-lightbox-rotate";
import Button from '@material-ui/core/Button';
import $ from 'jquery';
import "react-image-lightbox/style.css";

var classes = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    //backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: 500,
    height: 450,
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: 'translateZ(0)',
  },
  titleBar: {
    background:
      'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, ' +
      'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
  },
  icon: {
    color: 'white',
  },
}



class ImageGalary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      photoIndex: 0,
      isOpen: false, 
      openImageGalary : this.openImageGalary.bind(this),

    };
  }



  openImageGalary = () => {
 //   alert("openImageGalary called " )
    this.setState({
      isOpen: true
    });

   // this.isOpen = true ;
    $('.MuiToolbar-root').hide();
   
  }


  render() {
    const { photoIndex, isOpen } = this.state;

    console.log("lignghbox img url", this.props.images)
   
   var images = [
      "https://www.motoroids.com/wp-content/uploads/2019/03/Current-Driver-license-front-side-1200x675.jpg",
      "https://cdn.hpm.io/wp-content/uploads/2015/01/04114540/texas-roadside-assistance2-1000x750.jpg", 
      "https://www.graphic.com.gh/images/2017/july/july18/signature.png",
      "https://pbs.twimg.com/media/Bpbm1DXCAAA5vk4?format=jpg&name=900x900"
    ];
     if(this.props.images){
      images = [
        this.props.images
      ];
     }

   
    
    return (
      <div style={{justifyContent:"center"}}>


        {/* <Button size="small" variant="contained" color="default"  onClick={() => {this.setState({ isOpen: true }); $('.MuiToolbar-root').hide();} }>
          Open in Galary
        </Button> */}

          <Button size="small" variant="contained" color="default" onClick={this.openImageGalary }>
          Open in Galary
          </Button>

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

class AdvancedGridList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tileData  : props.imageList, 
     // openGalaryChild : this.openGalaryChild.bind(this),
      
    };
  }



  openGalaryChild = () => {


       alert("openImageGalary  child called " )
       this.setState({
         isOpen: true
       });
   
    //  ImageGalary.isOpen = true ;
       $('.MuiToolbar-root').hide();
      
     }
   


  render(props){
    // const useStyles = makeStyles(theme => ({
    //   root: {
    //     display: 'flex',
    //     flexWrap: 'wrap',
    //     justifyContent: 'space-around',
    //     overflow: 'hidden',
    //     backgroundColor: theme.palette.background.paper,
    //   },
    //   gridList: {
    //     width: 500,
    //     height: 450,
    //     // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    //     transform: 'translateZ(0)',
    //   },
    //   titleBar: {
    //     background:
    //       'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, ' +
    //       'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
    //   },
    //   icon: {
    //     color: 'white',
    //   },
    // }));
    
  
  //  const classes = useStyles();
    var tileData = [
         {
           img: 'https://www.motoroids.com/wp-content/uploads/2019/03/Current-Driver-license-front-side-1200x675.jpg',
           title: 'Front Image',
           author: 'Front Image',
           featured: true,
         },
         {
          img: 'https://cdn.hpm.io/wp-content/uploads/2015/01/04114540/texas-roadside-assistance2-1000x750.jpg',
          title: 'Back Image',
          author: 'Back Image',
          featured: true,
        },
        {
          img: 'https://www.graphic.com.gh/images/2017/july/july18/signature.png',
          title: 'Customer Signature',
          author: 'Customer Signature',
          featured: true,
        }];

    console.log(this.imageList)
      //  var tileData = '';
      //   if(props.imageList){
      //     tileData =  props.imageList;
      //   }

      var imageGalary = new ImageGalary(); 

       
    
  
    return (
  
      <div className={classes.root}>

       <Button size="small" variant="contained" color="default" onClick={this.props.openImageGalary }>
          Open in Galary Image vijay
       </Button>

          
        <GridList cellHeight={200} spacing={1} className={classes.gridList}>
          { tileData.map(tile => (
            <GridListTile key={tile.img} cols={tile.featured ? 2 : 1} rows={tile.featured ? 2 : 1}>
              
              <img src={tile.img} alt={tile.title} onClick={ImageGalary.openImageGalary} />
              <GridListTileBar
                title={tile.title}
                titlePosition="top"
                actionIcon={
                  <IconButton aria-label={`star ${tile.title}`} className={classes.icon}>
                    <StarBorderIcon />
                  </IconButton>
                }
                actionPosition="left"
                className={classes.titleBar}
              />
            </GridListTile>
          ))}
        </GridList>
      </div>
    );
  }
}


export default AdvancedGridList;

// export default function AdvancedGridList(props) {
//   const useStyles = makeStyles(theme => ({
//     root: {
//       display: 'flex',
//       flexWrap: 'wrap',
//       justifyContent: 'space-around',
//       overflow: 'hidden',
//       backgroundColor: theme.palette.background.paper,
//     },
//     gridList: {
//       width: 500,
//       height: 450,
//       // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
//       transform: 'translateZ(0)',
//     },
//     titleBar: {
//       background:
//         'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, ' +
//         'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
//     },
//     icon: {
//       color: 'white',
//     },
//   }));
  

//   const classes = useStyles();
//   // var tileData = [
//   //      {
//   //        img: 'https://www.motoroids.com/wp-content/uploads/2019/03/Current-Driver-license-front-side-1200x675.jpg',
//   //        title: 'Front Image',
//   //        author: 'Front Image',
//   //        featured: true,
//   //      },
//   //      {
//   //       img: 'https://cdn.hpm.io/wp-content/uploads/2015/01/04114540/texas-roadside-assistance2-1000x750.jpg',
//   //       title: 'Back Image',
//   //       author: 'Back Image',
//   //       featured: true,
//   //     },
//   //     {
//   //       img: 'https://www.graphic.com.gh/images/2017/july/july18/signature.png',
//   //       title: 'Customer Signature',
//   //       author: 'Customer Signature',
//   //       featured: true,
//   //     }];
//      var tileData = '';
//       if(props.imageList){
//         tileData =  props.imageList;
//       }
     
  

//   return (

//     <div className={classes.root}>
        
//       <GridList cellHeight={200} spacing={1} className={classes.gridList}>
//         {tileData.map(tile => (
//           <GridListTile key={tile.img} cols={tile.featured ? 2 : 1} rows={tile.featured ? 2 : 1}>
//             <img src={tile.img} alt={tile.title} onClick={ImageGalary.openImageGalary} />
//             <GridListTileBar
//               title={tile.title}
//               titlePosition="top"
//               actionIcon={
//                 <IconButton aria-label={`star ${tile.title}`} className={classes.icon}>
//                   <StarBorderIcon />
//                 </IconButton>
//               }
//               actionPosition="left"
//               className={classes.titleBar}
//             />
//           </GridListTile>
//         ))}
//       </GridList>
//     </div>
//   );
// }
