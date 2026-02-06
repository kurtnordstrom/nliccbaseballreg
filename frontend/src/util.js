export const getAgeAtDate = (birthDate, futureDate) => {
        let age = futureDate.getFullYear() - birthDate.getFullYear();
        const monthDelta = futureDate.getMonth() - birthDate.getMonth()

        if (monthDelta < 0 || 
            (monthDelta === 0 && futureDate.getDate() < birthDate.getDate())) {
            age--;

        }
        return age;    
}

export const getAgeNow = (birthDate) => {
    return getAgeAtDate(birthDate, new Date())
}


export const checkDateString = (dateString) => {
    return /^\d\d\d\d-\d\d-\d\d$/.test(dateString)
}