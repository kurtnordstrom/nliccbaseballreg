import {useState} from "react"
import api from "../api"


function PersonForm({person}) {
    const [submitData, setSubmitData] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSubmitData( {
            ...submitData,
            [name]: value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(submitData);
    }
    return (
        <form onSubmit={handleSubmit}>
        <input
            type="text"
            name="Last Name"
            value={person.last_name}
            onChange={handleChange}
            required
        />
        <button type="submit">Submit</button>

    </form>
    )
}

export default PersonForm