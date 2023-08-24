let hamburger = document.querySelector(".hamburger");
let navLinks = document.getElementById("nav-links");
let links = document.querySelectorAll(".links");
let words = ["Web Developer", "Designer", "Programmer", "Engineer"];
let typingDiv = document.getElementById("typing-text");
let wordIndex = 0;
let word = words[wordIndex];
let typingSpeed = 500;

setInterval(() => {
  wordIndex++;
  if (wordIndex >= words.length) {
    wordIndex = 0;
  }
  typingDiv.style.fontSize = "34px";
  typingDiv.style.color = "#f1c40f";
  typingDiv.style.marginTop = "10%";
  word = words[wordIndex];
  typingDiv.innerHTML = word;
}, 2500);
hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("hide");
  hamburger.classList.toggle("lines-rotate");
});

for (let i = 0; i < links.length; i++) {
  links[i].addEventListener("click", () => {
    navLinks.classList.toggle("hide");
  });
}

// DYNAMIC YEAR
let year = document.getElementById("year");
let dynamicYear = new Date().getFullYear();
year.innerHTML = dynamicYear;

// dark theme
document.addEventListener("DOMContentLoaded", (event) => {
  const recaptcha = document.querySelector(".g-recaptcha");
  recaptcha.setAttribute("data-theme", "dark");
});

// for multi title
let alertShow = false;

setInterval(() => {
  document.title = alertShow ? "Portfolio" : "Gagan Arora";
  alertShow = !alertShow;
}, 3000);

//current time
function displayCurrentTime() {
  var date = new Date();
  var time = date.toLocaleTimeString();
  document.getElementById("current-time").innerHTML = time;
}

// Update the time every second
setInterval(displayCurrentTime, 1000);

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
