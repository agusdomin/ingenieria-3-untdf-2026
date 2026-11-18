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
let base,style,previousLocation,previousSelectedLocation,previousBounds;
const overlay=L.layerGroup().addTo(map);
const pinIcon=L.divIcon({className:'',iconSize:[32,42],iconAnchor:[16,42],tooltipAnchor:[0,-38],html:'<svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0px 2px 4px rgba(0,0,0,0.35));"><path d="M16 0C7.163 0 0 7.163 0 16C0 27.2 14.2 40.4 15.1 41.2C15.6 41.7 16.4 41.7 16.9 41.2C17.8 40.4 32 27.2 32 16C32 7.163 24.837 0 16 0Z" fill="#EA4335" stroke="#FFFFFF" stroke-width="1.5"/><circle cx="16" cy="16" r="6" fill="#B31412"/></svg>'});
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
 (p.observationAreas||[]).forEach(a=>L.geoJSON(a.feature,{style:{color:a.feature.properties.color,weight:2,fillOpacity:.22},bubblingMouseEvents:false})
 .on('click',()=>send('area',a.id)).addTo(overlay));
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
 if(p.selectedLocation){const u=p.selectedLocation;const r=u.radius||1000;const c=L.circle([u.latitude,u.longitude],{radius:r,color:'#EA4335',weight:2,fillColor:'#EA4335',fillOpacity:.16,interactive:false}).addTo(overlay);L.marker([u.latitude,u.longitude],{icon:pinIcon,interactive:false}).addTo(overlay);if(JSON.stringify(u)!==previousSelectedLocation){map.invalidateSize();const h=map.getSize().y||window.innerHeight||600;map.flyToBounds(c.getBounds(),{paddingTopLeft:[36,Math.max(72,p.zoomControlTop||0)],paddingBottomRight:[36,u.radius?Math.round(h*.5):48],maxZoom:15,duration:.45});previousSelectedLocation=JSON.stringify(u);}}else{previousSelectedLocation=null;}
 if(p.focusBounds&&JSON.stringify(p.focusBounds)!==previousBounds){const b=p.focusBounds;map.fitBounds([[b[1],b[0]],[b[3],b[2]]],{padding:[60,100],maxZoom:16});previousBounds=JSON.stringify(b);}
};send('ready');
}catch(e){send('error');}
</script></body></html>`;

export function MapContainerGo(props: MapContainerProps) {
  const ref = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const payload = JSON.stringify({ mapStyle: props.mapStyle, events: props.events, trafficArea: props.trafficArea,
    observationAreas: props.observationAreas,
    userLocation: props.userLocation, selectedLocation: props.selectedLocation, focusBounds: props.focusBounds,
    zoomControlTop: props.zoomControlTop, zoomControlBottom: props.zoomControlBottom });
  useEffect(() => {
    if (ready) ref.current?.injectJavaScript(`window.updateMap(${payload});true;`);
  }, [ready, payload]);
  return <View style={{ flex: 1 }}>
    <WebView ref={ref} source={{ html, baseUrl: 'https://localhost' }} originWhitelist={['*']} style={{ flex: 1 }}
      onError={() => { setFailed(true); props.onError?.(); }}
      onMessage={({ nativeEvent }) => {
        try {
          const message = JSON.parse(nativeEvent.data);
          if (message.type === 'ready') { setReady(true); setFailed(false); props.onLoad?.(); }
          if (message.type === 'error') { setFailed(true); props.onError?.(); }
          if (message.type === 'event') props.onEventPress?.(message.data);
          if (message.type === 'area') props.onObservationAreaPress?.(message.data);
          if (message.type === 'map') props.onMapPress?.(message.data);
          if (message.type === 'camera') props.onCameraChange?.(message.data);
        } catch { setFailed(true); }
      }} />
    {failed && <Text>No se pudo cargar el mapa. Revisá la conexión.</Text>}
    <LocationControl {...props} />
    {props.children}
  </View>;
}
