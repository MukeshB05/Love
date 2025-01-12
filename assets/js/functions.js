function PlayAudio(audio_url, song_id) {
    
  var audio = document.getElementById('player');
  var source = document.getElementById('audioSource');
  source.src = audio_url;
  var name = document.getElementById(song_id+"-n").textContent;
  var album = document.getElementById(song_id+"-a").textContent;
  var image = document.getElementById(song_id+"-i").getAttribute("src");
    
document.title = name+" - "+album;
var bitrate = document.getElementById('saavn-bitrate');
var bitrate_i = bitrate.options[bitrate.selectedIndex].value;
var quality = "";
if (bitrate_i == 4) {quality = 320} else {quality = 160;}


    document.getElementById("player-name").innerHTML = name;
        document.getElementById("player-album").innerHTML = album;
document.getElementById("player-image").setAttribute("src",image);

var promise = audio.load();
if (promise) {
    //Older browsers may not return a promise, according to the MDN website
    promise.catch(function(error) { console.error(error); });
}//call this to just preload the audio without playing
  audio.play(); //call this to play the song right away
};
function searchSong(search_term) {
    
document.getElementById('search-box').value=search_term;
var goButton = document.getElementById("search-trigger");
            goButton.click();
    
}
var DOWNLOAD_API = "https://openmp3compiler.astudy.org"
function AddDownload(id) {
    var bitrate = document.getElementById('saavn-bitrate');
    var bitrate_i = bitrate.options[bitrate.selectedIndex].value;
    // MP3 server API
    var MP3DL = DOWNLOAD_API+"/add?id="+id;
    // make api call, if 200, add to download list
    fetch(MP3DL)
    .then(response => response.json())
    .then(data => {
        if (data.status == "success") {
            // add to download list
            var download_list = document.getElementById("download-list");
            var download_item = document.createElement("li");
           /*
           <li>
                    <div class="col">
                        
                        <img src="https://i.pinimg.com/originals/ed/54/d2/ed54d2fa700d36d4f2671e1be84651df.jpg" width="50px">
                        <div style="display: inline;">
                        <span id="download-name">Song</span>
                        <span id="download-album">Album</span>
                        <br>
                        <span id="download-size">Size</span>
                        <span id="download-status" style="color:green">Compiling.</span>
                        </div>
                    </div>
                    <hr>
                    </li>
           */
            // download_item.innerHTML = '<div class="col"><img src="'+data.image+'" width="50px"><div style="display: inline;"><span id="download-name">'+id+'</span><span id="download-album">'+data.album+'</span><br><span id="download-size">'+data.size+'</span><span id="download-status" style="color:green">Compiling.</span></div></div><hr>';
            download_item.innerHTML = `
            <div class="col">
            <img class="track-img" src="${data.image}" width="50px">
            <div style="display: inline;">
              <span class="track-name"> ${id}</span> - 
              <span class="track-album"> ${data.album}</span>
              <br>
              <span class="track-size"> Size : Null</span>
              <span class="track-status" style="color:green"> </span>
            </div>
          </div>
          <hr>
            `;

            // set download_item track_tag to song id
            download_item.setAttribute("track_tag",id);
            
            // set css class no-bullets
            download_item.className = "no-bullets";

            download_list.appendChild(download_item);
            // every 5 seconds, check download status
            var STATUS_URL = DOWNLOAD_API+"/status?id="+id;
            // get download_status_span by track_tag and class
            var download_status_span = document.querySelector('[track_tag="'+id+'"] .track-status');
            var download_name = document.querySelector('[track_tag="'+id+'"] .track-name');
            var download_album = document.querySelector('[track_tag="'+id+'"] .track-album');
            var download_img = document.querySelector('[track_tag="'+id+'"] .track-img');
            var download_size = document.querySelector('[track_tag="'+id+'"] .track-size');
            // set text content to song name and album name
            
            download_name.innerHTML= results_objects[id].track.name;
            download_status_span.innerHTML = data.status;
            download_album.innerHTML = results_objects[id].track.album.name;
            download_img.setAttribute("src",results_objects[id].track.image[2].link);
            
            // change mpopupLink background and border color to green and back to blue after 1 second
            var float_tap = document.getElementById('mpopupLink');
            float_tap.style.backgroundColor = "green";
            float_tap.style.borderColor = "green";

            setTimeout(function() {
                float_tap.style.backgroundColor = "#007bff";
                float_tap.style.borderColor = "#007bff";
            }, 1000);
            
            // check status every 5 seconds
            var interval = setInterval(function() {
                fetch(STATUS_URL)
                .then(response => response.json())
                .then(data => {
                    if (data.status) {
                        // update status
                        download_status_span.textContent = data.status;
                        if(data.size) {
                            download_size.textContent = "Size: "+data.size;
                        }
                        if (data.status == "Done") {
                            // download complete, add download button
                            download_status_span.innerHTML = `<a href="${DOWNLOAD_API}${data.url}" target="_blank">Download MP3</a>`;
                            // clear interval
                            clearInterval(interval);
                            return;
                  }}
              });}, 3000); // end interval
        } });}
        
        
        var results_container = document.querySelector("#saavn-results");
