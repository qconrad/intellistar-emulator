var introSequence = [];
var radarSequence = [];
var outlookSequence = [];
var narration = new Audio();
narration.volume = 0.9;
var currentSequenceArray;
var currentIndex = 0;

function playCurrentConditionsNarration(){
  var randomInt = Math.floor(Math.random() * 2) + 1;
  introSequence.push("assets/narrations/main/intro" + randomInt + ".mp3");
  introSequence.push("assets/narrations/temperature/" + currentTemperature + ".mp3");
  introSequence.push("assets/narrations/conditions/" + conditionFile[currentCondition]() + ".mp3");
  playSequence(introSequence);
}

function playOutlookNarration(){
  outlookSequence.push("assets/narrations/main/outlook.mp3");
  playSequence(outlookSequence);
}

function playRadarNarration(){
  var randomInt = Math.floor(Math.random() * 2) + 1;
  radarSequence.push("assets/narrations/main/radar" + randomInt + ".mp3");
  playSequence(radarSequence);
}

function playSequence(sequenceArray){
  currentSequenceArray = sequenceArray;
  softenMusicVolume();
  playNarration();
}

narration.onended = function() {
  var itemsLeftInSequence = currentIndex < currentSequenceArray.length;
  if(itemsLeftInSequence){
    playNarration();
  }
  else{
    resetMusicVolume();
    currentIndex = 0;
  }
};

function playNarration(){
  narration.src = currentSequenceArray[currentIndex];
  currentIndex++;
  narration.play();
}

function softenMusicVolume(){
  music.volume = 0.2;
}

function resetMusicVolume(){
  music.volume = 1;
}
