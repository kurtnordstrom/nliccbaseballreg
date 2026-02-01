import React from "react"

function Person({person}) {
    return (
        <div className="person-list-item">
            <p className="person-name">{`${person.last_name}, ${person.first_name}`}</p>
        </div>
    )
}

export default Person