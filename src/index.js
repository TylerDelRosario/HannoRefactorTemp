window.onload = () => {
  (() => {
      const switchTabs = (element) => {
          const currentTab = document.querySelector(".tabActive");

          if (currentTab !== element) {
              currentTab.setAttribute("class", "tabHidden");

              element.setAttribute("class", "tabActive");
          }
      }

      const eventListeners = () => {

          const navIDArray = ["oreClick", "iceClick", "apiClick", "aboutClick"];
          const tabIDArray = ["oreContainer", "iceContainer", "apiContainer", "aboutContainer"];

          navIDArray.forEach((id, index) => {

              let current = document.getElementById(id);
              let next = document.getElementById(tabIDArray[index]);
              console.log(next);
              current.addEventListener("click", () =>{
                  switchTabs(next);
              });
          });

          const formSubmission = () => {

              const mineralInput = document.forms.oreContainer;
              const oreButton = document.getElementById("hannoOreSubmit");

              oreButton.addEventListener("click", (event) => {
                  event.preventDefault();
                  const data = new FormData(mineralInput);
                  
                  buildURL(data, "ore")
              });

              const iceInput = document.forms.iceContainer;
              const iceButton = document.getElementById("hannoIceSubmit");

              iceButton.addEventListener("click", (event) => {
                  event.preventDefault();
                  const data = new FormData(iceInput);

                  buildURL(data, "ice");
              });
          }

          const buildURL = (data, type) => {

              let url = "http://localhost:5000/" + type + "?";
              let index = 0;
              for (const pair of data.entries()) {                    
                  if (index > 0) {
                  url += "&" + pair[0].toString() + "=" + pair[1].toString();
                  }
                  else {
                  url += pair[0].toString() + "=" + pair[1].toString();
                  }

                  index++;
              }

              fetchSolution(url).then((data) => {

                  const warning = `\r\nPSA: I'm still working on a more accurate appraisal for ores and ice.\r\n\r\nThank you for using Hanno!`;
                  const textarea = document.getElementById(type + "Output");
                  const output = outputParse(data);
                  output.push([`\r\nApproximate Sell Price:`, data.result]);

                  let outputText = "";
                  output.forEach((pair) => {
                      outputText += `${pair[0]}  ${Math.ceil(pair[1])}\r\n`;
                  });
                  textarea.value = outputText + warning;;

              }).catch((err) => {
                  console.log("ORE FETCH FAILED");
                  console.log(err);
                  throw err;
              });
          }

          const fetchSolution = async (url) => {

              const response = await fetch(url, {method: "GET"});
              console.log(response);
              const data = response.json();
              
              return data;
          }

          const outputParse = (data) => {

              const opValues = Object.values(data);
              const opKeys = Object.keys(data);
              let oreSort = [];
              opValues.forEach((value, index) => {
                  if (opKeys[index] !== "result" && typeof value === "number") {
                      oreSort.push([opKeys[index], value]);
                  }
              });
              
              return sortValues(oreSort);
          }
          //Receives [key, value] arrays and sorts by value.
          const sortValues = (array) => {
              const swap = (arr, first, second) => {
                  const firstValue = arr[first];

                  arr[first] = arr[second];
                  arr[second] = firstValue;
              }

              const findMin = (arr, index) => {
                  let largest = arr[index][1];
                  let minIndex = index;

                  for (let i = minIndex; i < arr.length; i++) {
                      if (largest < arr[i][1]) {
                          largest = arr[i][1];
                          minIndex = i;
                      }
                  }
                  return minIndex;
              }

              let min;
              array.forEach((pair, index) => {
                  min = findMin(array, index);
                  swap(array, index, min);
              });
              return array;
          }

          formSubmission();
      }

      eventListeners();
  }) ();
};