var queue = []; // Queue to store song URLs
var currentSongIndex = -1; // Track the current song index
var audioPlayer = new Audio(); // Global audio player for playing songs
var isPlaying = false; // To track whether the song is playing or paused

// Play or Pause the song
function togglePlayPause() {
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        document.getElementById("play-pause").innerHTML = "&#9658;"; // Change to Play icon
    } else {
        audioPlayer.play();
        isPlaying = true;
        document.getElementById("play-pause").innerHTML = "&#10074;&#10074;"; // Change to Pause icon
    }
}

// Play a specific song from the queue
function PlayAudio(url, songId) {
    audioPlayer.src = url;
    audioPlayer.play();
    currentSongIndex = queue.indexOf(url); // Set the current index in the queue
    updateSongDetails(songId); // Update song details on player
    isPlaying = true;
    document.getElementById("play-pause").innerHTML = "&#10074;&#10074;"; // Pause icon
}

// Update song details in the player
function updateSongDetails(songId) {
    var song = results_objects[songId].track;
    document.getElementById("player-name").textContent = song.name;
    document.getElementById("player-album").textContent = song.album.name;
    document.getElementById("player-image").src = song.image[1].link;
    document.getElementById("song-time").textContent = "00:00 / " + formatTime(song.duration); // Initialize with 0 time
}


//process slider code here 
// Assuming audioPlayer is already defined
var audioPlayer = new Audio();

// Function to format time in MM:SS format
function formatTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var seconds = Math.floor(seconds % 60);
    return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
}

// Function to update song time display
function updateSongTime() {
    var currentTimeFormatted = formatTime(audioPlayer.currentTime); // Current time
    var durationFormatted = formatTime(audioPlayer.duration); // Total duration
    document.getElementById("song-time").textContent = currentTimeFormatted + " / " + durationFormatted;
}

// Function to update the progress slider
function updateProgress() {
    var progressSlider = document.getElementById("progress-slider");

    // If audio duration is greater than 0 (song is loaded), update progress
    if (audioPlayer.duration > 0) {
        var progress = (audioPlayer.currentTime / audioPlayer.duration) * 100; // Calculate progress percentage
        progressSlider.value = progress; // Update slider value
    }

    updateSongTime(); // Update song time display
}

// Event listener to update the progress slider and song time while the song is playing
audioPlayer.ontimeupdate = function() {
    updateProgress();
};

// Handle progress slider change (seek feature)
document.getElementById("progress-slider").addEventListener("input", function() {
    var progress = this.value; // Get the slider value
    audioPlayer.currentTime = (progress / 100) * audioPlayer.duration; // Set current time based on slider value
    updateSongTime(); // Update song time display
});

