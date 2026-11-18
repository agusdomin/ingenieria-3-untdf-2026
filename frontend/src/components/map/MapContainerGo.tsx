import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { LocationControl } from './LocationControl';
import type { MapContainerProps } from './MapContainer.types';
import { binocularsSvg } from './markerIcons';

const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>html,body,#map{height:100%;margin:0}.leaflet-control-zoom a{width:42px!important;height:42px!important;line-height:42px!important}</style></head>
<body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>
const send=(type,data)=>window.ReactNativeWebView.postMessage(JSON.stringify({type,data}));
try {
const map=L.map('map',{zoomControl:false}).setView([-54.81,-68.3],11);
L.control.zoom({position:'topright'}).addTo(map);
let base,style,previousLocation,previousBounds;
const overlay=L.layerGroup().addTo(map);
map.on('click',e=>send('map',[e.latlng.lng,e.latlng.lat]));
map.on('moveend',()=>send('camera',{center:[map.getCenter().lng,map.getCenter().lat],zoom:map.getZoom()}));
window.updateMap=p=>{
 if(style!==p.mapStyle){if(base)map.removeLayer(base);style=p.mapStyle;
 base=L.tileLayer(style==='terrain'?'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png':'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
 {maxNativeZoom:style==='terrain'?17:19,maxZoom:19,attribution:style==='terrain'?'© OpenStreetMap · © OpenTopoMap':'© OpenStreetMap'}).addTo(map);}
 const control=document.querySelector('.leaflet-top.leaflet-right');
 control.style.top=p.zoomControlBottom==null?(p.zoomControlTop||0)+'px':'auto';
 control.style.bottom=p.zoomControlBottom==null?'auto':p.zoomControlBottom+'px';
 overlay.clearLayers();
 if(p.trafficArea){const a=p.trafficArea;L.circle([a.coordenadas.latitud,a.coordenadas.longitud],{radius:a.radio_km*1000,color:'#7254A3',fillOpacity:.12,interactive:false})
 .bindTooltip(a.total_personas+' personas · '+a.radio_km+' km',{permanent:true}).addTo(overlay);}
 (p.events||[]).forEach(e=>{
 const el=document.createElement('span');
 if(e.kind==='report')el.textContent='R';else el.innerHTML=${JSON.stringify(binocularsSvg)};
 Object.assign(el.style,{display:'flex',alignItems:'center',justifyContent:'center',width:'28px',height:'28px',border:'2px solid white',borderRadius:e.kind==='report'?'5px':'50%',background:e.color,color:'white',font:'bold 15px sans-serif'});
 const label=document.createElement('span');label.textContent=e.title;
 L.marker([e.coordinate[1],e.coordinate[0]],{icon:L.divIcon({html:el,className:'',iconSize:[32,32],iconAnchor:[16,16]}),bubblingMouseEvents:false})
 .bindTooltip(label).on('click',()=>send('event',e.id)).addTo(overlay);
 });
 if(p.userLocation){const u=p.userLocation;L.circleMarker([u.latitude,u.longitude],{radius:8,color:'white',fillColor:'#176B91',fillOpacity:1}).addTo(overlay);
 if(JSON.stringify(u)!==previousLocation){map.setView([u.latitude,u.longitude],13);previousLocation=JSON.stringify(u);}}
 if(p.selectedLocation){const u=p.selectedLocation;L.circleMarker([u.latitude,u.longitude],{radius:9,color:'white',fillColor:'#E53935',fillOpacity:1}).addTo(overlay);}
 if(p.focusBounds&&JSON.stringify(p.focusBounds)!==previousBounds){const b=p.focusBounds;map.fitBounds([[b[1],b[0]],[b[3],b[2]]],{padding:[60,100],maxZoom:16});previousBounds=JSON.stringify(b);}
};send('ready');
}catch(e){send('error');}
</script></body></html>`;

export function MapContainerGo(props: MapContainerProps) {
  const ref = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const payload = JSON.stringify({ mapStyle: props.mapStyle, events: props.events, trafficArea: props.trafficArea,
    userLocation: props.userLocation, selectedLocation: props.selectedLocation, focusBounds: props.focusBounds,
    zoomControlTop: props.zoomControlTop, zoomControlBottom: props.zoomControlBottom });
  useEffect(() => {
    if (ready) ref.current?.injectJavaScript(`window.updateMap(${payload});true;`);
  }, [ready, payload]);
  return <View style={{ flex: 1 }}>
    <WebView ref={ref} source={{ html }} originWhitelist={['*']} style={{ flex: 1 }}
      onError={() => { setFailed(true); props.onError?.(); }}
      onMessage={({ nativeEvent }) => {
        try {
          const message = JSON.parse(nativeEvent.data);
          if (message.type === 'ready') { setReady(true); setFailed(false); props.onLoad?.(); }
          if (message.type === 'error') { setFailed(true); props.onError?.(); }
          if (message.type === 'event') props.onEventPress?.(message.data);
          if (message.type === 'map') props.onMapPress?.(message.data);
          if (message.type === 'camera') props.onCameraChange?.(message.data);
        } catch { setFailed(true); }
      }} />
    {failed && <Text>No se pudo cargar el mapa. Revisá la conexión.</Text>}
    <LocationControl {...props} />
    {props.children}
  </View>;
}
