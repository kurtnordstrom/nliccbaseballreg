const baseUrl = import.meta.env.VITE_STATIC_FILE_URL;


export const ACCESS_TOKEN = "access";
export const REFRESH_TOKEN = "refresh";
export const SEASON_START_DATE = "2026-03-07"

export const EXTERNAL_LINK_URLS = {
    concessions: baseUrl + "/concession_stand_operations.pdf",
    scorekeeping: baseUrl + "/nlicc_scoring_guidelines.pdf",
    coaching: baseUrl + "/nlicc_coach_guidelines.pdf",
    medical_release: baseUrl + "/nlicc_medical_release_form.pdf",
    umpire_rules: baseUrl + "/nlicc_umpire_rulebook.pdf",
    child_protection: baseUrl + "/nlicc_child_protection_policy.pdf",
    volunteer_form: "https://nlicc.ccbchurch.com/goto/forms/88/responses/new"
}

