// Global variables for audio player and song queue
var results_container = document.querySelector("#saavn-results");
var results_objects = {};
const searchUrl = "https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=";
var queue = []; // Queue to store song URLs
var currentSongIndex = -1; // Track the current song index
var audioPlayer = new Audio(); // Global audio player for playing songs

// Function to initiate Saavn search when user submits search query
function SaavnSearch() {
    event.preventDefault(); // Stop page reload
    var query = document.querySelector("#saavn-search-box").value.trim();
    query = encodeURIComponent(query);

    if (query.length > 0) {
        window.location.hash = query;
        doSaavnSearch(query);
    }
}

// Function to add all songs to the queue
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

    // Automatically play the next song if the queue is populated
    if (queue.length > 0 && currentSongIndex === -1) {
        PlayAudio(queue[0], 0);  // Start playing the first song
    }
}

// Function to perform the actual search for songs using the Saavn API
var page_index = 1;

async function doSaavnSearch(query, NotScroll, page) {
    window.location.hash = query;
    document.querySelector("#saavn-search-box").value = decodeURIComponent(query);
    if (!query) {
        return 0;
    }
    results_container.innerHTML = `<span class="loader">Searching</span>`;
    query = query + "&limit=40";
    if (page) {
        page_index = page_index + 1;
        query = query + "&page=" + page_index;
    } else {
        query = query + "&page=1";
        page_index = 1;
    }

    try {
        var response = await fetch(searchUrl + query);
    } catch (error) {
        results_container.innerHTML = `<span class="error">Error: ${error} <br> Check if API is down </span>`;
        return;
    }

    var json = await response.json();
    if (response.status !== 200) {
        results_container.innerHTML = `<span class="error">Error: ${json.message}</span>`;
        return 0;
    }

    var json = json.data.results;
    var results = [];
    if (!json) {
        results_container.innerHTML = "<p> No result found. Try other Library </p>";
        return;
    }
    
    lastSearch = decodeURI(window.location.hash.substring(1));
    AddAllToQueue(json); // Add songs to queue
    
    for (let track of json) {
        var song_name = TextAbstract(track.name, 25);
        var album_name = TextAbstract(track.album.name, 20);
        if (track.album.name == track.name) {
            album_name = "";
        }
        var measuredTime = new Date(null);
        measuredTime.setSeconds(track.duration);
        var play_time = measuredTime.toISOString().substr(11, 8);
        if (play_time.startsWith("00:0")) {
            play_time = play_time.slice(4);
        }
        if (play_time.startsWith("00:")) {
            play_time = play_time.slice(3);
        }
        var song_id = track.id;
        var year = track.year;
        var song_image = track.image[1].link;
        var song_artist = TextAbstract(track.primaryArtists, 30);
        var bitrate = document.getElementById('saavn-bitrate');
        var bitrate_i = bitrate.options[bitrate.selectedIndex].value;
        if (track.downloadUrl) {
            var download_url = track.downloadUrl[bitrate_i]['link'];
            var quality = "";
            if (bitrate_i == 4) {
                quality = 320;
            } else {
                quality = 160;
            }
            results_objects[song_id] = {
                track: track,
            };
            results.push(`
                <div class="text-left song-container" style="margin-bottom:20px;border-radius:10px;background-color:#1c1c1c;padding:10px;">
                    <div class="row" style="margin:auto;">
                        <div class="col-auto" style="padding:0px;padding-right:0px;border-style:none;">
                            <img id="${song_id}-i" class="img-fluid d-inline" style="width:115px;border-radius:5px;height:115px;padding-right:10px;" src="${song_image}" loading="lazy"/>
                        </div>
                        <div class="col" style="border-style:none;padding:2px;">
                            <p class="float-right fit-content" style="margin:0px;color:#fff;padding-right:10px;">${year}</p>
                            <p id="${song_id}-n" class="fit-content" style="margin:0px;color:#fff;max-width:100%;">${song_name}</p>
                            <p id="${song_id}-a" class="fit-content" style="margin:0px;color:#fff;max-width:100%;">${album_name}<br/></p>
                            <p id="${song_id}-ar" class="fit-content" style="margin:0px;color:#fff;max-width:100%;">${song_artist}<br/></p>
                            <button class="btn btn-primary song-btn" type="button" style="margin:0px 2px;" onclick='PlayAudio("${download_url}","${song_id}")'>▶</button>
                            <button class="btn btn-primary song-btn" type="button" style="margin:0px 2px;" onclick='AddDownload("${song_id}")'>Download</button>
                            <p class="float-right fit-content" style="margin:0px;color:#fff;padding-right:10px;padding-top:15px;">${play_time}<br/></p>
                        </div>
                    </div>
                </div>
            `);
        }
    }

    results_container.innerHTML = results.join(' ');
    if (!NotScroll) {
        document.getElementById("saavn-results").scrollIntoView();
    }
}

