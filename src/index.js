import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

class StartForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {url: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
    fetch(`http://127.0.0.1:5000/tracks?v=${videoId}`).then(function(response) {
      return response.json();
    }).then(function(data) {
      console.log(`type: ${typeof(data)}, data: ${data}`);
    }).catch(function() {
      console.log("Booo");
    });
    event.preventDefault();
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