import React from 'react';
import { Slide } from 'react-slideshow-image';
 
const slideImages = [
  'https://aboutreact.com/wp-content/uploads/2018/09/react_native_slider_image_gallery.png',
  'https://bashooka.com/wp-content/uploads/2019/04/react-slider-carousel-gallery-11.jpg',
  'https://miro.medium.com/max/3840/1*emCGXTEsimcDn4ImjMIZbw.png'
];



import React from 'react';
import { Fade } from 'react-slideshow-image';
 
const fadeImages = [
  'images/slide_5.jpg',
  'images/slide_6.jpg',
  'images/slide_7.jpg'
];
 
const fadeProperties = {
  duration: 5000,
  transitionDuration: 500,
  infinite: false,
  indicators: true,
  onChange: (oldIndex, newIndex) => {
    console.log(`fade transition from ${oldIndex} to ${newIndex}`);
  }
}
 
const Slideshow = () => {
  return (
    <div className="slide-container">
      <Fade {...fadeProperties}>
        <div className="each-fade">
          <div className="image-container">
            <img src={fadeImages[0]} />
          </div>
          <h2>First Slide</h2>
        </div>
        <div className="each-fade">
          <div className="image-container">
            <img src={fadeImages[1]} />
          </div>
          <h2>Second Slide</h2>
        </div>
        <div className="each-fade">
          <div className="image-container">
            <img src={fadeImages[2]} />
          </div>
          <h2>Third Slide</h2>
        </div>
      </Fade>
    </div>
  )
}