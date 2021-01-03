import React from 'react'

// https://github.com/tariqulislam/react-multi-select-checkbox/blob/master/src/CheckBox.js

export const VideoSection = props => {
    return (
      <div>
        <input
          index={props.index}
          onChange={props.onSelectedChange}
          type="checkbox"
          checked={props.isChecked}           
        />
        <input
          index={props.index}
          value={props.value}
          onChange={props.onNameChange}
        />
      </div>
    )
}

export default VideoSection;