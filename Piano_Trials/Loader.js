import { SvgPlus, Vector } from "../vendor/Apps/app-class.js";
  
  class Loader extends SvgPlus {
    constructor(params) {
      super("path");
      this.progress = 0;
      this.hover = false;
      this.props = {
        id: "loader",
        fixed: 'yes',
      }
      this.styles = {
        "position": "absolute",
        "fill": "none",
        "stroke": "lightgrey",
        "stroke-width": "2",
        "stroke-linecap": "round",
      }
      this._position = new Vector(0, 0);
      this._size = 30;
      this.updateTransform();
      // if (this.elementPosition instanceof Vector) {
      //   this.position = this.elementPosition;
      // }
      this.animate();
    }
  
    set progress(num) {
      
      if (num > 1) num = 1;
      if (num < 0) num = 0;
      let angle = Math.PI * 2 * (1 - num);
      let p1 = new Vector(0, 5);
      let p2 = p1.rotate(angle);
      if (num > 0 && num < 1) {
        this.props = { d: `M${p1}A5,5,1,${angle > Math.PI ? 0 : 1},0,${p2}` };
      } else if (num == 1) {
        this.props = { d: `M0,5A5,5,0,0,0,0,-5A5,5,0,0,0,0,5` };
      } else {
        this.props = { d: "" };
      }
      // if the opacity is 0, trigger the click event
      if (num === 1 && this._progress < 1) {
        const event = new Event("click");
        this.dispatchEvent(event);
        // this.element.style.fill = this.color;
      }
      this._progress = num;
    }
  
    get progress(){
      return this._progress;
    }
  
    set position(pos){
      if (pos instanceof Vector) {
        this._position = pos;
        this.updateTransform();
      } else {
        console.error("Invalid position value:", pos);
      }
    }
  
    get position(){
      return this._position;
    }
  
    set size(size){
      this._size = size;
      this.updateTransform();
    }
  
    get size(){
      return this._size;
    }
  
    updateTransform() {
      if (this.position instanceof Vector && typeof this.size === "number") {
        this.props = {
          transform: `translate(${this.position.x - 2.5 * this.size}, ${this.position.y - 2.5 * this.size}) scale(${this.size})`,
        };
      } else {
        console.error("Invalid values in updateTransform:", {
          position: this.position,
          size: this.size,
        });
            // Fallback to default position or skip transformation
        this.props = {
          transform: `translate(0, 0) scale(${this.size || 1})`,
        };
      }
      
    }
  
    async animate(){
      // increment progress by 0.02 if hover is true, otherwise decrement by 0.005
      if (!this.editable) {
        while (true) {
          await this.waitFrame();
          if (this.hover) {
            this.progress += 0.01;
          } else {
            this.progress -= 0.005;
          }
        // console.log(`Progress: ${this.progress}, Hover: ${this.hover}`); // Debugging line
        }
      }
    }
  
    async waitFrame(){
      return new Promise(resolve => requestAnimationFrame(resolve));
    }
  }
  
  export {Loader};
