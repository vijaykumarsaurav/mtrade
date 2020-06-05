npm start

npm run build


//put the code on line no. 2196 on below file for custom key rotate, zoom in and zoom out

//Users/B0208058/Documents/slretailer-web-portal/node_modules/react-image-pan-zoom-rotate/dist/PanViewer.js

t.prototype.componentDidMount = function() {
    var e = this;
    
    document.addEventListener("keypress", function(t) {
        // console.log("t.keyCodeObject:",t)
        if(t.shiftKey && 36 === t.keyCode){
            e.zoomIn();
        }else if(t.shiftKey && 38 === t.keyCode){
            e.zoomOut()
        }else if(64 == t.keyCode ){
            e.rotateLeft()
        }
    });
}