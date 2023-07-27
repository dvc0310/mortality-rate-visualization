import { createBarChart, createLineChart} from "./visualizations/visuals.js";

async function mainEvent() {
  const url = "https://opendata.howardcountymd.gov/resource/j7s2-ynf8.json";
  try {
      const loadDataButton = document.querySelector('#data_load');
      const clearDataButton = document.querySelector('#data_clear');
      const cause_dropdown = document.getElementById("cause-selector");
      const updateButton = document.getElementById("update-button");
      const startYear = document.getElementById("start-year");
      const endYear = document.getElementById("end-year");

      const storedData = localStorage.getItem('storedData');
      let parsedData = storedData ? JSON.parse(storedData) : [];

      console.log("stored data")
      console.log(parsedData);

      if (parsedData?.length > 0){
        createBarChart(parsedData, "2005", "2020");
        createLineChart(parsedData, "All Causes");
        clearDataButton.classList.remove("disabled");
        clearDataButton.disabled = false;
      }else{
        clearDataButton.disabled = true;
        clearDataButton.classList.add("disabled"); 
      }
  

      loadDataButton.addEventListener('click', async () => {
        console.log('Loading data');
        const results = await fetch(url);
        const storedList = await results.json(); 
        localStorage.setItem('storedData', JSON.stringify(storedList));
        
        parsedData = storedList;
        console.log(storedList)
        createBarChart(storedList, "2005", "2020");
        createLineChart(storedList, "All Causes");
        clearDataButton.disabled = false;
        clearDataButton.classList.remove("disabled");
      });  

      clearDataButton.addEventListener("click", ()=>{
        console.log("clear");
        localStorage.clear();
        console.log("localStorage Check", localStorage.getItem("storedData"));
        clearDataButton.disabled = true;
        clearDataButton.classList.add("disabled"); 
        d3.select("#barchart-container").selectAll("*").remove();
        d3.select("#linechart-container").selectAll("*").remove();
      })
      

      cause_dropdown.addEventListener("change", async function () {
        const selectedCause = this.value;
        console.log(selectedCause);
        d3.select("#linechart-container").selectAll("*").remove(); 
        createLineChart(parsedData, selectedCause);
      });

      updateButton.addEventListener("click", async function () {
        console.log(startYear.value);
        console.log(endYear.value);
        if(endYear.value >= startYear.value){
            d3.select("#barchart-container").selectAll("*").remove();
            createBarChart(parsedData, startYear.value, endYear.value); 
        }else{
            if(startYear.value == 2005 && endYear.value == 2005){
              d3.select("#barchart-container").selectAll("*").remove();
              createBarChart(parsedData, startYear.value, endYear.value); 
            }else{
              alert("Start year cannot be greater than end year.");
            }
        }
        
      });
      
  } catch (error) {
      console.error("Error fetching data:", error);
  }
}
    

document.addEventListener('DOMContentLoaded', async () => mainEvent());
