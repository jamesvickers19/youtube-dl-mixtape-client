import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import CheckBox from './CheckBox'
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
    this.handleCheckChildElement = this.handleCheckChildElement.bind(this);
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

    fetch(`http://localhost:5000/tracks?v=${videoId}`)
      .then(response => response.json())
      .then(tracks => this.setState({tracks: tracks.map(t => ({ ...t, selected: true }))}))
    .catch(error => console.log(`Request to ${url} failed: ${error}`));
    event.preventDefault();
  }

  handleCheckChildElement(event) {
    let tracks = this.state.tracks;
    tracks
      .filter(t => t.name === event.target.value)
      .forEach(t => t.selected = event.target.checked);
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
          this.state.tracks.map((track, index) => (
            <CheckBox
              key={index}
              handleCheckChildElement={this.handleCheckChildElement}
              isChecked={track.selected}
              value={track.name} />))
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