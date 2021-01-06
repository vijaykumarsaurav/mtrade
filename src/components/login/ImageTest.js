import React from 'react';
//import AdminWelcome from '../adminwelcome.png';
import CryptoJS  from 'crypto-js'; 
import  {IMAGE_VALIDATION_TOKEN} from "../../utils/config";
import PostLoginNavBar from "../PostLoginNavbar";


class ImageTest extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            userName: "",
            password: "vkkkk123", 
            isDasable:false,
            isError:false,

            
        };
       
    }
    componentDidMount() {
        // var keynum = Math.floor(Math.random()*1E16);
        // if(keynum.toString().length == 15){
        //     keynum = keynum.toString() + "9"; 
        // }
        // var atualkey = (keynum * 69-99).toString(); 
        // atualkey =  atualkey.substring(0, 15);

        // console.log("ekynum",keynum,"atualkey", atualkey  ); 
       // var encryptedPass = CryptoJS.AES.encrypt( this.state.password, atualkey);
  
       
       var keynum = new Date( new Date().getTime() + 60000 * 2 ).getTime() / 1000; 
       var token =   btoa("5dbc98dcc983a70728bd082d1a47546e@"+parseInt( keynum )); 
      //atob("dmlqYXk=")
       // this.setState({ encryptedPass : token,  keynum:  parseInt( keynum ) });

        this.setState({ encryptedPass : token,  keynum:  parseInt( keynum ) });
       // this.loadImage();
      }

      loadImage(src, token, id){
       
        let response = fetch('http://125.17.6.6/apk/retailer/prepaid-acquisition/750046464/750046464_1608811631058_poi_front_image.jpeg', {
            headers: {
              token: IMAGE_VALIDATION_TOKEN
            }
          });
          console.log("response",response);

      }


    render() {

        return(
            <React.Fragment>
                 <PostLoginNavBar/>
 
                 {/* <img id="imgtest" title="by function load" onLoad={this.loadImage('http://125.17.6.6/apk/retailer/prepaid-acquisition/750046464/750046464_1608811631058_poi_front_image.jpeg',IMAGE_VALIDATION_TOKEN, 'imgtest' )} /> */}

                 <img style={styles.imagestyle} src={"http://125.17.6.6/apk/retailer/prepaid-acquisition/750046464/750046464_1608811631058_poi_front_image.jpeg?token="+IMAGE_VALIDATION_TOKEN} />
                 
                 {/* <img style={styles.imagestyle} src={"http://localhost/one.png?token="+this.state.encryptedPass} /> */}
            </React.Fragment>
        )

    }

  

}

const styles ={
    formStyle :{
        display: 'flex',
        flexFlow: 'row wrap'
    },
    label: {
        display: 'flex',
        justifyContent: 'center'
    },
    errorMessage:{
        color:"red",
        marginTop: '11px'
    },
    waitMessage:{
        color:"gray",
        marginTop: '11px'
    },
    imagestyle:{
        width:"100%",
        height: '100vh'
    }

}

export default ImageTest;

