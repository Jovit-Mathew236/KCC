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

const chart = {
  instance: null,
};

let currentSlide = 0;
let slides = [];

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

async function fetchDistrictData() {
  return fetchData(
    "https://getparticipantscountbyzone-z6r2mciapa-uc.a.run.app/"
  );
}

async function fetchCollegeData(district) {
  return fetchData(
    `https://getparticipantscountbycampus-z6r2mciapa-uc.a.run.app/?zone=${district}`
  );
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

  if (chart.instance) {
    chart.instance.destroy();
  }

  chart.instance = new ApexCharts(
    document.getElementById("column-chart"),
    options
  );
  chart.instance.render();

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

const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove("lazy");
      observer.unobserve(img);
    }
  });
});

async function loadImages() {
  const containerOngoing = document.getElementById("ongoingEventsWeb");
  const containerUpcoming = document.getElementById("upComingEventsWeb");
  const thumbnailCarousel = document.getElementById("thumbnail-carousel");

  containerOngoing.innerHTML = "";
  containerUpcoming.innerHTML = "";
  thumbnailCarousel.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "images"));
  const fragments = {
    ongoing: document.createDocumentFragment(),
    upcoming: document.createDocumentFragment(),
    thumbnails: document.createDocumentFragment(),
  };

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const img = createImageElement(data.url, data.alt);

    if (data.eventType === "ongoing") {
      const div = createOngoingImageContainer(img);
      fragments.ongoing.appendChild(div);
      slides.push(div);
    } else {
      const upComingEventCurrentPic = createUpcomingImageElement(
        data.url,
        data.alt
      );
      fragments.upcoming.appendChild(upComingEventCurrentPic);

      const thumbnailDiv = createThumbnailElement(data.url, data.alt);
      fragments.thumbnails.appendChild(thumbnailDiv);
      slides.push(thumbnailDiv);
    }
  });

  containerOngoing.appendChild(fragments.ongoing);
  containerUpcoming.appendChild(fragments.upcoming);
  thumbnailCarousel.appendChild(fragments.thumbnails);

  if (slides.length > 0) {
    showSlide(0);
    setupEventListeners();
  }
}

function createImageElement(src, alt) {
  const img = document.createElement("img");
  img.classList.add("lazy");
  img.dataset.src = src;
  img.alt = alt || "";
  imageObserver.observe(img);
  return img;
}

function createOngoingImageContainer(img) {
  const div = document.createElement("div");
  div.classList.add(
    "hidden",
    "duration-700",
    "ease-in-out",
    "absolute",
    "inset-0"
  );
  img.classList.add(
    "absolute",
    "object-cover",
    "object-center",
    "block",
    "w-full",
    "h-full"
  );
  div.appendChild(img);
  return div;
}

function createUpcomingImageElement(src, alt) {
  const img = createImageElement(src, alt);
  img.classList.add(
    "h-[250px]",
    "object-cover",
    "w-full",
    "md:h-full",
    "md:w-full",
    "md:object-cover",
    "rounded-lg"
  );
  return img;
}

function createThumbnailElement(src, alt) {
  const div = document.createElement("div");
  div.classList.add("md:h-full");
  const img = createImageElement(src, alt);
  img.classList.add(
    "md:object-cover",
    "h-auto",
    "md:h-full",
    "max-w-full",
    "rounded-lg",
    "thumbnail-image"
  );
  div.appendChild(img);
  return div;
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
  requestAnimationFrame(() => showSlide(currentSlide));
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  requestAnimationFrame(() => showSlide(currentSlide));
}

function setupEventListeners() {
  const nextButton = document.getElementById("nextButton");
  const prevButton = document.getElementById("prevButton");

  if (nextButton) nextButton.addEventListener("click", nextSlide);
  if (prevButton) prevButton.addEventListener("click", prevSlide);

  // Optional: Auto-advance slides every 5 seconds
  setInterval(nextSlide, 5000);
}

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("thumbnail-image")) {
    const index = Array.from(event.target.parentNode.children).indexOf(
      event.target
    );
    showImage(index);
  }
});

function showImage(index) {
  const mainImage = document
    .getElementById("upComingEventsWeb")
    .querySelector("img");
  const thumbnails = document.querySelectorAll(".thumbnail-image");

  mainImage.src = thumbnails[index].dataset.src;
  thumbnails.forEach((thumb) => thumb.classList.remove("active"));
  thumbnails[index].classList.add("active");
}

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

window.onload = loadImages;