// Function to play a song and update the controller bar
function playAudio(song) {
    audioPlayer.src = song.src;
    audioPlayer.play();

    // Update the song details in the controller bar
    document.getElementById("player-name").textContent = song.title;
    document.getElementById("player-album").textContent = song.album;
    document.getElementById("player-image").src = song.image;

    updateSongTime(); // Initialize song time

    // Update progress slider as the song plays
    setInterval(updateProgress, 1000); // Update the progress every second
}

// Handle song end and move to the next song in queue (if any)
audioPlayer.onended = function () {
    if (queue.length > 0) {
        var currentSongIndex = queue.indexOf(currentSong); // Get the index of the current song in the queue
        if (currentSongIndex + 1 < queue.length) {
            playAudio(queue[currentSongIndex + 1]); // Play next song in the queue
        }
    }
};
// chevk process slider yaha tk
//notification settings start 
self.addEventListener('push', function(event) {
  var options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png'
  };

  event.waitUntil(
    self.registration.showNotification('New Notification', options)
  );
});
// Check if the browser supports notifications
if ('Notification' in window) {
  // Request permission for notifications
  Notification.requestPermission().then(function(permission) {
    if (permission === "granted") {
      console.log("Notification permission granted.");
    } else {
      console.log("Notification permission denied.");
    }
  });
}

// Ensure Service Worker is ready
navigator.serviceWorker.ready.then(function(registration) {
  // Check if PushManager is supported
  if ('PushManager' in window) {
    registration.pushManager.subscribe({
      userVisibleOnly: true,  // The user will always see notifications
      applicationServerKey: '<Your Public VAPID Key Here>'  // Use VAPID for security
    })
    .then(function(subscription) {
      console.log('User is subscribed:', subscription);
      // Send the subscription object to your server to save it
    })
    .catch(function(error) {
      console.error('Subscription failed:', error);
    });
  }
});

self.addEventListener('push', function(event) {
  var options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png'
  };

  event.waitUntil(
    self.registration.showNotification('New Notification', options)
  );
});

self.addEventListener('push', function(event) {
  var options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png'
  };

  event.waitUntil(
    self.registration.showNotification('New Notification', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();  // Close the notification
  // Open a new window/tab with the URL you want
  event.waitUntil(
    clients.openWindow('https://your-website.com')
  );
});

self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-notifications') {
    // Handle syncing here
  }
});

// Next song in queue
function nextSong() {
    if (currentSongIndex + 1 < queue.length) {
        currentSongIndex++;
        PlayAudio(queue[currentSongIndex], queue[currentSongIndex]);
    } else {
        console.log("End of Queue");
    }
}

// Previous song in queue
function prevSong() {
    if (currentSongIndex - 1 >= 0) {
        currentSongIndex--;
        PlayAudio(queue[currentSongIndex], queue[currentSongIndex]);
    }
}

// Song queue management
function AddAllToQueue(songs) {
    songs.forEach(song => {
        if (song.downloadUrl) {
            var bitrate = document.getElementById('saavn-bitrate');
            var bitrate_i = bitrate.options[bitrate.selectedIndex].value;
            var download_url = song.downloadUrl[bitrate_i]['link'];
            queue.push(download_url);
        }
    });
    console.log("All songs added to queue.");
}

// Queue song details display
function displayQueue() {
    var queueContainer = document.getElementById("queue-container");
    queueContainer.innerHTML = '';
    queue.forEach((songUrl, index) => {
        var song = results_objects[index].track;
        var songItem = `<div class="queue-item">
                            <span>${song.name} - ${song.album.name}</span>
                            <button onclick="PlayAudio('${songUrl}', ${index})">Play</button>
                        </div>`;
        queueContainer.innerHTML += songItem;
    });
}

// Add songs to the queue and display the queue
async function doSaavnSearch(query) {
    // Code to perform search and add songs to the queue
    // After getting results, call AddAllToQueue(json)
    // Then call displayQueue() to show the queue in the UI
    var json = /* Get search results */
    AddAllToQueue(json);
    displayQueue();
}

