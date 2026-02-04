import {useState,useEffect} from "react"
import api from "../api"
import Note from "../components/Note"
import Person from "../components/Person"

function Home() {
    const [notes, setNotes] = useState([]);
    const [persons, setPersons] = useState([]);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");

    const checkPersonList = () => {
        api.get("/api/person/")
            .then((res) => res.data)
            .then((data) => {
                setPersons(data);
                console.log(data);
            })
            .catch((err) => alert(err));
    }

    useEffect(() => {
        checkPersonList();
    }, [])

    const getNotes = () => {
        api.get("/api/notes/")
            .then((res) => res.data)
            .then((data) => { setNotes(data); console.log(data) })
            .catch((err) => alert(err));
    };



    const deleteNote = (id) => {
        api.delete(`/api/notes/delete/${id}/`).then((res) => {
            if (res.status === 204) {
                alert("Note deleted!")
            } else {
                alert("Failed to delete note")
            }
            getNotes();
        }).catch((error) => alert(error))
        
    }

    const createNote = (e) => {
        e.preventDefault()
        api.post("/api/notes/", {content, title}).then((res) => {
            if (res.status === 201) {
                alert("Note created")
            } else {
                alert("Failed to make note")
            }
            getNotes();
        }).catch((err) => alert(err))
        
    }

    return (
    <div>
        { true && 
        <div>Show this block</div> }
        { false && 
        <div>Don't show this block</div> }
        <div>
            <h2>Family</h2>
            {persons.map((person) => (
                <Person person={person}/>
            ))}
        </div>
       
    </div>
    );
    
}

export default Home
