var gui = {},

    selectedSprite=undefined

function createGui() {

    //==========================    coins   ==========================
    gui["coins"] = createSprite({
        imageSrc:"shortBlock.png",
        pos:v(-(htmlSize.x*0.5)+100, -(htmlSize.y*0.5)+62.5),
        z:10,
    })
    gui["coins-icon"] = createSprite({
        imageSrc:"icons/coin.png",
        pos:v(gui["coins"].pos.x-45, gui["coins"].pos.y),
        z:10,
    })
    gui["coins-text"] = createText({
        content:gameState.coins,
        pos:v(gui["coins"].pos.x+45, gui["coins"].pos.y),
        z:10,
        font:75,
    })

    //==========================    health   ==========================
    gui["gameHealth"] = createSprite({
        imageSrc:"shortBlock.png",
        pos:v(-(htmlSize.x*0.5)+100+(200*(1)), -(htmlSize.y*0.5)+62.5),
        z:10,
    })
    gui["health-icon"] = createSprite({
        imageSrc:"icons/heart.png",
        pos:v(gui["gameHealth"].pos.x-45, gui["gameHealth"].pos.y),
        z:10,
    })
    gui["health-text"] = createText({
        content:gameState.health,
        pos:v(gui["gameHealth"].pos.x+45, gui["gameHealth"].pos.y),
        z:10,
        font:75,
    })


    //==========================    trophies   ==========================
    gui["gameTrophies"] = createSprite({
        imageSrc:"longBlock.png",
        pos:v(-(htmlSize.x*0.5)+150+(200*(2)), -(htmlSize.y*0.5)+62.5),
        z:10,
    })
    gui["trophies-icon"] = createSprite({
        imageSrc:"icons/trophies.png",
        pos:v(gui["gameTrophies"].pos.x-90, gui["gameTrophies"].pos.y),
        z:10,
    })
    gui["trophies-text"] = createText({
        content:`${gameState.trophies}/10`,
        pos:v(gui["gameTrophies"].pos.x+45, gui["gameTrophies"].pos.y),
        z:10,
        font:75,
    })


    //==========================    turns   ==========================
    gui["gameTurns"] = createSprite({
        imageSrc:"shortBlock.png",
        pos:v(-(htmlSize.x*0.5)+100+(200*(2))+(300*(1)), -(htmlSize.y*0.5)+62.5),
        z:10,
    })
    gui["turns-icon"] = createSprite({
        imageSrc:"icons/hourglass.png",
        pos:v(gui["gameTurns"].pos.x-45, gui["gameTurns"].pos.y),
        z:10,
    })
    gui["turns-text"] = createText({
        content:gameState.turn,
        pos:v(gui["gameTurns"].pos.x+45, gui["gameTurns"].pos.y),
        z:10,
        font:75,
    })


    //==========================    Butttons   ==========================

    gui["rollButt"] = createSprite({
        imageSrc:"buttons/rollButt.png",
        hoverImageSrc:"buttons/rollButtHover.png",
        pos:v(-(htmlSize.x*0.5)+142.5, (htmlSize.y*0.5)-60),
        z:10,
        onclick:function(e){
            if(makePurchase(rollCost)) {
                genShop()
                rollCost = 1
            }
        },
    })
    gui["endTurn"] = createSprite({
        imageSrc:"buttons/endTurn.png",
        hoverImageSrc:"buttons/endTurnHover.png",
        pos:v((htmlSize.x*0.5)-224, (htmlSize.y*0.5)-60),
        z:10,
        onclick:function(e){
            gameState.turn += 1
            startWar(
                compressArmy(getArmy()),
                getArmy(),
            )
        },
    })
    gui["freeze"] = createSprite({
        imageSrc:"buttons/freeze.png",
        hoverImageSrc:"buttons/freezeHover.png",
        pos:v((htmlSize.x*0.5)-397-244, (htmlSize.y*0.5)-60),
        z:10,
        visible:0,
        onclick:function(e){
            selectedSprite.person.frozen = !selectedSprite.person.frozen
        },
    })
    
    gui["sell"] = createSprite({
        imageSrc:"buttons/sell.png",
        hoverImageSrc:"buttons/sellHover.png",
        pos:v((htmlSize.x*0.5)-142-448, (htmlSize.y*0.5)-60),
        z:10,
        visible:false,
        onclick:function(e){
            requestInteraction(selectedSprite.name).onsell(selectedSprite.person)

            selectedSprite.dockedIn.docked = undefined
            deletePerson(selectedSprite.person)
            selectedSprite = undefined
            gameHighlight.pos = v(-10000,-10000)
            gui['sell'].render.visible = false
            gui['freeze'].render.visible = false
        },
    })
}

function updateGui() {
    gui["coins-text"].element.textContent = gameState.coins
    gui["health-text"].element.textContent = gameState.health
    gui["trophies-text"].element.textContent = `${gameState.trophies}/10`
    gui["turns-text"].element.textContent = gameState.turn
}



function endGameScreen(result, preArmy) {
    document.body.style["background-image"] = ''
    console.log(result)

    for (let i = 0; i < sprites.length; i++) {
        const sp = sprites[i];
        if (sp.person) {
            if (!sp.person.frozen) deletePerson(sp.person)
            continue
        } else {
            deleteSprite(sp)
        }
    }

    for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        deleteText(text)
    }


    createText({content:["You Lost","Uh ohhhhh","You Won","Tie"][result+1],font:60});
    
    ([
        ()=>{gameState.health-=1},
        ()=>{},
        ()=>{gameState.trophies+=1},
        ()=>{},
    ])[result+1]()

    setTimeout(() => {
        startGame(preArmy, frozenIndivuals)
    }, 2000/pauseSpeed);
}
//        