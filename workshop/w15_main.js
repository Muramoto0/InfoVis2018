function main()
{
  var volume = new KVS.LobsterData();
  var screen = new KVS.THREEScreen();
  var flag1 =1;
  var flag2 =0;
 /* var elem = document.getElementById('range');
  var target = documrnt.getElementById('value');
  var rangeValue = function (elem, target){
    return function(evt){
      targer.innerHTML = elem.value;
    }
  }
  elem.addEventlistener('input', rangeValue(elem, targer));
*/
  screen.init( volume, {
width: window.innerWidth*0.8,
height: window.innerHeight,
targetDom: document.getElementById('display'),
enableAutoResize: false
});

var bounds = Bounds( volume );
screen.scene.add( bounds );
var isovalue = 128;
var surfaces = Isosurfaces( volume, isovalue, screen, 0, 1 );
var surfaces2;
screen.scene.add( surfaces );

document.addEventListener( 'mousemove', function() {
    screen.light.position.copy( screen.camera.position );
    });

window.addEventListener( 'resize', function() {
    screen.resize( [ window.innerWidth * 0.8, window.innerHeight ] );
    });

screen.loop();
document.getElementById("change-isovalue-button").onclick = function(){
    var check1 = document.draw.Isosurface.checked;
    var check2 = document.draw.sliceplane.checked;
    var elem = document.getElementById("isovalue").value;
    var elem2 = document.getElementById("shader");
    var radioNodeList = elem2.shaders;
    var shaderData = radioNodeList.value; 
    var elem3 = document.getElementById("colormap");
    var radioNodeList2 = elem3.Cmap;
    var colorData = radioNodeList2.value; 
    if( check1 == true ){
      if(flag1 == 1){
        screen.scene.remove(surfaces);
        isovalue = parseInt( elem);
        surfaces = Isosurfaces( volume, isovalue, screen, shaderData, colorData );
        screen.scene.add( surfaces );
      }
      else{
        isovalue = parseInt(elem);
        surfaces = Isosurfaces( volume, isovalue, screen, shaderData, colorData );
        screen.scene.add( surfaces );
      }
      flag1 = 1;
    }
    else{
      if(flag1 == 1){
        screen.scene.remove(surfaces);
      }
      flag1 = 0;
    }
   if( check2 == true ){
     if(flag2 == 1){ 
        screen.scene.remove(surfaces2);
        isovalue = parseInt( elem);
        surfaces2 = Sliceplane( volume, isovalue );
        screen.scene.add( surfaces2 );
     }
     else{
        isovalue = parseInt(elem);
        surfaces2 = Sliceplane( volume, isovalue );
        screen.scene.add( surfaces2 );
     }
     flag2 = 1;
   }
   else{
     if( flag2 == 1){
       screen.scene.remove(surfaces2);
     }
     flag2 = 0;
   }
}
document.getElementById("isovalue").oninput = function(){
    var elem3 = document.getElementById("isovalue").value;
    document.getElementById("value").innerHTML = elem3;
}
}

