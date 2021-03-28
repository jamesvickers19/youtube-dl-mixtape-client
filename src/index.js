import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
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
    this.state = {url: '', sections: []}; 
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDownloadEntireVideo = this.handleDownloadEntireVideo.bind(this);
    this.handleDownload = this.handleDownload.bind(this);
    this.onSectionSelectedChange = this.onSectionSelectedChange.bind(this);
    this.onSectionNameChange = this.onSectionNameChange.bind(this);
    this.onAllSectionsSelectedChange = this.onAllSectionsSelectedChange.bind(this);
    this.nullIfNoSections = this.nullIfNoSections.bind(this);
    this.downloadSpinner = this.downloadSpinner.bind(this);
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
      .then(data => this.setState({
        videoInfo: {
          name: data.name,
          start: 0,
          end: data.length,
          selected: true
        },
        sections: data.sections.map(t => ({ ...t, selected: true})),
        fetchedVideoId: videoId
      }))
    .catch(error => console.log(`Request to ${serverURL} failed: ${error}`));
    event.preventDefault();
  }

  handleDownloadEntireVideo(event) {
    let videoId = this.getVideoId();
    const link = document.createElement('a');
    link.href = `${serverURL}/download/${videoId}`;
    link.target = '_blank';
    link.setAttribute("type", "hidden");
    document.body.appendChild(link); // needed for firefox (?)
    link.click();
    link.remove();
    event.preventDefault();
  }

  handleDownload(event) {
    let requestData = {
      'video-id': this.state.fetchedVideoId,
      'sections': this.state.sections.filter(t => t.selected)
    };
    this.setState({downloading: true});
    fetch(`${serverURL}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
    .then( res => res.blob() )
    .then( blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = "files.zip";
      link.target = '_blank';
      link.setAttribute("type", "hidden");
      document.body.appendChild(link); // needed for firefox (?)
      link.click();
      link.remove();
    })
    .catch((error) => {
      console.error('Error:', error);
    })
    .finally(() => {
      this.setState({downloading: false});
    });
  }

  onSectionSelectedChange(event) {
    let sections = this.state.sections;
    let index = event.target.getAttribute("index");
    sections[index].selected = event.target.checked;
    this.setState({sections: sections});
  }

  onSectionNameChange(event) {
    let sections = this.state.sections;
    let index = event.target.getAttribute("index");
    sections[index].name = event.target.value;
    this.setState({sections: sections});
  }
  
  onAllSectionsSelectedChange(event) {
    let sections = this.state.sections;
    sections.forEach(t => t.selected = event.target.checked);
    this.setState({sections: sections});
  }
  
  nullIfNoSections(element) {
    return this.state.sections.length > 0
      ? element
      : null;
  }

  downloadSpinner() {
    if (this.state.downloading) {
      return (
        <Loader
          type="Watch"
          color="#00BFFF"
          height={50}
          width={50}/>);
    }
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
        {
          this.state.fetchedVideoId == null
            ? null
            : (<button onClick={this.handleDownloadEntireVideo}>Download entire video</button>) 
        }
        <br/>
        {this.nullIfNoSections(
            <div>
              <input checked={this.state.sections.every(t => t.selected)}
                     onChange={this.onAllSectionsSelectedChange}
                     type="checkbox"
                     name="changeAllSelection"
                     id="changeAllSelection"
              />
              <label htmlFor="changeAllSelection">Select / unselect all</label>
            </div>)}
        <ul>
        {
          this.state.sections.map((section, index) => (
            <li key={index}>
              <VideoSection
                index={index}
                onSelectedChange={this.onSectionSelectedChange}
                onNameChange={this.onSectionNameChange}
                isChecked={section.selected}
                value={section.name}
                startTime={section.start}
                endTime={section.end}
              />
            </li>
          ))
        }
        </ul>
        {this.nullIfNoSections(
          <button onClick={this.handleDownload}>download</button>)}
        {this.downloadSpinner()}
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
// - Show entire video name as it's own section that can be downloaded; make downloaded zip file have this name
// - disable some controls (like download) while request is working
// - Button alongside each section to download separately
// - add links on each section that go to video at that section
// - client validation and/or cleaning of filenames?
// - More error handling