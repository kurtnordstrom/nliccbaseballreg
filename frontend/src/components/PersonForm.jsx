import {useState, useEffect} from "react"
import api from "../api"
import {useNavigate} from "react-router-dom"
import { getAgeAtDate, getAgeNow, checkDateString } from "../util"
import { SEASON_START_DATE, EXTERNAL_LINK_URLS } from "../constants"


function PersonForm({method, person_id}) { //method is either 'create' or 'edit'
    const [personObject, setPersonObject] = useState({})
    const [playerObject, setPlayerObject] = useState({})
    const [familyId, setFamilyId] = useState("");
    const [roleList, setRoleList] = useState([]);
    const [isPlayer, setIsPlayer] = useState(false)
    const [showValidateModal, setShowValidateModal] = useState(false)
    const [validateErrors, setValidateErrors] = useState([])
    const [showInfoModal, setShowInfoModal] = useState(false)
    const [infoItems, setInfoItems] = useState([])
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [confirmRole, setConfirmRole] = useState("")
    const [confirmData, setConfirmData] = useState({})

    const baseUrl = import.meta.env.VITE_STATIC_FILE_URL;

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

    const handleRoleConfirm = (role, confirmText, confirmLink) => {
        const confirmOb = {
            text: confirmText,
            link: confirmLink
        }
        setConfirmData(confirmOb)
        setShowConfirmModal(true)
        setConfirmRole(role)
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
            if(getAgeAtDate(new Date(personObject.date_of_birth), new Date(SEASON_START_DATE)) > 13 &&
                !playerObject.age_exemption_request) {
                errors.push(`Players cannot be older than 13 at the beginning of the season (${SEASON_START_DATE}). ` +
                    "If you would like to request an age exemption, please check the box for it, and list any relevant " +
                    "information in the notes field on the Family Information form"
                )
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
                await api.put(`/api/person/${person_id}/`, personObject)
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
            <label>Can pickup player(s) from practice/games
                <input 
                    class="inline-check"
                    type="checkbox" 
                    name="can_pickup" 
                    checked={personObject.can_pickup} 
                    onChange={(e) => { 
                        const val = e.target.checked;
                        handlePersonChange({
                            target: {name: "can_pickup", value: val}
                        })
                        }
                    }
                />
            </label>
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
                <option 
                    value="ASSISTANT_COACH"
                    //TODO: Fix bug
                    onClick={handleRoleConfirm(
                        "ASSISTANT_COACH",
                       "Please confirm that you have reviewed and agree to the coaching guidelines before selecting" +
                                " this role", 
                        EXTERNAL_LINK_URLS.coaching,
                    )}
                >Assistant Coach</option>
                <option value="SCOREKEEPER">Scorekeeper</option>
                <option value="CONCESSIONS">Concessions</option>
                <option value="UMPIRE">Umpire</option>
            </select>
            <button
                type="button"
                onClick={(e) => {setRoleList([])}}>
                    Clear Roles
            </button>
            <label>Person is Player
            <input
                class="inline-check"
                type="checkbox"
                name="is_player"
                checked={isPlayer}
                onChange={togglePlayer}
            />
            </label>
            { isPlayer &&
            <>
            <label>Franchise (First Choice)
                <button
                    type="button"
                    class="help-button"
                    onClick={() => {
                        const infoList = [
                            'There are four "franchises" in place for New Life Baseball. Franchises each have individual teams ' +
                            'for the different age levels (Majors, Minors, Teeball) and are managed by a General Manager.',
                            "Franchises are assigned different mid-week practices days as well as different practice times " +
                            "on Saturdays. Franchise practice days/times are:",
                            "Navy: Mondays 6:00 PM, Saturdays 9:30 AM - 11:20 AM",
                            "Blue: Tuesdays 6:00 PM, Saturdays 1:30 PM - 3:20 PM",
                            "Forest: Thursdays 6:00 PM, Saturdays 3:30 - 5:20 PM",
                            "Maroon: Fridays 6:00 PM, Saturdays 11:30 AM - 1:20 PM",
                            "New Life Baseball cannot guarantee placement on any given franchise, though we will try to "+
                            "accomodate requests as space allows. You may specify your first and second choice for franchise. "+
                            "Additionally, if a practice day will NOT work for your family specify that in the 'Incompatible Franchise' "+
                            "drop-down."
                        ]
                        setInfoItems(infoList);
                        setShowInfoModal(true);
                    }}>Help
                    </button>
            </label>
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
            <label>Returning Player?
                <input 
                    class="inline-check"
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
            </label>
            <label>Experience Pitching?
                <input 
                    class="inline-check"
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
            </label>
            <label>Experience Catching?
                <input 
                    type="checkbox" 
                    name="can_catch" 
                    class="inline-check"
                    checked={playerObject.can_catch} 
                    onChange={(e) => { 
                        const val = e.target.checked;
                        handlePlayerChange({
                            target: {name: "can_catch", value: val}
                        })
                        }
                    }
                />
            </label>
            <label>Age Exemption Request?
                <input 
                    type="checkbox" 
                    name="age_exemption_request" 
                    class="inline-check"
                    checked={playerObject.age_exemption_request} 
                    onChange={(e) => { 
                        if (!checkDateString(personObject.date_of_birth) ||
                            getAgeAtDate(new Date(personObject.date_of_birth), new Date(SEASON_START_DATE)) <= 13 ) {
                            const errors = [ "Age exemption is only required if age at the season start is older than 13" ]
                            setValidateErrors(errors)
                            setShowValidateModal(true)
                            e.target.checked = false;
                            return;
                        }
                        const val = e.target.checked;
                        handlePlayerChange({
                            target: {name: "age_exemption_request", value: val}
                        })
                        }
                    }
                />
            </label>
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
        { showInfoModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    {infoItems.map((info) => (
                        <InfoRow infoString={info}/>
                    ))}
                    <button
                        type="button"
                        onClick={() => setShowInfoModal(false)}
                    >OK</button>
                </div>
            </div>
        )}
        { showConfirmModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    { confirmData.text && (
                        <InfoRow infoString={confirmData.text}/>
                    )}
                    { confirmData.link && (
                        <InfoLink infoLink={confirmData.link}/>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            const tempRoleList = [...roleList]
                            const index = tempRoleList.indexOf(confirmRole)
                            if (index != -1) {
                                tempRoleList.splice(index, 1)
                                setRoleList(tempRoleList)
                            }
                            setShowConfirmModal(false)
                        }}
                    >No, Cancel</button>
                    <button
                        type="button"
                        onClick={() => setShowConfirmModal(false)}
                    >Yes, Confirm</button>
                </div>
            </div>
        )}
        </div>
    )
}

function InfoRow({infoString}) {
    return (<div class="item-display"><div class="item-text">{infoString}</div></div>)
}

function InfoLink({infoLink}) {
    return (<div class="item-link"><a href={infoLink}>{infoLink}</a></div>)
}

function ErrorRow({errorString}) {
    return (<div class="item-display"><div class="item-text">{errorString}</div></div>)
}

export default PersonForm