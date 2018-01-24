function setMainBackground(){
  getElement('background-image').style.backgroundImage = 'url(' + getRandomBackgroundPath() + ')';
}

function getRandomBackgroundPath(){
  var backgroundFolder = getBackgroundFolder();
  var folderCount = getFolderCount(backgroundFolder);
  var index = randomNumber(folderCount);
  var filePath = 'assets/backgrounds/' + backgroundFolder + "/" + index + '.jpg';
  return filePath;
}

function getBackgroundFolder(){
  var condition = currentIcon;
  var backgroundFolder = "other";
  if(condition.includes("snow") || condition.includes("flurr")){
    backgroundFolder = "snow";
  }else if(condition.includes("rain")){
    backgroundFolder = "rain";
  }else if (condition.includes("fog") || condition.includes("haz")){
    backgroundFolder = "fog";
  }else if(condition.includes("storm")){
    backgroundFolder = "tstorm";
  }
  return backgroundFolder;
}

function getFolderCount(folderName){
  switch(folderName) {
    case 'snow':
      return 4;
    case 'rain':
      return 5;
    case 'fog':
      return 8;
    case 'tstorm':
      return 9;
    case 'other':
      return 6;
    default:
      return 0;
  }
}

function randomNumber(max){
  return Math.floor(Math.random() * max) + 1
}