// Function to play the selected audio
function PlayAudio(url, songId) {
    audioPlayer.src = url;
    audioPlayer.play();
    currentSongIndex = queue.indexOf(url); // Set the current index in queue
    console.log(`Playing song ID: ${songId}`);
    UpdateControllerBar(songId);
}

// Auto-play next song in queue when current song ends
audioPlayer.onended = function () {
    if (currentSongIndex + 1 < queue.length) {
        currentSongIndex++;
        // Play the next song
        PlayAudio(queue[currentSongIndex], results_objects[queue[currentSongIndex]].track.id);
        // Update the controller bar with the next song's details
        UpdateControllerBar(queue[currentSongIndex]);
    } else {
        console.log("End of Queue");
    }
};

// Function to handle next song (next button click)
function nextPage() {
    page_index++;
    doSaavnSearch(lastSearch, false, page_index);

    // After fetching the next set of songs, update the song details if needed
    if (currentSongIndex + 1 < queue.length) {
        currentSongIndex++;
        // Update the controller bar with the next song's details
        UpdateControllerBar(queue[currentSongIndex]);
    }
}

// UpdateControllerBar function to update the controller bar with new song's details
function UpdateControllerBar(songId) {
    var song = results_objects[songId].track;
    var song_name = song.name;
    var song_artist = song.primaryArtists;
    var album_name = song.album.name;
    var play_time = new Date(null);
    play_time.setSeconds(song.duration);
    var play_time_str = play_time.toISOString().substr(11, 8);
    

    
    // Update the audio player controls
    document.querySelector("#player-name").innerText = song_name;
    document.querySelector("#player-album").innerText = album_name;
    document.querySelector("#player-image").src = song.image[1].link;

    // Update the progress bar time
    document.querySelector("#play_time").innerText = `00:00 / ${play_time_str}`;
    
    // Enable play/pause button
    document.querySelector("#play-pause").innerHTML = "&#10074;&#10074;"; // Pause symbol
}

// Auto-play next song in queue when current song ends
audioPlayer.onended = function () {
    if (currentSongIndex + 1 < queue.length) {
        currentSongIndex++;
        PlayAudio(queue[currentSongIndex], results_objects[queue[currentSongIndex]].track.id);
    } else {
        console.log("End of Queue");
    }
};



// Helper function to shorten text (for song/album names)
function TextAbstract(text, length) {
    if (text == null) {
        return "";
    }
    if (text.length <= length) {
        return text;
    }
    text = text.substring(0, length);
    last = text.lastIndexOf(" ");
    text = text.substring(0, last);
    return text + "...";
}

// Function to go to the next page of search results
document.getElementById("loadmore").addEventListener('click', nextPage);

// Function to handle next
// Function to handle next page load
const randomKeywords = [' ', 'party', 'rain', 'happy', 'Shambhu', 'rock', 'classical', '2024', 'Motivational', 'dance', 'new'];

// Function to get a random keyword
function getRandomKeyword() {
    return randomKeywords[Math.floor(Math.random() * randomKeywords.length)];
}

// Function to handle next page load
function nextPage() {
    page_index++;
    doSaavnSearch(lastSearch, false, page_index);
}

// Load initial results if hash exists
if (window.location.hash) {
    doSaavnSearch(window.location.hash.substring(1));
} else {
    // Auto search with a random keyword
    const randomSearch = getRandomKeyword();
    doSaavnSearch(randomSearch, 1);
}

