function main()
{
  var volume = new KVS.LobsterData();
  var screen = new KVS.THREEScreen();
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
var surfaces = Isosurfaces( volume, isovalue, screen );
screen.scene.add( surfaces );

document.addEventListener( 'mousemove', function() {
    screen.light.position.copy( screen.camera.position );
    });

window.addEventListener( 'resize', function() {
    screen.resize( [ window.innerWidth * 0.8, window.innerHeight ] );
    });

screen.loop();
document.getElementById("change-isovalue-button").onclick = function(){
    var elem = document.getElementById("isovalue").value;
    document.getElementById("value").innerHTML = elem; 
    screen.scene.remove(surfaces);
    isovalue = parseInt(isovalue * elem);
    surfaces = Isosurfaces( volume, isovalue, screen );
    screen.scene.add( surfaces );
  }

}

