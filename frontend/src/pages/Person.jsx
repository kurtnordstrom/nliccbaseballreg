import { useSearchParams } from "react-router-dom"
import PersonForm from "../components/PersonForm"

function Person() {
    const [queryParams] = useSearchParams()
    const method = queryParams.get('method')
    const person_id = queryParams.get('person_id')


    return (
        <div>
            <PersonForm method={method} person_id={person_id} />
        </div>
    )
}

export default Person