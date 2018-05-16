function Isosurfaces( volume, isovalue )
{
  var geometry = new THREE.Geometry();
  var material = new THREE.MeshLambertMaterial({
side: THREE.DoubleSide,	
});

var smin = volume.min_value;
var smax = volume.max_value;
isovalue = KVS.Clamp( isovalue, smin, smax );  //isovalueの値を範囲内に留める
var scalars = [];//interpolated scalars
var lut = new KVS.MarchingCubesTable();
var cell_index = 0;
var counter = 0;

var normal = new THREE.Vector3( 3, 4 ,5 ); //normal vector
var point = new THREE.Vector3( volume.resolution.x * 0.5, volume.resolution.y * 0.5, volume.resolution.z * 0.5 );

// Create color map
var cmap = [];
for ( var i = 0; i < 256; i++ )
{
  var S = i / 255.0; // [0,1]
  var R = Math.max( Math.cos( ( S - 1.0 ) * Math.PI ), 0.0 );
  var G = Math.max( Math.cos( ( S - 0.5 ) * Math.PI ), 0.0 );
  var B = Math.max( Math.cos( S * Math.PI ), 0.0 );
  var color = new THREE.Color( R, G, B );
  cmap.push( [ S, '0x' + color.getHexString() ] );
}

for ( var z = 0; z < volume.resolution.z - 1; z++ )
{
  for ( var y = 0; y < volume.resolution.y - 1; y++ )
  {
    for ( var x = 0; x < volume.resolution.x - 1; x++ )
    {
      var coordinates = cell_node_coordinates( x, y, z );
      var index = table_index( coordinates, normal, point ); 
      if ( index == 0 ) { continue; }
      if ( index == 255 ) { continue; }

      for ( var j = 0; lut.edgeID[index][j] != -1; j += 3 )
      {
        var eid0 = lut.edgeID[index][j];  //マーチングキューブ法により等値面と交差する辺のIDを算出
        var eid1 = lut.edgeID[index][j+2];
        var eid2 = lut.edgeID[index][j+1];

        var vid0 = lut.vertexID[eid0][0];  //辺のIDから辺を構成する点のIDを算出
        var vid1 = lut.vertexID[eid0][1];
        var vid2 = lut.vertexID[eid1][0];
        var vid3 = lut.vertexID[eid1][1];
        var vid4 = lut.vertexID[eid2][0];
        var vid5 = lut.vertexID[eid2][1];

        var v0 = new THREE.Vector3( x + vid0[0], y + vid0[1], z + vid0[2] );  //xyz座標面にセルを落とす
        var v1 = new THREE.Vector3( x + vid1[0], y + vid1[1], z + vid1[2] );
        var v2 = new THREE.Vector3( x + vid2[0], y + vid2[1], z + vid2[2] );
        var v3 = new THREE.Vector3( x + vid3[0], y + vid3[1], z + vid3[2] );
        var v4 = new THREE.Vector3( x + vid4[0], y + vid4[1], z + vid4[2] );
        var v5 = new THREE.Vector3( x + vid5[0], y + vid5[1], z + vid5[2] );

        var v01 = interpolated_vertex( v0, v1, normal, point );
        var v23 = interpolated_vertex( v2, v3, normal, point );
        var v45 = interpolated_vertex( v4, v5, normal, point );

        geometry.vertices.push( v01 );
        geometry.vertices.push( v23 );
        geometry.vertices.push( v45 );

        var id0 = counter++;
        var id1 = counter++;
        var id2 = counter++;

        var face = new THREE.Face3( id0, id1, id2 );
        //geometry.face.vertexColors.push( 
        geometry.faces.push( face );
      }
    }
   cell_index++;
  }
  cell_index += volume.resolution.x;
}

geometry.computeVertexNormals();
var nfaces = geometry.faces.length; 
var nscalars = scalars.length;
material.vertexColors = THREE.VertexColors;

//	material.color = new THREE.Color().setHex( cmap[ isovalue ][1] );
/*for (var i = 0; i < nscalars; i++){
  if(scalars[i]!=0){
    console.log(scalars[i]);
  }
}
*/
for ( var i = 0; i < nfaces; i++ )
{
  var id = geometry.faces[i];;
  var S0 = parseInt(scalars[ id.a ]);
  var S1 = parseInt(scalars[ id.b ]);
  var S2 = parseInt(scalars[ id.c ]);
  if(S0>0||S1>0||S2>0){
    console.log(S0,S1,S2);
  }
  var C0 = new THREE.Color().setHex( cmap[ S0 ][1] );
  var C1 = new THREE.Color().setHex( cmap[ S1 ][1] );
  var C2 = new THREE.Color().setHex( cmap[ S2 ][1] );
  geometry.faces[i].vertexColors.push( C0 );
  geometry.faces[i].vertexColors.push( C1 );
  geometry.faces[i].vertexColors.push( C2 );
}


/*
   console.log( material.color );
   console.log( isovalue );
   console.log( cmap[ isovalue ][0] );
 */

return new THREE.Mesh( geometry, material );

function cell_node_coordinates( x, y, z )
{
  var co0 = new THREE.Vector3( x, y, z );		
  var co1 = new THREE.Vector3( x+1, y, z );
  var co2 = new THREE.Vector3( x+1, y+1, z );
  var co3 = new THREE.Vector3( x, y+1, z );
  var co4 = new THREE.Vector3( x, y, z+1 );
  var co5 = new THREE.Vector3( x+1, y, z+1 );
  var co6 = new THREE.Vector3( x+1, y+1, z+1 );
  var co7 = new THREE.Vector3( x, y+1, z+1 );

  return [ co0, co1, co2, co3, co4, co5, co6, co7 ];
}

function table_index( coordinates, normal, point )
{
  var index = 0;
  if ( plane( coordinates[0], normal, point ) >= 0 ) { index |=   1; }
  if ( plane( coordinates[1], normal, point ) >= 0 ) { index |=   2; }
  if ( plane( coordinates[2], normal, point ) >= 0 ) { index |=   4; }
  if ( plane( coordinates[3], normal, point ) >= 0 ) { index |=   8; }
  if ( plane( coordinates[4], normal, point ) >= 0 ) { index |=  16; }
  if ( plane( coordinates[5], normal, point ) >= 0 ) { index |=  32; }
  if ( plane( coordinates[6], normal, point ) >= 0 ) { index |=  64; }
  if ( plane( coordinates[7], normal, point ) >= 0 ) { index |= 128; }

  return index;
}

function interpolated_vertex( v0, v1, normal, point )
{
  var i0 = v0.x + v0.y * volume.resolution.x + v0.z * volume.resolution.x * volume.resolution.y;
  var i1 = v1.x + v1.y * volume.resolution.x + v1.z * volume.resolution.x * volume.resolution.y;
  var s0 = volume.values[i0][0];
  var s1 = volume.values[i1][0];
  var x0 = v0.x - point.x;
  var y0 = v0.y - point.y;
  var z0 = v0.z - point.z; 
  var v = new THREE.Vector3().subVectors( v0, v1 );
    if ( v.x != 0 ) {
    var x = point.x - ( normal.y*y0 + normal.z*z0 ) / normal.x;
    if(s0 >= s1){
      scalars.push(s0-(s0-s1)*(Math.abs(v0.x-x)));
    }
    else{
      scalars.push(s1-(s1-s0)*(Math.abs(v1.x-x)));
    }
    var t = (v.x-v0.x)/(x-v0.x);


    return new THREE.Vector3( x, v0.y, v0.z );
  }
  if ( v.y != 0 ) {
    var y = point.y - ( normal.x*x0 + normal.z*z0 ) / normal.y;
    if(s0 >= s1){
      scalars.push(s0-(s0-s1)*(Math.abs(v0.y-y)));
    }
    else{
      scalars.push(s1-(s1-s0)*(Math.abs(v1.y-y)));
    }


    return new THREE.Vector3( v0.x, y, v0.z );
  }
  if ( v.z != 0 ) {
    var z = point.z - ( normal.x*x0 + normal.y*y0 ) / normal.z;
    if(s0 >= s1){
      scalars.push(s0-(s0-s1)*(Math.abs(v0.z-z)));
    }
    else{
      scalars.push(s1-(s1-s0)*(Math.abs(v1.z-z)));
    }


    return new THREE.Vector3( v0.x, v0.y, z );
  }
  return new THREE.Vector3().addVectors( v0, v1).divideScalar( 2 );
}

function plane( co, normal, point )
{
  var s = normal.x*( co.x - point.x )  + normal.y*( co.y - point.y ) + normal.z*( co.z - point.z );

  return s;
}
}
