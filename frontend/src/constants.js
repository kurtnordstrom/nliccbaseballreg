const baseUrl = import.meta.env.VITE_STATIC_FILE_URL;

export const ACCESS_TOKEN = "access";
export const REFRESH_TOKEN = "refresh";
export const AGE_CUT_OFF_DATE = "2026-01-01"

export const EXTERNAL_LINK_URLS = {
    concessions: baseUrl + "/concession_stand_operations.pdf",
    scorekeeping: baseUrl + "/nlicc_scoring_guidelines.pdf",
    coaching: baseUrl + "/nlicc_coach_guidelines.pdf",
    medical_release: baseUrl + "/nlicc_medical_release_form.pdf",
    umpire_rules: baseUrl + "/nlicc_umpire_rulebook.pdf",
    child_protection: baseUrl + "/nlicc_child_protection_policy.pdf",
    volunteer_form: "https://nlicc.ccbchurch.com/goto/forms/88/responses/new"
}

export const VOLUNTEER_JOB_DESCS = {
    umpire: "Receives training, attends two clinics, two practices, "+
        "and pre-season games, works games on Saturdays, provides "+
        "feedback for improvement",
    concessions: "Help prepare and sell concessions during the games, "+
        "help with setup and clean-up. Attend training clinics to learn "+
        "duties for various roles",
    field_assistant: "Assists the ground chief with preparing the fields for "+
        "baseball each week",
    scorekeeper: "Attends scorekeeping clinics for training. Keeps score for "+
        "Minors and Majors game, keeps scorebook up to date",
    property_manager: "Schedules helpers to assist with set-up and clean-up "+
        "every Saturday including orange cones and signs for children. Works "+
        "with umpires and scorekeeping to ensure canopies and tables are in "+
        "place and put away",
    property_assistant: "Ensures that trash cans are in place, drink coolers "+
        "are out and filled, scoreboards are up plus chalk and numbers are out, "+
        "and that they are all put away and trash disposed of at the end of the "+
        "day",
    lost_and_found: "Collects all the forgotten items at the end of each " +
        "Saturday, posts descriptions and/or pictures on our facebook page, "+
        "attempts to reunite with owner, works with clean-up person for the "+
        "day",
    equipment_manager: "(One per Franchise) Person in charge of their "+
        "equipment ensuring that everything is gotten out and put away as "+
        "needed, and that nothing leaves the church property, reports any "+
        "losses to the GM for location or replacement",
    scoreboard_operator: "(Two per team) Places appropriate runs on the board "+
        "for each team throughout the game",
    snack_coordinator: "(One per team) Recruits volunteers to bring snacks for "+
        "after each game during the season"
}
