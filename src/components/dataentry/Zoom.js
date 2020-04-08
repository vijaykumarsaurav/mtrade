import React, { Component } from "react";


const src = 'https://mediaassets.koaa.com/cordillera-network/wp-content/uploads/sites/11/2019/04/11123547/Colorado-Safety-Act-DL-1024x576.jpg'


//const src = "https://www.researchgate.net/profile/Jayesh_Kumar4/publication/23743730/figure/tbl1/AS:650037189165092@1531992351493/Data-structure-for-NIC-2-digit-Industry-code-Based-on-the-industrial-classification-of.png"; 

class Zoom extends Component {

  constructor(props) {
    super(props);
  }

  state = {
    backgroundImage: `url(${this.props.imageUrl})`,
    backgroundPosition: '0% 0%'
  }

  handleMouseMove = e => {
    const { left, top, width, height } = e.target.getBoundingClientRect()
    const x = (e.pageX - left) / width * 100
    const y = (e.pageY - top) / height * 100
    this.setState({ backgroundPosition: `${x}% ${y}%` })
  }

  render = (props) =>
    <figure onMouseMove={this.handleMouseMove} style={this.state}>
      <img src={this.props.imageUrl} width="400" />
    </figure>
}

export default Zoom;

// ReactDOM.render(<Zoom />, document.getElementById('viewImg'))