// Update on hash change
addEventListener('hashchange', event => {
    doSaavnSearch(window.location.hash.substring(1));
});


//main sever code end
// Auto-play next song in queue when current song ends
audioPlayer.onended = function () {
    if (currentSongIndex + 1 < queue.length) {
        currentSongIndex++;
        // Play the next song
        PlayAudio(queue[currentSongIndex], results_objects[queue[currentSongIndex]].track.id);
        // Update the controller bar with the next song's details
        UpdateControllerBar(queue[currentSongIndex]);
    } else {
        console.log("End of Queue");
    }
};

// Function to handle next song (next button click)
function nextPage() {
    page_index++;
    doSaavnSearch(lastSearch, false, page_index);

    // After fetching the next set of songs, update the song details if needed
    if (currentSongIndex + 1 < queue.length) {
        currentSongIndex++;
        // Update the controller bar with the next song's details
        UpdateControllerBar(queue[currentSongIndex]);
    }
}

// UpdateControllerBar function to update 

function UpdateControllerBar(songId) {
    var song = results_objects[songId].track;
    var song_name = song.name;
    var song_artist = song.primaryArtists;
    var album_name = song.album.name;
    var play_time = new Date(null);
    play_time.setSeconds(song.duration);
    var play_time_str = play_time.toISOString().substr(11, 8);
    

    
    // Update the audio player controls
    document.querySelector("#player-name").innerText = song_name;
    document.querySelector("#player-album").innerText = album_name;
    document.querySelector("#player-image").src = song.image[1].link;

    // Update the progress bar time
    document.querySelector("#song-time").innerText = `00:00 / ${play_time_str}`;
    
    // Enable play/pause button
    document.querySelector("#play-pause").innerHTML = "&#10074;&#10074;"; // Pause symbol
}

// Auto-play next song in queue when current song ends
audioPlayer.onended = function () {
    if (currentSongIndex + 1 < queue.length) {
        currentSongIndex++;
        PlayAudio(queue[currentSongIndex], results_objects[queue[currentSongIndex]].track.id);
    } else {
        console.log("End of Queue");
    }
};

