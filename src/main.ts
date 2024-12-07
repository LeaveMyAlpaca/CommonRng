import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { save } from "@tauri-apps/plugin-dialog";

async function IconSelectionDialog(randomItemIndex: number) {
  var value = await open({
    title: "Select icon source inside images folder",
    multiple: false,
    defaultPath: "/Images/",
  });
  var splittedPath = new URL(value as string).toString().split("/");

  var foundImagesFolder = false;
  var filePathFromImagesFolder = "";
  for (let index = 0; index < splittedPath.length; index++) {
    const element = splittedPath[index];
    if (!foundImagesFolder) {
      if (element == "Images") foundImagesFolder = true;

      continue;
    }

    filePathFromImagesFolder += `/${element}`;
  }
  if (filePathFromImagesFolder == "") return;

  var actualRelativePath = `./Images${filePathFromImagesFolder}`;
  thingsToRandomlyGet[randomItemIndex].localizationOfIcon = actualRelativePath;

  displayConfig();
}
async function SaveSelectionDialog() {
  var value = (await open({
    title: "Select save file",
    multiple: false,
    defaultPath: "/Save files/",
  })) as String;
  thingsToRandomlyGet = await invoke("parse_save", { path: value });
  displayConfig();
}
async function CreateSaveFileDialog() {
  var path = await save({
    filters: [
      {
        name: "SaveFile.txt",
        extensions: ["txt"],
      },
    ],
    defaultPath: "/Save files/",
  });
  await invoke("save_file", { settings: thingsToRandomlyGet, path: path });
}
async function onDiceClick() {
  var random: randomThing = await invoke("select_random", {
    vecToSelectFrom: thingsToRandomlyGet,
  });
  if (removeItemAfterSelection && thingsToRandomlyGet.length != 1) {
    var index = thingsToRandomlyGet.findIndex(
      (val) =>
        val.color == random.color &&
        val.name == random.name &&
        val.localizationOfIcon == random.localizationOfIcon
    );
    if (index > -1) {
      thingsToRandomlyGet.splice(index, 1);
    }
  }

  var randomImage = document.getElementById("RandomImage") as HTMLImageElement;
  randomImage.src = random.localizationOfIcon;

  var randomName = document.getElementById("RandomName") as HTMLElement;
  randomName.textContent = random.name;
  randomName.style.textDecorationColor = random.color as string;
  displayConfig();
}
async function GetDefault() {
  thingsToRandomlyGet = await invoke("get_default", {});
}
function addNewRandomThing() {
  const newRandomThing = new randomThing();
  newRandomThing.color = "white";
  newRandomThing.localizationOfIcon = "../Images/vite.svg";
  newRandomThing.name = "new";
  thingsToRandomlyGet.push(newRandomThing);
  displayConfig();
}
function displayConfig() {
  var randomLayout = document.getElementById("randomLayout") as HTMLElement;
  // clear old childs
  randomLayout.innerHTML = "";

  var Labels = document.createElement("configDisplay");
  Labels.className = "configDisplay";
  Labels.style.justifyContent = "space-between";
  Labels.style.flexDirection = "row";
  const imgLabel = document.createElement("imgLabel");
  imgLabel.textContent = "image";
  imgLabel.className = "label";

  const nameLabel = document.createElement("nameLabel");
  nameLabel.textContent = "name";
  nameLabel.className = "label";

  const colorLabel = document.createElement("colorLabel");
  colorLabel.textContent = "color";
  colorLabel.className = "label";

  Labels.append(imgLabel, nameLabel, colorLabel);
  randomLayout.append(Labels);

  for (let index = 0; index < thingsToRandomlyGet.length; index++) {
    const element = thingsToRandomlyGet[index];

    var configDisplay = document.createElement("configDisplay");
    configDisplay.className = "configDisplay";

    const imageElement = document.createElement("img");
    imageElement.className = "configIcons";
    imageElement.src = element.localizationOfIcon;
    imageElement.width = 50;
    imageElement.style.top = "0%";
    imageElement.style.padding = "5px";
    imageElement.style.right = "5%";
    imageElement.onclick = () => {
      IconSelectionDialog(index);
    };
    const inputBox = document.createElement("inputBox");

    var id = `name${index}`;

    inputBox.innerHTML += ` <input type=text placeHolder=name value="${element.name}" font-size: 16px; id=${id} >`;
    inputBox.innerHTML += ` <input type=text placeHolder=color value="${element.color}" font-size: 16px; id=${id}C >`;

    configDisplay.append(imageElement, inputBox);
    randomLayout.append(configDisplay);
    var nameInput = document.getElementById(id) as HTMLInputElement;
    nameInput.className = "input";
    nameInput.style.fontSize = "100%";
    nameInput.style.color = element.color;
    nameInput.onchange = (event: Event) => {
      nameChanged(event, element);
    };
    var ColorInput = document.getElementById(`${id}C`) as HTMLInputElement;
    ColorInput.className = "input";
    ColorInput.style.fontSize = "100%";
    ColorInput.style.width = "100px";
    ColorInput.style.color = element.color;
    ColorInput.onchange = (event: Event) => {
      colorChanged(event, element);
    };
  }

  function nameChanged(event: Event, randomThing: randomThing) {
    var input = event.target as HTMLInputElement;
    randomThing.name = input.value;
  }
  function colorChanged(event: Event, randomThing: randomThing) {
    var input = event.target as HTMLInputElement;
    randomThing.color = input.value;

    // Update colors of text
    displayConfig();
  }
}
class randomThing {
  public name: string = "";
  public localizationOfIcon: string = "";
  public color: string = "#ffffff";
}

var thingsToRandomlyGet: randomThing[] = [];
var removeItemAfterSelection = false;

await GetDefault();

window.addEventListener("DOMContentLoaded", () => {});

var dice = document.getElementById("dice") as HTMLImageElement;
dice.onclick = onDiceClick;

var addSign = document.getElementById("addSign") as HTMLElement;
addSign.onclick = addNewRandomThing;
var saveButton = document.getElementById("save") as HTMLElement;
saveButton.onclick = CreateSaveFileDialog;
var loadButton = document.getElementById("load") as HTMLElement;
loadButton.onclick = SaveSelectionDialog;
var removeButton = document.getElementById("cb3-8") as HTMLInputElement;
removeButton.onclick = () => {
  removeItemAfterSelection = !removeItemAfterSelection;
};

displayConfig();
