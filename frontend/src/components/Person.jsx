import React, {useState} from "react"
import {useNavigate} from "react-router-dom"
import api from "../api"


function Person({person}) {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate()
    return (
        <div>
        <div className="person-list-item">
            <p className="person-name">{`${person.last_name}, ${person.first_name}`}</p>
            <button
                onClick={()=>{navigate(`/person?person_id=${person.id}&method=edit`)}}
            >Edit</button>
            <button 
                onClick={()=>setShowModal(true)}
                disabled={person.is_user}
            >Delete</button>
        </div>
        {showModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Are you sure you want to delete this person?</h3>
                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                await api.delete(`/api/person/${person.id}/`)
                            } catch(error) {
                                alert(`Error deleting person: ${error}`)
                            } finally {
                                setShowModal(false)
                                window.location.reload(false);
                            }
                        }}
                    >Yes, Delete</button>
                    <button 
                        onClick={() => setShowModal(false)}
                    >Cancel</button>
                </div>
            </div>
        )}
        </div>
    )
}

export default Person