// Event listeners for the controls
document.getElementById("loadmore").addEventListener('click', nextPage);
//yaha tk hai play next queue song

// check process slider2

// Initialize the audio player and queue
var audioPlayer = document.getElementById("queueContainer");
var queue = [];

// Function to format time in MM:SS format
function formatTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var seconds = Math.floor(seconds % 60);
    return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
}

// Function to update song time display
function updateSongTime() {
    var currentTimeFormatted = formatTime(audioPlayer.currentTime);
    var durationFormatted = formatTime(audioPlayer.duration);
    document.getElementById("song-time").textContent = currentTimeFormatted + " / " + durationFormatted;
}

// Function to update progress slider
function updateProgress() {
    var progressSlider = document.getElementById("progress-slider");
    var progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressSlider.value = progress;
}

// Auto-update progress slider and song time during playback
audioPlayer.ontimeupdate = function () {
    updateProgress();
    updateSongTime();
};

// Handle progress slider change event
document.getElementById("progress-slider").addEventListener("input", function () {
    var progress = this.value;
    audioPlayer.currentTime = (progress / 100) * audioPlayer.duration;
    updateSongTime();
});

// Function to play a song and update the controller bar
function playAudio(song) {
    audioPlayer.src = song.src;
    audioPlayer.play();

    // Update the song details in the controller bar
    document.getElementById("player-name").textContent = song.title;
    document.getElementById("player-album").textContent = song.album;
    document.getElementById("player-image").src = song.image;

    updateSongTime(); // Initialize song time
}

// Function to extract song information and add to queue
function addSongsToQueue() {
    var results = document.querySelectorAll("#saavn-results .song-item"); // Update this selector based on actual structure of the #saavn-results container

    results.forEach(function (songItem) {
        var songData = {
            title: songItem.querySelector(".song-title").textContent, // Modify as per actual structure
            album: songItem.querySelector(".song-album").textContent, // Modify as per actual structure
            image: songItem.querySelector(".song-image").src, // Modify as per actual structure
            src: songItem.querySelector(".song-url").href // Modify as per actual structure
        };

        queue.push(songData); // Add to queue
    });

    // Optionally, play the first song automatically when songs are added to the queue
    if (queue.length > 0) {
        playAudio(queue[0]); // Play the first song from the queue
    }
}

// Automatically add songs to the queue from #saavn-results when the page loads or on an event
addSongsToQueue(); // You can call this when the page loads, or when new songs are added dynamically

// Handle song end and move to the next song in queue
audioPlayer.onended = function () {
    if (queue.length > 0) {
        var currentSongIndex = queue.indexOf(currentSong); // Get the index of the current song in the queue
        if (currentSongIndex + 1 < queue.length) {
            playAudio(queue[currentSongIndex + 1]); // Play next song in the queue
        }
    }
};
//endcode 3 for process
// Function to update progress slider
// Function to update the progress slider and song time
function updateProgress() {
    var progressSlider = document.getElementById("progress-slider"); // Your progress slider element
    var currentTimeFormatted = formatTime(audioPlayer.currentTime); // Format current time
    var durationFormatted = formatTime(audioPlayer.duration); // Format duration
    var progress = (audioPlayer.currentTime / audioPlayer.duration) * 100; // Calculate progress percentage

    // Set the slider value to the percentage of song played
    progressSlider.value = progress;

    // Update the song time display
    document.getElementById("song-time").textContent = currentTimeFormatted + " / " + durationFormatted;
}

// Event listener to update the progress slider and song time while the song is playing
audioPlayer.ontimeupdate = function() {
    updateProgress();
};

// Function to format time in MM:SS format
function formatTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var seconds = Math.floor(seconds % 60);
    return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
}

// Handle the progress slider change (seek feature)
document.getElementById("progress-slider").addEventListener("input", function() {
    var progress = this.value;
    audioPlayer.currentTime = (progress / 100) * audioPlayer.duration; // Set current time based on slider value
    updateProgress(); // Update song time display
});
/// process slider run code end
