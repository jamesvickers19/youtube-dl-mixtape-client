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

const serverURL = "http://localhost:8080";

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
  }

  handleVideoUrlInputChange(event) {
    let url = event.target.value;
    let videoId = getVideoId(url);
    this.setState({
      url: url,
      videoId: videoId
    });
  }

  handleSubmit(event) {
    let fetchedVideoId = this.state.videoId;
    fetch(`${serverURL}/sections/${fetchedVideoId}`)
      .then(response => response.json())
      .then(data => this.setState({
        videoInfo: {
          title: data.title,
          start: 0,
          end: data.length,
          selected: true
        },
        sections: data.sections.map(t => ({ ...t, selected: true})),
        fetchedVideoId: fetchedVideoId
      }))
    .catch(error => console.log(`Request to ${serverURL} failed: ${error}`));
    event.preventDefault();
  }

  async handleDownloadEntireVideo(event) {
    let videoTitle = this.state.videoInfo.title;
    let requestUrl = `${serverURL}/download/${this.state.videoId}`;
    this.setState({downloading: true});
    fetch(requestUrl)
      .then(res => res.blob())
      .then(blob => download(blob, `${videoTitle}.m4a`))
      .catch(error => console.log(`Request to ${requestUrl} failed: ${error}`))
      .finally(() => this.setState({downloading: false}));
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
    .then( blob => download(blob, "files.zip"))
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
          <input onChange={this.handleVideoUrlInputChange}>
          </input>
        </label>
        <button disabled={!this.state.videoId} onClick={this.handleSubmit}>submit</button>
        <br/>
        {
          this.state.fetchedVideoId == null
            ? null
            : (
              <div>
                <label>Video: {this.state.videoInfo.title}</label>
                <br></br>
                <button disabled={this.state.downloading} onClick={this.handleDownloadEntireVideo}>
                  Download entire video
                </button>
              </div>
              ) 
        }
        <br/>
        {this.nullIfNoSections(
            <div>
              <input checked={this.state.sections.every(t => t.selected)}
                     onChange={this.onAllSectionsSelectedChange}
                     type="checkbox"
                     name="changeAllSelection"
                     id="changeAllSelection"
                     disabled={this.state.downloading}
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
                videoId={this.state.fetchedVideoId}
                disabled={this.state.downloading}
              />
            </li>
          ))
        }
        </ul>
        {this.nullIfNoSections(
          <button disabled={this.state.downloading} onClick={this.handleDownload}>download</button>)}
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
// - error handling:
//   - non-existent video
//   - live video
// - Button alongside each section to download separately
// - styling
// - client validation and/or cleaning of filenames?
// - allow downloading audio or video; format and quality selection
// - handling of deleting old files, looking them up in cache...maybe more of a deployment thing
//    - maybe instead the server should do everything in memory...
//      - some private code might do it: https://github.com/sealedtx/java-youtube-downloader/blob/master/src/main/java/com/github/kiulian/downloader/model/YoutubeVideo.java
//        - could submit a PR: rework private YoutubeVideo.downloadStraight to be public
//        - could also just rewrite the needed parts of this library in Clojure
//      - can possibly manipuate the data using JAVE library: http://www.sauronsoftware.it/projects/jave/manual.php