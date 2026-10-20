const songs = [
  {id:1,title:'Peach Soda Skies',artist:'Luna Bloom',mood:'Dreamy',duration:'3:00',seconds:180,cover:'cover-pink',symbol:'☁',playlist:['pink','blue']},
  {id:2,title:'Sunshine on Replay',artist:'The Daydreamers',mood:'Happy',duration:'2:48',seconds:168,cover:'cover-yellow',symbol:'☼',playlist:['pink','main']},
  {id:3,title:'Little by Little',artist:'Milo June',mood:'Calm',duration:'3:22',seconds:202,cover:'cover-green',symbol:'✿',playlist:['blue','study']},
  {id:4,title:'Glitter in My Pocket',artist:'Cherry Club',mood:'Confident',duration:'2:56',seconds:176,cover:'cover-pink',symbol:'✦',playlist:['main','pink']},
  {id:5,title:'Blue Hour Letters',artist:'April & June',mood:'Heartbroken',duration:'3:40',seconds:220,cover:'cover-blue',symbol:'♡',playlist:['blue','pink']},
  {id:6,title:'Focus, Baby',artist:'Studio Sunday',mood:'Focused',duration:'2:35',seconds:155,cover:'cover-lilac',symbol:'✧',playlist:['study']},
  {id:7,title:'Cloud-Shaped Dreams',artist:'Luna Bloom',mood:'Dreamy',duration:'3:15',seconds:195,cover:'cover-blue',symbol:'☾',playlist:['blue']},
  {id:8,title:'Big Bright Energy',artist:'Cherry Club',mood:'Confident',duration:'2:59',seconds:179,cover:'cover-yellow',symbol:'✦',playlist:['main']},
  {id:9,title:'Little Love Note',artist:'Milo June',mood:'Happy',duration:'3:08',seconds:188,cover:'cover-green',symbol:'♡',playlist:['pink','study']},
  {id:10,title:'Window Seat',artist:'April & June',mood:'Calm',duration:'3:31',seconds:211,cover:'cover-lilac',symbol:'☁',playlist:['study','blue']},
  {id:11,title:'After the Rain',artist:'Luna Bloom',mood:'Heartbroken',duration:'3:45',seconds:225,cover:'cover-blue',symbol:'☂',playlist:['pink','blue']},
  {id:12,title:'Tiny Wins Club',artist:'The Daydreamers',mood:'Focused',duration:'2:51',seconds:171,cover:'cover-yellow',symbol:'✧',playlist:['study','main']}
];
const playlists = {
  pink:{title:'Pink Daydream',description:'soft pop · rosy thoughts',symbol:'♥',ids:[1,2,4,9,11]},
  blue:{title:'Cloud Nine',description:'floaty · slow mornings',symbol:'☾',ids:[1,3,5,7,10,11]},
  main:{title:'Main Character Energy',description:'bold pop · big energy',symbol:'☼',ids:[2,4,8,12]},
  study:{title:'Study Café',description:'focus beats · cozy hours',symbol:'✿',ids:[3,6,9,10,12]}
};
let currentView='discover', currentSongId=1, playing=false, elapsed=34, playCount=0, likedIds=new Set(), activeMood='', activePlaylist='pink', searchTerm='', toastTimer;
const $=id=>document.getElementById(id);
function currentSong(){return songs.find(s=>s.id===currentSongId)||songs[0]}
function formatTime(s){return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`}
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2300)}
function goView(view){
  currentView=view;document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active-view',v.id===`view-${view}`));
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  $('globalSearch').value=searchTerm;
  if(view==='player')renderPlayer(); if(view==='profile')renderLiked(); if(view==='moods')renderMoodSongs();
  if(view==='playlists'){$('playlistGrid').classList.remove('hidden');$('playlistDetail').classList.add('hidden')}
}
function songRow(song){
  const liked=likedIds.has(song.id);return `<div class="track-row"><button class="track-cover ${song.cover}" data-play-song="${song.id}" aria-label="Play ${song.title}">${song.symbol}</button><button class="track-meta song-open" data-play-song="${song.id}" style="text-align:left;border:0;background:transparent;cursor:pointer;padding:0"><strong>${song.title}</strong><span>${song.artist}</span></button><span class="track-mood">${song.mood}</span><span class="track-duration">${song.duration}</span><button class="track-action ${liked?'liked':''}" data-like-song="${song.id}" aria-label="${liked?'Unlike':'Like'} ${song.title}">${liked?'♥':'♡'}</button></div>`;
}
function bindSongButtons(container){container.querySelectorAll('[data-play-song]').forEach(b=>b.addEventListener('click',()=>playSong(Number(b.dataset.playSong))));container.querySelectorAll('[data-like-song]').forEach(b=>b.addEventListener('click',()=>toggleLike(Number(b.dataset.likeSong))))}
function renderTracks(container,songList,emptyTitle='Nothing here just yet',emptyCopy='Try another mood or search.'){container.innerHTML=songList.length?songList.map(songRow).join(''):`<div class="empty-state"><b>${emptyTitle}</b>${emptyCopy}</div>`;bindSongButtons(container)}
function filteredSongs(){return songs.filter(s=>(!searchTerm||`${s.title} ${s.artist} ${s.mood}`.toLowerCase().includes(searchTerm)))}
function renderDiscover(){renderTracks($('discoverTracks'),filteredSongs().slice(0,5),'No songs found','Try a different search.')}
function renderMoodSongs(){let list=filteredSongs();if(activeMood)list=list.filter(s=>s.mood===activeMood);$('moodResultTitle').textContent=activeMood?`${activeMood} sounds`:'A little bit of everything';$('moodResultEyebrow').textContent=activeMood?`YOUR ${activeMood.toUpperCase()} SOUNDTRACK`:'YOUR VIBE, YOUR SONGS';renderTracks($('moodTracks'),list,'No matching songs','Try clearing the mood filter.')}
function renderLiked(){const list=filteredSongs().filter(s=>likedIds.has(s.id));$('likedCount').textContent=likedIds.size;$('playedCount').textContent=playCount;renderTracks($('likedTracks'),list,'Your love notes go here','Tap the heart next to any song to save it.')}
function renderPlaylists(){document.querySelectorAll('.playlist-card').forEach(card=>card.addEventListener('click',()=>openPlaylist(card.dataset.playlist)))}
function openPlaylist(key){activePlaylist=key;const p=playlists[key];$('playlistGrid').classList.add('hidden');$('playlistDetail').classList.remove('hidden');$('detailTitle').textContent=p.title;$('detailDescription').textContent=p.description;$('detailCover').textContent=p.symbol;$('detailCover').className=`detail-cover detail-${key}`;renderTracks($('playlistTracks'),filteredSongs().filter(s=>p.ids.includes(s.id)),'No songs found','Try clearing your search.');$('playPlaylist').onclick=()=>{const first=p.ids.find(id=>filteredSongs().some(s=>s.id===id));if(first)playSong(first);else toast('No matching songs in this mix yet ♡')};}
function playSong(id){const song=songs.find(s=>s.id===id);if(!song)return;currentSongId=id;elapsed=0;playing=true;playCount++;renderPlayer();goView('player');toast(`Now playing: ${song.title} ♫`)}
function renderPlayer(){const s=currentSong();$('currentTitle').textContent=s.title;$('currentArtist').textContent=s.artist;$('durationTime').textContent=s.duration;$('progress').max=s.seconds;$('progress').value=elapsed;$('elapsedTime').textContent=formatTime(elapsed);$('togglePlay').textContent=playing?'Ⅱ':'▶';$('likeCurrent').textContent=likedIds.has(s.id)?'♥':'♡';$('likeCurrent').classList.toggle('liked',likedIds.has(s.id));document.querySelector('.vinyl').classList.toggle('playing',playing);$('playerStatus').textContent=playing?'A little moment, just for you ♡':'Paused — take your time ♡'}
function toggleLike(id){if(likedIds.has(id)){likedIds.delete(id);toast('Removed from your little love list ♡')}else{likedIds.add(id);toast('Saved to your liked songs ♥')}renderDiscover();renderMoodSongs();renderLiked();if(currentView==='player')renderPlayer();if(currentView==='playlists'&&!$('playlistDetail').classList.contains('hidden'))openPlaylist(activePlaylist)}
function setMood(mood){activeMood=mood;goView('moods');document.querySelectorAll('.mood-tile').forEach(t=>t.classList.toggle('selected',t.dataset.mood===mood));renderMoodSongs()}
function searchChanged(value){searchTerm=value.trim().toLowerCase();renderDiscover();renderMoodSongs();renderLiked();if(currentView==='playlists'&&!$('playlistDetail').classList.contains('hidden'))openPlaylist(activePlaylist)}
// Main navigation: each button swaps to a separate screen; no long landing-page scroll.
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>goView(button.dataset.view)));
document.querySelectorAll('[data-view-link]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();goView(link.dataset.viewLink)}));
$('globalSearch').addEventListener('input',e=>searchChanged(e.target.value));
document.querySelectorAll('[data-mood]').forEach(button=>button.addEventListener('click',()=>setMood(button.dataset.mood)));
$('clearMood').addEventListener('click',()=>{activeMood='';document.querySelectorAll('.mood-tile').forEach(t=>t.classList.remove('selected'));renderMoodSongs()});
$('playDailyMix').addEventListener('click',()=>playSong(2));
$('backToPlaylists').addEventListener('click',()=>{$('playlistDetail').classList.add('hidden');$('playlistGrid').classList.remove('hidden')});
$('togglePlay').addEventListener('click',()=>{playing=!playing;renderPlayer();toast(playing?'Play on, daydreamer ♫':'Paused — breathe for a sec ♡')});
$('previousTrack').addEventListener('click',()=>{const i=songs.findIndex(s=>s.id===currentSongId);playSong(songs[(i-1+songs.length)%songs.length].id)});
$('nextTrack').addEventListener('click',()=>{const i=songs.findIndex(s=>s.id===currentSongId);playSong(songs[(i+1)%songs.length].id)});
$('progress').addEventListener('input',e=>{elapsed=Number(e.target.value);$('elapsedTime').textContent=formatTime(elapsed)});
$('likeCurrent').addEventListener('click',()=>toggleLike(currentSongId));
$('editProfile').addEventListener('click',()=>{const name=prompt('What should we call you, daydreamer?','Jamie Daydream');if(name&&name.trim()){document.querySelector('.profile-copy h2').textContent=name.trim();document.querySelector('.profile-avatar').childNodes[0].textContent=name.trim()[0].toUpperCase();toast(`Looking good, ${name.trim()} ♡`)}});
renderPlaylists();renderDiscover();renderMoodSongs();renderLiked();renderPlayer();
// This is a front-end demo player: it simulates elapsed time but does not stream audio.
setInterval(()=>{if(playing){const s=currentSong();elapsed++;if(elapsed>=s.seconds){const i=songs.findIndex(x=>x.id===currentSongId);currentSongId=songs[(i+1)%songs.length].id;elapsed=0;playCount++;}if(currentView==='player')renderPlayer();}},1000);
