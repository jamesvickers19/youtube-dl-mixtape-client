import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import VideoSection from './VideoSection'
import reportWebVitals from './reportWebVitals';

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

const serverURL = "http://localhost:8080";

class StartForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {url: '', tracks: []};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDownload = this.handleDownload.bind(this);
    this.onTrackSelectedChange = this.onTrackSelectedChange.bind(this);
    this.onTrackNameChange = this.onTrackNameChange.bind(this);
    this.onAllTracksSelectedChange = this.onAllTracksSelectedChange.bind(this);
    this.nullIfNoTracks = this.nullIfNoTracks.bind(this);
  }

  handleChange(event) {
    this.setState({url: event.target.value});
  }

  getVideoId() {
    const url = new URL(this.state.url);
    const urlParams = new URLSearchParams(url.search);
    return urlParams.get('v');
  }

  handleSubmit(event) {
    let videoId = this.getVideoId();
    if (videoId === null) {
      alert(`Url '${this.state.url}' is not a YouTube video`);
      return;
    }

    fetch(`${serverURL}/sections/${videoId}`)
      .then(response => response.json())
      .then(tracks => this.setState({tracks: tracks.map(t => ({ ...t, selected: true }))}))
    .catch(error => console.log(`Request to ${serverURL} failed: ${error}`));
    event.preventDefault();
  }

  handleDownload(event) {
    // TODO should probably cache videoId after initial track fetch
    // otherwise it can get edited and be wrong at this point
    let videoId = this.getVideoId();
    let requestData = {
      'video-id': videoId,
      'sections': this.state.tracks.filter(t => t.selected)
    };
    fetch(`${serverURL}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
    .then( res => res.blob() )
    .then( blob => {
      // TODO set filename of downloaded file
      var file = window.URL.createObjectURL(blob);
      window.location.assign(file);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  onTrackSelectedChange(event) {
    let tracks = this.state.tracks;
    let index = event.target.getAttribute("index");
    tracks[index].selected = event.target.checked;
    this.setState({tracks: tracks});
  }

  onTrackNameChange(event) {
    let tracks = this.state.tracks;
    let index = event.target.getAttribute("index");
    tracks[index].name = event.target.value;
    this.setState({tracks: tracks});
  }
  
  onAllTracksSelectedChange(event) {
    let tracks = this.state.tracks;
    tracks.forEach(t => t.selected = event.target.checked);
    this.setState({tracks: tracks});
  }
  
  nullIfNoTracks(element) {
    return this.state.tracks.length > 0
      ? element
      : null;
  }

  render() {
    return (
      <div>
        <label>
          Enter a YouTube link:
          <input onChange={this.handleChange}>
          </input>
        </label>
        <button onClick={this.handleSubmit}>submit</button>
        <br/>
        {this.nullIfNoTracks(
            <div>
              <input checked={this.state.tracks.every(t => t.selected)}
                     onChange={this.onAllTracksSelectedChange}
                     type="checkbox"
                     name="changeAllSelection"
                     id="changeAllSelection"
              />
              <label htmlFor="changeAllSelection">Select / unselect all</label>
            </div>)}
        <ul>
        {
          // TODO use better key
          this.state.tracks.map((track, index) => (
            <li key={index}>
              <VideoSection
                index={index}
                onSelectedChange={this.onTrackSelectedChange}
                onNameChange={this.onTrackNameChange}
                isChecked={track.selected}
                value={track.name}
                startTime={track.start}
                endTime={track.end}
              />
            </li>
            ))
        }
        </ul>
        {this.nullIfNoTracks(
          <button onClick={this.handleDownload}>download</button>)}  
      </div>
    );
  }
}

ReactDOM.render(
  <React.StrictMode>
    <StartForm />
  </React.StrictMode>,
  document.getElementById('root')
);

// TODO
// - give better downloaded filename; at least make it has extension .zip
// - large downloads sometimes fail in server
// - should probably cache videoId after initial track fetch since it's used in state by download button
// - Button alongside each track to download separately
// - Show entire video name as it's own track
// - More error handling
// - Support mp3 downloads with metadata, e.g. artist/album/song ?