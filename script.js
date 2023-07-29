import {
    CARPENTRY_LEVELS,
    COND_FERM_EXP,
    FERM_COST,
    COND_FERM_SELL
} from './carpentryData.js'

const TOTAL_CARPENTRY_EXP = 55172425 // Total carpentry exp required to reach level 50
let remainingEXP = 0 // Exp left, assign value when IGN is entered
let fermentos = 0 // Amount of fermentos needed to buy
let fermentoCost = FERM_COST // Bazaar price of fermento
let totalCost = 0 // Amount of money needed
// Modifier variables
let expModifier = 0
let derpyActive = false
let balPet = false
let cookie = false



$(document).ready(function() {
    $('#level').on('input', function() {
        checkLevel($(this))
    })
    // When the calculate button is clicked, update the output div to display how much exp is needed
    $("button.calculate").click(function() {
        // Attributes that determine carpentry exp and any boosters to it
        let level = $('#level').val()
        if(level == ''){
            level = 0
        }
        expModifier = $('input[name="exp_modifier"]:checked').val()
        derpyActive = $('input[name="derpy"]').is(':checked') // Both this and prop work
        balPet = $('input[name="bal"]').prop('checked')
        cookie = $('input[name="cookie"]').prop('checked')
        remainingEXP = getRemainingEXP(level)
        fermentos = getFermentos(remainingEXP)
        totalCost = fermentos * fermentoCost
        totalCost = totalCost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        // Calculate total EXP needed to reach level 50
        generateOutput(expModifier, derpyActive, balPet, cookie, level)
    })
})

function checkLevel($value){
    // Validation for level
    if ($value.val() < 0){
        $value.val(0);
    }
    else if($value.val() > 49){
        $value.val(49);
    }
}

function getRemainingEXP(level){
    // Gets remaining exp needed
    return CARPENTRY_LEVELS[50]["Total XP"] - CARPENTRY_LEVELS[level]["Total XP"]
}

function getFermentos(exp){
    // Calculate number of fermentos to be bought
    // Calc is base exp from condensed fermento, (87500 + 25(cookie) + 50(derpy)) * (expModifier) * (bal in Magma Fields)
    let carpentryWisdom = (0 + (derpyActive ? 50 : 0) + (cookie? 25 : 0)) * (balPet ? 1.1 : 1) // % more carpentry exp
    let fermExp = COND_FERM_EXP * (1 + (carpentryWisdom / 100)) * (1 + (expModifier / 100)) // exp from each ferm
    console.log(`Capentry Wisdom: ${carpentryWisdom}`)
    console.log(`Exp from crafting Condesned Fermento: ${fermExp}`)
    console.log(`Number of fermentos: ${Math.ceil(exp / fermExp) * 9}`)
    return Math.ceil(exp / fermExp) * 9
}

function generateOutput(expModifier, derpy, bal, cookie, level){
    let cookieString = cookie ? "an active booster cookie, " : "no booster cookie, "
    let derpyString = derpy ? "Derpy in office, " : "Derpy not in office, "
    let balString = bal ? "and while using a Level 100 Legendary Bal pet while in the Magma Fields" : "and without a Bal Pet"
    $(".output").html(
        `<div class="description">At level ${level}, you need ${remainingEXP} more Carpentry exp to reach Level 50. </div> 
        <p>With a ${expModifier}% skill exp boost, ${cookieString}${derpyString}${balString}, you would need: </p>
        <p>${fermentos} <img src="images/fermento.png"> Fermentos to craft ${fermentos/9} <img src="images/condensed-fermento.png"> Condensed Fermentos</p>
        <p>Costing you ${totalCost} <img src="images/coin.png"> coins.</p>`
        )
    
    console.log(`Current skill exp modifier: ${expModifier}`)
    console.log(`Is Derpy currently in office? ${derpy}`)
    console.log(`Is a Bal pet being used while in the Magma Fields: ${bal}`)
    console.log(`Cookie buff? ${cookie}`)
    console.log(`Level: ${level}`)
    console.log(`Remaining EXP: ${remainingEXP}`)
}

// function calculateExp(){
//     $("div.output").html("With x y and z")
// } - With JavaScript alone.

// <p>If you sell the Condensed fermento back to NPCs, it would cost ${(totalCost - COND_FERM_SELL * (fermentos/9)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>