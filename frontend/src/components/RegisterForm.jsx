import {useState} from "react"
import api from "../api"
import {useNavigate} from "react-router-dom"

function RegisterForm({route}) {
    const [userObject, setUserObject] = useState({})
    const [personObject, setPersonObject] = useState({is_user: true})
    const [familyObject, setFamilyObject] = useState({registration_submitted: false})

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submissionObject = structuredClone(userObject);
        submissionObject.person = structuredClone(personObject);
        submissionObject.family = structuredClone(familyObject);

        try {
            const res = await api.post(route, submissionObject)
            navigate("/login")
        } catch (error) {
            alert (error) 
        } 
    }

    const handleUserChange = (e) => {
        const { name, value } = e.target;
        setUserObject({
            ...userObject,
            [name]: value
        });
    }

    const handlePersonChange = (e) => {
        const { name, value } = e.target;
        setPersonObject({
            ...personObject,
            [name]: value
        });
    }

     const handleFamilyChange = (e) => {
        const { name, value } = e.target;
        setFamilyObject({
            ...familyObject,
            [name]: value
        });
    }

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>Register New User</h1>
            <label>Username</label>
            <input
                className="form-input"
                type="text"
                value={userObject.username}
                name="username"
                onChange={handleUserChange}
            />
             <label>Password</label>
            <input
                className="form-input"
                type="password"
                value={userObject.password}
                name="password"
                onChange={handleUserChange}
            />
            <label>Family Name</label>
            <input
                className="form-input"
                type="text"
                value={familyObject.family_name}
                name="family_name"
                onChange={handleFamilyChange}
            />
            <label>First Name</label>
            <input
                className="form-input"
                type="text"
                value={personObject.first_name}
                name="first_name"
                onChange={handlePersonChange}
            />
            <label>Last Name</label>
            <input
                className="form-input"
                type="text"
                value={personObject.last_name}
                name="last_name"
                onChange={handlePersonChange}
            />
            <label>Email</label>
            <input
                className="form-input"
                type="text"
                value={personObject.email}
                name="email"
                onChange={handlePersonChange}
            />
            <label>Date of Birth</label>
            <input
                className="form-input"
                type="text"
                value={personObject.date_of_birth}
                name="date_of_birth"
                onChange={handlePersonChange}
            />
            <label>Address</label>
            <input
                className="form-input"
                type="text"
                value={personObject.address}
                name="address"
                onChange={handlePersonChange}
            />
            <button
                className="form-button"
                type="submit">
                    Submit
            </button>
        </form>
    )
}

export default RegisterForm