// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded");
  // Get the file input element
  var fileInput = document.getElementById("pdf-upload");
  document.getElementById("add-job-btn").addEventListener("click", function () {
    // Redirect to another webpage
    window.location.href = "addjob.html";
  });

  // Retrieve jobs from localStorage
  var jobs = JSON.parse(localStorage.getItem("jobs")) || [];

  // Display newly added jobs
  var newJobsContainer = document.getElementById("new-jobs");
  jobs.forEach(function (job) {
    var jobCard = document.createElement("div");
    jobCard.className = "job-card";
    jobCard.innerHTML = `
      <h2>${job.title}</h2>
      <p>Description: ${job.description}</p>
      <p>Location: ${job.location}</p>
      <button class="upload-btn">Apply</button>
    `;
    newJobsContainer.appendChild(jobCard);
  });

  // Add event listener for file input change
  fileInput.addEventListener("change", function (event) {
    console.log("File selected");
    // Get the uploaded file
    var file = event.target.files[0];

    // Check if the file is a PDF
    if (file.type === "application/pdf") {
      console.log("File is a PDF");
      // Create a new FileReader
      var reader = new FileReader();

      // FileReader onload event handler
      reader.onload = function (event) {
        console.log("FileReader onload");
        // Load the PDF document using PDF.js
        pdfjsLib
          .getDocument(new Uint8Array(event.target.result))
          .promise.then(function (pdf) {
            console.log("PDF loaded");
            // Initialize an empty string to store the extracted text
            var text = "";

            // Loop through each page of the PDF
            var promises = [];
            for (var pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
              // Get the text content of the current page
              var promise = pdf.getPage(pageNumber).then(function (page) {
                return page.getTextContent().then(function (content) {
                  // Concatenate the text content of each page
                  content.items.forEach(function (item) {
                    text += item.str + " ";
                  });
                });
              });
              promises.push(promise);
            }

            // Wait for all text extraction promises to resolve
            Promise.all(promises).then(function () {
              console.log("Text extraction complete");
              // Search for keywords related to job descriptions
              var keywords = [
                "web development",
                "software engineer",
                "data analyst",
              ]; // Add more keywords as needed

              // Check if any keyword is found in the extracted text
              var matchedJobs = [];
              var textLowerCase = text.toLowerCase();
              keywords.forEach(function (keyword) {
                if (textLowerCase.includes(keyword)) {
                  matchedJobs.push(keyword);
                }
              });

              // Show only the job cards that match the keywords found in the uploaded resume
              var jobCards = document.querySelectorAll(".job-card");
              jobCards.forEach(function (jobCard) {
                var jobTitle = jobCard
                  .querySelector("h2")
                  .textContent.toLowerCase();
                var jobDescription = jobCard
                  .querySelector("p")
                  .textContent.toLowerCase();
                if (
                  textLowerCase.includes(jobTitle) ||
                  textLowerCase.includes(jobDescription)
                ) {
                  jobCard.style.display = "block";
                } else {
                  jobCard.style.display = "none";
                }
              });

              console.log("Matched jobs:", matchedJobs);
            });
          });
      };

      // FileReader onerror event handler
      reader.onerror = function (event) {
        console.error("FileReader error:", event.target.error);
      };

      // Read the uploaded file as an ArrayBuffer
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a PDF file.");
    }
  });
});
