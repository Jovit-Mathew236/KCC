async function fetchDistrictData() {
  try {
    const response = await fetch(
      "https://getparticipantscountbyzone-z6r2mciapa-uc.a.run.app/"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const DistrictData = await response.json();
    return DistrictData;
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
    const CollegeData = await response.json();
    return CollegeData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function updateDistrictSelect(districtData) {
  const districtSelect = document.getElementById("district-select");
  districtSelect.innerHTML = "<option selected>Choose a District</option>";
  Object.keys(districtData).forEach((district) => {
    const option = document.createElement("option");
    option.value = district;
    option.text = district;
    districtSelect.appendChild(option);
  });
}

// function updateCollegeSelect(collegeData) {
//   const collegeSelect = document.getElementById("college-select");
//   collegeSelect.innerHTML = "<option selected>Choose a College</option>";
//   Object.keys(collegeData).forEach((college) => {
//     const option = document.createElement("option");
//     option.value = college;
//     option.text = college;
//     collegeSelect.appendChild(option);
//   });
// }

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

  const chart = new ApexCharts(
    document.getElementById("column-chart"),
    options
  );
  chart.render();

  document.getElementById("totalRegistration").textContent =
    totalRegistration.toLocaleString();
}

document
  .getElementById("district-select")
  .addEventListener("change", async (event) => {
    const district = event.target.value;
    const collegeData = await fetchCollegeData(district);
    // updateCollegeSelect(collegeData);

    const chartData = Object.entries(collegeData).map(([key, value]) => ({
      x: key,
      y: value,
    }));
    const totalRegistration = chartData.reduce(
      (total, data) => total + data.y,
      0
    );
    updateChart(chartData, totalRegistration);
    // console.log(chartData, totalRegistration);
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