// Function to download the song
function DownloadSong(url) {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'song.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Helper function to shorten text (for song/album names)
function TextAbstract(text, length) {
    if (text == null) {
        return "";
    }
    if (text.length <= length) {
        return text;
    }
    text = text.substring(0, length);
    last = text.lastIndexOf(" ");
    text = text.substring(0, last);
    return text + "...";
}

// Function to go to the next page of search results
document.getElementById("loadmore").addEventListener('click', nextPage);

// Function to handle next
// Function to handle next page load
function nextPage() {
    page_index++;
    doSaavnSearch(lastSearch, false, page_index);
}

// Load initial results if hash exists
if (window.location.hash) {
    doSaavnSearch(window.location.hash.substring(1));
} else {
    doSaavnSearch('english', 1);
}

// Update on hash change
addEventListener('hashchange', event => {
    doSaavnSearch(window.location.hash.substring(1));
});


//next play button click song details change on 
// Define song details array

//end song details code yaha se





// Auto-play next song in queue when current song ends
audioPlayer.onended = function () {
    if (currentSongIndex + 1 < queue.length) {
        currentSongIndex++;
        PlayAudio(queue[currentSongIndex], Object.keys(results_objects)[currentSongIndex]);
    } else {
        console.log("End of Queue");
    }
};

// Update the slider progress and time while the song plays
audioPlayer.ontimeupdate = function () {
    var progressBar = document.querySelector("#progress-bar");
    var songTime = document.querySelector("#song-time");

    if (audioPlayer.duration) {
        // Update the progress bar
        var progressValue = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = progressValue;

        // Update time display
        var currentTime = formatTime(audioPlayer.currentTime);
        var totalTime = formatTime(audioPlayer.duration);
        songTime.innerText = `${currentTime} / ${totalTime}`;
    }
};

// Format time helper (hh:mm:ss or mm:ss)
function formatTime(seconds) {
    var measuredTime = new Date(null);
    measuredTime.setSeconds(seconds);
    return seconds >= 3600
        ? measuredTime.toISOString().substr(11, 8) // hh:mm:ss
        : measuredTime.toISOString().substr(14, 5); // mm:ss
}

// Seek audio when the slider is adjusted
function SeekAudio(event) {
    var progressBar = document.querySelector("#progress-bar");
    var seekTime = (event.target.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = seekTime;
}

// Add event listener for manual seeking
document.querySelector("#progress-bar").addEventListener("input", SeekAudio);

// Function to play the selected audio
function PlayAudio(url, songId) {
    audioPlayer.src = url;
    audioPlayer.play();
    currentSongIndex = queue.indexOf(url); // Update the current index in the queue

    UpdateControllerBar(songId);
}

// Function to update the song details in the controller bar
function UpdateControllerBar(songId) {
    var song = results_objects[songId].track;
    var songName = song.name;
    var songAlbum = song.album.name;

    // Update player display
    document.querySelector("#player-name").innerText = songName;
    document.querySelector("#player-album").innerText = songAlbum;
    document.querySelector("#player-image").src = song.image[1].link;

    // Reset progress bar and time
    document.querySelector("#progress-bar").value = 0;
    document.querySelector("#song-time").innerText = "00:00 / 00:00";
}

// Toggle play/pause functionality
function TogglePlayPause() {
    if (audioPlayer.paused) {
        audioPlayer.play();
        document.querySelector("#play-pause").innerHTML = "&#10074;&#10074;"; // Pause symbol
    } else {
        audioPlayer.pause();
        document.querySelector("#play-pause").innerHTML = "&#9658;"; // Play symbol
    }
}

// Function to update the controller bar
function UpdateControllerBar(songId) {
    var song = results_objects[songId].track;
    var song_name = song.name;
    var song_artist = song.primaryArtists;
    var album_name = song.album.name;
    var play_time = new Date(null);
    play_time.setSeconds(song.duration);
    var play_time_str = play_time.toISOString().substr(11, 8);

    // Update the UI elements (example IDs used)
    document.getElementById("song-name").textContent = song_name;
    document.getElementById("song-artist").textContent = song_artist;
    document.getElementById("album-name").textContent = album_name;
    document.getElementById("play-time").textContent = play_time_str;
}

// Adding event listener for the "Next" button
document.getElementById("play-pause").addEventListener("click", function () {
    // Assuming you maintain a currentSongIndex and totalSongs
    if (currentSongIndex < totalSongs - 1) {
        currentSongIndex++;
        UpdateControllerBar(currentSongIndex);
    } else {
        console.log("End of playlist");
    }
});


//update auto song details 
// Auto-play next song in queue when current song ends
audioPlayer.onended = function () {
    if (currentSongIndex + 1 < queue.length) {
        currentSongIndex++;
        const nextSongUrl = queue[currentSongIndex];
        const nextSongId = Object.keys(results_objects).find(
            key => results_objects[key].track.downloadUrl[4].link === nextSongUrl
        );
        PlayAudio(nextSongUrl, nextSongId); // Play the next song and update the controller bar
    } else {
        console.log("End of Queue");
    }
};

//end code details 

//process slider 

function UpdateSlider() {
    const slider = document.querySelector("#progress-slider");
    const currentTimeElement = document.querySelector("#play-time");
    const totalTimeElement = document.querySelector("#play-time");

    // Update slider and time at regular intervals
    audioPlayer.ontimeupdate = function () {
        const currentTime = audioPlayer.currentTime;
        const duration = audioPlayer.duration;

        // Update slider
        slider.value = (currentTime / duration) * 100;

        // Update time display
        currentTimeElement.innerText = formatTime(currentTime);
        totalTimeElement.innerText = formatTime(duration);
    };

    // Allow manual slider control
    slider.oninput = function () {
        const seekTime = (slider.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
    };
}

function UpdateControllerBar(songId) {
    const song = results_objects[songId].track;
    document.querySelector("#player-name").innerText = song.name;
    document.querySelector("#player-album").innerText = song.album.name;
    document.querySelector("#player-image").src = song.image[1].link;

    // Reset slider and time
    const slider = document.querySelector("#progress-slider");
    slider.value = 0;
    document.querySelector("#play-time").innerText = "00:00";
    document.querySelector("#play-time").innerText = formatTime(song.duration);
}



//end process slider 

