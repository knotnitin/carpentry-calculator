import {
    CARPENTRY_LEVELS,
    COND_FERM_EXP,
    FERM_SELL,
    COND_FERM_SELL,
    PROFILE_NAMES
} from './carpentryData.js'

const TOTAL_CARPENTRY_EXP = 55172425 // Total carpentry exp required to reach level 50
let currentEXP = 0 // Get this from API
let remainingEXP = 0 // Exp left, assign value when IGN is entered
let fermentos = 0 // Amount of fermentos needed to buy
let fermentoCost = 0 // Bazaar price of fermento
let totalCost = 0 // Amount of money needed
// Modifier variables
let expModifier = 0
let derpyActive = false
let balPet = false
let cookie = false
let currentPlayer = ""
let currentProfile = ""
// Document Elements
const output = document.querySelector('.output')
const warning = document.querySelector('.info-text.username')
// Setting up some stuff
getJSON(`https://sky.shiiyu.moe/api/v2/bazaar`, data=> {
    // console.log(data.FERMENTO.sellPrice)
    fermentoCost = Math.ceil(data.FERMENTO.sellPrice)
    // console.log(fermentoCost) -> Debugging
})


function formatProfile(str){
    // Formats profile string entered to make searching for it easier
    const firstLetter = str.charAt(0).toUpperCase();
    const restOfWord = str.slice(1).toLowerCase();
    return firstLetter + restOfWord;
}

$(document).ready(function() {
    // When the calculate button is clicked, update the output div to display how much exp is needed
    $("button.calculate").click(function() {
        currentPlayer = $('#name').val()
        if(currentPlayer == ""){
            warning.style.display = "block"
            return -1
        }
        else{
            warning.style.display = "none"
        }
        currentProfile = formatProfile($('#profile').val())
        getCapentrySkill()
    })
})

function checkProfile(profile){
    // Checks if profile name entered is valid or not
    return PROFILE_NAMES.includes(profile)
}

function getCapentrySkill(){
    // Get current carpentry skill of player
    let foundProfile = false
    if(!checkProfile(currentProfile)){
        // invalid profile name entered
        displayError("notprofile")
    }
    else{
        // console.log(currentPlayer) -> Debugging
        getJSON(`https://sky.shiiyu.moe/api/v2/profile/${currentPlayer}`, data=>{
        // Look for the specific profile mentioned, or else take the default
        // console.log(data) -> Debugging
        let profiles = data.profiles
        // console.log(profiles) -> Debugging
        if(data == null){
            // never played skyblock before
            displayError("missingprofile")
            return -1
        }
        if(currentProfile == ""){
            // Find the last active profile the user logged onto
            let profNames = Object.keys(data.profiles)
            profNames.forEach((profileName) => {
                const profileData = profiles[profileName]
                if(profileData.current == true){
                    console.log(profileData.raw.player_data.experience)
                    currentEXP = profileData.raw.player_data.experience.SKILL_CARPENTRY
                    console.log(`Current player EXP = ${currentEXP} from profile ${profileData.cute_name}`)
                    foundProfile = true
                }
            })
        }
        else{
            let profNames = Object.keys(data.profiles)
            profNames.forEach((profileName) => {
                const profileData = profiles[profileName]
                if(profileData.cute_name == currentProfile){
                    console.log(`Found cute_name with profilie ${currentProfile}`)
                    currentEXP = profileData.raw.player_data.experience.SKILL_CARPENTRY
                    console.log(`Current player EXP = ${currentEXP} from profile ${profileData.cute_name}`)
                    foundProfile = true
                }
            })
        }
        if(currentEXP == undefined && foundProfile == true){
            displayError("apioff")
        }
        else if(foundProfile == false){
            displayError("missingprofile")
        }
        else{
            getValues()
        }
        })
        console.log("Calling Skycrypt API for Carpentry EXP")
    }
    
}

function displayError(error){
    if(error == "neverplayed"){
        output.innerHTML = `<div class="description">Error: This player has never joined Skyblock!</div>`
    }
    else if(error == "apioff"){
        output.innerHTML = `<div class="description">Error: Skills API turned off!</div>`
    }
    else if(error == "notprofile"){
        output.innerHTML = `<div class="description">Error: Invalid profile name!</div>`
    }
    else if(error == "missingprofile"){
        output.innerHTML = `<div class="description">Error: This player does not have a profile by this name!</div>`
    }
}

