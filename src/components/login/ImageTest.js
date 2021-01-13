import React from 'react';
//import AdminWelcome from '../adminwelcome.png';
import CryptoJS  from 'crypto-js'; 
import  {IMAGE_VALIDATION_TOKEN} from "../../utils/config";
import PostLoginNavBar from "../PostLoginNavbar";
import UserService from "../service/UserService";



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
        document.cookie = "token="+IMAGE_VALIDATION_TOKEN;

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

        fetch('http://localhost/one.png',{headers: {token:localStorage.getItem('token')}}).then(r=>r.blob()).then(d=> this.src=window.URL.createObjectURL(d));

      }

      getImage(filename){

        var myImage = document.querySelector('img');

        UserService.imageLoad( filename ).then(res => {
            try{ 
               // var objectURL = URL.createObjectURL(res);
              // var objectURL =  window.URL.createObjectURL(new Blob(res, {type: "image/png"}))
              // new File([res], "filename.json", {type: "text/json;charset=utf-8"});

             //  myImage.src =  new File([res], "filename.json", {type: "text/json;charset=utf-8"});;
             //const byteCharacters = atob(res);

            // myImage.src  = 'data:image/jpeg;base64,' + byteCharacters;

            var reader = new window.FileReader();
            reader.readAsDataURL(res.data); 
            reader.onload = function() {
    
            // var imageDataUrl = reader.result;
            //  myImage.src  =  reader.result;
            // console.log(reader.result); 
            //return reader.result;
            
            document.getElementById('img')
            .setAttribute(
                'src', reader.result
            );
            }


            }catch(e){
                console.error('Error:', e);
            }
           
            //return res; 
        })


    //     var myImage = document.querySelector('img');

    //     fetch('http://localhost/one.png', {headers: {token:localStorage.getItem('token')}}).then(function(response) {
    //     return response.blob();
    //     }).then(function(myBlob) {
           
    //     var objectURL = URL.createObjectURL(myBlob);
    //    //  console.error('objectURL:', objectURL);
    //     myImage.src = objectURL;
    //     }).catch(error => {
    //         console.error('Error:', error);
    //     });


        //fetch('http://localhost/one.png',{ 'headers': {'Authorization': 'Bearer ' + localStorage.getItem("token"), 'Access-Control-Allow-Origin': '*' } }).then(r=>r.blob()).then(d=> this.src=window.URL.createObjectURL(d));

    
      }

      


    render() {

        return(
            <React.Fragment>
                 <PostLoginNavBar/>
 
                 {/* <img id="imgtest" title="by function load" onLoad={this.loadImage('http://125.17.6.6/apk/retailer/prepaid-acquisition/750046464/750046464_1608811631058_poi_front_image.jpeg',IMAGE_VALIDATION_TOKEN, 'imgtest' )} /> */}

                 {/* <img style={styles.imagestyle} src={"http://125.17.6.6/apk/retailer/prepaid-acquisition/750046464/750046464_1608811631058_poi_front_image.jpeg?token="+localStorage.getItem('token')} /> */}
                 
                 {/* <img style={styles.imagestyle} src={"http://localhost/one.png?token="+localStorage.getItem('token')} /> */}
                 {/* <img style={styles.imagestyle} src={this.getImage('one.png')} /> */}

                 {/* <img id="img" onload={this.loadImage('one.png')} /> */}
                 {/* <img src={this.getImage('http://125.17.6.6/apk/retailer/prepaid-acquisition/750046464/750046464_1608811631058_poi_front_image.jpeg')}/> */}

                 {/* <img src onerror="fetch('https://picsum.photos/200',{headers: {hello:'World!'}}).then(r=>r.blob()).then(d=> this.src=window.URL.createObjectURL(d));" /> */}
                {/* <img title="fetch imgvk" src={fetch('http://localhost/one.png',{headers: {token:localStorage.getItem('token')}}).then(r=>r.blob()).then(d=> this.src=window.URL.createObjectURL(d))} /> */}
           
                <img title="fetch imgvk" src='http://125.17.6.6/apk/retailer/prepaid-acquisition/750046464/750046464_1608811631058_poi_front_image.jpeg' />

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

