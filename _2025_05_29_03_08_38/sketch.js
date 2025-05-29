let imgs = [];
let currentImgIndex = 0;
let leftChoiceCount = 0;
let bgm;
let resultPercent = 0;

let video;
let facemesh;
let predictions = [];

function preload() {
  imgs[0] = loadImage('Frame 1.png');
  imgs[1] = loadImage('Frame 2.png');
  imgs[2] = loadImage('Frame 7.png');
  imgs[3] = loadImage('Frame 8.png');
  imgs[4] = loadImage('Frame 9.png');
  imgs[5] = loadImage('Frame 10.png');
  imgs[6] = loadImage('100배경.png'); // 100% 배경
  imgs[7] = loadImage('80배경.png');  // 80% 배경
  imgs[8] = loadImage('60배경.png');  // 60% 배경
  imgs[9] = loadImage('40배경.png');  // 40% 배경
  imgs[10] = loadImage('20배경.png'); // 20% 배경
  imgs[11] = loadImage('0배경.png');  // 0% 배경
  imgs[12] = loadImage('0%.png');   // 0% 캐릭터
  imgs[13] = loadImage('20%.png');  // 20% 캐릭터
  imgs[14] = loadImage('40%.png');  // 40% 캐릭터
  imgs[15] = loadImage('60%.png');  // 60% 캐릭터
  imgs[16] = loadImage('80%.png');  // 80% 캐릭터
  imgs[17] = loadImage('100%.png'); // 100% 캐릭터
  imgs[18] = loadImage('heart.jpg');   // 하트 이미지
  imgs[19] = loadImage('Frame 31.png'); // 시작화면
  imgs[20] = loadImage('엔딩화면.png'); // 엔딩화면

  soundFormats('mp3', 'ogg');
  bgm = loadSound('bgm.mp3');
}

function setup() {
  createCanvas(600, 500);
  bgm.loop();
  bgm.setVolume(0.5);

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on("predict", results => {
    predictions = results;
  });
}

function modelReady() {
  console.log("FaceMesh 모델 로드 완료");
}

function draw() {
  background(220);

  if (currentImgIndex === 0) {
  // 시작화면
  image(imgs[19], 0, 0, width, height);
  // 여기선 drawStartButton() 호출 안 함
} else if (currentImgIndex === 1) {
  // 시작화면 다음 화면
  image(imgs[0], 0, 0, width, height);
  drawStartButton();  
  drawChoiceButtons(); 
} else if (currentImgIndex >= 2 && currentImgIndex <= 5) {
  image(imgs[currentImgIndex - 1], 0, 0, width, height);
  drawChoiceButtons();
} else if (currentImgIndex === 12) {
  drawMouthCamera();
} else if (currentImgIndex === 13) {
  drawResultImage();
} else if (currentImgIndex === 20) {
  image(imgs[20], 0, 0, width, height);
 }
}

function drawStartButton() {
  noFill();
  stroke(255);
  rect(220, 280, 150, 70);
}

function drawChoiceButtons() {
  noFill();
  stroke(255);
  ellipse(170, 320, 170, 150); // 왼쪽
  ellipse(438, 320, 170, 150); // 오른쪽
}

function drawMouthCamera() {
  image(video, 0, 0, width, height);

  let message = "입을 벌리거나 → 키를 눌러 결과를 확인하세요!";

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    noFill();
    stroke(255, 0, 0);
    beginShape();
    for (let i = 61; i <= 80; i++) {
      const [x, y] = keypoints[i];
      vertex(x, y);
    }
    endShape(CLOSE);

    if (isMouthOpen(keypoints)) {
      currentImgIndex = 13;
    }
  }

  fill(255);
  textSize(16);
  textAlign(CENTER);
  text(message, width / 2, height - 20);
}

function drawResultImage() {
  let bgImgIndex, charImgIndex;

  switch (resultPercent) {
    case 100:
      bgImgIndex = 6;
      charImgIndex = 17;
      break;
    case 80:
      bgImgIndex = 7;
      charImgIndex = 16;
      break;
    case 60:
      bgImgIndex = 8;
      charImgIndex = 15;
      break;
    case 40:
      bgImgIndex = 9;
      charImgIndex = 14;
      break;
    case 20:
      bgImgIndex = 10;
      charImgIndex = 13;
      break;
    default:
      bgImgIndex = 11;
      charImgIndex = 12;
      break;
  }

  image(imgs[bgImgIndex], 0, 0, width, height);
  image(imgs[charImgIndex], 0, 270, 240, 105);
}

function isMouthOpen(keypoints) {
  const upperLip = keypoints[13];
  const lowerLip = keypoints[14];
  const distance = dist(upperLip[0], upperLip[1], lowerLip[0], lowerLip[1]);
  return distance > 15;
}

function mousePressed() {
  if (currentImgIndex === 0) {
    // 시작화면에서는 클릭 이벤트 무시 (아무 동작 안 함)
  } else if (currentImgIndex === 1) {
    // 시작화면 다음 화면에서 중앙 영역 클릭 시 다음 화면으로 넘어감
    if (mouseX >= 220 && mouseX <= 370 && mouseY >= 280 && mouseY <= 350) {
      currentImgIndex++;
    }
  } else if (currentImgIndex >= 2 && currentImgIndex <= 5) {
    let clickedLeft = dist(mouseX, mouseY, 170, 320) < 85;
    let clickedRight = dist(mouseX, mouseY, 438, 320) < 85;

    if (clickedLeft || clickedRight) {
      if (clickedLeft) {
        leftChoiceCount++;
      }

      if (currentImgIndex === 5) {
        calculateResult();
      } else {
        currentImgIndex++;
      }
    }
  }
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    if (currentImgIndex === 0) {
      currentImgIndex = 1;  // 시작화면 → Frame 1 (imgs[0])로 이동
    } else if (currentImgIndex === 12) {
      currentImgIndex = 13;
    } else if (currentImgIndex === 13) {
      currentImgIndex = 20; // 엔딩화면으로 이동
    }
  }
}

function calculateResult() {
  switch (leftChoiceCount) {
    case 5: resultPercent = 100; break;
    case 4: resultPercent = 80; break;
    case 3: resultPercent = 60; break;
    case 2: resultPercent = 40; break;
    case 1: resultPercent = 20; break;
    default: resultPercent = 0; break;
  }

  currentImgIndex = 12;
}
