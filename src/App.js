import React from 'react';
import './App.css';
import AppRouter from "./components/RouterComponent";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
//import LoginComponent from "./login/LoginComponent";

import LoginComponent from "./components/login/LoginComponent";



function App() {
  const token = window.localStorage.getItem("token"); 

  // if(!token){
  //    window.location.replace(window.location.pathname + "/#/login");  
  // }

  return (
    <React.Fragment>
        <AppRouter/>
        <ToastContainer/>
    </React.Fragment>
  );
}

export default App;
