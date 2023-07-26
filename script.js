const TOTAL_CARPENTRY_EXP = 55172425 // Total carpentry exp required to reach level 50
let remainingEXP = 0 // Exp left, assign value when IGN is entered
let fermentos = 0 // Amount of fermentos needed to buy
let fermentoCost = 0 // Bazaar price of fermento


$(document).ready(function() {
    // When the calculate button is clicked, update the output div to display how much exp is needed
    $("button.calculate").click(function() {
        let expModifier = $('input[name="exp_modifier"]:checked').val()
        let derpyActive = $('input[name="derpy"]').is(':checked') // Both this and prop work
        let balPet = $('input[name="bal"]').prop('checked')
        generateOutput(expModifier, derpyActive, balPet)
    })
})

function generateOutput(expModifier, derpy, bal){
    let derpyString = derpy ? "Derpy in office, " : "Derpy not in office, "
    let balString = bal ? "and while using a Level 100 Legendary Bal pet while in the Magma Fields" : "and without a Bal Pet"
    $(".output").html(
        `You need ${remainingEXP} more Carpentry exp to reach Level 50. 
        With a ${expModifier}% skill exp boost, ${derpyString}${balString}, you would need:\<br>
        ${fermentos} Fermentos to craft ${fermentos/9} Condensed Fermentos`
        )
    
    console.log(`Current skill exp modifier: ${expModifier}`)
    console.log(`Is Derpy currently in office? ${derpy}`)
    console.log(`Is a Bal pet being used while in the Magma Fields: ${bal}`)
}

// function calculateExp(){
//     $("div.output").html("With x y and z")
// } - With JavaScript alone.