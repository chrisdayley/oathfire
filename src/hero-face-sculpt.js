// The authored head is in head-socket metres: +Z is the face, eyes lie near
// (+/- .0354, .110, .124). Sculpt a cloned anatomical-face geometry only.
// Eye, eyelid-contact, mouth-seam, helmet and back-of-skull positions stay
// stable, so the existing separate eyes, lip atlas and fitted helmets still fit.
const gaussian=(v,center,width)=>Math.exp(-(((v-center)/width)**2));
const smooth=(lo,hi,v)=>{const t=Math.max(0,Math.min(1,(v-lo)/(hi-lo)));return t*t*(3-2*t);};

export function sculptHeroFace(geometry,role){
 if(!['warden','ashwright','ranger'].includes(role)||!geometry?.attributes?.position)return geometry;
 if(geometry.userData?.heroFaceSculpt===role)return geometry;
 const positions=geometry.attributes.position;
 for(let i=0;i<positions.count;i++){
  const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i),ax=Math.abs(x),sign=Math.sign(x);
  const front=smooth(.018,.093,z)*(1-smooth(.175,.219,y));
  // Protect the existing eyeballs and lid margins, but allow the bony brow
  // above them to project. Otherwise identity changes can expose eye seams.
  const eye=gaussian(ax,.0354,.027)*gaussian(y,.110,.014)*smooth(.080,.116,z);
  const mouthSeam=gaussian(y,.044,.0045)*gaussian(x,0,.032)*smooth(.110,.133,z);
  const stable=(1-eye*.96)*(1-mouthSeam*.92),f=front*stable;
  const jaw=gaussian(y,.017,.036)*smooth(.021,.060,ax);
  const chin=gaussian(x,0,.033)*gaussian(y,.004,.023);
  const cheek=gaussian(ax,.056,.020)*gaussian(y,.086,.020);
  const hollow=gaussian(ax,.048,.023)*gaussian(y,.053,.024);
  const brow=gaussian(ax,.035,.030)*gaussian(y,.139,.014);
  const nose=gaussian(x,0,.017)*gaussian(y,.083,.040);
  let dx=0,dy=0,dz=0;
  if(role==='warden'){
   // Strong mandibular corners, planar cheekbones and a firm chin retain the
   // Warden's younger face without giving it the smith's broad, aged weight.
   dx=sign*(.0052*jaw+.0015*cheek);
   dy=-.0018*chin;
   dz=.0040*chin+.0035*cheek-.0030*hollow+.0042*brow+.0010*nose;
  }else if(role==='ashwright'){
   // Mature workman: broad jaw, heavier brow and nose bridge, loss of the
   // youthful cheek fullness. The beard remains a separately groomed mesh.
   dx=sign*(.0082*jaw+.0024*cheek)+x*.10*nose;
   dy=-.0030*chin-.0010*brow;
   dz=.0062*chin+.0030*cheek-.0060*hollow+.0062*brow+.0030*nose;
   // Shallow folds follow facial anatomy rather than adding random bumps.
   const foldX=.018+Math.max(0,.080-y)*.42;
   dz-=.0013*gaussian(ax,foldX,.0038)*gaussian(y,.064,.024);
   dz-=.00075*gaussian(y,.155,.0026)*gaussian(x,0,.049);
   dz-=.00045*gaussian(y,.166,.0028)*gaussian(x,0,.050);
   const outerEye=gaussian(ax,.068,.012)*gaussian(y,.109,.017);
   dz-=.00060*outerEye*(.5+.5*Math.cos((y-.111+(ax-.060)*.38)*630));
  }else{
   // Ranger: narrower jaw, high cheek plane and a more slender nose. Keep
   // the skull and eye separation intact; identity comes from facial planes.
   dx=sign*(-.0027*jaw+.0014*cheek)-x*.055*nose;
   dy=.0009*chin;
   dz=.0026*chin+.0042*cheek-.0038*hollow+.0030*brow+.0018*nose;
  }
  positions.setXYZ(i,x+dx*f,y+dy*f,z+dz*f);
 }
 positions.needsUpdate=true;
 geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
 geometry.userData={...geometry.userData,shared:false,heroFaceSculpt:role};
 return geometry;
}
