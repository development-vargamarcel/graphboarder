export const mandatoryArguments = (query) => {
    if (query?.args) {
        let mandatoryArgs = []
        mandatoryArgs = query?.args?.filter((arg) => {
            return arg?.type?.kind === "NON_NULL"
        })
        if (mandatoryArgs.length >= 1) {
            return mandatoryArgs
        } else {
            return false
        }


    } else { return { has: false }; }

}