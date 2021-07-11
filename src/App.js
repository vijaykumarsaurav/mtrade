import React from 'react';
import './App.css';
import AppRouter from "./components/RouterComponent";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


function App() {
  
  return (
    <React.Fragment>
        <AppRouter/>
        <ToastContainer/>
    </React.Fragment>
  );
}

export default App;
