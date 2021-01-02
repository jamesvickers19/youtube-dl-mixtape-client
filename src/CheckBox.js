import React from 'react'

// https://github.com/tariqulislam/react-multi-select-checkbox/blob/master/src/CheckBox.js

export const CheckBox = props => {
    return (
      <li>
       <input
        key={props.id}
        onChange={props.handleCheckChildElement}
        type="checkbox"
        checked={props.isChecked}
        value={props.value}           
        />
        {props.value}
      </li>
    )
}


export default CheckBox