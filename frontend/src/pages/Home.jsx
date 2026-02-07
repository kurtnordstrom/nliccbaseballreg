import {useState,useEffect} from "react"
import api from "../api"
import Note from "../components/Note"
import Person from "../components/Person"
import {useNavigate} from "react-router-dom"

function Home() {
    const [personObjects, setPersonObjects] = useState([]);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [familyObject, setFamilyObject] = useState({});
    const [submissionErrors, setSubmissionErrors] = useState([]);
    const [submissionWarnings, setSubmissionWarnings] = useState([]);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);

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
            for(const role of person.roles) {
                roleCount++
                if(!(role.name in roleObject)) {
                    roleObject[role.name] = []
                }
                roleObject[role.name].push(personName)
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
                    "The GMs are chosen by the NLB leaderhip and are determined ahead of "+
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
                    "role."
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
                    links: ["https://somelink.com"]    
                })
            }
        }

        if("UMPIRE" in roleObject) {
            for(const name of roleObject["UMPIRE"]) {
                warningList.push({
                    text: `You have ${name} signed up to volunteer as an umpire. ` +
                    "Please follow the link to find information about umpire rules "+
                    "and training.",
                    links: ["https://somelink.com"]    
                })
            }
        }

        if("CONCESSIONS" in roleObject) {
            for(const name of roleObject["CONCESSIONS"]) {
                warningList.push({
                    text: `You have ${name} signed up as a concessions volunteer. ` +
                    "Please follow the link to find information about concessions duties "+
                    "and training.",
                    links: ["https://somelink.com"]    
                })
            }
        }

        if("SCOREKEEPER" in roleObject) {
            for(const name of roleObject["SCOREKEEPER"]) {
                warningList.push({
                    text: `You have ${name} signed up to volunteer as a scorekeeper. ` +
                    "Please follow the link to find information about scorekeeping rules "+
                    "and training.",
                    links: ["https://somelink.com"]    
                })
            }
        }

        if(playerCount > 0) {
            warningList.push({
                text: "You have the following player(s) to register:" +
                playerList.join(", ")
            })
        }

        if(playerCount > 0) {
            warningList.push({
                text: "We will do our best to honor preferences for practices days/franchises, " +
                "but we cannot make guarantees, due to limited space. You will be notified of "+
                "placement once registration is closed and the rosters are completed."
            })
        }

        if(playerCount > 0) {
            warningList.push({
                text: `Your total fees are `+
                (totalFees).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                })
            })
        }

        setSubmissionWarnings(warningList)
        setShowWarningModal(true)
        return    

    }

    const checkPersonList = () => {
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
        checkPersonList();
    }, [])

    const familyName = `${familyObject.family_name} Family`
    
    return (
    <div>
        <div>
            <h2>{familyName}</h2>
            {personObjects.map((person) => (
                <Person person={person}/>
            ))}
        </div>
        <div>
        <button
            type="button"
            onClick={(e) => {navigate(`/person?method=create`)}}
            >
            Add Family Member
        </button>
        </div>
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
        { showErrorModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    {submissionErrors.map((item) => (
                        <Item item={item}/>
                    ))}
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
                        >Edit Submission</button>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={() => {
                                setSubmissionWarnings([])
                                setShowWarningModal(false)
                            }}
                        >Submit Registration</button>
                    </div>
                </div>
            </div>
        )}
    </div>
    );
    
}

function Item({item}) {
    return (
        <div>
            <div>{item.text}</div>
            {item.links?.map((link) => (<div>{link}</div>))}
        </div>
    )
}

export default Home
