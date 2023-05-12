'use strict';
import anime from './anime.es.js';

class Canvas {
  
  constructor ( config = {} ) {
    
    Object.assign(this, {
      sizeX: window.innerWidth,
      sizeY: window.innerHeight,
      dpr: window.devicePixelRatio,
      background: "#000",
    });
    
    Object.assign( this, config );
    
    this.sizeX *= this.dpr;
    this.sizeY *= this.dpr;
    
    const { dom, ctx } = this.constructDom();
    
    this.dom = dom;
    this.ctx = ctx;
    
  }
  
  constructDom () {
    
    const dom = document.createElement( 'canvas' );
    
    dom.width  = this.sizeX;
    dom.height = this.sizeY;
    
    Object.assign(dom.style, {
      width : ( this.sizeX / this.dpr ) + 'px',
      height: ( this.sizeY / this.dpr ) + 'px',
      background: this.background,
      touchAction: 'none',
      display: 'block',
    });
    
    const ctx = dom.getContext( '2d' );
    
    return { dom, ctx };
    
  }
  
  clear () {
    
    const { ctx, sizeX, sizeY } = this;
    
    ctx.clearRect( 0, 0, sizeX, sizeY );
    
  }
  
  render ( circles ) {
    
    this.clear();
    
    const { ctx } = this;
    
    const TWO_PI = 2 * Math.PI;
    
    for ( let i = 0; i < circles.length; i ++ ) {
    
      const { x, y, radius, color, offsetX, offsetY } = circles[ i ];
      
      ctx.beginPath();
      ctx.arc( 
        x + offsetY, y + offsetY,
        Math.abs( radius ), 0, TWO_PI 
      );
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();
      
    }
    
  }
  
}

class Circle {
  
  constructor ( x, y, radius = 12, color = '#fff' ) {
    
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    
    this.offsetX = 0;
    this.offsetY = 0;
    
  }
  
  collide ( point, threshold = this.radius + 24 ) {
    
    const dx = this.x - point.x;
    const dy = this.y - point.y;
    
    const distance = Math.hypot( dx, dy );
    
    if ( distance < threshold ) return true;
    
    return false;
    
  }
  
}

const canvas = new Canvas();
document.body.appendChild( canvas.dom );

let animation = null;

const scene = [];
const padding = 48;
const size = 32;

const nX = ~~( canvas.sizeX / ( size + padding ) );
const nY = ~~( canvas.sizeY / ( size + padding ) );

const grid = [ nY - 1, nX - 1 ];

const gapX = canvas.sizeX / nX;
const gapY = canvas.sizeY / nY;

for ( let x = 1; x < nX; x ++ ) {
  
  for ( let y = 1; y < nY; y ++ ) {
    
    const _x = x * gapX;
    const _y = y * gapY;
    
    scene.push( new Circle( _x, _y, size ) );
    
  }
  
}

function animate ( now ) {
  
  requestAnimationFrame( animate );
  
  if ( animation ) animation.tick( now );
  canvas.render( scene );
  
}

requestAnimationFrame( animate );

function react ( point ) {
  
  for ( let i = 0; i < scene.length; i ++ ) {
    
    const collision = scene[ i ].collide( point );
    
    if ( !collision ) continue;
    
    const delay = anime.stagger( 32, {
        grid, from: i,
    });
    
    animation = anime({
      targets: scene,
      autoplay: false,
      radius:  [
        {
          value: 1,
          easing: 'easeOutSine',
          duration: 200
        },
        { value: 32 }
      ],
      color: [
        { 
          value: '#ff1565',
          easing: 'easeOutSine',
          duration: 350,
        },
        { value: '#F6F4F2' },
      ],
      delay,
    });
    
    break;
  
  }
  
}

window.addEventListener("click", ( e ) => {

  const point = {
    x: e.clientX * canvas.dpr,
    y: e.clientY * canvas.dpr,
  };
  
  react( point );
  
});