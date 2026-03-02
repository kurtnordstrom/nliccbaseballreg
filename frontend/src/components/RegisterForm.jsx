import {useState} from "react"
import api from "../api"
import {useNavigate} from "react-router-dom"
//import {checkDateString} from "../util"

function RegisterForm({route}) {
    const [userObject, setUserObject] = useState({})
    const [personObject, setPersonObject] = useState({is_user: true})
    const [familyObject, setFamilyObject] = useState({registration_submitted: false})
    const [passwordCheck, setPasswordCheck] = useState("")
    const [submissionErrors, setSubmissionErrors] = useState([])
    const [showErrorModal, setShowErrorModal] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submissionObject = structuredClone(userObject);
        submissionObject.person = structuredClone(personObject);

        //Assume that the parent can pick up
        submissionObject.person.can_pickup = true;

        submissionObject.family = structuredClone(familyObject);

        const errors = doValidation(submissionObject)

        if (errors.length) {
            setShowErrorModal(true)
        } else {
            try {
                await api.post(route, submissionObject)
                navigate("/login")
            } catch (error) {
                const errorMsg = `Error submitting registration: ${error.response?.status}: ${JSON.stringify(error.response?.data)}`
                console.log(errorMsg)
                alert (errorMsg) 
            } 
        }
    }

    const doValidation = (submissionObject) => {
        const errors = []
        if (!submissionObject.username) {
            errors.push("You must provide a username")
        }        
        if (!submissionObject.password) {
            errors.push("You must provide a password")
        }
        if (submissionObject.password != passwordCheck) {
            errors.push("Provided passwords do not match")
        }
        if (!submissionObject.person.first_name || !submissionObject.person.last_name) {
            errors.push("You must provide a first and last name")
        }
        if (!submissionObject.person.email) {
            errors.push("You must provide a valid email address")
        }

        if (!submissionObject.person.address) {
            errors.push("Please provide a full address for the primary registrant")
        }

        if (!submissionObject.person.phone_primary) {
            errors.push("Pleae provide at least one valid phone number (with area code)")
        }
        /*
        if(!checkDateString(submissionObject.person.date_of_birth)) {
            errors.push("You must provide a birthdate in the form of YYYY-MM-DD")
        }
        */
        if (!submissionObject.person.is_adult) {
            errors.push("Primary registrant must be a legal adult")
        }
        if (!submissionObject.person.is_parent) {
            errors.push("Primary registrant must be a parent to player(s) being registered")
        }
        if (!submissionObject.family.family_name) {
            errors.push("Please provide a name for your family (typically your last name)")
        }
        setSubmissionErrors(errors)
        return errors
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
        <div>
        <form onSubmit={handleSubmit} className="form-container">
            <h1>Register New User</h1>
            <label>Username (You will use this to login to the system)</label>
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
            <label>Password (Again)</label>
            <input
                className="form-input"
                type="password"
                value={passwordCheck}
                name="password-again"
                onChange={(e) => setPasswordCheck(e.target.value)}
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
                onBlur={
                    (e) => {
                        if (!familyObject.family_name) {
                            setFamilyObject({
                                ...familyObject,
                                family_name: e.target.value
                            })
                        }
                    }
                }
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
            <label>Primary Phone</label>
            <input
                className="form-input"
                type="text"
                value={personObject.phone_primary}
                name="phone_primary"
                onChange={handlePersonChange}
            />
            <label>Address (Number, Street, City, State)</label>
            <input
                className="form-input"
                type="text"
                value={personObject.address}
                name="address"
                onChange={handlePersonChange}
            />
            <label>Person is 18 or older
                <input 
                    class="inline-check"
                    type="checkbox" 
                    name="is_adult" 
                    checked={personObject.is_adult} 
                    onChange={(e) => { 
                        const val = e.target.checked;
                        handlePersonChange({
                            target: {name: "is_adult", value: val}
                        })
                        }
                    }
                />
            </label>
            <label>Person is parent/guardian of player(s)
                <input 
                    class="inline-check"
                    type="checkbox" 
                    name="is_parent" 
                    checked={personObject.is_parent} 
                    onChange={(e) => { 
                        const val = e.target.checked;
                        handlePersonChange({
                            target: {name: "is_parent", value: val}
                        })
                        }
                    }
                />
            </label>
            <label>Family Name</label>
            <input
                className="form-input"
                type="text"
                value={familyObject.family_name}
                name="family_name"
                onChange={handleFamilyChange}
            />
            <button
                className="form-button"
                type="submit">
                    Submit
            </button>
        </form>
        { showErrorModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Validation Errors, please check and resubmit</h3>
                    {submissionErrors.map((error) => (
                        <ErrorRow errorString={error}/>
                        ))}
                    <button
                        type="button"
                        onClick={()=> setShowErrorModal(false)}>OK</button>
                </div>
            </div>
        )}
        </div>
    )
}

function ErrorRow({errorString}) {
    return (<div class="item-display"><div class="item-text">{errorString}</div></div>)
}

export default RegisterForm