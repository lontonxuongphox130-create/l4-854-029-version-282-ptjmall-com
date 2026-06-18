(function(){
function initMoviePlayer(videoId,source){
var video=document.getElementById(videoId);if(!video||!source)return;var overlay=document.querySelector('[data-play-overlay="'+videoId+'"]');var hls=null;var loaded=false;function attach(){if(loaded)return;loaded=true;if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=source}else if(window.Hls&&window.Hls.isSupported()){hls=new window.Hls({enableWorker:true,lowLatencyMode:true});hls.loadSource(source);hls.attachMedia(video)}else{video.src=source}}
function play(){attach();if(overlay)overlay.classList.add('is-hidden');video.controls=true;var p=video.play();if(p&&p.catch){p.catch(function(){if(overlay)overlay.classList.remove('is-hidden')})}}
if(overlay){overlay.addEventListener('click',play)}video.addEventListener('click',function(){if(!loaded||video.paused){play()}else{video.pause()}});video.addEventListener('play',function(){if(overlay)overlay.classList.add('is-hidden')});video.addEventListener('ended',function(){if(overlay)overlay.classList.remove('is-hidden')});window.addEventListener('beforeunload',function(){if(hls&&hls.destroy)hls.destroy()})}
window.initMoviePlayer=initMoviePlayer;
})();