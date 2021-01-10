import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import VideoSection from './VideoSection'
import reportWebVitals from './reportWebVitals';

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

class StartForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {url: '', tracks: []};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onSelectedChange = this.onSelectedChange.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
  }

  handleChange(event) {
    this.setState({url: event.target.value});
  }

  handleSubmit(event) {
    const url = new URL(this.state.url);
    const urlParams = new URLSearchParams(url.search);
    const videoId = urlParams.get('v');
    if (videoId === null) {
      alert(`Url '${this.state.url}' is not a YouTube video`);
      return;
    }

    fetch(`http://localhost:5000/sections?v=${videoId}`)
      .then(response => response.json())
      .then(tracks => this.setState({tracks: tracks.map(t => ({ ...t, selected: true }))}))
    .catch(error => console.log(`Request to ${url} failed: ${error}`));
    event.preventDefault();
  }

  onSelectedChange(event) {
    let tracks = this.state.tracks;
    let index = event.target.getAttribute("index");
    tracks[index].selected = event.target.checked;
    this.setState({tracks: tracks});
    this.state.tracks.forEach(t => console.log(`${t.name} selected = ${t.selected}`));
  }

  onNameChange(event) {
    let tracks = this.state.tracks;
    let index = event.target.getAttribute("index");
    tracks[index].name = event.target.value;
    this.setState({tracks: tracks});
    this.state.tracks.forEach(t => console.log(`${t.name} selected = ${t.selected}`));
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Enter a YouTube link:
          <input onChange={this.handleChange}>
          </input>
        </label>
        <input type="submit" value="Submit" />
        <br/>
        <ul>
        {
          // TODO use better key
          this.state.tracks.map((track, index) => (
            <li key={index}>
              <VideoSection
                index={index}
                onSelectedChange={this.onSelectedChange}
                onNameChange={this.onNameChange}
                isChecked={track.selected}
                value={track.name}
                startTime={track.startTimeSec}
                endTime={track.endTimeSec}
              />
            </li>
            ))
        }
        </ul>
      </form>
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
// - Show track lengths with their names
// - Button to download all selected tracks (as e.g. zip)
// - Button alongside each track to download separately
// - Show entire video name as it's own track
// - More error handling
// - Support mp3 downloads with metadata, e.g. artist/album/song ?