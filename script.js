import { createBarChart, createLineChart} from "./visuals.js";

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
        d3.select("#linechart-container").selectAll("*").remove(); 
        createLineChart(data, selectedCause);
      });

      document.getElementById("update-button").addEventListener("click", async function () {
        const startYear = document.getElementById("start-year").value;
        const endYear = document.getElementById("end-year").value;
        console.log(startYear);
        console.log(endYear);
        if(endYear >= startYear){
            d3.select("#barchart-container").selectAll("*").remove(); 
            createBarChart(data, startYear, endYear); 
        }else{
            alert("Start year cannot be greater than end year.");
        }
        
      });
      
  } catch (error) {
      console.error("Error fetching data:", error);
  }
}

document.addEventListener('DOMContentLoaded', async () => mainEvent());
