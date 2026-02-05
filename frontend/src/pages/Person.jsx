import { useSearchParams } from "react-router-dom"
import PersonForm from "../components/PersonForm"

function Person() {
    const [queryParams] = useSearchParams()
    const method = queryParams.get('method')
    const person_id = queryParams.get('person_id')
    const is_player = queryParams.get('is_player')


    return (
        <div>
            <PersonForm method={method} person_id={person_id} is_player={!!is_player} />
        </div>
    )
}

export default Person