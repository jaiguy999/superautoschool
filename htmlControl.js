var htmls = {
  sprite: function (e) {
    return `<img class="nonDraggableImage" ondragover="allowDrop(event)" ondragstart="dragstart(event)" ondrop="drop(event)" onmouseover="hover(this);" onmouseout="unhover(this);" onmousedown="clickSprite(event)" src="imgs/${e.render.src}">`;
  },
  text: function (e) {
    return `<span>${e.content}</span>`;
  },
};

var screenShake = 0;

var screenOverlay = document.createElement("div")


var htmlSize = v(1680, 913);

function createSpriteHTML(options) {
  var ele = createElementFromHTML(htmls.sprite(options));
  document.body.appendChild(ele);
  return ele;
}
function createElementFromHTML(htmlString) {
  var div = document.createElement("div");
  div.innerHTML = htmlString;
  // Change this to div.childNodes to support multiple top-level nodes.
  var c = div.firstChild;
  c.id = Math.random();
  return c;
}

document.onmousedown = (e) => {
  var yes = false;
  if (e.path[0].sprite) {
    if (e.path[0].sprite.person) {
      yes = true;
    }
  }
  if (!yes) {
    selectedSprite = undefined;
    gameHighlight.pos = v(-10000, -10000);
    gui["sell"].render.visible = false;
    gui["freeze"].render.visible = false;
  }
};

function hover(element) {
  if (element.sprite.person != undefined) {
    element.sprite.person.ability.render.visible = true;
    element.sprite.person.abilityText.render.visible = true;
    element.sprite.person.nameText.render.visible = true;
  }
  if (element.sprite.render.highlighable && !selectedSprite)
    gameHighlight.pos = { ...element.sprite.pos };
  if (element.sprite.render.hoverSrc)
    element.setAttribute("src", "imgs/" + element.sprite.render.hoverSrc);
}

function unhover(element) {
  if (element.sprite.person != undefined) {
    element.sprite.person.ability.render.visible = false;
    element.sprite.person.abilityText.render.visible = false;
    element.sprite.person.nameText.render.visible = false;
  }
  if (element.sprite.render.hoverSrc)
    element.setAttribute("src", "imgs/" + element.sprite.render.src);
  if (!selectedSprite) gameHighlight.pos = v(-10000, -10000);
}

function drop(e) {
  var data = e.dataTransfer.getData("text").split("/");
  console.log(data);
  var element = document.getElementById(data[0]),
    sourceStone = document.getElementById(data[1]);

  console.log("drop");
  if (makingPurchase ? makePurchase(3) : true) {
    var isP = e.srcElement.sprite.person
    if (isP != undefined && !droppingFood && (isP!=undefined)?(isP.sprite.element.id!=element.id):false) {
      e.srcElement.sprite.person.frozen = false;
      e.srcElement.sprite.person.stats.h += 1;
      e.srcElement.sprite.person.stats.d += 1;
      e.srcElement.sprite.render.targetScaleV += 0.7
      givePersonXp(e.srcElement.sprite.person, 1)

      if (makingPurchase) {
        requestInteraction(e.srcElement.sprite.name).onbuy(
          e.srcElement.sprite.person
        );
      }

      
      

      sourceStone.sprite.docked = undefined;

      //playAnimation(throwApple(e.srcElement.sprite, e.srcElement.sprite), ()=>{})

      deletePerson(element.sprite.person);
      selectedSprite = undefined;
      gameHighlight.pos = v(-10000, -10000);
    } else {
      if (droppingFood) {
        var details = getFoodDetals(element.sprite.name);
        console.log(details);
        if (details.held) {
          e.srcElement.sprite.person.frozen = false;

          setPersonHeldFood(e.srcElement.sprite.person, element.sprite.name);

          sourceStone.sprite.docked = undefined;
          deletePerson(element.sprite.person);
          selectedSprite = undefined;
          gameHighlight.pos = v(-10000, -10000);
        } else {
          e.srcElement.sprite.person.frozen = false;
          var stats = details.stats;
          

          sourceStone.sprite.docked = undefined;
          console.log(stats)
          if (stats.xp > 0) {
            playAnimation(
              throwItem("xp.png", e.srcElement.sprite, e.srcElement.sprite),
              () => {
                givePersonXp(e.srcElement.sprite.person, stats.xp)
            e.srcElement.sprite.render.targetScaleV += 1
              }
            );
          }
          if (stats.h>0 || stats.d>0) {
          playAnimation(
            throwItem("apple.png", e.srcElement.sprite, e.srcElement.sprite),
            () => {
              e.srcElement.sprite.person.stats.h += stats.h;
          e.srcElement.sprite.person.stats.d += stats.d;
          e.srcElement.sprite.render.targetScaleV += 1
            }
          );
          }

          deletePerson(element.sprite.person);
          selectedSprite = undefined;
          gameHighlight.pos = v(-10000, -10000);
        }
      } else {
        if (!e.srcElement.sprite.srcStone.ele.docked) {
          gui["sell"].render.visible = false;
          gui["freeze"].render.visible = false;
          sourceStone.sprite.docked = undefined;

          selectedSprite.person.frozen = false;

          selectedSprite = undefined;
          gameHighlight.pos = v(-10000, -10000);
          placeSpriteInStone(element.sprite, e.srcElement.sprite.srcStone);
          army1.push(element.sprite.person);
          element.sprite.person.army = army1;
          if (makingPurchase) {
            requestInteraction(element.sprite.name).onbuy(
              element.sprite.person
            );
          }

          element.sprite.render.targetScaleV = 0.6
          element.sprite.inShop = false;
        } else if (e.srcElement.sprite.srcStone.ele.docked.name) {
        }
        console.log(e.srcElement.sprite.srcStone.ele.docked.name);
      }
    }
  }

  //placeSpriteInStone(element.sprite, )
  //  = {...e.srcElement.sprite.pos}
}
var droppingFood = false,
  makingPurchase = false,
  droppingName = undefined,
  droppingId = undefined
function ondrop(ev) {
  //ev.preventDefault();
  //var data = ev.dataTransfer.getData("text");
  //console.log(data)
  //ev.target.appendChild(document.getElementById(data));
}

function allowDrop(ev) {
  if (droppingFood && ev.srcElement.sprite.person != undefined) {
    ev.preventDefault();
  }
  if (ev.srcElement.sprite.droppable && !droppingFood) {
    ev.preventDefault();
  }
  if (ev.srcElement.sprite.name == droppingName && ev.srcElement.id != droppingId) {
    ev.preventDefault();
  }
}
function dragstart(ev) {
  droppingFood = ev.target.sprite.person.foodItem;
  makingPurchase = ev.target.sprite.inShop;
  droppingName = ev.target.sprite.name;
  droppingId = ev.target.id
  ev.dataTransfer.setData(
    "text",
    `${ev.target.id}/${ev.target.sprite.dockedIn.element.id}`
  );
  ev.target.sprite.person.ability.render.visible = false;
  ev.target.sprite.person.abilityText.render.visible = false;
  ev.target.sprite.person.nameText.render.visible = false;
}