function getValues(){
    expModifier = $('input[name="exp_modifier"]:checked').val()
    derpyActive = $('input[name="derpy"]').is(':checked') // Both this and prop work
    balPet = $('input[name="bal"]').prop('checked')
    cookie = $('input[name="cookie"]').prop('checked')
    remainingEXP = Math.round(getRemainingEXP(currentEXP))
    let level  = getLevel(currentEXP)
    console.log(level)
    if(level == 50) {
        maxLevelOutput()
        return
    }
    fermentos = getFermentos(remainingEXP)
    totalCost = fermentos * fermentoCost
    // Calculate total EXP needed to reach level 50
    generateOutput(expModifier, derpyActive, balPet, cookie, level)
}

function getRemainingEXP(current){
    // Get remaining exp needed
    return TOTAL_CARPENTRY_EXP - current
}

function getLevel(current){
    // Get Carpentry skill level using CARPENTRY_LEVELS
    if(current > TOTAL_CARPENTRY_EXP){ return 50}
    let left = 0, right = 50
    while(left <= right){
        let middle = Math.floor((left+right) / 2)
        let exp = CARPENTRY_LEVELS[middle]["Total XP"]
        if(exp < current){
            if(current < CARPENTRY_LEVELS[middle + 1]["Total XP"]){
                return middle // found level
            }
            else{
                left = middle + 1 // level on right side
            }
        }
        else{
            right = middle - 1 // level on left side
        }
    }
    // console.error("Binary Search Failed")
    return NaN
}

function getFermentos(exp){
    // Calculate number of fermentos to be bought
    // Calc is base exp from condensed fermento, (87500 + 25(cookie) + 50(derpy)) * (expModifier) * (bal in Magma Fields)
    let carpentryWisdom = (0 + (derpyActive ? 50 : 0) + (cookie? 25 : 0)) * (balPet ? 1.1 : 1) // % more carpentry exp
    let fermExp = COND_FERM_EXP * (1 + (carpentryWisdom / 100)) * (1 + (expModifier / 100)) // exp from each ferm

    // Debugging statements
    // console.log(`Capentry Wisdom: ${carpentryWisdom}`)
    // console.log(`Exp from crafting Condesned Fermento: ${fermExp}`)
    // console.log(`Number of fermentos: ${Math.ceil(exp / fermExp) * 9}`)

    return Math.ceil(exp / fermExp) * 9
}

function generateOutput(expModifier, derpy, bal, cookie, level){
    let cookieString = cookie ? "an active booster cookie, " : "no booster cookie, "
    let derpyString = derpy ? "Derpy in office, " : "Derpy not in office, "
    let balString = bal ? "and while using a Level 100 Legendary Bal pet while in the Magma Fields" : "and without a Bal Pet"
    output.innerHTML = `
    <div class="description">At level ${level}, you need ${remainingEXP} more Carpentry exp to reach Level 50. </div> 
    <p>With a ${expModifier}% skill exp boost, ${cookieString}${derpyString}${balString}, you would need: </p>
    <p>${fermentos} <img src="images/fermento.png"> Fermentos to craft ${fermentos/9} <img src="images/condensed-fermento.png"> Condensed Fermentos</p>
    <p>Costing you ${totalCost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} <img src="images/coin.png"> coins.</p>
    <p>The current price of Fermento on the Bazaar is ${fermentoCost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} coins</p>
    `
    // Debugging statements
    // console.log(`Current skill exp modifier: ${expModifier}`)
    // console.log(`Is Derpy currently in office? ${derpy}`)
    // console.log(`Is a Bal pet being used while in the Magma Fields: ${bal}`)
    // console.log(`Cookie buff? ${cookie}`)
    // console.log(`Level: ${level}`)
    // console.log(`Remaining EXP: ${remainingEXP}`)
}

function maxLevelOutput(){
    // When the profile mentioned is at the max level
    output.innerHTML = `
    <div class="description">At level 50, you have maxed out the carpentry skill. </div>
    `
}

// <p>If you sell the Condensed fermento back to NPCs, it would cost ${(totalCost - COND_FERM_SELL * (fermentos/9)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>

// API Calls
async function getJSON(url, callback){
    // Get JSON for any API call
    fetch(url)
        .then(response => response.json())
        .then(data => {
        // Pass the retrieved data to the callback
        callback(data);
        })
        .catch(error => {
            displayError("neverplayed")
            console.error(`API Call error at url ${url}: ${error}`)
        })
}
