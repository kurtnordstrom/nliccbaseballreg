import {useState, useEffect} from "react"
import api from "../api"
import {useNavigate} from "react-router-dom"
import { getAgeAtDate, getAgeNow, checkDateString } from "../util"
import { SEASON_START_DATE } from "../constants"


function PersonForm({method, person_id}) { //method is either 'create' or 'edit'
    const [personObject, setPersonObject] = useState({})
    const [playerObject, setPlayerObject] = useState({})
    const [familyId, setFamilyId] = useState("");
    const [roleList, setRoleList] = useState([]);
    const [isPlayer, setIsPlayer] = useState(false)
    const [showValidateModal, setShowValidateModal] = useState(false)
    const [validateErrors, setValidateErrors] = useState([])
    const navigate = useNavigate()


    //Move this call and the useEffect hook to the Person page and pass the object instead
   
    
    const getPersonData = (person_id_value) => {
        console.log("Getting person data...")
        api.get(`/api/person/${person_id_value}/`)
            .then((res) => res.data)
            .then((data) => {
                setPersonObject(data);
                console.log(data);
            })
            .catch((err) => alert(err));
        api.get(`/api/role/?person=${person_id_value}`)
            .then((role_res) => role_res.data)
            .then((role_data) => {
                console.dir(role_data)
                const roleNameList = []
                for(const role of role_data) {
                    roleNameList.push(role.name)
                }
                setRoleList(roleNameList)
            })
            .catch((err) => alert(err));
        
        api.get(`/api/player/?person=${person_id_value}`)
            .then((player_res) => player_res.data)
            .then((player_data) => {
                if(player_data?.length > 0) {
                    const player = player_data[0]
                    setPlayerObject(player)
                    setIsPlayer(true)
                    console.dir(player)
                }
            })
            .catch((err) => {
                console.log(`Error getting player data: ${err}`)
            })
        
    }
    
    const getAndSetFamily =  () => {
        api.get("/api/person/")
            .then((res) => res.data)
            .then((data) => {
                console.dir(data)
                const person = data[0]
                console.dir(person)
                const family_id = person.family;
                setFamilyId(family_id)
                console.log(`family id set to ${family_id}`);
            })
        
    }


    useEffect(() => {
        if( method == 'edit') {
            getPersonData(person_id)
        } else {
            getAndSetFamily()
        }
    },[method, person_id])
        
    

    const handlePersonChange = (e) => {
        const { name, value } = e.target;
        setPersonObject({
            ...personObject,
            [name]: value   
        });
    }

    const handlePlayerChange = (e) => {
        const { name, value } = e.target;
        console.log(`handlePlayerChange, name=${name}, value=${value}`)
        setPlayerObject({
            ...playerObject,
            [name]: value
        })
    }

    const updateOrCreatePlayer = async (person_id) => {
        try {
            let res = await api.get(`/api/player/?person=${person_id}`)
            if(res.data.length > 0) {
                //It exists, update with a put
                await api.put(`/api/player/${res.data[0].id}/`, playerObject)
            } else {
                await api.post(`/api/player/`, { ...playerObject, person: person_id, season: "2026"})
                //It doesn't exist, create with POST
            } 
        } catch(error) {
            alert(error)
        }
    }

    const deletePlayerIfExisting = async () => {
        try {
            const player_res = await api.get(`/api/player/?person=${personObject.id}`)
            if(player_res.data.length > 0) {
                await api.delete(`/api/player/${player_res.data[0].id}/`)
            }
        } catch (error) {
            console.log(`Error getting player data for person ${personObject.id}: ${error}`)
        }
    }

    const togglePlayer = (e) => {
        setIsPlayer(e.target.checked)
    }

    const validateSubmission = () => {
        console.log("Validating")
        const errors = []

        if (!checkDateString(personObject.date_of_birth)) {
            errors.push("Birthdate must be present and be in the form of YYYY-MM-DD")
        }

        if(personObject.is_user) {
            if(getAgeNow(new Date(personObject.date_of_birth)) < 18) {
                errors.push("Primary registrant must be over 18 years of age")
            }
            if(!personObject.email) {
                errors.push("Email address required for primary registrant")
            }
            if(!personObject.phone_primary) {
                errors.push("A phone number is required for the primary registrant")
            }
            if(!personObject.address) {
                errors.push("A physical address is required for the primary registrant")
            }
        }

        if (isPlayer) {
            if(getAgeAtDate(new Date(personObject.date_of_birth), new Date(SEASON_START_DATE)) > 13) {
                errors.push(`Players cannot be older than 13 at the beginning of the season (${SEASON_START_DATE})`)
            }
            if( (playerObject.franchise_first && playerObject.franchise_second) && 
                (playerObject.franchise_first === playerObject.franchise_second)) {
                    errors.push("If a first and second choice for franchise are selected, they must be different")
            }
            if(playerObject.franchise_no &&
                 (playerObject.franchise_first == playerObject.franchise_no || playerObject.franchise_second == playerObject.franchise_no)) {
                    errors.push("If an incompatible franchise is selected, it cannot be the same as the first or second choice for franchises")
            }
            if(!playerObject.shirt_size) {
                errors.push("Please make sure you select a shirt size")
            }
            const legalRoles = [ "CONCESSIONS", "SCOREKEEPER" ]
            for(const role of roleList) {
                if(!legalRoles.includes(role)) {
                    errors.push("The only valid service roles for players are Concessions and Scorekeeper")
                    break
                }
            }            
        }
        return errors
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateSubmission()
        console.log("Errors:")
        console.dir(errors)
        setValidateErrors(errors)
        if (errors.length > 0) {
            setShowValidateModal(true)
            return
        }
        if(method==="create") {
            try {
                const personSubmit = {...personObject, family: familyId}
                const person_res = await api.post("/api/person/", personSubmit)
                const person_res_id = person_res.data.id;
                for (const role of roleList) {
                    const roleOb = {
                        name: role,
                        season: "2026",
                        person: person_res_id
                    }
                    await api.post("/api/role/", roleOb)
                }
                if (isPlayer) {
                    const playerSubmit = {...playerObject, person: person_res_id, season: "2026"}
                    await api.post("/api/player/", playerSubmit)
                }
                navigate("/")
            } catch(error) {
                alert(error)
            }
               
        } else { //it's an edit
            try {
                const person_res = await api.put(`/api/person/${person_id}/`, personObject)
                const role_res = await api.get(`/api/role/?person=${person_id}`)
                const existingRoleObjects = []
                for(const role of role_res.data) {
                    existingRoleObjects.push(role)
                }
                const existingRoles = existingRoleObjects.flatMap((x) => x.name)
                const deleteRoleIdList = []
                const addRoleList = []
                for(const entry of existingRoleObjects) {
                    if(!roleList.includes(entry.name)) {
                        deleteRoleIdList.push(entry.id)
                    }
                }
                for(const entry of roleList) {
                    if(!existingRoles.includes(entry)) {
                        addRoleList.push(entry)
                    }
                }
                for(const entry of addRoleList) {
                    const roleOb = {
                        name: entry,
                        season: "2026",
                        person: person_id
                    }
                    await api.post(`/api/role/`, roleOb)
                }
                for(const entry of deleteRoleIdList) {
                    await api.delete(`/api/role/${entry}/`)                        
                }
                if (isPlayer) {
                    //await api.put(`/api/player/${playerObject.id}/`, playerObject)
                    await updateOrCreatePlayer(person_id)
                } else {
                    await deletePlayerIfExisting()
                }
                navigate("/")
            } catch(error) {
                alert(error)
            }
        }
        
    }

    const handleRoleChange = (e) => {
        const options = [...e.target.selectedOptions]
        const values = options.map(option => option.value)
        setRoleList(values)
        console.log(values)
    }



    const pageTitle = method === "create" ? "Register New User" : "Edit User";

    return (
        <div>
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{pageTitle}</h1>
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
            <label>Phone (Primary)</label>
            <input
                className="form-input"
                type="text"
                value={personObject.phone_primary}
                name="phone_primary"
                onChange={handlePersonChange}
            />
            <label>Phone (Secondary)</label>
            <input
                className="form-input"
                type="text"
                value={personObject.phone_secondary}
                name="phone_secondary"
                onChange={handlePersonChange}
            />
            <label>Medical Training</label>
            <select
                name="medical_experience"
                value={personObject.medical_experience}
                onChange={handlePersonChange}>
                <option value="">(None)</option>
                <option value="firstaid">First Aid/CPR</option>
                <option value="emt">EMT/Paramedic</option>
                <option value="nurse">Nurse/RN</option>
                <option value="physician">Physician</option>
            </select>
            
            <label>Service Roles</label>
            <select 
                name="personRoles"
                multiple={true}
                value={roleList}
                onChange={handleRoleChange}>
                <option value="GENERAL_MANAGER">General Manager</option>
                <option value="HEAD_COACH">Head Coach</option>
                <option value="ASSISTANT_COACH">Assistant Coach</option>
                <option value="SCOREKEEPER">Scorekeeper</option>
                <option value="CONCESSIONS">Concessions</option>
                <option value="UMPIRE">Umpire</option>
            </select>
            <button
                type="button"
                onClick={(e) => {setRoleList([])}}>
                    Clear Roles
            </button>
            <label>Person is Player</label>
            <input
                type="checkbox"
                name="is_player"
                checked={isPlayer}
                onChange={togglePlayer}
            />
            { isPlayer &&
            <>
            <label>Franchise (First Choice)</label>
            <select
                name="franchise_first"
                value={playerObject.franchise_first}
                onChange={handlePlayerChange}>
                <option value="">(None)</option>
                <option value="BLUE">Blue</option>
                <option value="FOREST">Forest</option>
                <option value="MAROON">Maroon</option>
                <option value="NAVY">Navy</option>
            </select>
            <label>Franchise (Second Choice)</label>
            <select
                name="franchise_second"
                value={playerObject.franchise_second}
                onChange={handlePlayerChange}>
                <option value="">(None)</option>
                <option value="BLUE">Blue</option>
                <option value="FOREST">Forest</option>
                <option value="MAROON">Maroon</option>
                <option value="NAVY">Navy</option>
            </select>
            <label>Incompatible Franchise</label>
            <select
                name="franchise_no"
                value={playerObject.franchise_no}
                onChange={handlePlayerChange}>
                <option value="">(None)</option>
                <option value="BLUE">Blue</option>
                <option value="FOREST">Forest</option>
                <option value="MAROON">Maroon</option>
                <option value="NAVY">Navy</option>
            </select>
            <label>Shirt Size</label>
            <select
                name="shirt_size"
                value={playerObject.shirt_size}
                onChange={handlePlayerChange}>
                <option value="">Please select a size</option>
                <option value="Youth Small">Youth Small</option>
                <option value="Youth Medium">Youth Medium</option>
                <option value="Youth Large">Youth Large</option>
                <option value="Adult Small">Adult Small</option>
                <option value="Adult Medium">Adult Medium</option>
                <option value="Adult Large">Adult Large</option>
            </select>
            <label>Returning Player?</label>
            <input 
                type="checkbox" 
                name="returning" 
                checked={playerObject.returning} 
                onChange={(e) => { 
                    const val = e.target.checked;
                    handlePlayerChange({
                        target: {name: "returning", value: val}
                    })
                    }
                }
            />
            <label>Experience Pitching?</label>
            <input 
                type="checkbox" 
                name="can_pitch" 
                checked={playerObject.can_pitch} 
                onChange={(e) => { 
                    const val = e.target.checked;
                    handlePlayerChange({
                        target: {name: "can_pitch", value: val}
                    })
                    }
                }
            />
            <label>Experience Catching?</label>
            <input 
                type="checkbox" 
                name="can_catch" 
                checked={playerObject.can_catch} 
                onChange={(e) => { 
                    const val = e.target.checked;
                    handlePlayerChange({
                        target: {name: "can_catch", value: val}
                    })
                    }
                }
            />
            </>
            }
            <button
                className="form-button"
                type="submit">
                    Save Changes
            </button>
            <button
                type="button"
                className="form-button"
                onClick={() => navigate("/")}>
                    Cancel
                </button>
        </form>
        { showValidateModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Validation Errors, please check and resubmit</h3>
                    {validateErrors.map((error) => (
                        <ErrorRow errorString={error}/>
                        ))}
                    <button
                        type="button"
                        onClick={()=> setShowValidateModal(false)}>OK</button>
                </div>
            </div>
        )}
        </div>
    )
}

function ErrorRow({errorString}) {
    return (<div class="item-display"><div class="item-text">{errorString}</div></div>)
}

export default PersonForm