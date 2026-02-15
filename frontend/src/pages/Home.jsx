import {useState,useEffect} from "react"
import api from "../api"
import Note from "../components/Note"
import Person from "../components/Person"
import {useNavigate} from "react-router-dom"
import { getAgeNow } from "../util"

function Home() {
    const [personObjects, setPersonObjects] = useState([]);
    //const [content, setContent] = useState("");
    //const [title, setTitle] = useState("");
    const [familyObject, setFamilyObject] = useState({});
    const [submissionErrors, setSubmissionErrors] = useState([]);
    const [submissionWarnings, setSubmissionWarnings] = useState([]);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const baseUrl = import.meta.env.VITE_STATIC_FILE_URL;

    const navigate = useNavigate()

    const makeMasterList = async () => {
        const masterList = []
        for(const person of personObjects) {
            const personClone = {...person}
            try {
                const playerRes = await api.get(`/api/player/?person=${person.id}`)
                if (playerRes.data.length > 0) {
                    const playerObject = playerRes.data[0]
                    personClone.player = playerObject
                }
                const roleList = []
                const roleRes = await api.get(`/api/role/?person=${person.id}`)
                if (roleRes.data.length > 0) {
                    for (const role of roleRes.data) {
                        roleList.push(role)
                    }
                }
                personClone.roles = roleList
            } catch(error) {
                console.log(`Error building list ${error}`)
            }
            masterList.push(personClone)
        }
        return masterList
    }

    const handleFamilyChange = (e) => {
        const { name, value } = e.target;
        setFamilyObject({
            ...familyObject,
            [name]: value
        })
    }

    const handleFamilySave = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/api/family/${familyObject.id}/`, familyObject)
        } catch(error) {
            alert(error)
        }
    }

    const processRegistration = async () => {
        const masterList = await makeMasterList()
        console.dir(masterList)
        let roleCount = 0

        const roleObject = {}
        const errorList = []
        const warningList = []
        const playerList = []
        for(const person of masterList) {
            const personName = `${person.first_name} ${person.last_name}`
            if(person.player) {
                playerList.push(personName)
            }
            if (person.roles) {
                for(const role of person.roles) {
                    roleCount++
                    if(!(role.name in roleObject)) {
                        roleObject[role.name] = []
                    }
                    roleObject[role.name].push(personName)
                }
            }
            if(person.is_user) {                
                if(getAgeNow(new Date(person.date_of_birth)) < 18) {
                    errorList.push({text:"Primary registrant must be over 18 years of age"})
                }
                if(!person.email) {
                    errorList.push({text:"Email address required for primary registrant"})
                }
                if(!person.phone_primary) {
                    errorList.push({text:"A phone number is required for the primary registrant"})
                }
                if(!person.address) {
                    errorList.push({text:"A physical address is required for the primary registrant"})
                }            
            }
        }
        const playerCount = playerList.length
        console.log(`Family has ${playerCount} player(s) and ${roleCount} service roles`)
        const totalFees = (playerCount * 75.0) < 225.0 ? (playerCount * 75.0) : 225.0

        if (roleCount < 1) {
            errorList.push({
                text : "You currently have no service roles selected for any "+
                "family member. Each family must sign up for at least one service "+
                "role slot. Please select one or more roles before submitting."
            })
        }

        if (errorList.length > 0) {
            setSubmissionErrors(errorList)
            setShowErrorModal(true)
            return
        }

        if ("GENERAL_MANAGER" in roleObject) {
            for(const name of roleObject["GENERAL_MANAGER"]) {
                warningList.push({
                    text: `You have ${name} signed up to be a franchise General Manager. `+
                    "The GMs are chosen by the NLB leadership and are determined ahead of "+
                    "registration. If you are not already assigned to be a GM, you should "+
                    "not select this role."
                })
            }
        }

        if("HEAD_COACH" in roleObject) {
            for(const name of roleObject["HEAD_COACH"]) {
                warningList.push({
                    text: `You have ${name} signed up to be a Head Coach. The `+
                    "Head Coaches are approved by the General Managers of each " +
                    "franchise. If you have not already spoken with the General "+
                    "Manager about being Head Coach, you should not choose this "+
                    "role. All coaches must review and agree to the coaching "+
                    "guidelines.",
                    links: [baseUrl + "/nlicc_coach_guidelines.pdf"]
                })
            }
        }

        if("ASSISTANT_COACH" in roleObject) {
            for(const name of roleObject["ASSISTANT_COACH"]) {
                warningList.push({
                    text: `You have ${name} signed up as an Assistant Coach. ` +
                    "All coaches are required to read and agree to our "+
                    "guidelines and code of conduct. Please review these documents "+
                    "before proceeding, as well as information about coach meetings.",
                    links: [baseUrl + "/nlicc_coach_guidelines.pdf"]    
                })
            }
        }

        if("UMPIRE" in roleObject) {
            for(const name of roleObject["UMPIRE"]) {
                warningList.push({
                    text: `You have ${name} signed up to volunteer as an umpire. ` +
                    "Please follow the link to find information about umpire rules "+
                    "and training.",
                    links: [baseUrl +"/nlicc_umpire_rulebook.pdf"]    
                })
            }
        }

        if("CONCESSIONS" in roleObject) {
            for(const name of roleObject["CONCESSIONS"]) {
                warningList.push({
                    text: `You have ${name} signed up as a concessions volunteer. ` +
                    "Please follow the link to find information about concessions duties "+
                    "and training.",
                    links: [baseUrl + "/concession_stand_operations.pdf"]    
                })
            }
        }

        if("SCOREKEEPER" in roleObject) {
            for(const name of roleObject["SCOREKEEPER"]) {
                warningList.push({
                    text: `You have ${name} signed up to volunteer as a scorekeeper. ` +
                    "Please follow the link to find information about scorekeeping rules "+
                    "and training.",
                    links: [baseUrl + "/nlicc_scoring_guidelines.pdf"]    
                })
            }
        }

        if(playerCount > 0) {
            warningList.push({
                text: "You have the following player(s) to register:" +
                playerList.join(", ")
            })
   
            warningList.push({
                text: "We will do our best to honor preferences for practices days/franchises, " +
                "but we cannot make guarantees, due to limited space. You will be notified of "+
                "placement once registration is closed and the rosters are completed."
            })

            warningList.push({
                text: `Your total fees are `+
                (totalFees).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                })
            })

            if (familyObject.payment_option === "financial_aid") {
                warningList.push({
                    text: "You have requested financial assistance for registration. Please contact the NLB Financial Officer to discuss details."
                })
            }
        }

    

        setSubmissionWarnings(warningList)
        setShowWarningModal(true)
        return    

    }

    const getDuesFromMasterList = (masterList) => {
        let playerCount = 0
        for (const person of masterList) {
            if (person.player) {
                playerCount++
            }
        }
        const dues = (playerCount * 75.0) < 225.0 ? (playerCount * 75.0) : 225.0
        return dues
    }

    const doFinalSubmission = async () => {
        const masterList = await makeMasterList()
        const reg_date = new Date().toISOString()
        const dues = getDuesFromMasterList(masterList)
        const putData = {
            ...familyObject,
            dues : dues,
            registration_date : reg_date,
            registration_submitted : true
        }
        try {
            await api.put(`/api/family/${familyObject.id}/`, putData)
            setFamilyObject(putData)
        } catch(error) {
            alert(error)
        }
        setSubmissionWarnings([])
        setShowWarningModal(false)
    }

    const getPersonsAndFamilyData = () => {
        api.get("/api/person/")
            .then((res) => res.data)
            .then((data) => {
                setPersonObjects(data);
                console.log(data);
                const family_id = data[0].family
                api.get(`/api/family/${family_id}/`)
                    .then((res) => res.data)
                    .then((data) => {
                        setFamilyObject(data)
                        console.log(data)
                    })
            })
            .catch((err) => alert(err));
    }

    useEffect(() => {
        getPersonsAndFamilyData();
    }, [])

    const familyName = `${familyObject.family_name} Family Registration`
    
    return (
    <div>
        <div class="standard-block">
            <h2>{familyName}</h2>
            {personObjects.map((person) => (
                <Person person={person}/>
            ))}
            <div>
            <button
                type="button"
                onClick={(e) => {navigate(`/person?method=create`)}}
                >
                Add Family Member
            </button>
            </div>
        </div>
        <form
            onSubmit={handleFamilySave}
            className="form-container">
            <h3>Family Information</h3>
            <label>Notes</label>
            <input
                className="form-input"
                type="textField"
                value={familyObject.notes}
                name="notes"
                onChange={handleFamilyChange}
            />
            <label>Payment Preference</label>
            <select
                name="payment_option"
                value={familyObject.payment_option}
                onChange={handleFamilyChange}>
                <option value="full">Pay in Full</option>
                <option value="installments">Pay in 3 Installments</option>
                <option value="financial_aid">Request Financial Assistance</option>
            </select>
            <button
                type="button"
                onClick={handleFamilySave}
            >Save Family Information</button>
        </form>
        <div class="standard-block">
            <div>
            <button
                type="button"
                onClick={processRegistration}
                >Submit Family Registration</button>
            </div>
            <div>
                <button
                    type="button"
                    onClick={() => {navigate("/logout")}}
                >Logout</button>
            </div>
        </div>
        { showErrorModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>There are errors in your registration</h3>
                    {submissionErrors.map((item) => (
                        <Item item={item}/>
                    ))}
                    <h3>Please correct these and re-submit the registration</h3>
                     <div>
                    <button
                        type="button"
                        onClick={() => {
                            setSubmissionErrors([])
                            setShowErrorModal(false)
                        }}
                    >Close</button>
                    </div>
                </div>
            </div>
        )}
        { showWarningModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Please review before submitting registration</h3>
                    {submissionWarnings.map((item) => (
                        <Item item={item}/>
                    ))}
                     <div>
                        <button
                            type="button"
                            onClick={() => {
                                setSubmissionWarnings([])
                                setShowWarningModal(false)
                            }}
                        >Cancel and Re-edit</button>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={doFinalSubmission}
                        >Yes, Submit Registration</button>
                    </div>
                </div>
            </div>
        )}
        { familyObject.registration_submitted && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Registration was submitted on {familyObject.registration_date}</h3>
                    <div>
                        <button
                            type="button"
                            onClick={() => {navigate("/logout")}}
                        >Logout</button>
                    </div>
                </div>
            </div>
        )}
    </div>
    );
    
}

function Item({item}) {
    return (
        <div class="item-display">
            <div class="item-text">{item.text}</div>
            {item.links?.map((link) => (<div class="item-link"><a href={link}>{link}</a></div>))}
        </div>
    )
}

export default Home
