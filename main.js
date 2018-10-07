const CLIENT_ID = '30073939618-2tqlhumfchj22lpd92n2h5tg3s9fqrsg.apps.googleusercontent.com';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';
const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const videoContainer = document.getElementById('video-container');

const defaultchannel = 'TechGuyWeb';


//Form Submit and Change Channel
channelForm.addEventListener('submit', e => {
    e.preventDefault();

    const channel = channelInput.value;
    console.log(channel);
    getChannel(channel);
});

//Load Auth2 Library
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

//Initialize the API Client Library and set up sign in listners
function initClient() {
    gapi.client.init({
      discoveryDocs: DISCOVERY_DOCS,
      clientId: CLIENT_ID,
      scope: SCOPES
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      authorizeButton.onclick = handleAuthClick;
      signoutButton.onclick = handleSignoutClick;
    });
}


//Update UI Sign In State Changes
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      authorizeButton.style.display = 'none';
      signoutButton.style.display = 'block';
      content.style.display = 'block';
      videoContainer.style.display = 'block';
      getChannel(defaultchannel);
    } else {
      authorizeButton.style.display = 'block';
      signoutButton.style.display = 'none';
      content.style.display='none';
      videoContainer.style.display = 'none';
    }
}


//Handle Login
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

//Handle Logout
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function showChannelData(data){
    const channelData = document.getElementById('channel-data');
    channelData.innerHTML = data;
}

//Get the Channel List
function getChannel(channel) {
    //console.log(channel)
   gapi.client.youtube.channels.list({
      'part': 'snippet,contentDetails,statistics',
      'forUsername': channel
    }).then(function(response) {
        console.log(response);
      var channel = response.result.items[0];
      const output = `
      <ul class="collection">
        <li class="collection-item"> Title: ${channel.snippet.title}</li>
        <li class="collection-item"> ID: ${channel.id}</li>
        <li class="collection-item"> Subscribers: ${numberWithCommas(channel.statistics.subscriberCount)}</li>
        <li class="collection-item"> Views: ${numberWithCommas(channel.statistics.viewCount)}</li>
        <li class="collection-item"> Videos: ${numberWithCommas(channel.statistics.videoCount)}</li>
      </ul>
      <p>${channel.snippet.description}</p>
      <hr>
      <a class="btn grey darken-2" target="_blank" href="https://youtube.com/${channel.snippet.customUrl}">Visit Channel</a>
      `;
      showChannelData(output);

      const playlistId = channel.contentDetails.relatedPlaylists.uploads;
      requestVideoPlaylist(playlistId);

    }).catch(err => alert('No Channel By That Name'));
  }

  //Add Commas to number
  function numberWithCommas (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function requestVideoPlaylist(playlistId){
    const requestOptions = {
        playlistId : playlistId,
        part : 'snippet',
        maxResults : 10
    }

    const request = gapi.client.youtube.playlistItems.list(requestOptions);

    request.execute(response => {
        console.log(response);
        const playlistItems = response.result.items;
        if(playlistItems){
            let output = '<br><h4 class="center-align">Latest Videos</h4>';

            //Loop through videos and append output 
            playlistItems.forEach(item => {
                const videoId = item.snippet.resourceId.videoId;

                output += `
                    <div class="col s3">
                    <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                    </div>
                `;
            });

            //Output videos
            videoContainer.innerHTML = output;
        }else{
            videoContainer.innerHTML = 'No Uploaded Videos';
        }
    });
  }
