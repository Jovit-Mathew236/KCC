let chart;

async function fetchDistrictData() {
  try {
    const response = await fetch(
      "https://getparticipantscountbyzone-z6r2mciapa-uc.a.run.app/"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const districtData = await response.json();
    return districtData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function fetchCollegeData(district) {
  try {
    const response = await fetch(
      `https://getparticipantscountbycampus-z6r2mciapa-uc.a.run.app/?zone=${district}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const collegeData = await response.json();
    return collegeData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function updateDistrictSelect(districtData) {
  const districtSelect = document.getElementById("district-select");
  districtSelect.innerHTML = "<option selected>Choose a Zone</option>";
  Object.keys(districtData).forEach((district) => {
    const option = document.createElement("option");
    option.value = district;
    option.text = district;
    districtSelect.appendChild(option);
  });
}

function updateChart(chartData, totalRegistration) {
  const options = {
    colors: ["#1A56DB", "#FDBA8C"],
    series: [
      {
        name: "Participants",
        color: "#0ea5e9",
        data: chartData,
      },
    ],
    chart: {
      type: "bar",
      height: "320px",
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadiusApplication: "end",
        borderRadius: 8,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      style: {
        fontFamily: "Inter, sans-serif",
      },
    },
    states: {
      hover: {
        filter: {
          type: "darken",
          value: 1,
        },
      },
    },
    stroke: {
      show: true,
      width: 0,
      colors: ["transparent"],
    },
    grid: {
      show: false,
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: -14,
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    xaxis: {
      floating: false,
      labels: {
        show: true,
        rotate: -90,
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
    },
    fill: {
      opacity: 1,
    },
  };

  if (chart) {
    chart.destroy();
  }

  chart = new ApexCharts(document.getElementById("column-chart"), options);
  chart.render();

  document.getElementById("totalRegistration").textContent =
    totalRegistration.toLocaleString();
}

document
  .getElementById("district-select")
  .addEventListener("change", async (event) => {
    const district = event.target.value;
    const collegeData = await fetchCollegeData(district);

    const chartData = Object.entries(collegeData).map(([key, value]) => ({
      x: key,
      y: value,
    }));
    const totalRegistration = chartData.reduce(
      (total, data) => total + data.y,
      0
    );
    updateChart(chartData, totalRegistration);
    console.log(chartData, totalRegistration);
  });

// Initial load
fetchDistrictData().then((districtData) => {
  updateDistrictSelect(districtData);
  const chartData = Object.entries(districtData).map(([key, value]) => ({
    x: key,
    y: value,
  }));
  const totalRegistration = chartData.reduce(
    (total, data) => total + data.y,
    0
  );
  updateChart(chartData, totalRegistration);
});

// firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCycFbzihXVBYAbeVWwbNGlm7fFGeOicb8",
  authDomain: "kcc24-277a5.firebaseapp.com",
  projectId: "kcc24-277a5",
  storageBucket: "kcc24-277a5.appspot.com",
  messagingSenderId: "980169847772",
  appId: "1:980169847772:web:a22c48a18a068014859519",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentSlide = 0;
let slides = [];

function loadImages() {
  const containerOngoing = document.getElementById("ongoingEventsWeb");
  const containerUpcoming = document.getElementById("upComingEventsWeb");
  const thumbnailCarousel = document.getElementById("thumbnail-carousel");
  // containerOngoing.innerHTML = "";
  // containerUpcoming.innerHTML = "";
  // thumbnailCarousel.innerHTML = "";

  let slides = [];
  let currentSlide = 0;

  getDocs(collection(db, "images")).then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const div = document.createElement("div");
      div.classList.add(
        "hidden",
        "duration-700",
        "ease-in-out",
        "absolute",
        "inset-0"
      );

      const img = document.createElement("img");
      img.src = data.url;
      img.classList.add(
        "absolute",
        "object-cover",
        "object-center",
        "block",
        "w-full",
        "h-full"
      );

      div.appendChild(img);
      console.log(data.eventType);
      if (data.eventType === "upcoming") {
        // Create thumbnail
        containerUpcoming.classList.add("lg:w-[700px]");
        const upComingEventCurrentPic = document.createElement("img");
        upComingEventCurrentPic.src = data.url;
        upComingEventCurrentPic.classList.add(
          "h-[250px]",
          "object-cover",
          "w-full",
          "md:h-full",
          "md:w-full",
          "md:object-cover",
          "rounded-lg"
        );
        upComingEventCurrentPic.alt = data.alt || "";
        containerUpcoming.appendChild(upComingEventCurrentPic);
        const thumbnailDiv = document.createElement("div");
        thumbnailDiv.classList.add("md:h-full");
        // thumbnailDiv.appendChild(thumbImg);
        const thumbnailImg = document.createElement("img");
        thumbnailImg.src = data.url;
        thumbnailImg.classList.add(
          "md:object-cover",
          "h-auto",
          "md:h-full",
          "max-w-full",
          "rounded-lg",
          "thumbnail-image"
        );
        thumbnailImg.alt = data.alt || "";
        slides.push(thumbnailImg);
        thumbnailDiv.appendChild(thumbnailImg);
        thumbnailCarousel.appendChild(thumbnailDiv);
      } else {
        console.log("here");
        containerOngoing.appendChild(div);
      }
      containerOngoing.appendChild(div);
      slides.push(div);
    });

    if (slides.length > 0) {
      showSlide(0);
      setupEventListeners();
    }
  });
}

function showSlide(index) {
  slides.forEach((slide, i) => {
    if (i === index) {
      slide.classList.remove("hidden");
    } else {
      slide.classList.add("hidden");
    }
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
}

function setupEventListeners() {
  const nextButton = document.getElementById("nextButton");
  const prevButton = document.getElementById("prevButton");

  if (nextButton) nextButton.addEventListener("click", nextSlide);
  if (prevButton) prevButton.addEventListener("click", prevSlide);

  // Optional: Auto-advance slides every 5 seconds
  setInterval(nextSlide, 5000);
}

window.onload = loadImages();
