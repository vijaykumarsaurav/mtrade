import React from 'react';

class TreeView extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            isError:false,
            treeData: [
              {
                name: "a",
                child: [
                  {
                    name: "a1"
                  },
                  {
                    name: "a2",
                    child: [{ name: "a2.1" }]
                  }
                ]
              },
              {
                name: "b",
                child:[]
              }
            ]
        };
       
    }
  
  // for (let index = 0; index < treeData.length; index++) {
  //   const element = treeData[index];
  //   if(element[i].child.length){
        
  //   }
  // }

    getChildElement =(row)=> {
       
    }
    getTreeData =()=>{
        let treeData = this.state.treeData && this.state.treeData.map((row, i)  => (
                 
            <ul> row.name </ul> 
            {row.child.length ? row.child.map(innerItem => (   
                 this.getChildElement(); 
                // <li>{innerItem.name} </li>
            
            )) : ""}

     ))

    }
    render(){

       let data =  getTreeData(); 

       

      return(
        <div> Tree Data 


        


        </div>

         

      )
    }


}

export default TreeView