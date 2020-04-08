import React, { Component } from "react";
import { render } from "react-dom";
//import Lightbox from "react-image-lightbox";
//import Lightbox from "react-image-lightbox-rotate-fixed";

import Lightbox from "rhino-react-image-lightbox-rotate";

import "react-image-lightbox/style.css";

const images = [
    "https://www.oregon.gov/ODOT/DMV/PublishingImages/driverid/sampledl.jpg",
  "//placekitten.com/1500/500",
  
  "//placekitten.com/800/1200",
  "//placekitten.com/1500/1500"
];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      photoIndex: 0,
      isOpen: true
    };
  }

  render() {
    const { photoIndex, isOpen } = this.state;

    return (
      <div>
        <button type="button" onClick={() => this.setState({ isOpen: true })}>
          Open Lightbox
        </button>

        {isOpen && (
          <Lightbox
            mainSrc={images[photoIndex]}
            nextSrc={images[(photoIndex + 1) % images.length]}
            prevSrc={images[(photoIndex + images.length - 1) % images.length]}
            onCloseRequest={() => this.setState({ isOpen: false })}
            onMovePrevRequest={() =>
              this.setState({
                photoIndex: (photoIndex + images.length - 1) % images.length
              })
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

export default App; 
// render(<App />, document.getElementById("root"));
