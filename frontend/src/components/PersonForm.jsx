import {useState, useEffect} from "react"
import api from "../api"


function PersonForm({method, person_id}) { //method is either 'create' or 'edit'
    const [personObject, setPersonObject] = useState({})
    const [playerObject, setPlayerObject] = useState({})
    const [familyId, setFamilyId] = useState("");
    const [roleList, setRoleList] = useState([]);


    //Move this call and the useEffect hook to the Person page and pass the object instead
   
    
    const getPersonData = (person_id_value) => {
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
                    console.dir(player)
                }
            })
    }
    
    const setFamily =  () => {
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
            setFamily()
        }
    },[method, person_id])
        
    

    const handlePersonChange = (e) => {
        const { name, value } = e.target;
        setPersonObject({
            ...personObject,
            [name]: value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            } catch(error) {
                alert(error)
            }
               
        } else { 
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
                className="form-button"
                type="submit">
                    Submit
            </button>
        </form>
    )
}

export default PersonForm