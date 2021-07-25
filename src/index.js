import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Grid, Cell } from "styled-css-grid";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
import VideoSection from './VideoSection'
import reportWebVitals from './reportWebVitals';

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

const serverURL = "http://localhost:8080";

function download(blob, name) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.target = '_blank';
  link.setAttribute("type", "hidden");
  document.body.appendChild(link); // needed for firefox (?)
  link.click();
  link.remove();
}

function getVideoId(text) {
  const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  if (!text.match(youtubeRegex))
  {
    return null;
  }
  if (!text.startsWith('http://www.') && !text.startsWith('https://www.'))
  {
    text = 'https://www.' + text;
  }
  const url = new URL(text);
  const urlParams = new URLSearchParams(url.search);
  return urlParams.get('v');
}

class StartForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {url: '', sections: []}; 
    this.handleVideoUrlInputChange = this.handleVideoUrlInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDownloadEntireVideo = this.handleDownloadEntireVideo.bind(this);
    this.handleDownload = this.handleDownload.bind(this);
    this.onSectionSelectedChange = this.onSectionSelectedChange.bind(this);
    this.onSectionNameChange = this.onSectionNameChange.bind(this);
    this.onAllSectionsSelectedChange = this.onAllSectionsSelectedChange.bind(this);
    this.nullIfNoSections = this.nullIfNoSections.bind(this);
    this.downloadSpinner = this.downloadSpinner.bind(this);
    this.request = this.request.bind(this);
  }

  handleVideoUrlInputChange(event) {
    let url = event.target.value;
    let videoId = getVideoId(url);
    this.setState({
      url: url,
      videoId: videoId
    });
  }

  request(endpoint, responseHandler, requestParams = null) {
    let errorMsg = "";
    this.setState({
      errorMessage: errorMsg,
      downloading: true
    });
    fetch(`${serverURL}${endpoint}`, requestParams)
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => { throw Error(text); });
        }
        return response;
      })
      .then(response => responseHandler(response))
      .catch(error => {
        let msg = error.message;
        console.log(`Request to ${serverURL} failed: ${msg}`);
        errorMsg = `Error: ${msg}`;
      })
      .finally(() => {
        this.setState({
          downloading: false,
          errorMessage: errorMsg,
        });
      });
  }

  handleSubmit(event) {
    let fetchedVideoId = this.state.videoId;
    this.request(`/sections/${fetchedVideoId}`, response => response.json().then(data => this.setState({
      videoInfo: {
        title: data.title,
        start: 0,
        end: data.length,
        selected: true
      },
      sections: data.sections.map(t => ({ ...t, selected: true})),
      fetchedVideoId: fetchedVideoId
    })));
    event.preventDefault();
  }

  handleDownloadEntireVideo(event) {
    let videoId = this.state.videoId;
    let videoTitle = this.state.videoInfo.title;
    this.request(
      `/download/${videoId}`,
      response => response.blob().then(blob => download(blob, `${videoTitle}.mp3`)));
    event.preventDefault();
  }

  handleDownload(event) {
    let requestData = {
      'video-id': this.state.fetchedVideoId,
      'sections': this.state.sections.filter(t => t.selected)
    };
    let requestParams = {
      method: 'POST',
      body: JSON.stringify(requestData),
      headers: { 'Content-Type': 'application/json'}
    };
    this.request(
      '/download',
      response => response.blob().then(blob => download(blob, "files.zip")),
      requestParams);
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
          color="#2ba805"
          height={150}
          width={150}/>);
    }
  }

  render() {
    let urlInput = (<input id="urlInput" type="text" onChange={this.handleVideoUrlInputChange}/>);
    let submitBtn = (
    <button
        id="submitBtn"
        type="submit"
        disabled={!this.state.videoId}
        // show glowing animation if valid video is entered and hasn't been fetched yet
        style={{animation: this.state.videoId && this.state.fetchedVideoId !== this.state.videoId
          ? 'glowing 1300ms infinite'
          : 'none'}}
        onClick={this.handleSubmit}>
        Submit
    </button>);
    let errorLabel = (<label>{this.state.errorMessage}</label>);
    let selectAllInput = this.nullIfNoSections(
      <input checked={this.state.sections.every(t => t.selected)}
             onChange={this.onAllSectionsSelectedChange}
             type="checkbox"
             name="changeAllSelection"
             id="changeAllSelection"
             disabled={this.state.downloading}/>);
    let selectAllInputLabel = this.nullIfNoSections(
      <label htmlFor="changeAllSelection">Select / unselect all sections</label>
    );
    let sectionsList = (
      <ul>
        {
          this.state.sections.map((section, index) => (
            <li
              style={{ listStyleType: "none" }} 
              key={index}>
              <VideoSection
                index={index}
                onSelectedChange={this.onSectionSelectedChange}
                onNameChange={this.onSectionNameChange}
                isChecked={section.selected}
                value={section.name}
                startTime={section.start}
                endTime={section.end}
                style={{width: '800px'}}
                videoId={this.state.fetchedVideoId}
                disabled={this.state.downloading}
              />
            </li>
          ))
        }
        </ul>
    );
    let downloadBtn = (
      this.nullIfNoSections(
        <button
          type="button"
          disabled={this.state.downloading}
          onClick={this.handleDownload}>
          Download selected sections
      </button>));
    let videoTitleLabel = null;
    let downloadEntireVideoBtn = null;
    if (this.state.fetchedVideoId != null) {
      videoTitleLabel = (
      <div>
        <label>Video:     </label>
        <label style={{fontStyle: 'italic'}}>
          {this.state.videoInfo.title}
        </label>
      </div>
      );
      downloadEntireVideoBtn = (
        <button
          type="button"
          disabled={this.state.downloading}
          onClick={this.handleDownloadEntireVideo}>
          Download entire video
        </button>
      );
    }
    return (
    <form>
      <Grid columns={"1fr"} rows={"1fr"}>
        <Cell center>
          <h1 style={{fontSize: '50px', fontFamily: 'Garamond'}}>
            Youtube Mixtape Downloader
          </h1>
          <hr style={{margin: "0px 0px 20px 0px"}}/>
        </Cell>
        <Cell center>
          <label style={{fontSize: '30px'}}>Enter a YouTube link:</label>
        </Cell>
        <Cell center>
          {urlInput}
        </Cell>
        <Cell center>
          {submitBtn}
        </Cell>
        <Cell center>
          {errorLabel}
          {this.downloadSpinner()}
        </Cell>
        <Cell center>{videoTitleLabel}</Cell>
        <Cell center>{downloadEntireVideoBtn}</Cell>
        <Cell center>{downloadBtn}</Cell>
        <Cell center>
          {selectAllInput}
          {selectAllInputLabel}
        </Cell>
        <Cell center>{sectionsList}</Cell>
      </Grid>
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
// - styling
// - client validation and/or cleaning of filenames?
// - allow downloading audio or video; format and quality selection
// - Button alongside each section to download separately
// - integration tests for client (selenium ?)
// - more integration tests for server