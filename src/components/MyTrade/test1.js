


function parent(){

    var name = "vk"; 

    function child(){

            var age = 29; 
            return  name + " " + age; 
    }

  return child; 
}

var child = parent(); 
child(); 







function arrayReturn(multiArr){
   
    var resultArr = []; 
    function addToArray(element){
        element.forEach(childElement => {
            if(childElement.length>0){
                addToArray(childElement); 
            }else{
                resultArr.push(childElement)
            }
        });
    }
    
    for (let index = 0; index < multiArr.length; index++) {
        const element = multiArr[index];
        
        if(element.length > 0){
            addToArray(element); 
        }else{
            resultArr.push(element); 
        }
    }

    console.log(resultArr); 
 }

 arrayReturn([[1,2,3],[4,5,6],[7,8,9], 10, [[9,8,5]], [[90, [9,8,5, [11,12,13]]] ]]); 
