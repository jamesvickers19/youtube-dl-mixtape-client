import React from 'react'

// https://github.com/tariqulislam/react-multi-select-checkbox/blob/master/src/CheckBox.js

export const VideoSection = props => {
    return (
      <div>
        <input
          disabled={props.disabled}
          index={props.index}
          onChange={props.onSelectedChange}
          type="checkbox"
          checked={props.isChecked}           
        />
        <input
          disabled={props.disabled}
          index={props.index}
          value={props.value}
          onChange={props.onNameChange}
          style={props.style}
        />
        <a href={`https://youtube.com/watch?v=${props.videoId}&t=${props.startTime}`} target="_blank" rel="noreferrer">
          {toTimeString(props.startTime)} - {toTimeString(props.endTime)}
        </a>
      </div>
    )
}

function toTimeString(seconds) {
  var hours   = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds - (hours * 3600)) / 60);
  var remainingSeconds = seconds - (hours * 3600) - (minutes * 60);
  let prependZero = x => x < 10 ? "0" + x : x;
  return `${prependZero(hours)}:${prependZero(minutes)}:${prependZero(remainingSeconds)}`;
}

export default VideoSection;