import { createBarChart, createLineChart} from "./visuals.js";

// Main function to fetch data and create visualization
async function mainEvent() {
  const url = "https://opendata.howardcountymd.gov/resource/j7s2-ynf8.json";
  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      console.log(data)
      createBarChart(data, "2005", "2020");
      createLineChart(data, "All Causes");
      
      document.getElementById("cause-selector").addEventListener("change", async function () {
        const selectedCause = this.value;
        console.log(selectedCause);
        d3.select("#linechart-container").selectAll("*").remove(); // Remove the previous chart
        createLineChart(data, selectedCause); // Create the new chart with the selected cause
      });

      document.getElementById("update-button").addEventListener("click", async function () {
        const startYear = document.getElementById("start-year").value;
        const endYear = document.getElementById("end-year").value;
        console.log(startYear);
        console.log(endYear);
        if(endYear >= startYear){
            d3.select("#barchart-container").selectAll("*").remove(); // Remove the previous chart
            createBarChart(data, startYear, endYear); // Create the new chart with the selected time period
        }else{
            alert("Start year cannot be greater than end year.");
        }
        
      });
      
  } catch (error) {
      console.error("Error fetching data:", error);
  }
}

async function setupBarChart(data) {
    const startYear = document.getElementById("start-year").value;
    const endYear = document.getElementById("end-year").value;
    
    if (startYear && endYear && startYear > endYear) {
      alert("Start year cannot be greater than end year.");
      document.getElementById("start-year").value = "";
      document.getElementById("end-year").value = "";
      return;
    }
  
    const filteredData = filterDataByYear(data, startYear, endYear);
    const chartData = prepareChartData(filteredData);
    createBarChart(chartData);
  }


  
  
  
  
  

// Add DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', async () => mainEvent());
